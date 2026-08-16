import {
  readFileSync,
} from 'node:fs';

import {
  describe,
  expect,
  it,
} from 'vitest';

/*
 * Normaliza quebras de linha para que os
 * testes estáticos sejam independentes de
 * LF (Linux/macOS) ou CRLF (Windows).
 */
const source =
  readFileSync(
    'src/server/auth/admin-session.ts',
    'utf8',
  ).replace(
    /\r\n?/g,
    '\n',
  );

describe(
  'admin session lifecycle',
  () => {
    it(
      'mantém expiração absoluta de oito horas',
      () => {
        expect(
          source,
        ).toContain(
          'ADMIN_SESSION_MAX_AGE',
        );

        expect(
          source,
        ).toContain(
          '60 * 60 * 8',
        );
      },
    );

    it(
      'aplica idle timeout de trinta minutos',
      () => {
        expect(
          source,
        ).toContain(
          'ADMIN_SESSION_IDLE_TIMEOUT',
        );

        expect(
          source,
        ).toContain(
          '60 * 30',
        );

        expect(
          source,
        ).toContain(
          'idleTimeMs',
        );
      },
    );

    it(
      'inicializa lastUsedAt ao criar a sessão',
      () => {
        const createPosition =
          source.indexOf(
            '.adminSession\n    .create',
          );

        const lastUsedPosition =
          source.indexOf(
            'lastUsedAt:',
            createPosition,
          );

        expect(
          createPosition,
        ).toBeGreaterThan(
          -1,
        );

        expect(
          lastUsedPosition,
        ).toBeGreaterThan(
          createPosition,
        );
      },
    );

    it(
      'mantém compatibilidade com sessões antigas sem lastUsedAt',
      () => {
        expect(
          source,
        ).toContain(
          'session.lastUsedAt ??',
        );

        expect(
          source,
        ).toContain(
          'session.createdAt',
        );
      },
    );

    it(
      'limita a frequência de touch da sessão',
      () => {
        expect(
          source,
        ).toContain(
          'ADMIN_SESSION_TOUCH_INTERVAL',
        );

        expect(
          source,
        ).toContain(
          '60 * 5',
        );

        expect(
          source,
        ).toContain(
          '.updateMany',
        );
      },
    );

    it(
      'remove sessão de administrador desativado',
      () => {
        const inactivePosition =
          source.indexOf(
            '!session.user.isActive',
          );

        const deletePosition =
          source.indexOf(
            '.deleteMany',
            inactivePosition,
          );

        expect(
          inactivePosition,
        ).toBeGreaterThan(
          -1,
        );

        expect(
          deletePosition,
        ).toBeGreaterThan(
          inactivePosition,
        );
      },
    );

    it(
      'não altera o token durante o touch',
      () => {
        const updatePosition =
          source.indexOf(
            '.updateMany',
          );

        const updateSection =
          source.slice(
            updatePosition,
            source.indexOf(
              'return {',
              updatePosition,
            ),
          );

        expect(
          updateSection,
        ).toContain(
          'lastUsedAt:',
        );

        expect(
          updateSection,
        ).not.toContain(
          'tokenHash:',
        );
      },
    );
  },
);
