import 'server-only';

import {
  argon2,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const MEMORY =
  19 * 1024;

const PASSES =
  2;

const PARALLELISM =
  1;

const TAG_LENGTH =
  32;

const SALT_LENGTH =
  16;

/*
 * Hash sintaticamente válido usado somente
 * para equalizar o custo de autenticação
 * quando a conta consultada não existe ou
 * está inativa.
 *
 * Não representa uma credencial real.
 */
const PASSWORD_VERIFICATION_PLACEHOLDER =
  [
    'v1',
    'argon2id',
    `m=${MEMORY},t=${PASSES},p=${PARALLELISM}`,
    Buffer.alloc(
      SALT_LENGTH,
    ).toString(
      'base64url',
    ),
    Buffer.alloc(
      TAG_LENGTH,
    ).toString(
      'base64url',
    ),
  ].join(
    '$',
  );

function derivePasswordKey(
  password:
    string,

  salt:
    Buffer,
): Promise<Buffer> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      argon2(
        'argon2id',
        {
          message:
            password,

          nonce:
            salt,

          parallelism:
            PARALLELISM,

          tagLength:
            TAG_LENGTH,

          memory:
            MEMORY,

          passes:
            PASSES,
        },
        (
          error,
          derivedKey,
        ) => {
          if (error) {
            reject(
              error,
            );

            return;
          }

          resolve(
            derivedKey,
          );
        },
      );
    },
  );
}

export async function hashPassword(
  password:
    string,
) {
  if (
    password.length <
    12
  ) {
    throw new Error(
      'A senha precisa ter pelo menos 12 caracteres.',
    );
  }

  const salt =
    randomBytes(
      SALT_LENGTH,
    );

  const hash =
    await derivePasswordKey(
      password,
      salt,
    );

  return [
    'v1',
    'argon2id',
    `m=${MEMORY},t=${PASSES},p=${PARALLELISM}`,
    salt.toString(
      'base64url',
    ),
    hash.toString(
      'base64url',
    ),
  ].join(
    '$',
  );
}

export async function verifyPassword(
  password:
    string,

  storedHash:
    string,
) {
  try {
    const parts =
      storedHash.split(
        '$',
      );

    if (
      parts.length !==
      5
    ) {
      return false;
    }

    const [
      version,
      algorithm,
      parameters,
      saltValue,
      hashValue,
    ] =
      parts;

    if (
      version !==
        'v1' ||
      algorithm !==
        'argon2id' ||
      parameters !==
        `m=${MEMORY},t=${PASSES},p=${PARALLELISM}`
    ) {
      return false;
    }

    const salt =
      Buffer.from(
        saltValue,
        'base64url',
      );

    const expectedHash =
      Buffer.from(
        hashValue,
        'base64url',
      );

    const actualHash =
      await derivePasswordKey(
        password,
        salt,
      );

    if (
      expectedHash.length !==
      actualHash.length
    ) {
      return false;
    }

    return timingSafeEqual(
      expectedHash,
      actualHash,
    );
  }
  catch {
    return false;
  }
}

export async function verifyPasswordAgainstPlaceholder(
  password:
    string,
) {
  return verifyPassword(
    password,
    PASSWORD_VERIFICATION_PLACEHOLDER,
  );
}
