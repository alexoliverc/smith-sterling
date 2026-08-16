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
  'public institutional placeholder exposure',
  () => {
    it(
      'não renderiza a razão social provisória diretamente nas páginas legais',
      () => {
        const privacy =
          source(
            'src/app/privacidade/page.tsx',
          );

        const terms =
          source(
            'src/app/termos/page.tsx',
          );

        expect(
          privacy,
        ).toContain(
          'institution.legalNameIsPlaceholder',
        );

        expect(
          terms,
        ).toContain(
          'institution.legalNameIsPlaceholder',
        );

        expect(
          privacy,
        ).not.toContain(
          '{institution.legalName}',
        );

        expect(
          terms,
        ).not.toContain(
          '{institution.legalName}',
        );
      },
    );

    it(
      'inclui a razão social no gate de identidade da proposta',
      () => {
        const proposal =
          source(
            'src/app/solicitacao/[protocol]/proposta/page.tsx',
          );

        expect(
          proposal,
        ).toContain(
          '!institution.legalNameIsPlaceholder',
        );
      },
    );

    it(
      'não apresenta o modelo regulatório sem confirmação',
      () => {
        const about =
          source(
            'src/app/sobre/page.tsx',
          );

        expect(
          about,
        ).toContain(
          'institution.regulatory.authorizationConfirmed ?',
        );

        expect(
          about,
        ).toContain(
          'As informações regulatórias definitivas ainda não estão confirmadas para publicação.',
        );
      },
    );
  },
);
