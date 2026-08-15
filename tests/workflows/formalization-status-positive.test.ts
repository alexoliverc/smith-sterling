import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => {
  const tx = {
    creditFormalization: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },

    creditOffer: {
      findFirst: vi.fn(),
    },

    formalizationStatusHistory: {
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
    $transaction: mocks.transaction,
  },
}));

import {
  registerFormalizationDisbursement,
  submitFormalizationBankData,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

describe('formalization-status - caminho positivo', () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(
      async (
        callback: (
          transactionClient: typeof mocks.tx,
        ) => unknown,
      ) => callback(mocks.tx),
    );

    mocks.tx.creditOffer.findFirst.mockResolvedValue({
      id: 'accepted-offer-1',
    });

    mocks.tx.creditFormalization.updateMany.mockResolvedValue({
      count: 1,
    });

    mocks.tx.formalizationStatusHistory.create.mockResolvedValue({
      id: 'history-1',
    });
  });

  it('registra envio bancário como ação do cliente', async () => {
    mocks.tx.creditFormalization.findUnique
      .mockResolvedValueOnce({
        id: 'formalization-1',
        applicationId: 'application-1',
        acceptedOfferId: 'accepted-offer-1',
        status: 'PENDING',
      })
      .mockResolvedValueOnce({
        id: 'formalization-1',
        status: 'BANK_DETAILS_SUBMITTED',
        bankDataSubmittedAt: new Date(),
        updatedAt: new Date(),
      });

    await submitFormalizationBankData(
      'formalization-1',
      'encrypted-bank-data',
    );

    expect(
      mocks.tx.creditOffer.findFirst,
    ).toHaveBeenCalledWith({
      where: {
        id: 'accepted-offer-1',
        applicationId: 'application-1',
        status: 'ACCEPTED',
      },

      select: {
        id: true,
      },
    });

    expect(
      mocks.tx.creditFormalization.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: 'formalization-1',
        status: 'PENDING',
      },

      data: {
        bankDataEncrypted: 'encrypted-bank-data',
        bankDataSubmittedAt: expect.any(Date),
        status: 'BANK_DETAILS_SUBMITTED',
      },
    });

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        formalizationId: 'formalization-1',
        fromStatus: 'PENDING',
        toStatus: 'BANK_DETAILS_SUBMITTED',
        actorType: 'APPLICANT',
        actorId: null,
        reason: 'Dados bancários enviados pelo cliente.',
      },
    });
  });

  it('registra conferência como ação do operador', async () => {
    mocks.tx.creditFormalization.findUnique
      .mockResolvedValueOnce({
        id: 'formalization-1',
        applicationId: 'application-1',
        acceptedOfferId: 'accepted-offer-1',
        status: 'BANK_DETAILS_SUBMITTED',
      })
      .mockResolvedValueOnce({
        id: 'formalization-1',
        status: 'READY_FOR_DISBURSEMENT',
        bankDataSubmittedAt: new Date(),
        readyAt: new Date(),
        disbursedAt: null,
        cancelledAt: null,
        updatedAt: new Date(),
      });

    await transitionFormalizationStatus(
      'formalization-1',
      'READY_FOR_DISBURSEMENT',
      {
        actorType: 'OPERATOR',
        actorId: 'admin-1',
        reason: 'Dados bancários conferidos.',
      },
    );

    expect(
      mocks.tx.creditFormalization.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: 'formalization-1',
        status: 'BANK_DETAILS_SUBMITTED',
      },

      data: {
        status: 'READY_FOR_DISBURSEMENT',
        readyAt: expect.any(Date),
      },
    });

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        formalizationId: 'formalization-1',
        fromStatus: 'BANK_DETAILS_SUBMITTED',
        toStatus: 'READY_FOR_DISBURSEMENT',
        actorType: 'OPERATOR',
        actorId: 'admin-1',
        reason: 'Dados bancários conferidos.',
      },
    });
  });

  it('registra a liberação somente como confirmação administrativa', async () => {
    mocks.tx.creditFormalization.findUnique
      .mockResolvedValueOnce({
        id: 'formalization-1',
        applicationId: 'application-1',
        acceptedOfferId: 'accepted-offer-1',
        status: 'READY_FOR_DISBURSEMENT',
      })
      .mockResolvedValueOnce({
        id: 'formalization-1',
        status: 'DISBURSED',
        disbursedAt: new Date(),
        updatedAt: new Date(),
      });

    await registerFormalizationDisbursement(
      'formalization-1',
      'encrypted-external-transfer-reference',
      {
        actorType: 'OPERATOR',
        actorId: 'admin-1',
        reason: 'Transferência externa confirmada pelo operador.',
      },
    );

    expect(
      mocks.tx.creditFormalization.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: 'formalization-1',
        status: 'READY_FOR_DISBURSEMENT',
      },

      data: {
        status: 'DISBURSED',
        disbursementReferenceEncrypted:
          'encrypted-external-transfer-reference',
        disbursedAt: expect.any(Date),
      },
    });

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        formalizationId: 'formalization-1',
        fromStatus: 'READY_FOR_DISBURSEMENT',
        toStatus: 'DISBURSED',
        actorType: 'OPERATOR',
        actorId: 'admin-1',
        reason: 'Transferência externa confirmada pelo operador.',
      },
    });
  });

  it('audita correção dos dados bancários sem registrar PII', async () => {
    mocks.tx.creditFormalization.findUnique
      .mockResolvedValueOnce({
        id: 'formalization-1',
        applicationId: 'application-1',
        acceptedOfferId: 'accepted-offer-1',
        status: 'BANK_DETAILS_SUBMITTED',
      })
      .mockResolvedValueOnce({
        id: 'formalization-1',
        status: 'BANK_DETAILS_SUBMITTED',
        bankDataSubmittedAt: new Date(),
        updatedAt: new Date(),
      });

    await submitFormalizationBankData(
      'formalization-1',
      'new-encrypted-bank-data',
    );

    expect(
      mocks.tx.creditOffer.findFirst,
    ).toHaveBeenCalledWith({
      where: {
        id: 'accepted-offer-1',
        applicationId: 'application-1',
        status: 'ACCEPTED',
      },

      select: {
        id: true,
      },
    });

    expect(
      mocks.tx.creditFormalization.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: 'formalization-1',
        status: 'BANK_DETAILS_SUBMITTED',
      },

      data: {
        bankDataEncrypted: 'new-encrypted-bank-data',
        bankDataSubmittedAt: expect.any(Date),
      },
    });

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        formalizationId: 'formalization-1',
        fromStatus: 'BANK_DETAILS_SUBMITTED',
        toStatus: 'BANK_DETAILS_SUBMITTED',
        actorType: 'APPLICANT',
        actorId: null,
        reason: 'Dados bancários atualizados pelo cliente.',
      },
    });

    expect(
      JSON.stringify(
        mocks.tx.formalizationStatusHistory.create.mock.calls,
      ),
    ).not.toContain(
      'new-encrypted-bank-data',
    );
  });

});
