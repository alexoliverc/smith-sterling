import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => {
  const tx = {
    creditApplication: {
      update: vi.fn(),
    },

    creditOffer: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },

    creditOfferStatusHistory: {
      create: vi.fn(),
    },
  };

  const transaction = vi.fn();

  return {
    tx,
    transaction,
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction:
      mocks.transaction,
  },
}));

import {
  CreditOfferFinancialIntegrityError,
  publishCreditOffer,
} from '@/server/workflows/credit-offer';

const validInput = {
  principalCents:
    100000,

  netDisbursementCents:
    95000,

  installmentCents:
    10000,

  totalRepaymentCents:
    120000,

  iofCents:
    3000,

  otherFeesCents:
    2000,

  months:
    12,

  installmentCount:
    12,

  monthlyRatePercent:
    '2.5',

  annualRatePercent:
    '34.49',

  cetAnnualPercent:
    '39.1',

  lateInterestMonthlyPercent:
    '1',

  latePenaltyPercent:
    '2',

  lateOtherChargesDescription:
    'Não há outros encargos de atraso além dos informados.',

  defaultConsequences:
    'O atraso poderá gerar os encargos informados e as medidas de cobrança previstas na contratação.',

  cetCompositionDescription:
    'O CET considera juros, IOF e os demais encargos informados nesta proposta.',

  firstDueDate:
    new Date(
      '2026-09-15T12:00:00.000Z',
    ),

  expiresAt:
    new Date(
      '2026-08-20T12:00:00.000Z',
    ),

  termsVersion:
    '2026-08-v1',
};

async function expectFinancialIntegrityFailure(
  overrides: Partial<
    typeof validInput
  >,
) {
  await expect(
    publishCreditOffer(
      'application-1',
      {
        ...validInput,
        ...overrides,
      },
      {
        actorId:
          'admin-1',
      },
    ),
  ).rejects.toBeInstanceOf(
    CreditOfferFinancialIntegrityError,
  );

  expect(
    mocks.tx.creditApplication.update,
  ).not.toHaveBeenCalled();

  expect(
    mocks.tx.creditOffer.create,
  ).not.toHaveBeenCalled();
}

describe(
  'credit-offer - integridade financeira',
  () => {
    beforeEach(() => {
      vi.useFakeTimers();

      vi.setSystemTime(
        new Date(
          '2026-08-14T15:00:00.000Z',
        ),
      );

      vi.clearAllMocks();

      mocks.transaction.mockImplementation(
        async (
          callback: (
            transactionClient:
              typeof mocks.tx,
          ) => unknown,
        ) =>
          callback(
            mocks.tx,
          ),
      );
    });

    it(
      'bloqueia total incompatível com parcela e quantidade',
      async () => {
        await expectFinancialIntegrityFailure({
          totalRepaymentCents:
            119999,
        });
      },
    );

    it.each([
      {
        name:
          'valor zero',

        principalCents:
          0,
      },

      {
        name:
          'valor negativo',

        principalCents:
          -1,
      },

      {
        name:
          'valor fracionário em centavos',

        principalCents:
          100000.5,
      },

      {
        name:
          'valor acima do INT do banco',

        principalCents:
          2147483648,
      },
    ])(
      'bloqueia $name',
      async ({
        principalCents,
      }) => {
        await expectFinancialIntegrityFailure({
          principalCents,
        });
      },
    );

    it.each([
      {
        name:
          'IOF negativo',

        iofCents:
          -1,
      },

      {
        name:
          'outros encargos negativos',

        otherFeesCents:
          -1,
      },

      {
        name:
          'IOF acima do INT do banco',

        iofCents:
          2147483648,
      },
    ])(
      'bloqueia $name',
      async ({
        iofCents,
        otherFeesCents,
      }) => {
        await expectFinancialIntegrityFailure({
          ...(iofCents !==
          undefined
            ? {
                iofCents,
              }
            : {}),

          ...(otherFeesCents !==
          undefined
            ? {
                otherFeesCents,
              }
            : {}),
        });
      },
    );

    it.each([
      'NaN',
      'Infinity',
      '-1',
      '1.123456789',
      '10000',
      'texto',
    ])(
      'bloqueia percentual inválido: %s',
      async (monthlyRatePercent) => {
        await expectFinancialIntegrityFailure({
          monthlyRatePercent,
        });
      },
    );

    it(
      'aceita formato compatível com Decimal(12,8)',
      async () => {
        /*
         * Não testamos publicação completa aqui.
         * Apenas usamos um percentual que deve
         * passar pela validação financeira.
         *
         * A execução seguirá até a primeira
         * operação de negócio no banco.
         */
        mocks.tx.creditApplication.update.mockResolvedValue({
          id:
            'application-1',

          status:
            'REJECTED',
        });

        await expect(
          publishCreditOffer(
            'application-1',
            {
              ...validInput,

              monthlyRatePercent:
                '9999.99999999',
            },
            {
              actorId:
                'admin-1',
            },
          ),
        ).rejects.not.toBeInstanceOf(
          CreditOfferFinancialIntegrityError,
        );
      },
    );

    it.each([
      {
        name:
          'prazo fracionário',

        months:
          12.5,
      },

      {
        name:
          'prazo zero',

        months:
          0,
      },

      {
        name:
          'mais de 120 meses',

        months:
          121,
      },

      {
        name:
          'quantidade de parcelas fracionária',

        installmentCount:
          12.5,
      },

      {
        name:
          'quantidade de parcelas zero',

        installmentCount:
          0,
      },

      {
        name:
          'mais de 120 parcelas',

        installmentCount:
          121,
      },
    ])(
      'bloqueia $name',
      async ({
        months,
        installmentCount,
      }) => {
        await expectFinancialIntegrityFailure({
          ...(months !==
          undefined
            ? {
                months,
              }
            : {}),

          ...(installmentCount !==
          undefined
            ? {
                installmentCount,
              }
            : {}),
        });
      },
    );

    it(
      'bloqueia primeiro vencimento inválido',
      async () => {
        await expectFinancialIntegrityFailure({
          firstDueDate:
            new Date(
              'invalid',
            ),
        });
      },
    );

    it(
      'bloqueia primeiro vencimento no passado',
      async () => {
        await expectFinancialIntegrityFailure({
          firstDueDate:
            new Date(
              '2026-08-13T12:00:00.000Z',
            ),
        });
      },
    );
  },
);
