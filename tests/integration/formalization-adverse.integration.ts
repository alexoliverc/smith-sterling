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
  FormalizationOfferNotAcceptedError,
  InvalidFormalizationStatusTransitionError,
  submitFormalizationBankData,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

let applicationId:
  string | null =
  null;

describe('formalização adversa - integração MySQL', () => {
  afterEach(async () => {
    if (!applicationId) {
      return;
    }

    await prisma.creditApplication.deleteMany({
      where: {
        id:
          applicationId,
      },
    });

    applicationId =
      null;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('bloqueia dados bancários quando não existe proposta aceita', async () => {
    const application =
      await prisma.creditApplication.create({
        data: {
          status:
            'APPROVED',

          amount:
            5000,

          months:
            12,

          formalization: {
            create: {
              status:
                'PENDING',
            },
          },
        },

        select: {
          id: true,

          formalization: {
            select: {
              id: true,
            },
          },
        },
      });

    applicationId =
      application.id;

    if (!application.formalization) {
      throw new Error(
        'Formalização de teste não foi criada.',
      );
    }

    await expect(
      submitFormalizationBankData(
        application.formalization.id,
        'encrypted-test-bank-data',
      ),
    ).rejects.toBeInstanceOf(
      FormalizationOfferNotAcceptedError,
    );

    const storedFormalization =
      await prisma.creditFormalization.findUnique({
        where: {
          id:
            application.formalization.id,
        },

        include: {
          statusHistory:
            true,
        },
      });

    expect(
      storedFormalization?.status,
    ).toBe(
      'PENDING',
    );

    expect(
      storedFormalization?.bankDataEncrypted,
    ).toBeNull();

    expect(
      storedFormalization?.bankDataSubmittedAt,
    ).toBeNull();

    expect(
      storedFormalization?.statusHistory,
    ).toHaveLength(
      0,
    );
  });

  it('bloqueia salto de PENDING diretamente para READY_FOR_DISBURSEMENT', async () => {
    const application =
      await prisma.creditApplication.create({
        data: {
          status:
            'APPROVED',

          amount:
            7000,

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
            700000,

          netDisbursementCents:
            670000,

          installmentCents:
            70000,

          totalRepaymentCents:
            840000,

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
            'integration-adverse-v1',
        },

        {
          actorId:
            'integration-admin',
        },
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
      formalization?.status,
    ).toBe(
      'PENDING',
    );

    if (!formalization) {
      throw new Error(
        'Formalização não criada após o aceite.',
      );
    }

    await expect(
      transitionFormalizationStatus(
        formalization.id,
        'READY_FOR_DISBURSEMENT',
        {
          actorType:
            'OPERATOR',

          actorId:
            'integration-admin',

          reason:
            'Tentativa inválida de pular etapa.',
        },
      ),
    ).rejects.toBeInstanceOf(
      InvalidFormalizationStatusTransitionError,
    );

    const storedFormalization =
      await prisma.creditFormalization.findUnique({
        where: {
          id:
            formalization.id,
        },

        include: {
          statusHistory:
            true,
        },
      });

    expect(
      storedFormalization?.status,
    ).toBe(
      'PENDING',
    );

    expect(
      storedFormalization?.readyAt,
    ).toBeNull();

    expect(
      storedFormalization?.statusHistory,
    ).toHaveLength(
      0,
    );
  });
});
