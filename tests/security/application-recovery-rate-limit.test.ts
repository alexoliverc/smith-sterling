import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),

  createLookupHash: vi.fn(
    (value: string) =>
      `hash:${value}`,
  ),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    applicationRecoveryRateLimitBucket: {
      upsert: mocks.upsert,
      update: mocks.update,
      deleteMany: mocks.deleteMany,
    },
  },
}));

vi.mock('@/lib/security/pii', () => ({
  createLookupHash:
    mocks.createLookupHash,
}));

type UpsertArgs = {
  where: {
    keyHash_bucketStart: {
      keyHash: string;
      bucketStart: Date;
    };
  };
};

describe(
  'application recovery rate limit',
  () => {
    const bucketAttempts =
      new Map<string, number>();

    beforeEach(() => {
      vi.resetModules();
      vi.clearAllMocks();

      vi.useFakeTimers();

      vi.setSystemTime(
        new Date(
          '2026-08-14T15:00:00.000Z',
        ),
      );

      bucketAttempts.clear();

      mocks.deleteMany.mockResolvedValue({
        count: 0,
      });

      mocks.upsert.mockImplementation(
        async (
          args: UpsertArgs,
        ) => {
          const {
            keyHash,
            bucketStart,
          } =
            args.where
              .keyHash_bucketStart;

          const key =
            `${keyHash}|${bucketStart.toISOString()}`;

          const attempts =
            (bucketAttempts.get(
              key,
            ) ?? 0) + 1;

          bucketAttempts.set(
            key,
            attempts,
          );

          return {
            attempts,
          };
        },
      );
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function loadRateLimiter() {
      return import(
        '@/server/security/application-recovery-rate-limit'
      );
    }

    it(
      'permite as primeiras oito tentativas para o mesmo protocolo',
      async () => {
        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        for (
          let attempt = 1;
          attempt <= 8;
          attempt++
        ) {
          const result =
            await consumeApplicationRecoveryRateLimit(
              {
                origin:
                  'ip:203.0.113.10',

                protocol:
                  'SS-PROTOCOL-1',
              },
            );

          expect(
            result.allowed,
          ).toBe(true);

          expect(
            result.targetAttempts,
          ).toBe(attempt);
        }
      },
    );

    it(
      'bloqueia a nona tentativa para o mesmo protocolo na mesma janela',
      async () => {
        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        for (
          let attempt = 1;
          attempt <= 8;
          attempt++
        ) {
          await consumeApplicationRecoveryRateLimit(
            {
              origin:
                'ip:203.0.113.10',

              protocol:
                'SS-PROTOCOL-1',
            },
          );
        }

        const blocked =
          await consumeApplicationRecoveryRateLimit(
            {
              origin:
                'ip:203.0.113.10',

              protocol:
                'SS-PROTOCOL-1',
            },
          );

        expect(
          blocked.allowed,
        ).toBe(false);

        expect(
          blocked.targetAttempts,
        ).toBe(9);
      },
    );

    it(
      'aplica o limite auxiliar de sessenta tentativas por origem',
      async () => {
        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        for (
          let attempt = 1;
          attempt <= 60;
          attempt++
        ) {
          const result =
            await consumeApplicationRecoveryRateLimit(
              {
                origin:
                  'ip:203.0.113.20',

                protocol:
                  `SS-TARGET-${attempt}`,
              },
            );

          expect(
            result.allowed,
          ).toBe(true);

          expect(
            result.originAttempts,
          ).toBe(attempt);
        }

        const blocked =
          await consumeApplicationRecoveryRateLimit(
            {
              origin:
                'ip:203.0.113.20',

              protocol:
                'SS-TARGET-61',
            },
          );

        expect(
          blocked.allowed,
        ).toBe(false);

        expect(
          blocked.originAttempts,
        ).toBe(61);

        expect(
          blocked.targetAttempts,
        ).toBe(1);
      },
    );

    it(
      'normaliza origem e protocolo antes de gerar as chaves do rate limit',
      async () => {
        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        await consumeApplicationRecoveryRateLimit(
          {
            origin:
              '  ip:203.0.113.30  ',

            protocol:
              '  ss-example-1  ',
          },
        );

        expect(
          mocks.createLookupHash,
        ).toHaveBeenCalledWith(
          'recovery-rate-limit:v1:origin:ip:203.0.113.30',
        );

        expect(
          mocks.createLookupHash,
        ).toHaveBeenCalledWith(
          'recovery-rate-limit:v1:target:SS-EXAMPLE-1',
        );
      },
    );

    it(
      'reinicia a contagem do protocolo quando começa uma nova janela',
      async () => {
        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        for (
          let attempt = 1;
          attempt <= 9;
          attempt++
        ) {
          await consumeApplicationRecoveryRateLimit(
            {
              origin:
                'ip:203.0.113.40',

              protocol:
                'SS-WINDOW-1',
            },
          );
        }

        vi.setSystemTime(
          new Date(
            '2026-08-14T15:16:00.000Z',
          ),
        );

        const result =
          await consumeApplicationRecoveryRateLimit(
            {
              origin:
                'ip:203.0.113.40',

              protocol:
                'SS-WINDOW-1',
            },
          );

        expect(
          result.allowed,
        ).toBe(true);

        expect(
          result.targetAttempts,
        ).toBe(1);

        expect(
          result.originAttempts,
        ).toBe(1);
      },
    );

    it(
      'remove buckets com mais de vinte e quatro horas',
      async () => {
        vi.setSystemTime(
          new Date(
            '2026-08-14T15:30:00.000Z',
          ),
        );

        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        await consumeApplicationRecoveryRateLimit(
          {
            origin:
              'ip:203.0.113.50',

            protocol:
              'SS-CLEANUP-1',
          },
        );

        expect(
          mocks.deleteMany,
        ).toHaveBeenCalledTimes(1);

        expect(
          mocks.deleteMany,
        ).toHaveBeenCalledWith({
          where: {
            bucketStart: {
              lt: new Date(
                '2026-08-13T15:30:00.000Z',
              ),
            },
          },
        });
      },
    );

    it(
      'continua aplicando o rate limit mesmo quando a limpeza falha',
      async () => {
        mocks.deleteMany
          .mockRejectedValueOnce(
            new Error(
              'cleanup failure',
            ),
          );

        const {
          consumeApplicationRecoveryRateLimit,
        } =
          await loadRateLimiter();

        const result =
          await consumeApplicationRecoveryRateLimit(
            {
              origin:
                'ip:203.0.113.60',

              protocol:
                'SS-CLEANUP-FAILURE',
            },
          );

        expect(
          result.allowed,
        ).toBe(true);

        expect(
          result.originAttempts,
        ).toBe(1);

        expect(
          result.targetAttempts,
        ).toBe(1);
      },
    );
  },
);
