import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  getProductionReadinessReport,
} from '@/config/production-readiness-report';

describe(
  'production readiness report',
  () => {
    it(
      'agrupa os nove blockers atuais por domínio operacional',
      () => {
        const report =
          getProductionReadinessReport();

        expect(
          report.ready,
        ).toBe(false);

        expect(
          report.blockers,
        ).toHaveLength(9);

        expect(
          report.blockers.map(
            (blocker) =>
              blocker.code,
          ),
        ).toEqual([
          'LEGAL_NAME',
          'DOCUMENT',
          'ADDRESS',
          'SUPPORT_EMAIL',
          'SUPPORT_PHONE',
          'SUPPORT_HOURS',
          'PRIVACY_EMAIL',
          'PRIVACY_OFFICER',
          'REGULATORY_AUTHORIZATION',
        ]);
      },
    );

    it(
      'mantém a distribuição operacional esperada',
      () => {
        const report =
          getProductionReadinessReport();

        const domains =
          report.blockers.reduce<
            Record<string, number>
          >(
            (
              result,
              blocker,
            ) => {
              result[blocker.domain] =
                (
                  result[blocker.domain] ??
                  0
                ) + 1;

              return result;
            },
            {},
          );

        expect(
          domains,
        ).toEqual({
          EMPRESA: 3,
          ATENDIMENTO: 3,
          PRIVACIDADE: 2,
          REGULATORIO: 1,
        });
      },
    );

    it(
      'não expõe valores institucionais no relatório',
      () => {
        const serialized =
          JSON.stringify(
            getProductionReadinessReport(),
          );

        expect(
          serialized,
        ).not.toContain(
          '00.000.000/0000-00',
        );

        expect(
          serialized,
        ).not.toContain(
          'atendimento@smithsterling.com.br',
        );

        expect(
          serialized,
        ).not.toContain(
          'privacidade@smithsterling.com.br',
        );

        expect(
          serialized,
        ).not.toContain(
          'Smith Sterling Crédito Digital Ltda.',
        );
      },
    );
  },
);
