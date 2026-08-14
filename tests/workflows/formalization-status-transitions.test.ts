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
  ConcurrentFormalizationStatusTransitionError,
  InvalidFormalizationStatusTransitionError,
  registerFormalizationDisbursement,
  submitFormalizationBankData,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

describe('formalization-status - transições e concorrência', () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(
      async (
        callback: (
          transactionClient: typeof mocks.tx,
        ) => unknown,
      ) => callback(mocks.tx),
    );

    mocks.tx.creditOffer.findFirst.mockResolvedValue({
      id: 'offer-accepted-1',
    });
  });

  it('impede pular de PENDING diretamente para READY_FOR_DISBURSEMENT', async () => {
    mocks.tx.creditFormalization.findUnique.mockResolvedValue({
      id: 'formalization-1',
      applicationId: 'application-1',
      status: 'PENDING',
    });

    await expect(
      transitionFormalizationStatus(
        'formalization-1',
        'READY_FOR_DISBURSEMENT',
      ),
    ).rejects.toBeInstanceOf(
      InvalidFormalizationStatusTransitionError,
    );

    expect(
      mocks.tx.creditFormalization.updateMany,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).not.toHaveBeenCalled();
  });

  it('impede registrar DISBURSED antes de READY_FOR_DISBURSEMENT', async () => {
    mocks.tx.creditFormalization.findUnique.mockResolvedValue({
      id: 'formalization-1',
      applicationId: 'application-1',
      status: 'BANK_DETAILS_SUBMITTED',
    });

    await expect(
      registerFormalizationDisbursement(
        'formalization-1',
        'encrypted-reference',
      ),
    ).rejects.toBeInstanceOf(
      InvalidFormalizationStatusTransitionError,
    );

    expect(
      mocks.tx.creditFormalization.updateMany,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).not.toHaveBeenCalled();
  });

  it('detecta concorrência ao preparar formalização para liberação', async () => {
    mocks.tx.creditFormalization.findUnique.mockResolvedValue({
      id: 'formalization-1',
      applicationId: 'application-1',
      status: 'BANK_DETAILS_SUBMITTED',
    });

    mocks.tx.creditFormalization.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      transitionFormalizationStatus(
        'formalization-1',
        'READY_FOR_DISBURSEMENT',
        {
          actorType: 'OPERATOR',
          actorId: 'admin-1',
          reason: 'Dados bancários conferidos.',
        },
      ),
    ).rejects.toBeInstanceOf(
      ConcurrentFormalizationStatusTransitionError,
    );

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).not.toHaveBeenCalled();
  });

  it('detecta concorrência no envio inicial dos dados bancários', async () => {
    mocks.tx.creditFormalization.findUnique.mockResolvedValue({
      id: 'formalization-1',
      applicationId: 'application-1',
      status: 'PENDING',
    });

    mocks.tx.creditFormalization.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      submitFormalizationBankData(
        'formalization-1',
        'encrypted-bank-data',
      ),
    ).rejects.toBeInstanceOf(
      ConcurrentFormalizationStatusTransitionError,
    );

    expect(
      mocks.tx.formalizationStatusHistory.create,
    ).not.toHaveBeenCalled();
  });
});
