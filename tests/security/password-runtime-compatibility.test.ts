import {
  readFileSync,
} from 'node:fs';

import {
  dirname,
  resolve,
} from 'node:path';

import {
  fileURLToPath,
} from 'node:url';

import {
  describe,
  expect,
  it,
} from 'vitest';

const currentDirectory =
  dirname(
    fileURLToPath(
      import.meta.url,
    ),
  );

const projectRoot =
  resolve(
    currentDirectory,
    '../..',
  );

const passwordSource =
  readFileSync(
    resolve(
      projectRoot,
      'src/lib/auth/password.ts',
    ),
    'utf8',
  );

const packageJson =
  JSON.parse(
    readFileSync(
      resolve(
        projectRoot,
        'package.json',
      ),
      'utf8',
    ),
  ) as {
    dependencies?: Record<
      string,
      string
    >;
  };

describe(
  'password runtime compatibility',
  () => {
    it(
      'usa o pacote argon2 em vez de node:crypto.argon2',
      () => {
        expect(
          passwordSource,
        ).toContain(
          "import * as argon2 from 'argon2';",
        );

        const cryptoImport =
          passwordSource.match(
            /import\s*\{([\s\S]*?)\}\s*from\s*['"]node:crypto['"]/,
          )?.[1] ?? '';

        expect(
          cryptoImport,
        ).not.toMatch(
          /\bargon2\b/,
        );
      },
    );

    it(
      'mantém argon2 como dependência de runtime',
      () => {
        expect(
          packageJson.dependencies?.argon2,
        ).toBe(
          '^0.45.1',
        );
      },
    );

    it(
      'preserva os parâmetros do hash legado',
      () => {
        expect(
          passwordSource,
        ).toMatch(
          /const MEMORY\s*=\s*19 \* 1024;/,
        );

        expect(
          passwordSource,
        ).toMatch(
          /const PASSES\s*=\s*2;/,
        );

        expect(
          passwordSource,
        ).toMatch(
          /const PARALLELISM\s*=\s*1;/,
        );

        expect(
          passwordSource,
        ).toMatch(
          /const TAG_LENGTH\s*=\s*32;/,
        );

        expect(
          passwordSource,
        ).toMatch(
          /const SALT_LENGTH\s*=\s*16;/,
        );

        expect(
          passwordSource,
        ).toMatch(
          /const ARGON2_VERSION\s*=\s*0x13;/,
        );

        expect(
          passwordSource,
        ).toMatch(
          /raw:\s*true/,
        );
      },
    );
  },
);
