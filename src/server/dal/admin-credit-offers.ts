import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getAdminCreditOfferWorkspace(
  protocol: string,
) {
  const application =
    await prisma.creditApplication.findUnique({
      where: {
        publicProtocol: protocol,
      },

      select: {
        id: true,
        publicProtocol: true,
        status: true,
        amount: true,
        months: true,
        submittedAt: true,
        createdAt: true,

        offers: {
          orderBy: {
            version: 'desc',
          },

          select: {
            id: true,
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

            statusHistory: {
              orderBy: {
                createdAt: 'asc',
              },

              select: {
                id: true,
                fromStatus: true,
                toStatus: true,

                actorType: true,
                actorId: true,

                reason: true,

                createdAt: true,
              },
            },
          },
        },
      },
    });

  if (!application) {
    return null;
  }

  /*
   * Somente eventos realizados por
   * OPERATOR possuem actorId que deve
   * ser resolvido para AdminUser.
   *
   * APPLICANT e SYSTEM não precisam
   * carregar dados pessoais adicionais.
   */
  const operatorIds = [
    ...new Set(
      application.offers
        .flatMap(
          (offer) =>
            offer.statusHistory,
        )
        .filter(
          (event) =>
            event.actorType ===
              'OPERATOR' &&
            event.actorId,
        )
        .map(
          (event) =>
            event.actorId as string,
        ),
    ),
  ];

  const operators =
    operatorIds.length > 0
      ? await prisma.adminUser.findMany({
          where: {
            id: {
              in: operatorIds,
            },
          },

          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const operatorNameById =
    new Map(
      operators.map(
        (operator) => [
          operator.id,
          operator.name,
        ],
      ),
    );

  const offers =
    application.offers.map(
      (offer) => ({
        ...offer,

        statusHistory:
          offer.statusHistory.map(
            (event) => ({
              ...event,

              actorName:
                event.actorType ===
                  'OPERATOR' &&
                event.actorId
                  ? operatorNameById.get(
                      event.actorId,
                    ) ??
                    'Operador não encontrado'
                  : null,
            }),
          ),
      }),
    );

  return {
    ...application,
    offers,
  };
}
