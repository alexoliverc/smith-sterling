import 'server-only';

import { prisma } from '@/lib/prisma';

type PublishCreditOfferInput = {
  principalCents: number;
  netDisbursementCents: number;
  installmentCents: number;
  totalRepaymentCents: number;

  iofCents: number;
  otherFeesCents: number;

  months: number;
  installmentCount: number;

  monthlyRatePercent: string;
  annualRatePercent: string;
  cetAnnualPercent: string;

  /*
   * O banco aceita NULL para preservar
   * propostas historicas. A interface
   * administrativa exige estes dados
   * nas novas publicacoes.
   */
  lateInterestMonthlyPercent: string;
  latePenaltyPercent: string;
  lateOtherChargesDescription: string;
  defaultConsequences: string;
  cetCompositionDescription: string;

  firstDueDate: Date;
  expiresAt: Date;

  termsVersion: string;
};

type PublishCreditOfferOptions = {
  actorId: string;
};

export class CreditOfferApplicationNotApprovedError extends Error {
  constructor() {
    super(
      'A solicitação precisa estar aprovada antes da publicação da proposta.',
    );

    this.name =
      'CreditOfferApplicationNotApprovedError';
  }
}

export class CreditOfferAlreadyAcceptedError extends Error {
  constructor() {
    super(
      'Esta solicitação já possui uma proposta aceita.',
    );

    this.name =
      'CreditOfferAlreadyAcceptedError';
  }
}

export class CreditOfferExpirationTooShortError extends Error {
  constructor() {
    super(
      'A proposta precisa permanecer válida por pelo menos 2 dias.',
    );

    this.name =
      'CreditOfferExpirationTooShortError';
  }
}


export class CreditOfferDisclosureIncompleteError extends Error {
  constructor() {
    super(
      'A proposta precisa informar as condições de atraso, consequências do inadimplemento e composição do CET.',
    );

    this.name =
      'CreditOfferDisclosureIncompleteError';
  }
}

const MAX_STORED_INT =
  2_147_483_647;

const PERCENTAGE_PATTERN =
  /^\d{1,4}(\.\d{1,8})?$/;

export class CreditOfferFinancialIntegrityError extends Error {
  constructor(message: string) {
    super(message);

    this.name =
      'CreditOfferFinancialIntegrityError';
  }
}

function isPositiveStoredInteger(
  value: number,
) {
  return (
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_STORED_INT
  );
}

function isNonNegativeStoredInteger(
  value: number,
) {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_STORED_INT
  );
}

function hasValidPercentageFormat(
  value: string,
) {
  return PERCENTAGE_PATTERN.test(
    value,
  );
}

function validateCreditOfferFinancialIntegrity(
  input: PublishCreditOfferInput,
  now: Date,
) {
  const principalValues = [
    input.principalCents,
    input.netDisbursementCents,
    input.installmentCents,
    input.totalRepaymentCents,
  ];

  if (
    !principalValues.every(
      isPositiveStoredInteger,
    )
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'Os valores principais da proposta devem ser inteiros em centavos, maiores que zero e compatíveis com o armazenamento.',
    );
  }

  if (
    !isNonNegativeStoredInteger(
      input.iofCents,
    ) ||
    !isNonNegativeStoredInteger(
      input.otherFeesCents,
    )
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'IOF e outros encargos devem ser valores não negativos e compatíveis com o armazenamento.',
    );
  }

  /*
   * Nesta camada, principal, valor líquido, IOF e outros
   * encargos são componentes independentes da proposta.
   *
   * O workflow não presume como IOF ou encargos são
   * financiados ou descontados do desembolso. Essa relação
   * depende da estrutura financeira efetivamente contratada
   * e deve permanecer coerente com o CET e suas divulgações.
   *
   * A invariante técnica aqui é apenas que o valor líquido
   * não ultrapasse o principal informado.
   */
  if (
    input.netDisbursementCents >
    input.principalCents
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'O valor líquido a liberar não pode ser superior ao valor principal aprovado.',
    );
  }

  if (
    input.totalRepaymentCents <
    input.netDisbursementCents
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'O total da operação não pode ser inferior ao valor líquido liberado.',
    );
  }

  if (
    !Number.isInteger(
      input.months,
    ) ||
    input.months < 1 ||
    input.months > 120 ||
    !Number.isInteger(
      input.installmentCount,
    ) ||
    input.installmentCount < 1 ||
    input.installmentCount > 120
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'Prazo e número de parcelas devem ser inteiros entre 1 e 120.',
    );
  }

  const calculatedTotal =
    input.installmentCents *
    input.installmentCount;

  if (
    calculatedTotal !==
    input.totalRepaymentCents
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'O total da operação deve corresponder ao valor da parcela multiplicado pelo número de parcelas.',
    );
  }

  const percentages = [
    input.monthlyRatePercent,
    input.annualRatePercent,
    input.cetAnnualPercent,
    input.lateInterestMonthlyPercent,
    input.latePenaltyPercent,
  ];

  if (
    !percentages.every(
      hasValidPercentageFormat,
    )
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'As taxas e percentuais da proposta possuem formato inválido.',
    );
  }

  if (
    Number.isNaN(
      input.firstDueDate.getTime(),
    ) ||
    Number.isNaN(
      input.expiresAt.getTime(),
    )
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'As datas da proposta são inválidas.',
    );
  }

  if (
    input.firstDueDate <= now
  ) {
    throw new CreditOfferFinancialIntegrityError(
      'O primeiro vencimento precisa ocorrer no futuro.',
    );
  }
}

