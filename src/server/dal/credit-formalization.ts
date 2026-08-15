import 'server-only';

import { prisma } from '@/lib/prisma';
import { encryptPii } from '@/lib/security/pii';
import { findApplicationForSession } from '@/server/dal/credit-application';
import {
  FormalizationLockedError,
  submitFormalizationBankData,
} from '@/server/workflows/formalization-status';

export type BankAccountInput = {
  bankName: string;

  branch: string;

  account: string;

  accountType: 'CHECKING' | 'SAVINGS' | 'PAYMENT';

  holderName: string;

  pixKey?: string;
};

export async function getFormalizationForSession(
  protocol: string,
  accessToken: string,
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

      reason:
        'NOT_APPROVED' as const,

      application: {
        status:
          publicApplication.status,

        protocol,
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

        /*
         * Compatibilidade temporária com
         * formalizações anteriores à criação
         * de acceptedOfferId.
         *
         * Para registros novos, a relação
         * formalization.acceptedOffer abaixo
         * é sempre a fonte autoritativa.
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

          select: {
            id: true,
            version: true,
            status: true,

            principalCents:
              true,

            netDisbursementCents:
              true,

            installmentCents:
              true,

            totalRepaymentCents:
              true,

            months: true,

            installmentCount:
              true,

            acceptedAt:
              true,

            termsVersion:
              true,
          },
        },

        formalization: {
          select: {
            status: true,

            acceptedOfferId:
              true,

            acceptedOffer: {
              select: {
                id: true,
                version: true,
                status: true,

                principalCents:
                  true,

                netDisbursementCents:
                  true,

                installmentCents:
                  true,

                totalRepaymentCents:
                  true,

                months: true,

                installmentCount:
                  true,

                acceptedAt:
                  true,

                termsVersion:
                  true,
              },
            },

            bankDataSubmittedAt:
              true,

            readyAt: true,

            disbursedAt: true,

            createdAt: true,

            updatedAt: true,
          },
        },
      },
    });

  if (!application) {
    return null;
  }

  /*
   * A formalização deve ter sido criada
   * no mesmo workflow que registrou o
   * aceite da proposta.
   */
  if (!application.formalization) {
    return {
      allowed: false as const,

      reason:
        'FORMALIZATION_NOT_FOUND' as const,

      application: {
        status:
          publicApplication.status,

        protocol,
      },
    };
  }

  /*
   * Quando acceptedOfferId existe, não
   * fazemos fallback para outra proposta.
   *
   * Isso impede que uma inconsistência
   * relacional seja mascarada escolhendo
   * simplesmente outra oferta ACCEPTED.
   */
  const acceptedOffer =
    application.formalization
      .acceptedOfferId
      ? application.formalization
            .acceptedOffer
          ?.status ===
        'ACCEPTED'
        ? application.formalization
            .acceptedOffer
        : null
      : application.offers[0] ??
        null;

  if (!acceptedOffer) {
    return {
      allowed: false as const,

      reason:
        'OFFER_NOT_ACCEPTED' as const,

      application: {
        status:
          publicApplication.status,

        protocol,
      },
    };
  }

  return {
    allowed: true as const,

    application: {
      status:
        publicApplication.status,

      protocol,
    },

    offer:
      acceptedOffer,

    formalization:
      application.formalization,
  };
}

export async function saveBankDataForSession(
  protocol: string,
  accessToken: string,
  bankData: BankAccountInput,
) {
  const publicApplication =
    await findApplicationForSession(
      protocol,
      accessToken,
    );

  if (!publicApplication) {
    return {
      success: false as const,

      reason:
        'UNAUTHORIZED' as const,
    };
  }

  if (
    publicApplication.status !==
    'APPROVED'
  ) {
    return {
      success: false as const,

      reason:
        'NOT_APPROVED' as const,
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

        /*
         * Fallback somente para registros
         * legados ainda sem acceptedOfferId.
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

          select: {
            id: true,
            version: true,
          },
        },

        formalization: {
          select: {
            id: true,
            status: true,

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

  if (!application) {
    return {
      success: false as const,

      reason:
        'NOT_FOUND' as const,
    };
  }

  if (!application.formalization) {
    return {
      success: false as const,

      reason:
        'NOT_FOUND' as const,
    };
  }

  const acceptedOfferExists =
    application.formalization
      .acceptedOfferId
      ? application.formalization
            .acceptedOffer
          ?.status ===
        'ACCEPTED'
      : application.offers.length >
        0;

  if (!acceptedOfferExists) {
    return {
      success: false as const,

      reason:
        'NOT_APPROVED' as const,
    };
  }

  const protectedPayload =
    encryptPii(
      JSON.stringify({
        version: 1,

        bankName:
          bankData.bankName,

        branch:
          bankData.branch,

        account:
          bankData.account,

        accountType:
          bankData.accountType,

        holderName:
          bankData.holderName,

        pixKey:
          bankData.pixKey ||
          null,
      }),

      `${application.id}:bankData`,
    );

  try {
    await submitFormalizationBankData(
      application.formalization.id,
      protectedPayload,
    );
  } catch (error) {
    if (
      error instanceof
      FormalizationLockedError
    ) {
      return {
        success: false as const,

        reason:
          'LOCKED' as const,
      };
    }

    throw error;
  }

  return {
    success: true as const,
  };
}
