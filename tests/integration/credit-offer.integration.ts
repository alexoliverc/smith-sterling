import {
  afterAll,
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import { prisma } from '@/lib/prisma';
import { publishCreditOffer } from '@/server/workflows/credit-offer';

let applicationId:
  string | null =
  null;

describe('credit-offer - integração MySQL', () => {
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

  it('publica uma proposta real e persiste sua auditoria', async () => {
    const application =
      await prisma.creditApplication.create({
        data: {
          status:
            'APPROVED',

          amount:
            5000,

          months:
            12,
        },

        select: {
          id: true,
          status: true,
        },
      });

    applicationId =
      application.id;

    expect(
      application.status,
    ).toBe(
      'APPROVED',
    );

    const firstDueDate =
      new Date(
        Date.now() +
          30 *
            24 *
            60 *
            60 *
            1000,
      );

    const expiresAt =
      new Date(
        Date.now() +
          5 *
            24 *
            60 *
            60 *
            1000,
      );

    const published =
      await publishCreditOffer(
        application.id,

        {
          principalCents:
            500000,

          netDisbursementCents:
            480000,

          installmentCents:
            50000,

          totalRepaymentCents:
            600000,

          iofCents:
            15000,

          otherFeesCents:
            5000,

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

          lateInterestMonthlyPercent:
            '1',

          latePenaltyPercent:
            '2',

          lateOtherChargesDescription:
            'Não há outros encargos de atraso além dos informados.',

          defaultConsequences:
            'O atraso poderá gerar os encargos informados e as medidas de cobrança previstas na contratação.',

          cetCompositionDescription:
            'O CET considera juros, IOF e os demais encargos informados nesta proposta.',

          firstDueDate,

          expiresAt,

          termsVersion:
            'integration-test-v1',
        },

        {
          actorId:
            'integration-test-operator',
        },
      );

    expect(
      published.version,
    ).toBe(
      1,
    );

    expect(
      published.status,
    ).toBe(
      'PRESENTED',
    );

    const storedOffer =
      await prisma.creditOffer.findUnique({
        where: {
          applicationId_version: {
            applicationId:
              application.id,

            version:
              1,
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
      storedOffer,
    ).not.toBeNull();

    expect(
      storedOffer?.status,
    ).toBe(
      'PRESENTED',
    );

    expect(
      storedOffer?.version,
    ).toBe(
      1,
    );

    expect(
      storedOffer?.principalCents,
    ).toBe(
      500000,
    );

    expect(
      storedOffer?.statusHistory,
    ).toHaveLength(
      1,
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

      actorId:
        'integration-test-operator',

      reason:
        'Proposta versão 1 publicada pelo backoffice.',
    });
  });
});
