import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  applicationSchema,
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
    'Apto 1',

  neighborhood:
    'Centro',

  city:
    'Cidade Teste',

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
  'applicationSchema',
  () => {
    beforeEach(() => {
      vi.useFakeTimers();

      vi.setSystemTime(
        new Date(
          '2026-08-14T15:00:00.000Z',
        ),
      );
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it(
      'aceita uma solicitação válida',
      () => {
        const result =
          applicationSchema.safeParse(
            validApplicant,
          );

        expect(
          result.success,
        ).toBe(true);
      },
    );

    it(
      'rejeita data inexistente e data futura',
      () => {
        const invalidDate =
          applicationSchema.safeParse({
            ...validApplicant,

            birthDate:
              '2026-02-31',
          });

        const futureDate =
          applicationSchema.safeParse({
            ...validApplicant,

            birthDate:
              '2027-01-01',
          });

        expect(
          invalidDate.success,
        ).toBe(false);

        expect(
          futureDate.success,
        ).toBe(false);
      },
    );

    it(
      'aceita telefone brasileiro com dez ou onze dígitos e rejeita conteúdo inválido',
      () => {
        const landline =
          applicationSchema.safeParse({
            ...validApplicant,

            phone:
              '(73) 3333-4444',
          });

        const mobile =
          applicationSchema.safeParse({
            ...validApplicant,

            phone:
              '(73) 99999-9999',
          });

        const invalid =
          applicationSchema.safeParse({
            ...validApplicant,

            phone:
              'telefone 73999999999',
          });

        expect(
          landline.success,
        ).toBe(true);

        expect(
          mobile.success,
        ).toBe(true);

        expect(
          invalid.success,
        ).toBe(false);
      },
    );

    it(
      'valida CEP pela estrutura de oito dígitos',
      () => {
        const formatted =
          applicationSchema.safeParse({
            ...validApplicant,

            cep:
              '45810-000',
          });

        const digitsOnly =
          applicationSchema.safeParse({
            ...validApplicant,

            cep:
              '45810000',
          });

        const invalid =
          applicationSchema.safeParse({
            ...validApplicant,

            cep:
              '4581-000',
          });

        expect(
          formatted.success,
        ).toBe(true);

        expect(
          digitsOnly.success,
        ).toBe(true);

        expect(
          invalid.success,
        ).toBe(false);
      },
    );

    it(
      'aceita somente UFs brasileiras',
      () => {
        const valid =
          applicationSchema.safeParse({
            ...validApplicant,

            state:
              'SP',
          });

        const invalid =
          applicationSchema.safeParse({
            ...validApplicant,

            state:
              'XX',
          });

        expect(
          valid.success,
        ).toBe(true);

        expect(
          invalid.success,
        ).toBe(false);
      },
    );

    it(
      'aceita renda positiva e rejeita zero ou texto arbitrário',
      () => {
        const valid =
          applicationSchema.safeParse({
            ...validApplicant,

            monthlyIncome:
              'R$ 5.000',
          });

        const zero =
          applicationSchema.safeParse({
            ...validApplicant,

            monthlyIncome:
              'R$ 0',
          });

        const arbitrary =
          applicationSchema.safeParse({
            ...validApplicant,

            monthlyIncome:
              'cinco mil',
          });

        expect(
          valid.success,
        ).toBe(true);

        expect(
          zero.success,
        ).toBe(false);

        expect(
          arbitrary.success,
        ).toBe(false);
      },
    );

    it(
      'rejeita situação profissional fora das opções permitidas',
      () => {
        const result =
          applicationSchema.safeParse({
            ...validApplicant,

            employmentType:
              'valor-inventado',
          });

        expect(
          result.success,
        ).toBe(false);
      },
    );
  },
);
