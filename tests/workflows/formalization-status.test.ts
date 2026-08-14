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
  FormalizationOfferNotAcceptedError,
  registerFormalizationDisbursement,
  submitFormalizationBankData,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

describe('formalization-status workflow', () => {
  beforeEach(() => {
    mocks.transaction.mockImplementation(
      async (
        callback: (
          transactionClient: typeof mocks.tx,
        ) => unknown,
      ) => callback(mocks.tx),
    );
  });

  describe('invariante de proposta aceita', () => {
    it('bloqueia envio de dados bancários sem proposta aceita', async () => {
      mocks.tx.creditFormalization.findUnique.mockResolvedValue({
        id: 'formalization-1',
        applicationId: 'application-1',
        status: 'PENDING',
      });

      mocks.tx.creditOffer.findFirst.mockResolvedValue(
        null,
      );

      await expect(
        submitFormalizationBankData(
          'formalization-1',
          'encrypted-bank-data',
        ),
      ).rejects.toBeInstanceOf(
        FormalizationOfferNotAcceptedError,
      );

      expect(
        mocks.tx.creditOffer.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          applicationId: 'application-1',
          status: 'ACCEPTED',
        },

        select: {
          id: true,
        },
      });

      expect(
        mocks.tx.creditFormalization.updateMany,
      ).not.toHaveBeenCalled();

      expect(
        mocks.tx.formalizationStatusHistory.create,
      ).not.toHaveBeenCalled();
    });

    it('bloqueia avanço para pronta para liberação sem proposta aceita', async () => {
      mocks.tx.creditFormalization.findUnique.mockResolvedValue({
        id: 'formalization-1',
        applicationId: 'application-1',
        status: 'BANK_DETAILS_SUBMITTED',
      });

      mocks.tx.creditOffer.findFirst.mockResolvedValue(
        null,
      );

      await expect(
        transitionFormalizationStatus(
          'formalization-1',
          'READY_FOR_DISBURSEMENT',
        ),
      ).rejects.toBeInstanceOf(
        FormalizationOfferNotAcceptedError,
      );

      expect(
        mocks.tx.creditFormalization.updateMany,
      ).not.toHaveBeenCalled();

      expect(
        mocks.tx.formalizationStatusHistory.create,
      ).not.toHaveBeenCalled();
    });

    it('bloqueia registro de liberação sem proposta aceita', async () => {
      mocks.tx.creditFormalization.findUnique.mockResolvedValue({
        id: 'formalization-1',
        applicationId: 'application-1',
        status: 'READY_FOR_DISBURSEMENT',
      });

      mocks.tx.creditOffer.findFirst.mockResolvedValue(
        null,
      );

      await expect(
        registerFormalizationDisbursement(
          'formalization-1',
          'encrypted-reference',
        ),
      ).rejects.toBeInstanceOf(
        FormalizationOfferNotAcceptedError,
      );

      expect(
        mocks.tx.creditFormalization.updateMany,
      ).not.toHaveBeenCalled();

      expect(
        mocks.tx.formalizationStatusHistory.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('compatibilidade com registros legados', () => {
    it('permite cancelamento mesmo sem proposta aceita', async () => {
      mocks.tx.creditFormalization.findUnique
        .mockResolvedValueOnce({
          id: 'formalization-1',
          applicationId: 'application-1',
          status: 'PENDING',
        })
        .mockResolvedValueOnce({
          id: 'formalization-1',
          status: 'CANCELLED',
          bankDataSubmittedAt: null,
          readyAt: null,
          disbursedAt: null,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        });

      mocks.tx.creditFormalization.updateMany.mockResolvedValue({
        count: 1,
      });

      mocks.tx.formalizationStatusHistory.create.mockResolvedValue({
        id: 'history-1',
      });

      const result =
        await transitionFormalizationStatus(
          'formalization-1',
          'CANCELLED',
        );

      expect(
        mocks.tx.creditOffer.findFirst,
      ).not.toHaveBeenCalled();

      expect(
        mocks.tx.creditFormalization.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: 'formalization-1',
          status: 'PENDING',
        },

        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        },
      });

      expect(
        mocks.tx.formalizationStatusHistory.create,
      ).toHaveBeenCalledWith({
        data: {
          formalizationId: 'formalization-1',
          fromStatus: 'PENDING',
          toStatus: 'CANCELLED',
          actorType: 'SYSTEM',
          actorId: null,
          reason: null,
        },
      });

      expect(result?.status).toBe(
        'CANCELLED',
      );
    });
  });
});
