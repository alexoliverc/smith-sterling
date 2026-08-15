import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  findApplicationForSession:
    vi.fn(),

  creditApplicationFindUnique:
    vi.fn(),
}));

vi.mock(
  '@/server/dal/credit-application',
  () => ({
    findApplicationForSession:
      mocks.findApplicationForSession,
  }),
);

vi.mock(
  '@/lib/prisma',
  () => ({
    prisma: {
      creditApplication: {
        findUnique:
          mocks.creditApplicationFindUnique,
      },
    },
  }),
);

import {
  getPublicCreditOfferForSession,
} from '@/server/dal/public-credit-offer';

describe(
  'public-credit-offer DAL',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it(
      'exclui DRAFT e busca a versão pública mais recente',
      async () => {
        mocks.findApplicationForSession.mockResolvedValue({
          publicProtocol:
            'SS-TESTE',

          status:
            'APPROVED',

          amount:
            5000,

          months:
            12,

          submittedAt:
            new Date(
              '2026-08-14T12:00:00.000Z',
            ),
        });

        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          publicProtocol:
            'SS-TESTE',

          offers: [
            {
              version:
                2,

              status:
                'PRESENTED',

              principalCents:
                500000,

              netDisbursementCents:
                500000,

              installmentCents:
                50000,

              totalRepaymentCents:
                600000,

              iofCents:
                0,

              otherFeesCents:
                0,

              months:
                12,

              installmentCount:
                12,

              monthlyRatePercent:
                '2.49',

              annualRatePercent:
                '34.38',

              cetAnnualPercent:
                '35.00',

              lateInterestMonthlyPercent:
                '1.00',

              latePenaltyPercent:
                '2.00',

              lateOtherChargesDescription:
                'Sem outros encargos.',

              defaultConsequences:
                'Condições informadas na proposta.',

              cetCompositionDescription:
                'Composição informada na proposta.',

              firstDueDate:
                new Date(
                  '2026-09-20T12:00:00.000Z',
                ),

              expiresAt:
                new Date(
                  '2026-08-20T12:00:00.000Z',
                ),

              termsVersion:
                'v1',

              presentedAt:
                new Date(
                  '2026-08-14T12:00:00.000Z',
                ),

              acceptedAt:
                null,

              declinedAt:
                null,

              expiredAt:
                null,

              cancelledAt:
                null,

              createdAt:
                new Date(
                  '2026-08-14T12:00:00.000Z',
                ),

              updatedAt:
                new Date(
                  '2026-08-14T12:00:00.000Z',
                ),
            },
          ],
        });

        const result =
          await getPublicCreditOfferForSession(
            'SS-TESTE',
            'token-publico',
          );

        expect(
          mocks.creditApplicationFindUnique,
        ).toHaveBeenCalledTimes(1);

        const query =
          mocks.creditApplicationFindUnique.mock
            .calls[0][0];

        expect(
          query.select.offers.where,
        ).toEqual({
          status: {
            in: [
              'PRESENTED',
              'ACCEPTED',
              'DECLINED',
              'EXPIRED',
              'CANCELLED',
            ],
          },
        });

        expect(
          query.select.offers.orderBy,
        ).toEqual({
          version:
            'desc',
        });

        expect(
          query.select.offers.take,
        ).toBe(1);

        expect(
          result,
        ).toEqual(
          expect.objectContaining({
            allowed:
              true,

            application:
              expect.objectContaining({
                protocol:
                  'SS-TESTE',

                status:
                  'APPROVED',
              }),

            offer:
              expect.objectContaining({
                version:
                  2,

                status:
                  'PRESENTED',
              }),
          }),
        );
      },
    );
  },
);
