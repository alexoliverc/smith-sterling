import { hasProductionInstitutionalData } from '@/config/institution';

const APP_ENVIRONMENTS = [
  'local',
  'test',
  'staging',
  'production',
] as const;

export type AppEnvironment =
  (typeof APP_ENVIRONMENTS)[number];

function requireEnvironmentVariable(
  name: string,
) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} não está configurada.`,
    );
  }

  return value;
}

function getAppEnvironment():
  AppEnvironment {
  const value =
    requireEnvironmentVariable('APP_ENV');

  const isValid =
    APP_ENVIRONMENTS.some(
      (environment) =>
        environment === value,
    );

  if (!isValid) {
    throw new Error(
      'APP_ENV precisa ser local, test, staging ou production.',
    );
  }

  return value as AppEnvironment;
}

function validateDatabaseUrl(
  appEnvironment: AppEnvironment,
) {
  const value =
    requireEnvironmentVariable(
      'DATABASE_URL',
    );

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      'DATABASE_URL possui formato inválido.',
    );
  }

  if (url.protocol !== 'mysql:') {
    throw new Error(
      'DATABASE_URL precisa utilizar o protocolo mysql://',
    );
  }

  if (!url.hostname) {
    throw new Error(
      'DATABASE_URL precisa informar o host do banco.',
    );
  }

  if (!url.username) {
    throw new Error(
      'DATABASE_URL precisa informar o usuário do banco.',
    );
  }

  const databaseName =
    decodeURIComponent(
      url.pathname.replace(/^\/+/, ''),
    ).trim();

  if (!databaseName) {
    throw new Error(
      'DATABASE_URL precisa informar o nome do banco.',
    );
  }

  if (
    (
      appEnvironment === 'staging' ||
      appEnvironment === 'production'
    ) &&
    !url.password
  ) {
    throw new Error(
      'DATABASE_URL de staging e produção precisa possuir credencial de acesso.',
    );
  }
}

function decodePiiKey(
  name:
    | 'PII_ENCRYPTION_KEY'
    | 'PII_LOOKUP_KEY',
) {
  const value =
    requireEnvironmentVariable(name);

  const key =
    Buffer.from(value, 'base64');

  if (key.length !== 32) {
    throw new Error(
      `${name} precisa conter exatamente 32 bytes em Base64.`,
    );
  }

  return key;
}

export function validateRuntimeEnvironment() {
  const appEnvironment =
    getAppEnvironment();

  validateDatabaseUrl(
    appEnvironment,
  );

  const encryptionKey =
    decodePiiKey(
      'PII_ENCRYPTION_KEY',
    );

  const lookupKey =
    decodePiiKey(
      'PII_LOOKUP_KEY',
    );

  if (encryptionKey.equals(lookupKey)) {
    throw new Error(
      'PII_ENCRYPTION_KEY e PII_LOOKUP_KEY precisam ser chaves distintas.',
    );
  }

  if (
    appEnvironment === 'production' &&
    !hasProductionInstitutionalData()
  ) {
    throw new Error(
      'Inicialização de produção bloqueada: os dados institucionais ainda não estão prontos para publicação.',
    );
  }

  return {
    appEnvironment,
  };
}
