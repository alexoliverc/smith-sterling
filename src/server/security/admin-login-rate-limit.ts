import 'server-only';

import {
  prisma,
} from '@/lib/prisma';

import {
  createLookupHash,
} from '@/lib/security/pii';

const LOGIN_WINDOW_MS =
  15 * 60 * 1000;

const RATE_LIMIT_RETENTION_MS =
  24 * 60 * 60 * 1000;

const CLEANUP_INTERVAL_MS =
  60 * 60 * 1000;

/*
 * Toda tentativa consome o limite auxiliar
 * de origem.
 *
 * O limite por alvo representa somente
 * falhas de autenticação da conta.
 */
const ORIGIN_MAX_ATTEMPTS =
  30;

const TARGET_MAX_FAILURES =
  8;

let lastCleanupAt =
  0;

type AdminLoginRateLimitIdentity = {
  email:
    string;
};

type CheckAdminLoginRateLimitInput =
  AdminLoginRateLimitIdentity & {
    forwardedFor:
      string | null;

    realIp:
      string | null;

    userAgent:
      string | null;
  };

function getBucketStart(
  now:
    Date,
) {
  return new Date(
    Math.floor(
      now.getTime() /
        LOGIN_WINDOW_MS,
    ) *
      LOGIN_WINDOW_MS,
  );
}

function normalizeOrigin(
  input:
    Pick<
      CheckAdminLoginRateLimitInput,
      | 'forwardedFor'
      | 'realIp'
      | 'userAgent'
    >,
) {
  const firstForwardedAddress =
    input.forwardedFor
      ?.split(
        ',',
      )[0]
      ?.trim();

  const normalizedRealIp =
    input.realIp
      ?.trim();

  if (
    normalizedRealIp
  ) {
    return `ip:${normalizedRealIp.slice(
      0,
      256,
    )}`;
  }

  if (
    firstForwardedAddress
  ) {
    return `ip:${firstForwardedAddress.slice(
      0,
      256,
    )}`;
  }

  return `fallback:${(
    input.userAgent ??
    'unknown-agent'
  )
    .trim()
    .slice(
      0,
      160,
    )}`;
}

function normalizeEmail(
  value:
    string,
) {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .slice(
        0,
        191,
      );

  return (
    normalized ||
    'empty'
  );
}

function createOriginKeyHash(
  input:
    Pick<
      CheckAdminLoginRateLimitInput,
      | 'forwardedFor'
      | 'realIp'
      | 'userAgent'
    >,
) {
  return createLookupHash(
    `admin-login-rate-limit:v1:origin:${normalizeOrigin(
      input,
    )}`,
  );
}

function createTargetKeyHash(
  email:
    string,
) {
  return createLookupHash(
    `admin-login-rate-limit:v1:target:${normalizeEmail(
      email,
    )}`,
  );
}

async function consumeBucket(
  keyHash:
    string,

  bucketStart:
    Date,
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
          attempts:
            1,
        },

        update: {
          attempts: {
            increment:
              1,
          },
        },

        select: {
          attempts:
            true,
        },
      });
  }
  catch (
    upsertError
  ) {
    /*
     * Duas requisições podem disputar a
     * criação do mesmo bucket.
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
              increment:
                1,
            },
          },

          select: {
            attempts:
              true,
          },
        });
    }
    catch {
      throw upsertError;
    }
  }
}

async function getBucketAttempts(
  keyHash:
    string,

  bucketStart:
    Date,
) {
  const bucket =
    await prisma
      .applicationRecoveryRateLimitBucket
      .findUnique({
        where: {
          keyHash_bucketStart: {
            keyHash,
            bucketStart,
          },
        },

        select: {
          attempts:
            true,
        },
      });

  return (
    bucket?.attempts ??
    0
  );
}

async function cleanupExpiredBuckets(
  now:
    Date,
) {
  const nowMs =
    now.getTime();

  if (
    nowMs -
      lastCleanupAt <
    CLEANUP_INTERVAL_MS
  ) {
    return;
  }

  lastCleanupAt =
    nowMs;

  const retentionLimit =
    new Date(
      nowMs -
        RATE_LIMIT_RETENTION_MS,
    );

  try {
    await prisma
      .applicationRecoveryRateLimitBucket
      .deleteMany({
        where: {
          bucketStart: {
            lt:
              retentionLimit,
          },
        },
      });
  }
  catch {
    /*
     * Limpeza é manutenção operacional.
     * A autenticação continua fail-closed
     * caso a operação principal do limiter
     * não possa ser executada.
     */
  }
}

function getRetryAfterSeconds(
  bucketStart:
    Date,

  now:
    Date,
) {
  const nextBucketAt =
    bucketStart.getTime() +
    LOGIN_WINDOW_MS;

  return Math.max(
    1,
    Math.ceil(
      (
        nextBucketAt -
        now.getTime()
      ) /
        1000,
    ),
  );
}

export async function checkAdminLoginRateLimit(
  input:
    CheckAdminLoginRateLimitInput,
) {
  const now =
    new Date();

  const bucketStart =
    getBucketStart(
      now,
    );

  await cleanupExpiredBuckets(
    now,
  );

  const originKeyHash =
    createOriginKeyHash(
      input,
    );

  const targetKeyHash =
    createTargetKeyHash(
      input.email,
    );

  /*
   * Origem consome uma tentativa em toda
   * requisição.
   *
   * O alvo é apenas consultado aqui.
   * Uma autenticação válida não deve
   * aumentar seu contador de falhas.
   */
  const [
    originBucket,
    targetFailures,
  ] =
    await Promise.all([
      consumeBucket(
        originKeyHash,
        bucketStart,
      ),

      getBucketAttempts(
        targetKeyHash,
        bucketStart,
      ),
    ]);

  const originAllowed =
    originBucket.attempts <=
    ORIGIN_MAX_ATTEMPTS;

  const targetAllowed =
    targetFailures <
    TARGET_MAX_FAILURES;

  return {
    allowed:
      originAllowed &&
      targetAllowed,

    originAttempts:
      originBucket.attempts,

    targetFailures,

    retryAfterSeconds:
      getRetryAfterSeconds(
        bucketStart,
        now,
      ),
  };
}

export async function recordAdminLoginFailure(
  input:
    AdminLoginRateLimitIdentity,
) {
  const now =
    new Date();

  const bucketStart =
    getBucketStart(
      now,
    );

  const targetKeyHash =
    createTargetKeyHash(
      input.email,
    );

  const targetBucket =
    await consumeBucket(
      targetKeyHash,
      bucketStart,
    );

  return {
    targetFailures:
      targetBucket.attempts,

    blocked:
      targetBucket.attempts >=
      TARGET_MAX_FAILURES,

    retryAfterSeconds:
      getRetryAfterSeconds(
        bucketStart,
        now,
      ),
  };
}
