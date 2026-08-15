import {
  readFileSync,
} from 'node:fs';

import {
  resolve,
} from 'node:path';

import {
  describe,
  expect,
  it,
} from 'vitest';

const formalizationDalPaths = [
  'src/server/dal/admin-formalization.ts',
  'src/server/dal/credit-formalization.ts',
];

describe(
  'formalization authoritative offer regression guard',
  () => {
    it(
      'keeps formalization DALs independent from application.offers fallback',
      () => {
        for (
          const relativePath
          of formalizationDalPaths
        ) {
          const source =
            readFileSync(
              resolve(
                process.cwd(),
                relativePath,
              ),
              'utf8',
            );

          /*
           * A formalização não pode voltar
           * a inferir a proposta contratada
           * através da coleção de propostas
           * da solicitação.
           */
          expect(
            source,
          ).not.toMatch(
            /\bapplication\s*\.\s*offers\b/,
          );

          expect(
            source,
          ).not.toMatch(
            /\boffers\s*\[\s*0\s*\]/,
          );

          /*
           * O vínculo persistido na própria
           * formalização deve continuar sendo
           * explicitamente utilizado.
           */
          expect(
            source,
          ).toContain(
            'acceptedOfferId',
          );

          expect(
            source,
          ).toContain(
            'acceptedOffer',
          );
        }
      },
    );
  },
);