export async function publishCreditOffer(
  applicationId: string,
  input: PublishCreditOfferInput,
  options: PublishCreditOfferOptions,
) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    validateCreditOfferFinancialIntegrity(
      input,
      now,
    );

    const lateInterest =
      Number(
        input.lateInterestMonthlyPercent,
      );

    const latePenalty =
      Number(
        input.latePenaltyPercent,
      );

    const disclosuresAreValid =
      Number.isFinite(lateInterest) &&
      lateInterest >= 0 &&
      Number.isFinite(latePenalty) &&
      latePenalty >= 0 &&
      input.lateOtherChargesDescription.trim().length >= 2 &&
      input.defaultConsequences.trim().length >= 10 &&
      input.cetCompositionDescription.trim().length >= 10;

    if (!disclosuresAreValid) {
      throw new CreditOfferDisclosureIncompleteError();
    }

    const minimumExpiration =
      new Date(
        now.getTime() +
          2 *
            24 *
            60 *
            60 *
            1000,
      );

    if (
      input.expiresAt <
      minimumExpiration
    ) {
      throw new CreditOfferExpirationTooShortError();
    }

    /*
     * Esta atualização também serializa
     * publicações concorrentes da mesma
     * solicitação dentro do banco.
     */
    const application =
      await tx.creditApplication.update({
        where: {
          id: applicationId,
        },

        data: {
          updatedAt: now,
        },

        select: {
          id: true,
          status: true,
        },
      });

    if (
      application.status !==
      'APPROVED'
    ) {
      throw new CreditOfferApplicationNotApprovedError();
    }

    const acceptedOffer =
      await tx.creditOffer.findFirst({
        where: {
          applicationId,
          status: 'ACCEPTED',
        },

        select: {
          id: true,
        },
      });

    if (acceptedOffer) {
      throw new CreditOfferAlreadyAcceptedError();
    }

    /*
     * Uma solicitação não deve possuir
     * duas propostas PRESENTED ao mesmo
     * tempo.
     */
    const previousPresentedOffers =
      await tx.creditOffer.findMany({
        where: {
          applicationId,
          status: 'PRESENTED',
        },

        select: {
          id: true,
          expiresAt: true,
        },
      });

    for (const previousOffer of previousPresentedOffers) {
      const expired =
        previousOffer.expiresAt <= now;

      const nextStatus =
        expired
          ? 'EXPIRED'
          : 'CANCELLED';

      await tx.creditOffer.update({
        where: {
          id: previousOffer.id,
        },

        data: {
          status: nextStatus,

          ...(expired
            ? {
                expiredAt: now,
              }
            : {
                cancelledAt: now,
              }),
        },
      });

      await tx.creditOfferStatusHistory.create({
        data: {
          offerId:
            previousOffer.id,

          fromStatus:
            'PRESENTED',

          toStatus:
            nextStatus,

          actorType:
            'OPERATOR',

          actorId:
            options.actorId,

          reason:
            expired
              ? 'Proposta anterior expirada antes da publicação de uma nova versão.'
              : 'Proposta anterior substituída por uma nova versão.',
        },
      });
    }

    const latestVersion =
      await tx.creditOffer.aggregate({
        where: {
          applicationId,
        },

        _max: {
          version: true,
        },
      });

    const version =
      (latestVersion._max.version ?? 0) +
      1;

    const offer =
      await tx.creditOffer.create({
        data: {
          applicationId,

          version,

          status:
            'PRESENTED',

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

          lateInterestMonthlyPercent:
            input.lateInterestMonthlyPercent,

          latePenaltyPercent:
            input.latePenaltyPercent,

          lateOtherChargesDescription:
            input.lateOtherChargesDescription,

          defaultConsequences:
            input.defaultConsequences,

          cetCompositionDescription:
            input.cetCompositionDescription,

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

    await tx.creditOfferStatusHistory.create({
      data: {
        offerId:
          offer.id,

        fromStatus:
          'DRAFT',

        toStatus:
          'PRESENTED',

        actorType:
          'OPERATOR',

        actorId:
          options.actorId,

        reason:
          `Proposta versão ${version} publicada pelo backoffice.`,
      },
    });

    return offer;
  });
}
