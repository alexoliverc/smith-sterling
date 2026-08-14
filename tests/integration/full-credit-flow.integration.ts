import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import { prisma } from '@/lib/prisma';

import {
  publishCreditOffer,
} from '@/server/workflows/credit-offer';

import {
  decidePublicCreditOffer,
} from '@/server/workflows/public-credit-offer';

import {
  registerFormalizationDisbursement,
  submitFormalizationBankData,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

let applicationId:
  string | null =
  null;

describe('fluxo completo de crédito - integração MySQL', () => {
  afterEach(async () => {
    if (!applicationId) {
      return;
    }

    await prisma.creditApplication.deleteMany({
      where: {
        id: applicationId,
      },
    });

    applicationId =
      null;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('percorre proposta aceita até registro da liberação', async () => {
    const application =
      await prisma.creditApplication.create({
        data: {
          status:
            'APPROVED',

          amount:
            10000,

          months:
            12,
        },

        select: {
          id: true,
        },
      });

    applicationId =
      application.id;

    const offer =
      await publishCreditOffer(
        application.id,

        {
          principalCents:
            1000000,

          netDisbursementCents:
            960000,

          installmentCents:
            100000,

          totalRepaymentCents:
            1200000,

          iofCents:
            30000,

          otherFeesCents:
            10000,

          months:
            12,

          installmentCount:
            12,

          monthlyRatePercent:
            '2.50',

          annualRatePercent:
            '34.49',

          cetAnnualPercent:
            '39.10',

          firstDueDate:
            new Date(
              Date.now() +
                30 *
                  24 *
                  60 *
                  60 *
                  1000,
            ),

          expiresAt:
            new Date(
              Date.now() +
                5 *
                  24 *
                  60 *
                  60 *
                  1000,
            ),

          termsVersion:
            'integration-full-flow-v1',
        },

        {
          actorId:
            'integration-admin',
        },
      );

    expect(
      offer.status,
    ).toBe(
      'PRESENTED',
    );

    await decidePublicCreditOffer({
      applicationId:
        application.id,

      version:
        offer.version,

      decision:
        'ACCEPT',
    });

    const formalization =
      await prisma.creditFormalization.findUnique({
        where: {
          applicationId:
            application.id,
        },

        select: {
          id: true,
          status: true,
        },
      });

    expect(
      formalization,
    ).not.toBeNull();

    expect(
      formalization?.status,
    ).toBe(
      'PENDING',
    );

    if (!formalization) {
      throw new Error(
        'Formalização não criada após aceite.',
      );
    }

    await submitFormalizationBankData(
      formalization.id,
      'encrypted-integration-bank-data',
    );

    let storedFormalization =
      await prisma.creditFormalization.findUnique({
        where: {
          id:
            formalization.id,
        },
      });

    expect(
      storedFormalization?.status,
    ).toBe(
      'BANK_DETAILS_SUBMITTED',
    );

    expect(
      storedFormalization?.bankDataSubmittedAt,
    ).toBeInstanceOf(
      Date,
    );

    await transitionFormalizationStatus(
      formalization.id,
      'READY_FOR_DISBURSEMENT',
      {
        actorType:
          'OPERATOR',

        actorId:
          'integration-admin',

        reason:
          'Dados bancários conferidos no teste de integração.',
      },
    );

    storedFormalization =
      await prisma.creditFormalization.findUnique({
        where: {
          id:
            formalization.id,
        },
      });

    expect(
      storedFormalization?.status,
    ).toBe(
      'READY_FOR_DISBURSEMENT',
    );

    expect(
      storedFormalization?.readyAt,
    ).toBeInstanceOf(
      Date,
    );

    await registerFormalizationDisbursement(
      formalization.id,

      'encrypted-integration-external-reference',

      {
        actorType:
          'OPERATOR',

        actorId:
          'integration-admin',

        reason:
          'Transferência externa confirmada no teste de integração.',
      },
    );

    const finalFormalization =
      await prisma.creditFormalization.findUnique({
        where: {
          id:
            formalization.id,
        },

        include: {
          statusHistory: {
            orderBy: {
              createdAt:
                'asc',
            },
          },
        },
      });

    expect(
      finalFormalization?.status,
    ).toBe(
      'DISBURSED',
    );

    expect(
      finalFormalization?.disbursedAt,
    ).toBeInstanceOf(
      Date,
    );

    expect(
      finalFormalization
        ?.disbursementReferenceEncrypted,
    ).toBe(
      'encrypted-integration-external-reference',
    );

    expect(
      finalFormalization?.statusHistory,
    ).toHaveLength(
      3,
    );

    expect(
      finalFormalization?.statusHistory[0],
    ).toMatchObject({
      fromStatus:
        'PENDING',

      toStatus:
        'BANK_DETAILS_SUBMITTED',

      actorType:
        'APPLICANT',

      actorId:
        null,

      reason:
        'Dados bancários enviados pelo cliente.',
    });

    expect(
      finalFormalization?.statusHistory[1],
    ).toMatchObject({
      fromStatus:
        'BANK_DETAILS_SUBMITTED',

      toStatus:
        'READY_FOR_DISBURSEMENT',

      actorType:
        'OPERATOR',

      actorId:
        'integration-admin',
    });

    expect(
      finalFormalization?.statusHistory[2],
    ).toMatchObject({
      fromStatus:
        'READY_FOR_DISBURSEMENT',

      toStatus:
        'DISBURSED',

      actorType:
        'OPERATOR',

      actorId:
        'integration-admin',

      reason:
        'Transferência externa confirmada no teste de integração.',
    });

    const acceptedOffers =
      await prisma.creditOffer.count({
        where: {
          applicationId:
            application.id,

          status:
            'ACCEPTED',
        },
      });

    expect(
      acceptedOffers,
    ).toBe(
      1,
    );

    const formalizationCount =
      await prisma.creditFormalization.count({
        where: {
          applicationId:
            application.id,
        },
      });

    expect(
      formalizationCount,
    ).toBe(
      1,
    );
  });
});
