import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => {
  class FormalizationLockedError extends Error {}

  return {
    creditApplicationFindUnique:
      vi.fn(),

    findApplicationForSession:
      vi.fn(),

    encryptPii:
      vi.fn(),

    submitFormalizationBankData:
      vi.fn(),

    FormalizationLockedError,
  };
});

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

vi.mock(
  '@/lib/security/pii',
  () => ({
    encryptPii:
      mocks.encryptPii,
  }),
);

vi.mock(
  '@/server/workflows/formalization-status',
  () => ({
    FormalizationLockedError:
      mocks.FormalizationLockedError,

    submitFormalizationBankData:
      mocks.submitFormalizationBankData,
  }),
);

import {
  saveBankDataForSession,
} from '@/server/dal/credit-formalization';

const bankData = {
  bankName:
    'Banco Teste',

  branch:
    '0001',

  account:
    '12345-6',

  accountType:
    'CHECKING' as const,

  holderName:
    'Cliente Teste',

  pixKey:
    'teste@example.com',
};

function createApplication(
  formalization: {
    acceptedOfferId: string | null;

    acceptedOffer: {
      id: string;
      status: string;
    } | null;

    status?: string;
  },
) {
  return {
    id:
      'application-1',

    formalization: {
      id:
        'formalization-1',

      status:
        formalization.status ??
        'PENDING',

      acceptedOfferId:
        formalization.acceptedOfferId,

      acceptedOffer:
        formalization.acceptedOffer,
    },
  };
}

describe(
  'credit-formalization DAL público - gravação bancária',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.findApplicationForSession.mockResolvedValue({
        status:
          'APPROVED',
      });

      mocks.encryptPii.mockReturnValue(
        'encrypted-bank-data',
      );

      mocks.submitFormalizationBankData.mockResolvedValue(
        undefined,
      );
    });

    it(
      'grava somente quando a proposta vinculada está aceita',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue(
          createApplication({
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

        const result =
          await saveBankDataForSession(
            'SS-TESTE',
            'access-token',
            bankData,
          );

        expect(
          result,
        ).toEqual({
          success:
            true,
        });

        expect(
          mocks.encryptPii,
        ).toHaveBeenCalledTimes(
          1,
        );

        expect(
          mocks.submitFormalizationBankData,
        ).toHaveBeenCalledWith(
          'formalization-1',
          'encrypted-bank-data',
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
      'bloqueia acceptedOfferId nulo antes de criptografar dados bancários',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue(
          createApplication({
            acceptedOfferId:
              null,

            acceptedOffer:
              null,
          }),
        );

        const result =
          await saveBankDataForSession(
            'SS-TESTE',
            'access-token',
            bankData,
          );

        expect(
          result,
        ).toEqual({
          success:
            false,

          reason:
            'NOT_APPROVED',
        });

        expect(
          mocks.encryptPii,
        ).not.toHaveBeenCalled();

        expect(
          mocks.submitFormalizationBankData,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'bloqueia proposta vinculada que não está aceita',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue(
          createApplication({
            acceptedOfferId:
              'offer-1',

            acceptedOffer: {
              id:
                'offer-1',

              status:
                'CANCELLED',
            },
          }),
        );

        const result =
          await saveBankDataForSession(
            'SS-TESTE',
            'access-token',
            bankData,
          );

        expect(
          result,
        ).toEqual({
          success:
            false,

          reason:
            'NOT_APPROVED',
        });

        expect(
          mocks.encryptPii,
        ).not.toHaveBeenCalled();

        expect(
          mocks.submitFormalizationBankData,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'bloqueia relação cujo id não corresponde a acceptedOfferId',
      async () => {
        mocks.creditApplicationFindUnique.mockResolvedValue(
          createApplication({
            acceptedOfferId:
              'offer-1',

            acceptedOffer: {
              id:
                'offer-2',

              status:
                'ACCEPTED',
            },
          }),
        );

        const result =
          await saveBankDataForSession(
            'SS-TESTE',
            'access-token',
            bankData,
          );

        expect(
          result,
        ).toEqual({
          success:
            false,

          reason:
            'NOT_APPROVED',
        });

        expect(
          mocks.encryptPii,
        ).not.toHaveBeenCalled();

        expect(
          mocks.submitFormalizationBankData,
        ).not.toHaveBeenCalled();
      },
    );
  },
);
