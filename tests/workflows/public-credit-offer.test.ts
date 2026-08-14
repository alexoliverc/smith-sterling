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
  decidePublicCreditOffer,
} from '@/server/workflows/public-credit-offer';

describe('public-credit-offer - decisão do cliente', () => {
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

  it('expira proposta vencida antes de processar a decisão', async () => {
    const now =
      new Date(
        '2026-08-14T15:00:00.000Z',
      );

    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'PRESENTED',
      expiresAt:
        new Date(
          '2026-08-14T14:59:00.000Z',
        ),
    });

    mocks.tx.creditOffer.updateMany.mockResolvedValue({
      count: 1,
    });

    mocks.tx.creditOfferStatusHistory.create.mockResolvedValue({
      id: 'history-1',
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

    expect(
      mocks.tx.creditOffer.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id:
          'offer-1',

        applicationId:
          'application-1',

        version:
          1,

        status:
          'PRESENTED',
      },

      data: {
        status:
          'EXPIRED',

        expiredAt:
          now,
      },
    });

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        offerId:
          'offer-1',

        fromStatus:
          'PRESENTED',

        toStatus:
          'EXPIRED',

        actorType:
          'SYSTEM',

        actorId:
          null,

        reason:
          'Prazo de validade da proposta encerrado antes da decisão do cliente.',
      },
    });

    expect(
      mocks.tx.creditFormalization.findUnique,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();

    expect(result).toEqual({
      success:
        false,

      reason:
        'EXPIRED',
    });
  });

  it('aceita proposta válida como ação do cliente e cria formalização', async () => {
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

    const result =
      await decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'ACCEPT',
      });

    expect(
      mocks.tx.creditOffer.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where:
          expect.objectContaining({
            id:
              'offer-1',

            applicationId:
              'application-1',

            version:
              1,

            status:
              'PRESENTED',

            expiresAt: {
              gt:
                expect.any(Date),
            },
          }),

        data: {
          status:
            'ACCEPTED',

          acceptedAt:
            expect.any(Date),
        },
      }),
    );

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        offerId:
          'offer-1',

        fromStatus:
          'PRESENTED',

        toStatus:
          'ACCEPTED',

        actorType:
          'APPLICANT',

        actorId:
          null,

        reason:
          'Proposta aceita pelo cliente na área autenticada da solicitação.',
      },
    });

    expect(
      mocks.tx.creditFormalization.upsert,
    ).toHaveBeenCalledWith({
      where: {
        applicationId:
          'application-1',
      },

      update: {},

      create: {
        applicationId:
          'application-1',

        status:
          'PENDING',
      },
    });

    expect(result).toEqual({
      success:
        true,

      outcome:
        'ACCEPTED',

      alreadyDecided:
        false,
    });
  });

  it('recusa proposta válida como ação do cliente sem criar formalização', async () => {
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
      count: 1,
    });

    mocks.tx.creditOfferStatusHistory.create.mockResolvedValue({
      id: 'history-1',
    });

    const result =
      await decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'DECLINE',
      });

    expect(
      mocks.tx.creditOffer.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where:
          expect.objectContaining({
            id:
              'offer-1',

            applicationId:
              'application-1',

            version:
              1,

            status:
              'PRESENTED',

            expiresAt: {
              gt:
                expect.any(Date),
            },
          }),

        data: {
          status:
            'DECLINED',

          declinedAt:
            expect.any(Date),
        },
      }),
    );

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        offerId:
          'offer-1',

        fromStatus:
          'PRESENTED',

        toStatus:
          'DECLINED',

        actorType:
          'APPLICANT',

        actorId:
          null,

        reason:
          'Proposta recusada pelo cliente na área autenticada da solicitação.',
      },
    });

    expect(
      mocks.tx.creditFormalization.upsert,
    ).not.toHaveBeenCalled();

    expect(result).toEqual({
      success:
        true,

      outcome:
        'DECLINED',

      alreadyDecided:
        false,
    });
  });

  it('trata aceite repetido da mesma versão como idempotente', async () => {
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
        true,

      outcome:
        'ACCEPTED',

      alreadyDecided:
        true,
    });

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

  it('trata recusa repetida da mesma versão como idempotente', async () => {
    mocks.tx.creditOffer.findUnique.mockResolvedValue({
      id: 'offer-1',
      applicationId: 'application-1',
      version: 1,
      status: 'DECLINED',
      expiresAt:
        new Date(
          '2026-08-20T15:00:00.000Z',
        ),
    });

    const result =
      await decidePublicCreditOffer({
        applicationId:
          'application-1',

        version:
          1,

        decision:
          'DECLINE',
      });

    expect(result).toEqual({
      success:
        true,

      outcome:
        'DECLINED',

      alreadyDecided:
        true,
    });

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
