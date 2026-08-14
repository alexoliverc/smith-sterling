import 'server-only';

import { prisma } from '@/lib/prisma';
import { createLookupHash } from '@/lib/security/pii';

const RECOVERY_WINDOW_MS =
  15 * 60 * 1000;

/*
 * Origem é uma proteção auxiliar.
 *
 * O protocolo é o principal alvo do
 * throttling, pois IP/cabeçalhos podem
 * variar entre proxies e redes.
 */
const ORIGIN_MAX_ATTEMPTS = 60;
const TARGET_MAX_ATTEMPTS = 8;

type ConsumeApplicationRecoveryRateLimitInput = {
  origin: string;
  protocol: string;
};

function getBucketStart(
  now: Date,
) {
  return new Date(
    Math.floor(
      now.getTime() /
        RECOVERY_WINDOW_MS,
    ) * RECOVERY_WINDOW_MS,
  );
}

function normalizeOrigin(
  value: string,
) {
  const normalized =
    value.trim().slice(0, 256);

  return normalized || 'unknown';
}

function normalizeProtocol(
  value: string,
) {
  const normalized =
    value
      .trim()
      .toUpperCase()
      .slice(0, 24);

  return normalized || 'empty';
}

async function consumeBucket(
  keyHash: string,
  bucketStart: Date,
) {
  try {
    return await prisma
      .applicationRecoveryRateLimitBucket
      .upsert({
        where: {
          keyHash_bucketStart: {
            keyHash,
            bucketStart,
          },
        },

        create: {
          keyHash,
          bucketStart,
          attempts: 1,
        },

        update: {
          attempts: {
            increment: 1,
          },
        },

        select: {
          attempts: true,
        },
      });
  } catch (upsertError) {
    /*
     * Duas requisições podem tentar
     * criar o mesmo bucket exatamente
     * ao mesmo tempo.
     *
     * Se uma delas ganhou a corrida,
     * tentamos apenas incrementar o
     * registro que agora já existe.
     */
    try {
      return await prisma
        .applicationRecoveryRateLimitBucket
        .update({
          where: {
            keyHash_bucketStart: {
              keyHash,
              bucketStart,
            },
          },

          data: {
            attempts: {
              increment: 1,
            },
          },

          select: {
            attempts: true,
          },
        });
    } catch {
      throw upsertError;
    }
  }
}

export async function consumeApplicationRecoveryRateLimit(
  input: ConsumeApplicationRecoveryRateLimitInput,
) {
  const now = new Date();

  const bucketStart =
    getBucketStart(now);

  /*
   * Domain separation:
   * não armazenamos protocolo ou
   * origem diretamente no banco.
   */
  const originKeyHash =
    createLookupHash(
      `recovery-rate-limit:v1:origin:${normalizeOrigin(
        input.origin,
      )}`,
    );

  const targetKeyHash =
    createLookupHash(
      `recovery-rate-limit:v1:target:${normalizeProtocol(
        input.protocol,
      )}`,
    );

  const [
    originBucket,
    targetBucket,
  ] = await Promise.all([
    consumeBucket(
      originKeyHash,
      bucketStart,
    ),

    consumeBucket(
      targetKeyHash,
      bucketStart,
    ),
  ]);

  const originAllowed =
    originBucket.attempts <=
    ORIGIN_MAX_ATTEMPTS;

  const targetAllowed =
    targetBucket.attempts <=
    TARGET_MAX_ATTEMPTS;

  const nextBucketAt =
    bucketStart.getTime() +
    RECOVERY_WINDOW_MS;

  const retryAfterSeconds =
    Math.max(
      1,
      Math.ceil(
        (nextBucketAt -
          now.getTime()) /
          1000,
      ),
    );

  return {
    allowed:
      originAllowed &&
      targetAllowed,

    originAttempts:
      originBucket.attempts,

    targetAttempts:
      targetBucket.attempts,

    retryAfterSeconds,
  };
}
