import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  describe,
  expect,
  it,
} from 'vitest';

const actionFiles = [
  'src/app/admin/actions.ts',
  'src/app/admin/login/actions.ts',
  'src/app/admin/solicitacoes/[protocol]/actions.ts',
  'src/app/admin/solicitacoes/[protocol]/oferta/actions.ts',
  'src/app/admin/solicitacoes/[protocol]/formalizacao/actions.ts',
  'src/app/acompanhar/actions.ts',
  'src/app/solicitacao/actions.ts',
  'src/app/solicitacao/[protocol]/proposta/actions.ts',
  'src/app/solicitacao/[protocol]/formalizacao/actions.ts',
];

function getConsoleStatements(source: string) {
  return [
    ...source.matchAll(
      /console\.(?:log|info|warn|error)\([\s\S]*?\);/g,
    ),
  ].map((match) => match[0]);
}

describe('server action logging', () => {
  it('does not log raw Error.message values', () => {
    for (const file of actionFiles) {
      const source = readFileSync(
        resolve(process.cwd(), file),
        'utf8',
      );

      const statements =
        getConsoleStatements(source);

      for (const statement of statements) {
        expect(
          statement,
          `${file}: ${statement}`,
        ).not.toContain(
          'error.message',
        );
      }
    }
  });

  it('does not log submitted or parsed sensitive payloads', () => {
    for (const file of actionFiles) {
      const source = readFileSync(
        resolve(process.cwd(), file),
        'utf8',
      );

      const statements =
        getConsoleStatements(source);

      for (const statement of statements) {
        expect(
          statement,
          `${file}: ${statement}`,
        ).not.toMatch(
          /\b(?:formData|parsed\.data|bankData|accessToken|password)\b/,
        );
      }
    }
  });
});