import 'server-only';

import { prisma } from '@/lib/prisma';
import { decryptPii } from '@/lib/security/pii';

const acceptedOfferSelect = {
  id: true,
  version: true,
  status: true,
  principalCents: true,
  netDisbursementCents: true,
  installmentCents: true,
  totalRepaymentCents: true,
  months: true,
  installmentCount: true,
  acceptedAt: true,
  termsVersion: true,
} as const;

export async function getAdminFormalizationByProtocol(
  protocol: string,
) {
  const application =
    await prisma.creditApplication.findUnique({
      where: {
        publicProtocol:
          protocol,
      },

      select: {
        id: true,
        publicProtocol: true,
        status: true,

        /*
         * Compatibilidade temporária com
         * formalizações anteriores à criação
         * de acceptedOfferId.
         *
         * Para registros novos, a relação
         * formalization.acceptedOffer abaixo
         * é a fonte autoritativa.
         */
        offers: {
          where: {
            status:
              'ACCEPTED',
          },

          orderBy: {
            acceptedAt:
              'desc',
          },

          take: 1,

          select:
            acceptedOfferSelect,
        },

        formalization: {
          select: {
            id: true,
            status: true,

            acceptedOfferId:
              true,

            acceptedOffer: {
              select:
                acceptedOfferSelect,
            },

            bankDataEncrypted:
              true,

            bankDataSubmittedAt:
              true,

            readyAt:
              true,

            disbursedAt:
              true,

            cancelledAt:
              true,

            createdAt:
              true,

            updatedAt:
              true,

            statusHistory: {
              orderBy: {
                createdAt:
                  'asc',
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

  if (!application.formalization) {
    return {
      id:
        application.id,

      publicProtocol:
        application.publicProtocol,

      status:
        application.status,

      acceptedOffer:
        null,

      formalization:
        null,
    };
  }

  const formalization =
    application.formalization;

  /*
   * Se acceptedOfferId estiver preenchido,
   * nenhuma outra proposta ACCEPTED pode
   * substituir silenciosamente a relação.
   *
   * O fallback por application.offers existe
   * somente para registros legados cujo
   * acceptedOfferId ainda seja NULL.
   */
  const acceptedOffer =
    formalization.acceptedOfferId
      ? formalization.acceptedOffer
            ?.status ===
          'ACCEPTED'
        ? formalization.acceptedOffer
        : null
      : application.offers[0] ??
        null;

  const operatorIds = [
    ...new Set(
      formalization.statusHistory
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

  const statusHistory =
    formalization.statusHistory.map(
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
    );

  let bankData: {
    bankName: string;
    branch: string;
    account: string;
    accountType: string;
    holderName: string;
    pixKey: string;
  } | null = null;

  if (
    formalization.bankDataEncrypted
  ) {
    const decrypted =
      decryptPii(
        formalization.bankDataEncrypted,

        `${application.id}:bankData`,
      );

    const parsed =
      parseJsonObject(
        decrypted,
      );

    bankData = {
      bankName:
        readString(
          parsed,
          'bankName',
        ),

      branch:
        readString(
          parsed,
          'branch',
        ),

      account:
        readString(
          parsed,
          'account',
        ),

      accountType:
        readString(
          parsed,
          'accountType',
        ),

      holderName:
        readString(
          parsed,
          'holderName',
        ),

      pixKey:
        readString(
          parsed,
          'pixKey',
        ),
    };
  }

  return {
    id:
      application.id,

    publicProtocol:
      application.publicProtocol,

    status:
      application.status,

    acceptedOffer,

    formalization: {
      id:
        formalization.id,

      acceptedOfferId:
        formalization.acceptedOfferId,

      status:
        formalization.status,

      bankDataSubmittedAt:
        formalization.bankDataSubmittedAt,

      readyAt:
        formalization.readyAt,

      disbursedAt:
        formalization.disbursedAt,

      cancelledAt:
        formalization.cancelledAt,

      createdAt:
        formalization.createdAt,

      updatedAt:
        formalization.updatedAt,

      bankData,

      statusHistory,
    },
  };
}

export async function findAdminFormalizationForTransition(
  protocol: string,
) {
  return prisma.creditApplication.findUnique({
    where: {
      publicProtocol:
        protocol,
    },

    select: {
      id: true,
      status: true,

      formalization: {
        select: {
          id: true,
          status: true,

          bankDataEncrypted:
            true,

          acceptedOfferId:
            true,

          acceptedOffer: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

function parseJsonObject(
  value: string,
): Record<string, unknown> {
  try {
    const parsed: unknown =
      JSON.parse(
        value,
      );

    if (
      typeof parsed ===
        'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<
        string,
        unknown
      >;
    }

    return {};
  } catch {
    return {};
  }
}

function readString(
  object: Record<string, unknown>,
  key: string,
) {
  const value =
    object[key];

  return typeof value ===
    'string'
    ? value
    : '';
}
