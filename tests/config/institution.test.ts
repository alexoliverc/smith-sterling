import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  getProductionInstitutionalReadiness,
  hasProductionInstitutionalData,
  productionInstitutionalRequirements,
} from '@/config/institution';

describe(
  'production institutional readiness',
  () => {
    it(
      'expõe explicitamente todos os requisitos pendentes atuais',
      () => {
        expect(
          getProductionInstitutionalReadiness(),
        ).toEqual({
          ready: false,

          missingRequirements: [
            'LEGAL_NAME',
            'DOCUMENT',
            'ADDRESS',
            'SUPPORT_EMAIL',
            'SUPPORT_PHONE',
            'SUPPORT_HOURS',
            'PRIVACY_EMAIL',
            'PRIVACY_OFFICER',
            'REGULATORY_AUTHORIZATION',
          ],
        });
      },
    );

    it(
      'mantém o booleano de compatibilidade derivado do readiness gate',
      () => {
        expect(
          hasProductionInstitutionalData(),
        ).toBe(false);
      },
    );

    it(
      'mantém códigos de requisito únicos',
      () => {
        const codes =
          productionInstitutionalRequirements.map(
            (requirement) =>
              requirement.code,
          );

        expect(
          new Set(codes).size,
        ).toBe(
          codes.length,
        );
      },
    );
  },
);
