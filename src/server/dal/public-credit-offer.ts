import 'server-only';

import { prisma } from '@/lib/prisma';
import { findApplicationForSession } from '@/server/dal/credit-application';

export async function getPublicCreditOfferForSession(
  protocol: string,
  accessToken: string,
) {
  /*
   * Primeiro validamos a combinação:
   *
   * protocolo + token da sessão pública.
   *
   * Assim, conhecer apenas um protocolo
   * não permite consultar a proposta.
   */
  const publicApplication =
    await findApplicationForSession(
      protocol,
      accessToken,
    );

  if (!publicApplication) {
    return null;
  }

  if (
    publicApplication.status !==
    'APPROVED'
  ) {
    return {
      allowed: false as const,

      application: {
        protocol:
          publicApplication.publicProtocol ??
          protocol,

        status:
          publicApplication.status,

        amount:
          publicApplication.amount,

        months:
          publicApplication.months,
      },
    };
  }

  const application =
    await prisma.creditApplication.findUnique({
      where: {
        publicProtocol:
          protocol,
      },

      select: {
        id: true,

        publicProtocol: true,

        offers: {
          where: {
            status: {
              in: [
                'PRESENTED',
                'ACCEPTED',
                'DECLINED',
                'EXPIRED',
                'CANCELLED',
              ],
            },
          },

          orderBy: {
            version: 'desc',
          },

          take: 1,

          select: {
            version: true,
            status: true,

            principalCents: true,
            netDisbursementCents: true,
            installmentCents: true,
            totalRepaymentCents: true,

            iofCents: true,
            otherFeesCents: true,

            months: true,
            installmentCount: true,

            monthlyRatePercent: true,
            annualRatePercent: true,
            cetAnnualPercent: true,

            lateInterestMonthlyPercent: true,
            latePenaltyPercent: true,

            lateOtherChargesDescription: true,
            defaultConsequences: true,
            cetCompositionDescription: true,

            firstDueDate: true,
            expiresAt: true,

            termsVersion: true,

            presentedAt: true,
            acceptedAt: true,
            declinedAt: true,
            expiredAt: true,
            cancelledAt: true,

            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

  if (!application) {
    return null;
  }

  const offer =
    application.offers[0] ??
    null;

  return {
    allowed: true as const,

    application: {
      protocol:
        application.publicProtocol ??
        protocol,

      status:
        publicApplication.status,

      requestedAmount:
        publicApplication.amount,

      requestedMonths:
        publicApplication.months,
    },

    offer,
  };
}

/*
 * Contexto usado por Server Actions.
 *
 * O navegador envia somente protocolo
 * e versão da proposta. O applicationId
 * interno é resolvido novamente no
 * servidor após validar a sessão.
 */
export async function getPublicCreditOfferDecisionContext(
  protocol: string,
  accessToken: string,
  version: number,
) {
  const publicApplication =
    await findApplicationForSession(
      protocol,
      accessToken,
    );

  if (!publicApplication) {
    return null;
  }

  if (
    publicApplication.status !==
    'APPROVED'
  ) {
    return {
      allowed: false as const,
    };
  }

  const application =
    await prisma.creditApplication.findUnique({
      where: {
        publicProtocol:
          protocol,
      },

      select: {
        id: true,

        offers: {
          where: {
            version,
          },

          take: 1,

          select: {
            version: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    });

  if (!application) {
    return null;
  }

  const offer =
    application.offers[0];

  if (!offer) {
    return {
      allowed: true as const,
      found: false as const,
    };
  }

  return {
    allowed: true as const,
    found: true as const,

    applicationId:
      application.id,

    offer: {
      version:
        offer.version,

      status:
        offer.status,

      expiresAt:
        offer.expiresAt,
    },
  };
}
