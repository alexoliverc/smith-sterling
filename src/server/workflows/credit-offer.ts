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


export async function publishCreditOffer(
  applicationId: string,
  input: PublishCreditOfferInput,
  options: PublishCreditOfferOptions,
) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

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
