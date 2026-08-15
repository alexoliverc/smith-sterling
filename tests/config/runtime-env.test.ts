import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  validateRuntimeEnvironment,
} from '@/config/runtime-env';

const encryptionKey =
  Buffer.alloc(32, 1).toString('base64');

const lookupKey =
  Buffer.alloc(32, 2).toString('base64');

function configureValidEnvironment(
  appEnvironment:
    | 'local'
    | 'test'
    | 'staging'
    | 'production' = 'local',
) {
  vi.stubEnv(
    'APP_ENV',
    appEnvironment,
  );

  const databaseUrl =
    new URL(
      'mysql://127.0.0.1:3306/smith_sterling',
    );

  databaseUrl.username =
    'smith_app';

  databaseUrl.password =
    'test-password';

  vi.stubEnv(
    'DATABASE_URL',
    databaseUrl.toString(),
  );

  vi.stubEnv(
    'PII_ENCRYPTION_KEY',
    encryptionKey,
  );

  vi.stubEnv(
    'PII_LOOKUP_KEY',
    lookupKey,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe(
  'validateRuntimeEnvironment',
  () => {
    it(
      'aceita um ambiente local válido',
      () => {
        configureValidEnvironment();

        expect(
          validateRuntimeEnvironment(),
        ).toEqual({
          appEnvironment: 'local',
        });
      },
    );

    it(
      'bloqueia DATABASE_URL ausente',
      () => {
        configureValidEnvironment();

        vi.stubEnv(
          'DATABASE_URL',
          undefined,
        );

        expect(
          () =>
            validateRuntimeEnvironment(),
        ).toThrow(
          'DATABASE_URL não está configurada.',
        );
      },
    );

    it(
      'bloqueia protocolo de banco inválido',
      () => {
        configureValidEnvironment();

        vi.stubEnv(
          'DATABASE_URL',
          'postgresql://app:secret@127.0.0.1:5432/smith_sterling',
        );

        expect(
          () =>
            validateRuntimeEnvironment(),
        ).toThrow(
          'DATABASE_URL precisa utilizar o protocolo mysql://',
        );
      },
    );

    it(
      'bloqueia chave de PII com tamanho inválido',
      () => {
        configureValidEnvironment();

        vi.stubEnv(
          'PII_ENCRYPTION_KEY',
          Buffer.alloc(16).toString(
            'base64',
          ),
        );

        expect(
          () =>
            validateRuntimeEnvironment(),
        ).toThrow(
          'PII_ENCRYPTION_KEY precisa conter exatamente 32 bytes em Base64.',
        );
      },
    );

    it(
      'bloqueia reutilização da mesma chave de PII',
      () => {
        configureValidEnvironment();

        vi.stubEnv(
          'PII_LOOKUP_KEY',
          encryptionKey,
        );

        expect(
          () =>
            validateRuntimeEnvironment(),
        ).toThrow(
          'PII_ENCRYPTION_KEY e PII_LOOKUP_KEY precisam ser chaves distintas.',
        );
      },
    );

    it(
      'bloqueia produção enquanto existirem dados institucionais provisórios',
      () => {
        configureValidEnvironment(
          'production',
        );

        expect(
          () =>
            validateRuntimeEnvironment(),
        ).toThrow(
          'Inicialização de produção bloqueada',
        );
      },
    );
  },
);
