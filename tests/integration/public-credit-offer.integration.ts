import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import { prisma } from '@/lib/prisma';
import { publishCreditOffer } from '@/server/workflows/credit-offer';
import { decidePublicCreditOffer } from '@/server/workflows/public-credit-offer';

let applicationId:
  string | null =
  null;

describe('public-credit-offer - integração MySQL', () => {
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

  it('cria exatamente uma formalização PENDING após o aceite', async () => {
    const application =
      await prisma.creditApplication.create({
        data: {
          status:
            'APPROVED',

          amount:
            8000,

          months:
            12,
        },

        select: {
          id: true,
        },
      });

    applicationId =
      application.id;

    const published =
      await publishCreditOffer(
        application.id,

        {
          principalCents:
            800000,

          netDisbursementCents:
            770000,

          installmentCents:
            80000,

          totalRepaymentCents:
            960000,

          iofCents:
            20000,

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
            'integration-test-v1',
        },

        {
          actorId:
            'integration-test-operator',
        },
      );

    expect(
      published.status,
    ).toBe(
      'PRESENTED',
    );

    const beforeAccept =
      await prisma.creditFormalization.count({
        where: {
          applicationId:
            application.id,
        },
      });

    expect(
      beforeAccept,
    ).toBe(
      0,
    );

    const decision =
      await decidePublicCreditOffer({
        applicationId:
          application.id,

        version:
          published.version,

        decision:
          'ACCEPT',
      });

    expect(
      decision,
    ).toEqual({
      success:
        true,

      outcome:
        'ACCEPTED',

      alreadyDecided:
        false,
    });

    const storedOffer =
      await prisma.creditOffer.findUnique({
        where: {
          applicationId_version: {
            applicationId:
              application.id,

            version:
              published.version,
          },
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
      storedOffer?.status,
    ).toBe(
      'ACCEPTED',
    );

    expect(
      storedOffer?.acceptedAt,
    ).toBeInstanceOf(
      Date,
    );

    expect(
      storedOffer?.statusHistory,
    ).toHaveLength(
      2,
    );

    expect(
      storedOffer?.statusHistory[0],
    ).toMatchObject({
      fromStatus:
        'DRAFT',

      toStatus:
        'PRESENTED',

      actorType:
        'OPERATOR',
    });

    expect(
      storedOffer?.statusHistory[1],
    ).toMatchObject({
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
    });

    const formalizations =
      await prisma.creditFormalization.findMany({
        where: {
          applicationId:
            application.id,
        },
      });

    expect(
      formalizations,
    ).toHaveLength(
      1,
    );

    expect(
      formalizations[0]?.status,
    ).toBe(
      'PENDING',
    );

    /*
     * Repetir o aceite deve ser
     * idempotente e não criar outra
     * formalização ou auditoria.
     */
    const repeatedDecision =
      await decidePublicCreditOffer({
        applicationId:
          application.id,

        version:
          published.version,

        decision:
          'ACCEPT',
      });

    expect(
      repeatedDecision,
    ).toEqual({
      success:
        true,

      outcome:
        'ACCEPTED',

      alreadyDecided:
        true,
    });

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

    const historyCount =
      await prisma.creditOfferStatusHistory.count({
        where: {
          offerId:
            storedOffer?.id,
        },
      });

    expect(
      historyCount,
    ).toBe(
      2,
    );
  });
});
