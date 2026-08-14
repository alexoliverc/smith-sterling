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

        amount:
          publicApplication.amount,

        months:
          publicApplication.months,

        protocol,
      },
    };
  }

  /*
   * A formalização não é mais criada
   * simplesmente porque a solicitação
   * foi aprovada.
   *
   * Para liberar acesso precisamos de:
   *
   * 1. CreditApplication APPROVED
   * 2. CreditOffer ACCEPTED
   * 3. CreditFormalization existente
   *
   * A CreditFormalization passa a nascer
   * dentro do workflow de aceite.
   */
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
            acceptedAt: true,
          },
        },

        formalization: {
          select: {
            status: true,

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

  if (
    application.offers.length ===
    0
  ) {
    return {
      allowed: false as const,

      reason:
        'OFFER_NOT_ACCEPTED' as const,

      application: {
        status:
          publicApplication.status,

        amount:
          publicApplication.amount,

        months:
          publicApplication.months,

        protocol,
      },
    };
  }

  /*
   * Uma proposta ACCEPTED deve possuir
   * formalização porque o workflow de
   * aceite é responsável por criá-la.
   *
   * Se não existir, tratamos como
   * inconsistência de estado em vez de
   * recriá-la silenciosamente aqui.
   */
  if (!application.formalization) {
    return {
      allowed: false as const,

      reason:
        'FORMALIZATION_NOT_FOUND' as const,

      application: {
        status:
          publicApplication.status,

        amount:
          publicApplication.amount,

        months:
          publicApplication.months,

        protocol,
      },
    };
  }

  return {
    allowed: true as const,

    application: {
      status:
        publicApplication.status,

      amount:
        publicApplication.amount,

      months:
        publicApplication.months,

      protocol,
    },

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

  /*
   * Mantemos NOT_APPROVED como retorno
   * público para preservar a semântica
   * atual da Server Action enquanto
   * migramos a interface.
   *
   * Internamente, neste ponto, significa:
   * não existe CreditOffer ACCEPTED.
   */
  if (
    application.offers.length ===
    0
  ) {
    return {
      success: false as const,

      reason:
        'NOT_APPROVED' as const,
    };
  }

  /*
   * Não criamos mais uma formalização
   * automaticamente durante o envio dos
   * dados bancários.
   *
   * Ela obrigatoriamente deve ter sido
   * criada pelo aceite da proposta.
   */
  if (!application.formalization) {
    return {
      success: false as const,

      reason:
        'NOT_FOUND' as const,
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
