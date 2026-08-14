import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  creditApplicationRequestSchema,
} from '@/lib/schemas/application';

const validApplicant = {
  name:
    'Cliente de Teste',

  cpf:
    '123.456.789-09',

  birthDate:
    '1990-05-20',

  email:
    'cliente@example.com',

  phone:
    '(73) 99999-9999',

  cep:
    '45810-000',

  street:
    'Rua de Teste',

  number:
    '100',

  complement:
    '',

  neighborhood:
    'Centro',

  city:
    'Porto Seguro',

  state:
    'BA',

  occupation:
    'Profissional',

  monthlyIncome:
    'R$ 5.000',

  employmentType:
    'clt',
};

describe(
  'creditApplicationRequestSchema',
  () => {
    it(
      'aceita os limites válidos de valor e prazo',
      () => {
        const minimum =
          creditApplicationRequestSchema.safeParse({
            amount: 500,
            months: 3,
            applicant:
              validApplicant,
          });

        const maximum =
          creditApplicationRequestSchema.safeParse({
            amount: 10000,
            months: 24,
            applicant:
              validApplicant,
          });

        expect(
          minimum.success,
        ).toBe(true);

        expect(
          maximum.success,
        ).toBe(true);
      },
    );

    it(
      'rejeita valor abaixo ou acima do intervalo permitido',
      () => {
        const below =
          creditApplicationRequestSchema.safeParse({
            amount: 499,
            months: 12,
            applicant:
              validApplicant,
          });

        const above =
          creditApplicationRequestSchema.safeParse({
            amount: 10001,
            months: 12,
            applicant:
              validApplicant,
          });

        expect(
          below.success,
        ).toBe(false);

        expect(
          above.success,
        ).toBe(false);
      },
    );

    it(
      'rejeita prazo abaixo ou acima do intervalo permitido',
      () => {
        const below =
          creditApplicationRequestSchema.safeParse({
            amount: 5000,
            months: 2,
            applicant:
              validApplicant,
          });

        const above =
          creditApplicationRequestSchema.safeParse({
            amount: 5000,
            months: 25,
            applicant:
              validApplicant,
          });

        expect(
          below.success,
        ).toBe(false);

        expect(
          above.success,
        ).toBe(false);
      },
    );

    it(
      'rejeita valor ou prazo fracionário',
      () => {
        const fractionalAmount =
          creditApplicationRequestSchema.safeParse({
            amount: 5000.5,
            months: 12,
            applicant:
              validApplicant,
          });

        const fractionalMonths =
          creditApplicationRequestSchema.safeParse({
            amount: 5000,
            months: 12.5,
            applicant:
              validApplicant,
          });

        expect(
          fractionalAmount.success,
        ).toBe(false);

        expect(
          fractionalMonths.success,
        ).toBe(false);
      },
    );
  },
);
