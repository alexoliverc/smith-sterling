import { config } from 'dotenv';

config({
  path: '.env.test',
  override: true,
});

function assertTestDatabase(
  variableName: string,
  expectedDatabase: string,
) {
  const value =
    process.env[variableName];

  if (!value) {
    throw new Error(
      `${variableName} não está configurada para os testes de integração.`,
    );
  }

  const url =
    new URL(value);

  const databaseName =
    decodeURIComponent(
      url.pathname.replace(
        /^\/+/,
        '',
      ),
    );

  if (
    url.protocol !== 'mysql:' ||
    databaseName !== expectedDatabase
  ) {
    throw new Error(
      `BLOQUEADO: ${variableName} precisa apontar exclusivamente para ${expectedDatabase}.`,
    );
  }
}

assertTestDatabase(
  'DATABASE_URL',
  'smith_sterling_test',
);

assertTestDatabase(
  'SHADOW_DATABASE_URL',
  'smith_sterling_test_shadow',
);
