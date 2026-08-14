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
    $transaction: mocks.transaction,
  },
}));

import {
  CreditOfferAlreadyAcceptedError,
  CreditOfferApplicationNotApprovedError,
  publishCreditOffer,
} from '@/server/workflows/credit-offer';

const input = {
  principalCents: 100000,
  netDisbursementCents: 95000,
  installmentCents: 10000,
  totalRepaymentCents: 120000,

  iofCents: 3000,
  otherFeesCents: 2000,

  months: 12,
  installmentCount: 12,

  monthlyRatePercent: '2.5',
  annualRatePercent: '34.49',
  cetAnnualPercent: '39.1',

  firstDueDate:
    new Date(
      '2026-09-15T12:00:00.000Z',
    ),

  expiresAt:
    new Date(
      '2026-08-20T12:00:00.000Z',
    ),

  termsVersion: '2026-08-v1',
};

describe('credit-offer - publicação administrativa', () => {
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

  it('bloqueia publicação quando a solicitação não está aprovada', async () => {
    mocks.tx.creditApplication.update.mockResolvedValue({
      id: 'application-1',
      status: 'UNDER_REVIEW',
    });

    await expect(
      publishCreditOffer(
        'application-1',
        input,
        {
          actorId: 'admin-1',
        },
      ),
    ).rejects.toBeInstanceOf(
      CreditOfferApplicationNotApprovedError,
    );

    expect(
      mocks.tx.creditOffer.findFirst,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditOffer.create,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).not.toHaveBeenCalled();
  });

  it('bloqueia nova publicação quando já existe proposta aceita', async () => {
    mocks.tx.creditApplication.update.mockResolvedValue({
      id: 'application-1',
      status: 'APPROVED',
    });

    mocks.tx.creditOffer.findFirst.mockResolvedValue({
      id: 'accepted-offer-1',
    });

    await expect(
      publishCreditOffer(
        'application-1',
        input,
        {
          actorId: 'admin-1',
        },
      ),
    ).rejects.toBeInstanceOf(
      CreditOfferAlreadyAcceptedError,
    );

    expect(
      mocks.tx.creditOffer.findMany,
    ).not.toHaveBeenCalled();

    expect(
      mocks.tx.creditOffer.create,
    ).not.toHaveBeenCalled();
  });

  it('publica a primeira proposta como versão 1 e registra o operador', async () => {
    const now =
      new Date(
        '2026-08-14T15:00:00.000Z',
      );

    mocks.tx.creditApplication.update.mockResolvedValue({
      id: 'application-1',
      status: 'APPROVED',
    });

    mocks.tx.creditOffer.findFirst.mockResolvedValue(
      null,
    );

    mocks.tx.creditOffer.findMany.mockResolvedValue(
      [],
    );

    mocks.tx.creditOffer.aggregate.mockResolvedValue({
      _max: {
        version: null,
      },
    });

    mocks.tx.creditOffer.create.mockResolvedValue({
      id: 'offer-1',
      version: 1,
      status: 'PRESENTED',
      presentedAt: now,
    });

    const result =
      await publishCreditOffer(
        'application-1',
        input,
        {
          actorId: 'admin-1',
        },
      );

    expect(
      mocks.tx.creditOffer.create,
    ).toHaveBeenCalledWith({
      data: {
        applicationId: 'application-1',

        version: 1,

        status: 'PRESENTED',

        principalCents:
          input.principalCents,

        netDisbursementCents:
          input.netDisbursementCents,

        installmentCents:
          input.installmentCents,

        totalRepaymentCents:
          input.totalRepaymentCents,

        iofCents:
          input.iofCents,

        otherFeesCents:
          input.otherFeesCents,

        months:
          input.months,

        installmentCount:
          input.installmentCount,

        monthlyRatePercent:
          input.monthlyRatePercent,

        annualRatePercent:
          input.annualRatePercent,

        cetAnnualPercent:
          input.cetAnnualPercent,

        firstDueDate:
          input.firstDueDate,

        expiresAt:
          input.expiresAt,

        termsVersion:
          input.termsVersion,

        presentedAt:
          now,
      },

      select: {
        id: true,
        version: true,
        status: true,
        presentedAt: true,
      },
    });

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        offerId: 'offer-1',

        fromStatus: 'DRAFT',

        toStatus: 'PRESENTED',

        actorType: 'OPERATOR',

        actorId: 'admin-1',

        reason:
          'Proposta versão 1 publicada pelo backoffice.',
      },
    });

    expect(result).toEqual({
      id: 'offer-1',
      version: 1,
      status: 'PRESENTED',
      presentedAt: now,
    });
  });

  it('encerra propostas apresentadas anteriores e publica a próxima versão', async () => {
    const now =
      new Date(
        '2026-08-14T15:00:00.000Z',
      );

    mocks.tx.creditApplication.update.mockResolvedValue({
      id: 'application-1',
      status: 'APPROVED',
    });

    mocks.tx.creditOffer.findFirst.mockResolvedValue(
      null,
    );

    mocks.tx.creditOffer.findMany.mockResolvedValue([
      {
        id: 'offer-active',
        expiresAt:
          new Date(
            '2026-08-20T12:00:00.000Z',
          ),
      },

      {
        id: 'offer-expired',
        expiresAt:
          new Date(
            '2026-08-13T12:00:00.000Z',
          ),
      },
    ]);

    mocks.tx.creditOffer.aggregate.mockResolvedValue({
      _max: {
        version: 2,
      },
    });

    mocks.tx.creditOffer.create.mockResolvedValue({
      id: 'offer-3',
      version: 3,
      status: 'PRESENTED',
      presentedAt: now,
    });

    await publishCreditOffer(
      'application-1',
      input,
      {
        actorId: 'admin-1',
      },
    );

    expect(
      mocks.tx.creditOffer.update,
    ).toHaveBeenCalledWith({
      where: {
        id: 'offer-active',
      },

      data: {
        status: 'CANCELLED',
        cancelledAt: now,
      },
    });

    expect(
      mocks.tx.creditOffer.update,
    ).toHaveBeenCalledWith({
      where: {
        id: 'offer-expired',
      },

      data: {
        status: 'EXPIRED',
        expiredAt: now,
      },
    });

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        offerId: 'offer-active',

        fromStatus: 'PRESENTED',

        toStatus: 'CANCELLED',

        actorType: 'OPERATOR',

        actorId: 'admin-1',

        reason:
          'Proposta anterior substituída por uma nova versão.',
      },
    });

    expect(
      mocks.tx.creditOfferStatusHistory.create,
    ).toHaveBeenCalledWith({
      data: {
        offerId: 'offer-expired',

        fromStatus: 'PRESENTED',

        toStatus: 'EXPIRED',

        actorType: 'OPERATOR',

        actorId: 'admin-1',

        reason:
          'Proposta anterior expirada antes da publicação de uma nova versão.',
      },
    });

    expect(
      mocks.tx.creditOffer.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data:
          expect.objectContaining({
            applicationId:
              'application-1',

            version:
              3,

            status:
              'PRESENTED',
          }),
      }),
    );
  });
});
