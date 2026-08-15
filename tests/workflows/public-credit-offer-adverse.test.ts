import {
  afterEach,
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
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },

    creditOfferStatusHistory: {
      create: vi.fn(),
    },

    creditFormalization: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
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
    $transaction: mocks.transaction,
  },
}));

import {
  CreditOfferFormalizationConflictError,
  CreditOfferNotAvailableError,
  CreditOfferNotFoundError,
  decidePublicCreditOffer,
} from '@/server/workflows/public-credit-offer';

describe('public-credit-offer - casos adversos', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.setSystemTime(
      new Date(
        '2026-08-14T15:00:00.000Z',
      ),
    );

    mocks.transaction.mockImplementation(
      async (
        callback: (
          transactionClient: typeof mocks.tx,
        ) => unknown,
      ) => callback(mocks.tx),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('bloqueia decisão quando a proposta não existe', async () => {
    mocks.tx.creditOffer.findUnique.mockResolvedValue(
      null,
    );

    await expect(
      decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          99,

        decision:
          'ACCEPT',
      }),
    ).rejects.toBeInstanceOf(
      CreditOfferNotFoundError,
    );

    expect(
      mocks.tx.creditOffer.updateMany,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();
  });

  it('bloqueia decisão incompatível com proposta já aceita', async () => {
    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'ACCEPTED',
      expiresAt:
        new Date(
          '2026-08-20T15:00:00.000Z',
        ),
    });

    await expect(
      decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'DECLINE',
      }),
    ).rejects.toBeInstanceOf(
      CreditOfferNotAvailableError,
    );

    expect(
      mocks.tx.creditOffer.updateMany,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();
  });

  it.each([
    'CANCELLED',
    'DISBURSED',
  ] as const)(
    'bloqueia novo aceite quando a formalização está %s',
    async (status) => {
      mocks.tx.creditOffer.findUnique.mockResolvedValue({
        id: 'offer-1',
        applicationId: 'application-1',
        version: 1,
        status: 'PRESENTED',
        expiresAt:
          new Date(
            '2026-08-20T15:00:00.000Z',
          ),
      });

      mocks.tx.creditFormalization.findUnique.mockResolvedValue({
        id: 'formalization-1',
        status,
      });

      await expect(
        decidePublicCreditOffer({
          applicationId:
            'application-1',

          version:
            1,

          decision:
            'ACCEPT',
        }),
      ).rejects.toBeInstanceOf(
        CreditOfferFormalizationConflictError,
      );

      expect(
        mocks.tx.creditOffer.updateMany,
      ).not.toHaveBeenCalled();

      expect(
        mocks.tx.creditOfferStatusHistory.create,
      ).not.toHaveBeenCalled();

      expect(
        mocks.tx.creditFormalization.upsert,
      ).not.toHaveBeenCalled();
    },
  );

  it('detecta corrida concorrente no aceite', async () => {
    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'PRESENTED',
      expiresAt:
        new Date(
          '2026-08-20T15:00:00.000Z',
        ),
    });

    mocks.tx.creditFormalization.findUnique.mockResolvedValue(
      null,
    );

    /*
     * Outra requisição mudou o status
     * antes deste update condicional.
     */
    mocks.tx.creditOffer.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'ACCEPT',
      }),
    ).rejects.toBeInstanceOf(
      CreditOfferNotAvailableError,
    );

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();
  });

  it('detecta corrida concorrente na recusa', async () => {
    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'PRESENTED',
      expiresAt:
        new Date(
          '2026-08-20T15:00:00.000Z',
        ),
    });

    mocks.tx.creditOffer.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'DECLINE',
      }),
    ).rejects.toBeInstanceOf(
      CreditOfferNotAvailableError,
    );

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();
  });

  it('não duplica auditoria quando outra requisição já expirou a proposta', async () => {
    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'PRESENTED',
      expiresAt:
        new Date(
          '2026-08-14T14:00:00.000Z',
        ),
    });

    /*
     * count 0 significa que outra operação
     * já alterou a proposta antes daqui.
     */
    mocks.tx.creditOffer.updateMany.mockResolvedValue({
      count: 0,
    });

    const result =
      await decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'ACCEPT',
      });

    expect(result).toEqual({
      success:
        false,

      reason:
        'EXPIRED',
    });

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();
  });

  it('adquire o lock da solicitação antes de ler a proposta para decisão', async () => {
    mocks.tx.creditApplication.update.mockResolvedValue({
      id: 'application-1',
    });

    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'PRESENTED',
      expiresAt:
        new Date(
          '2026-08-20T15:00:00.000Z',
        ),
    });

    mocks.tx.creditFormalization.findUnique.mockResolvedValue(
      null,
    );

    mocks.tx.creditOffer.updateMany.mockResolvedValue({
      count: 1,
    });

    mocks.tx.creditOfferStatusHistory.create.mockResolvedValue({
      id: 'history-1',
    });

    mocks.tx.creditFormalization.upsert.mockResolvedValue({
      id: 'formalization-1',
      status: 'PENDING',
    });

    await decidePublicCreditOffer({
      applicationId:
        'application-1',

      version:
        1,

      decision:
        'ACCEPT',
    });

    expect(
      mocks.tx.creditApplication.update,
    ).toHaveBeenCalledTimes(1);

    expect(
      mocks.tx.creditOffer.findUnique,
    ).toHaveBeenCalledTimes(1);

    const lockCallOrder =
      mocks.tx.creditApplication.update
        .mock.invocationCallOrder[0];

    const offerReadCallOrder =
      mocks.tx.creditOffer.findUnique
        .mock.invocationCallOrder[0];

    expect(
      lockCallOrder,
    ).toBeLessThan(
      offerReadCallOrder,
    );
  });


  it('bloqueia aceite quando a formalização já pertence a outra proposta', async () => {
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

    mocks.tx.creditApplication.update.mockResolvedValue({
      id: 'application-1',
    });

    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-2',
      applicationId: 'application-1',
      version: 2,
      status: 'PRESENTED',
      expiresAt:
        new Date(
          '2026-08-20T15:00:00.000Z',
        ),
    });

    mocks.tx.creditFormalization.findUnique.mockResolvedValue({
      id: 'formalization-1',
      status: 'PENDING',
      acceptedOfferId:
        'offer-1',
    });

    await expect(
      decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          2,

        decision:
          'ACCEPT',
      }),
    ).rejects.toBeInstanceOf(
      CreditOfferFormalizationConflictError,
    );

    expect(
      mocks.tx.creditOffer.updateMany,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();
  });

});
