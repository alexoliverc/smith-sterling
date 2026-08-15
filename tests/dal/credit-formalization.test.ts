import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  creditApplicationFindUnique:
    vi.fn(),

  findApplicationForSession:
    vi.fn(),
}));

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

vi.mock(
  '@/server/dal/credit-application',
  () => ({
    findApplicationForSession:
      mocks.findApplicationForSession,
  }),
);

import {
  getFormalizationForSession,
} from '@/server/dal/credit-formalization';

const acceptedOffer = {
  id:
    'offer-1',

  version:
    1,

  status:
    'ACCEPTED',

  principalCents:
    500000,

  netDisbursementCents:
    480000,

  installmentCents:
    50000,

  totalRepaymentCents:
    600000,

  months:
    12,

  installmentCount:
    12,

  acceptedAt:
    new Date(
      '2026-08-15T09:00:00.000Z',
    ),

  termsVersion:
    'v1',
} as const;

function createFormalization(
  overrides: Record<string, unknown> = {},
) {
  return {
    status:
      'PENDING',

    acceptedOfferId:
      'offer-1',

    acceptedOffer,

    bankDataSubmittedAt:
      null,

    readyAt:
      null,

    disbursedAt:
      null,

    createdAt:
      new Date(
        '2026-08-15T09:00:00.000Z',
      ),

    updatedAt:
      new Date(
        '2026-08-15T09:00:00.000Z',
      ),

    ...overrides,
  };
}

describe(
  'credit-formalization DAL público',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.findApplicationForSession.mockResolvedValue({
        status:
          'APPROVED',
      });
    });

    it(
      'usa somente a proposta vinculada por acceptedOfferId',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          formalization:
            createFormalization(),
        });

        const result =
          await getFormalizationForSession(
            'SS-TESTE',
            'access-token',
          );

        expect(
          result,
        ).toEqual(
          expect.objectContaining({
            allowed:
              true,

            offer:
              expect.objectContaining({
                id:
                  'offer-1',

                status:
                  'ACCEPTED',
              }),
          }),
        );

        const query =
          mocks.creditApplicationFindUnique.mock
            .calls[0][0];

        expect(
          query.select.offers,
        ).toBeUndefined();
      },
    );

    it(
      'bloqueia formalização ativa sem acceptedOfferId',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          formalization:
            createFormalization({
              acceptedOfferId:
                null,

              acceptedOffer:
                null,

              status:
                'PENDING',
            }),
        });

        const result =
          await getFormalizationForSession(
            'SS-TESTE',
            'access-token',
          );

        expect(
          result,
        ).toEqual(
          expect.objectContaining({
            allowed:
              false,

            reason:
              'OFFER_NOT_ACCEPTED',
          }),
        );
      },
    );

    it(
      'preserva DISBURSED histórico sem inventar proposta',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          formalization:
            createFormalization({
              acceptedOfferId:
                null,

              acceptedOffer:
                null,

              status:
                'DISBURSED',

              disbursedAt:
                new Date(
                  '2026-08-15T09:10:00.000Z',
                ),
            }),
        });

        const result =
          await getFormalizationForSession(
            'SS-TESTE',
            'access-token',
          );

        expect(
          result,
        ).toEqual(
          expect.objectContaining({
            allowed:
              true,

            offer:
              null,

            formalization:
              expect.objectContaining({
                status:
                  'DISBURSED',

                acceptedOfferId:
                  null,
              }),
          }),
        );

        const query =
          mocks.creditApplicationFindUnique.mock
            .calls[0][0];

        expect(
          query.select.offers,
        ).toBeUndefined();
      },
    );

    it(
      'não trata relação vinculada inconsistente como legado terminal',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          formalization:
            createFormalization({
              acceptedOfferId:
                'offer-1',

              acceptedOffer: {
                ...acceptedOffer,

                status:
                  'CANCELLED',
              },

              status:
                'DISBURSED',
            }),
        });

        const result =
          await getFormalizationForSession(
            'SS-TESTE',
            'access-token',
          );

        expect(
          result,
        ).toEqual(
          expect.objectContaining({
            allowed:
              false,

            reason:
              'OFFER_NOT_ACCEPTED',
          }),
        );
      },
    );
  },
);
