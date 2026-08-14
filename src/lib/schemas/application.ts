import * as z from 'zod';

import { isValidCpf } from '@/lib/validation/cpf';

const brazilianStates = new Set([
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]);

const employmentTypes = new Set([
  'clt',
  'autonomo',
  'empresario',
  'servidor',
  'aposentado',
  'outro',
]);

function isLeapYear(
  year: number,
) {
  return (
    year % 4 === 0 &&
    (
      year % 100 !== 0 ||
      year % 400 === 0
    )
  );
}

function isValidBirthDate(
  value: string,
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return false;
  }

  const [
    yearValue,
    monthValue,
    dayValue,
  ] = value
    .split('-')
    .map(Number);

  if (
    !yearValue ||
    monthValue < 1 ||
    monthValue > 12 ||
    dayValue < 1
  ) {
    return false;
  }

  const daysPerMonth = [
    31,
    isLeapYear(yearValue)
      ? 29
      : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const maximumDay =
    daysPerMonth[
      monthValue - 1
    ];

  if (
    !maximumDay ||
    dayValue > maximumDay
  ) {
    return false;
  }

  const today =
    new Date();

  const currentYear =
    today.getFullYear();

  const currentMonth =
    today.getMonth() + 1;

  const currentDay =
    today.getDate();

  if (
    yearValue > currentYear
  ) {
    return false;
  }

  if (
    yearValue === currentYear &&
    monthValue > currentMonth
  ) {
    return false;
  }

  if (
    yearValue === currentYear &&
    monthValue === currentMonth &&
    dayValue > currentDay
  ) {
    return false;
  }

  return true;
}

function isValidPhone(
  value: string,
) {
  const trimmed =
    value.trim();

  if (
    !/^[0-9()+\-\s]+$/.test(
      trimmed,
    )
  ) {
    return false;
  }

  const digits =
    trimmed.replace(
      /\D/g,
      '',
    );

  return (
    digits.length === 10 ||
    digits.length === 11
  );
}

function isValidCep(
  value: string,
) {
  return /^\d{5}-?\d{3}$/.test(
    value.trim(),
  );
}

function isValidState(
  value: string,
) {
  return brazilianStates.has(
    value
      .trim()
      .toUpperCase(),
  );
}

function isValidMonthlyIncome(
  value: string,
) {
  const normalized =
    value
      .trim()
      .replace(
        /^R\$\s*/u,
        '',
      )
      .replace(
        /\./g,
        '',
      )
      .replace(
        /\s/g,
        '',
      );

  if (
    !/^\d+$/.test(
      normalized,
    )
  ) {
    return false;
  }

  const amount =
    Number(normalized);

  return (
    Number.isSafeInteger(
      amount,
    ) &&
    amount > 0
  );
}

export const applicationSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        3,
        'Informe seu nome completo.',
      )
      .max(
        120,
        'Nome muito longo.',
      ),

    cpf: z
      .string()
      .trim()
      .min(
        1,
        'Informe seu CPF.',
      )
      .max(
        14,
        'Informe um CPF válido.',
      )
      .refine(
        isValidCpf,
        'Informe um CPF válido.',
      ),

    birthDate: z
      .string()
      .trim()
      .min(
        1,
        'Informe sua data de nascimento.',
      )
      .refine(
        isValidBirthDate,
        'Informe uma data de nascimento válida.',
      ),

    email: z
      .string()
      .trim()
      .min(
        1,
        'Informe seu e-mail.',
      )
      .max(
        254,
        'E-mail muito longo.',
      )
      .email(
        'Informe um e-mail válido.',
      ),

    phone: z
      .string()
      .trim()
      .min(
        1,
        'Informe seu telefone.',
      )
      .max(
        20,
        'Informe um telefone válido.',
      )
      .refine(
        isValidPhone,
        'Informe um telefone válido.',
      ),

    cep: z
      .string()
      .trim()
      .min(
        1,
        'Informe seu CEP.',
      )
      .max(
        9,
        'Informe um CEP válido.',
      )
      .refine(
        isValidCep,
        'Informe um CEP válido.',
      ),

    street: z
      .string()
      .trim()
      .min(
        3,
        'Informe seu endereço.',
      )
      .max(
        160,
        'Endereço muito longo.',
      ),

    number: z
      .string()
      .trim()
      .min(
        1,
        'Informe o número.',
      )
      .max(
        30,
        'Número muito longo.',
      ),

    complement: z
      .string()
      .trim()
      .max(
        120,
        'Complemento muito longo.',
      )
      .optional(),

    neighborhood: z
      .string()
      .trim()
      .min(
        2,
        'Informe o bairro.',
      )
      .max(
        100,
        'Bairro muito longo.',
      ),

    city: z
      .string()
      .trim()
      .min(
        2,
        'Informe a cidade.',
      )
      .max(
        100,
        'Cidade muito longa.',
      ),

    state: z
      .string()
      .trim()
      .length(
        2,
        'Informe a UF.',
      )
      .refine(
        isValidState,
        'Informe uma UF válida.',
      ),

    occupation: z
      .string()
      .trim()
      .min(
        2,
        'Informe sua ocupação.',
      )
      .max(
        120,
        'Ocupação muito longa.',
      ),

    monthlyIncome: z
      .string()
      .trim()
      .min(
        1,
        'Informe sua renda mensal.',
      )
      .max(
        40,
        'Informe uma renda mensal válida.',
      )
      .refine(
        isValidMonthlyIncome,
        'Informe uma renda mensal válida.',
      ),

    employmentType: z
      .string()
      .trim()
      .min(
        1,
        'Selecione sua situação profissional.',
      )
      .refine(
        (value) =>
          employmentTypes.has(
            value,
          ),
        'Selecione uma situação profissional válida.',
      ),
  });

export const creditApplicationRequestSchema =
  z.object({
    amount: z
      .number()
      .int()
      .min(
        500,
        'O valor mínimo é R$ 500.',
      )
      .max(
        10000,
        'O valor máximo é R$ 10.000.',
      ),

    months: z
      .number()
      .int()
      .min(
        3,
        'O prazo mínimo é de 3 meses.',
      )
      .max(
        24,
        'O prazo máximo é de 24 meses.',
      ),

    applicant:
      applicationSchema,
  });

export type CreditApplicationRequestData =
  z.infer<
    typeof creditApplicationRequestSchema
  >;

export type ApplicationFormData =
  z.infer<
    typeof applicationSchema
  >;
