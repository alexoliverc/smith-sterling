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

  adminUserFindMany:
    vi.fn(),

  decryptPii:
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

      adminUser: {
        findMany:
          mocks.adminUserFindMany,
      },
    },
  }),
);

vi.mock(
  '@/lib/security/pii',
  () => ({
    decryptPii:
      mocks.decryptPii,
  }),
);

import {
  findAdminFormalizationForTransition,
  getAdminFormalizationByProtocol,
} from '@/server/dal/admin-formalization';

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
    id:
      'formalization-1',

    status:
      'BANK_DETAILS_SUBMITTED',

    acceptedOfferId:
      'offer-1',

    acceptedOffer,

    bankDataEncrypted:
      null,

    bankDataSubmittedAt:
      new Date(
        '2026-08-15T09:05:00.000Z',
      ),

    readyAt:
      null,

    disbursedAt:
      null,

    cancelledAt:
      null,

    createdAt:
      new Date(
        '2026-08-15T09:00:00.000Z',
      ),

    updatedAt:
      new Date(
        '2026-08-15T09:05:00.000Z',
      ),

    statusHistory:
      [],

    ...overrides,
  };
}

describe(
  'admin-formalization DAL',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.adminUserFindMany.mockResolvedValue(
        [],
      );
    });

    it(
      'usa exatamente a proposta vinculada por acceptedOfferId',
      async () => {
        const otherAcceptedOffer = {
          ...acceptedOffer,

          id:
            'offer-2',

          version:
            2,
        };

        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          publicProtocol:
            'SS-TESTE',

          status:
            'APPROVED',

          /*
           * Mesmo existindo outra proposta
           * aceita no fallback legado,
           * acceptedOfferId deve prevalecer.
           */
          offers: [
            otherAcceptedOffer,
          ],

          formalization:
            createFormalization(),
        });

        const result =
          await getAdminFormalizationByProtocol(
            'SS-TESTE',
          );

        expect(
          result?.acceptedOffer,
        ).toEqual(
          expect.objectContaining({
            id:
              'offer-1',

            version:
              1,

            status:
              'ACCEPTED',
          }),
        );

        expect(
          result?.acceptedOffer?.id,
        ).not.toBe(
          'offer-2',
        );
      },
    );

    it(
      'não faz fallback para outra proposta quando acceptedOfferId está preenchido mas inconsistente',
      async () => {
        const fallbackAcceptedOffer = {
          ...acceptedOffer,

          id:
            'offer-2',

          version:
            2,
        };

        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          publicProtocol:
            'SS-TESTE',

          status:
            'APPROVED',

          offers: [
            fallbackAcceptedOffer,
          ],

          formalization:
            createFormalization({
              acceptedOfferId:
                'offer-1',

              acceptedOffer: {
                ...acceptedOffer,

                status:
                  'CANCELLED',
              },
            }),
        });

        const result =
          await getAdminFormalizationByProtocol(
            'SS-TESTE',
          );

        expect(
          result?.acceptedOffer,
        ).toBeNull();

        expect(
          result?.formalization,
        ).toEqual(
          expect.objectContaining({
            acceptedOfferId:
              'offer-1',
          }),
        );
      },
    );

    it(
      'mantém fallback temporário para formalização legada com acceptedOfferId nulo',
      async () => {
        const legacyAcceptedOffer = {
          ...acceptedOffer,

          id:
            'offer-legacy',

          version:
            3,
        };

        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          publicProtocol:
            'SS-TESTE',

          status:
            'APPROVED',

          offers: [
            legacyAcceptedOffer,
          ],

          formalization:
            createFormalization({
              acceptedOfferId:
                null,

              acceptedOffer:
                null,
            }),
        });

        const result =
          await getAdminFormalizationByProtocol(
            'SS-TESTE',
          );

        expect(
          result?.acceptedOffer,
        ).toEqual(
          expect.objectContaining({
            id:
              'offer-legacy',

            status:
              'ACCEPTED',
          }),
        );

        expect(
          result?.formalization,
        ).toEqual(
          expect.objectContaining({
            acceptedOfferId:
              null,
          }),
        );
      },
    );

    it(
      'carrega acceptedOfferId e a proposta vinculada para as transições administrativas',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue({
          id:
            'application-1',

          status:
            'APPROVED',

          formalization: {
            id:
              'formalization-1',

            status:
              'BANK_DETAILS_SUBMITTED',

            bankDataEncrypted:
              'encrypted-bank-data',

            acceptedOfferId:
              'offer-1',

            acceptedOffer: {
              id:
                'offer-1',

              status:
                'ACCEPTED',
            },
          },
        });

        const result =
          await findAdminFormalizationForTransition(
            'SS-TESTE',
          );

        expect(
          result?.formalization,
        ).toEqual(
          expect.objectContaining({
            acceptedOfferId:
              'offer-1',

            acceptedOffer: {
              id:
                'offer-1',

              status:
                'ACCEPTED',
            },
          }),
        );

        const query =
          mocks.creditApplicationFindUnique.mock
            .calls[0][0];

        expect(
          query.select.formalization.select,
        ).toEqual(
          expect.objectContaining({
            acceptedOfferId:
              true,

            acceptedOffer: {
              select: {
                id:
                  true,

                status:
                  true,
              },
            },
          }),
        );
      },
    );
  },
);
