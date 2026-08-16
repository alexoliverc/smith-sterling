import {
  randomUUID,
} from 'node:crypto';

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  prisma,
} from '../../src/lib/prisma';

import {
  createLookupHash,
} from '../../src/lib/security/pii';

import {
  checkAdminLoginRateLimit,
  recordAdminLoginFailure,
} from '../../src/server/security/admin-login-rate-limit';

const cleanupKeyHashes =
  new Set<string>();

const originalLookupKey =
  process.env
    .PII_LOOKUP_KEY;

beforeAll(
  () => {
    /*
     * Chave sintética exclusiva do teste.
     *
     * Não é segredo real e não é
     * persistida no repositório como
     * credencial operacional.
     */
    process.env
      .PII_LOOKUP_KEY =
      Buffer
        .alloc(
          32,
          91,
        )
        .toString(
          'base64',
        );
  },
);

afterEach(
  async () => {
    if (
      cleanupKeyHashes.size ===
      0
    ) {
      return;
    }

    await prisma
      .applicationRecoveryRateLimitBucket
      .deleteMany({
        where: {
          keyHash: {
            in:
              [
                ...cleanupKeyHashes,
              ],
          },
        },
      });

    cleanupKeyHashes.clear();
  },
);

afterAll(
  async () => {
    if (
      typeof originalLookupKey ===
      'undefined'
    ) {
      delete process.env
        .PII_LOOKUP_KEY;
    }
    else {
      process.env
        .PII_LOOKUP_KEY =
        originalLookupKey;
    }

    await prisma
      .$disconnect();
  },
);

describe(
  'admin login rate limit integration',
  () => {
    it(
      'persiste origem, registra somente falhas no alvo e bloqueia após o limite',
      async () => {
        const suffix =
          randomUUID();

        const email =
          `admin-login-${suffix}@example.invalid`;

        const userAgent =
          `smith-admin-login-integration-${suffix}`;

        const normalizedOrigin =
          `fallback:${userAgent}`;

        const originKeyHash =
          createLookupHash(
            `admin-login-rate-limit:v1:origin:${normalizedOrigin}`,
          );

        const targetKeyHash =
          createLookupHash(
            `admin-login-rate-limit:v1:target:${email.toLowerCase()}`,
          );

        cleanupKeyHashes.add(
          originKeyHash,
        );

        cleanupKeyHashes.add(
          targetKeyHash,
        );

        expect(
          originKeyHash,
        ).not.toBe(
          targetKeyHash,
        );

        const input = {
          forwardedFor:
            null,

          realIp:
            null,

          userAgent,

          email,
        };

        /*
         * O precheck consome somente origem.
         */
        const firstCheck =
          await checkAdminLoginRateLimit(
            input,
          );

        expect(
          firstCheck.allowed,
        ).toBe(true);

        expect(
          firstCheck.originAttempts,
        ).toBe(1);

        expect(
          firstCheck.targetFailures,
        ).toBe(0);

        const secondCheck =
          await checkAdminLoginRateLimit(
            input,
          );

        expect(
          secondCheck.allowed,
        ).toBe(true);

        expect(
          secondCheck.originAttempts,
        ).toBe(2);

        expect(
          secondCheck.targetFailures,
        ).toBe(0);

        /*
         * O alvo só é incrementado quando
         * registramos falha explicitamente.
         */
        for (
          let attempt = 1;
          attempt <= 8;
          attempt++
        ) {
          const failure =
            await recordAdminLoginFailure({
              email,
            });

          expect(
            failure.targetFailures,
          ).toBe(
            attempt,
          );
        }

        /*
         * O nono precheck já encontra
         * o alvo temporariamente bloqueado.
         */
        const blockedCheck =
          await checkAdminLoginRateLimit(
            input,
          );

        expect(
          blockedCheck.allowed,
        ).toBe(false);

        expect(
          blockedCheck.originAttempts,
        ).toBe(3);

        expect(
          blockedCheck.targetFailures,
        ).toBe(8);

        expect(
          blockedCheck.retryAfterSeconds,
        ).toBeGreaterThan(0);

        /*
         * Confirma estado persistido no
         * banco exclusivo de integração.
         */
        const rows =
          await prisma
            .applicationRecoveryRateLimitBucket
            .findMany({
              where: {
                keyHash: {
                  in: [
                    originKeyHash,
                    targetKeyHash,
                  ],
                },
              },

              select: {
                keyHash:
                  true,

                attempts:
                  true,
              },
            });

        expect(
          rows,
        ).toHaveLength(2);

        const attemptsByKey =
          new Map(
            rows.map(
              (
                row,
              ) => [
                row.keyHash,
                row.attempts,
              ],
            ),
          );

        expect(
          attemptsByKey.get(
            originKeyHash,
          ),
        ).toBe(3);

        expect(
          attemptsByKey.get(
            targetKeyHash,
          ),
        ).toBe(8);
      },
    );
  },
);
