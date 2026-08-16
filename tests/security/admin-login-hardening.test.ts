import {
  readFileSync,
} from 'node:fs';

import {
  describe,
  expect,
  it,
} from 'vitest';

function source(
  path:
    string,
) {
  return readFileSync(
    path,
    'utf8',
  );
}

describe(
  'admin login hardening',
  () => {
    it(
      'mantém um caminho Argon2 para contas inexistentes ou inativas',
      () => {
        const password =
          source(
            'src/lib/auth/password.ts',
          );

        const login =
          source(
            'src/app/admin/login/actions.ts',
          );

        expect(
          password,
        ).toContain(
          'PASSWORD_VERIFICATION_PLACEHOLDER',
        );

        expect(
          password,
        ).toContain(
          'verifyPasswordAgainstPlaceholder',
        );

        expect(
          login,
        ).toContain(
          'verifyPasswordAgainstPlaceholder',
        );
      },
    );

    it(
      'não realiza quick exit de conta inexistente antes da verificação de senha',
      () => {
        const login =
          source(
            'src/app/admin/login/actions.ts',
          );

        const queryPosition =
          login.indexOf(
            '.adminUser',
          );

        const passwordPath =
          login.indexOf(
            'const passwordIsValid',
          );

        const placeholderPosition =
          login.indexOf(
            'verifyPasswordAgainstPlaceholder',
            passwordPath,
          );

        const rejectionPosition =
          login.indexOf(
            '!admin ||',
            passwordPath,
          );

        expect(
          queryPosition,
        ).toBeGreaterThan(
          -1,
        );

        expect(
          placeholderPosition,
        ).toBeGreaterThan(
          queryPosition,
        );

        expect(
          rejectionPosition,
        ).toBeGreaterThan(
          placeholderPosition,
        );
      },
    );

    it(
      'aplica namespaces criptográficos distintos para origem e alvo',
      () => {
        const limiter =
          source(
            'src/server/security/admin-login-rate-limit.ts',
          );

        expect(
          limiter,
        ).toContain(
          'createLookupHash',
        );

        expect(
          limiter,
        ).toContain(
          'admin-login-rate-limit:v1:origin:',
        );

        expect(
          limiter,
        ).toContain(
          'admin-login-rate-limit:v1:target:',
        );

        expect(
          limiter,
        ).toContain(
          'applicationRecoveryRateLimitBucket',
        );
      },
    );

    it(
      'consulta o limite do alvo sem incrementar falhas antes da autenticação',
      () => {
        const limiter =
          source(
            'src/server/security/admin-login-rate-limit.ts',
          );

        const checkStart =
          limiter.indexOf(
            'export async function checkAdminLoginRateLimit',
          );

        const failureStart =
          limiter.indexOf(
            'export async function recordAdminLoginFailure',
          );

        const checkSection =
          limiter.slice(
            checkStart,
            failureStart,
          );

        expect(
          checkSection,
        ).toContain(
          'getBucketAttempts',
        );

        expect(
          checkSection,
        ).toContain(
          'consumeBucket',
        );

        expect(
          checkSection,
        ).toContain(
          'targetFailures',
        );

        expect(
          checkSection,
        ).not.toContain(
          'recordAdminLoginFailure',
        );
      },
    );

    it(
      'incrementa o alvo somente no caminho de credencial inválida',
      () => {
        const login =
          source(
            'src/app/admin/login/actions.ts',
          );

        const invalidBranch =
          login.indexOf(
            '!admin ||',
          );

        const recordFailure =
          login.indexOf(
            'recordAdminLoginFailure',
            invalidBranch,
          );

        const createSession =
          login.indexOf(
            'createAdminSession',
            recordFailure,
          );

        expect(
          invalidBranch,
        ).toBeGreaterThan(
          -1,
        );

        expect(
          recordFailure,
        ).toBeGreaterThan(
          invalidBranch,
        );

        expect(
          createSession,
        ).toBeGreaterThan(
          recordFailure,
        );
      },
    );

    it(
      'mantém respostas genéricas e atraso mínimo de falha',
      () => {
        const login =
          source(
            'src/app/admin/login/actions.ts',
          );

        expect(
          login,
        ).toContain(
          'MINIMUM_FAILURE_TIME_MS',
        );

        expect(
          login,
        ).toContain(
          'waitForMinimumFailureTime',
        );

        expect(
          login,
        ).toContain(
          'E-mail ou senha inválidos.',
        );

        expect(
          login,
        ).not.toContain(
          'E-mail não encontrado',
        );

        expect(
          login,
        ).not.toContain(
          'Usuário não encontrado',
        );
      },
    );
  },
);
