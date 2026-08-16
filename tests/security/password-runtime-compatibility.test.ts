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
      'usa Argon2id WebAssembly sem dependência nativa',
      () => {
        expect(
          passwordSource,
        ).toContain(
          "from 'hash-wasm';",
        );

        expect(
          passwordSource,
        ).not.toContain(
          "from 'argon2';",
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
      'mantém somente hash-wasm como implementação Argon2 de runtime',
      () => {
        expect(
          packageJson.dependencies?.['hash-wasm'],
        ).toBe(
          '4.12.0',
        );

        expect(
          packageJson.dependencies?.argon2,
        ).toBeUndefined();
      },
    );

    it(
      'preserva os parâmetros do hash existente',
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
          /outputType:\s*'binary'/,
        );
      },
    );
  },
);
