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

export async function getFormalizationForSession(protocol: string, accessToken: string) {
  const publicApplication = await findApplicationForSession(protocol, accessToken);

  if (!publicApplication) {
    return null;
  }

  if (publicApplication.status !== 'APPROVED') {
    return {
      allowed: false as const,

      application: {
        status: publicApplication.status,

        amount: publicApplication.amount,

        months: publicApplication.months,

        protocol,
      },
    };
  }

  const application = await prisma.creditApplication.findUnique({
    where: {
      publicProtocol: protocol,
    },

    select: {
      id: true,
    },
  });

  if (!application) {
    return null;
  }

  const formalization = await prisma.creditFormalization.upsert({
    where: {
      applicationId: application.id,
    },

    update: {},

    create: {
      applicationId: application.id,

      status: 'PENDING',
    },

    select: {
      status: true,

      bankDataSubmittedAt: true,

      readyAt: true,

      disbursedAt: true,

      createdAt: true,

      updatedAt: true,
    },
  });

  return {
    allowed: true as const,

    application: {
      status: publicApplication.status,

      amount: publicApplication.amount,

      months: publicApplication.months,

      protocol,
    },

    formalization,
  };
}

export async function saveBankDataForSession(
  protocol: string,
  accessToken: string,
  bankData: BankAccountInput,
) {
  const publicApplication = await findApplicationForSession(protocol, accessToken);

  if (!publicApplication) {
    return {
      success: false as const,

      reason: 'UNAUTHORIZED' as const,
    };
  }

  if (publicApplication.status !== 'APPROVED') {
    return {
      success: false as const,

      reason: 'NOT_APPROVED' as const,
    };
  }

  const application = await prisma.creditApplication.findUnique({
    where: {
      publicProtocol: protocol,
    },

    select: {
      id: true,

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

      reason: 'NOT_FOUND' as const,
    };
  }

  const formalization =
    application.formalization ??
    (await prisma.creditFormalization.create({
      data: {
        applicationId: application.id,

        status: 'PENDING',
      },

      select: {
        id: true,
        status: true,
      },
    }));

  const protectedPayload = encryptPii(
    JSON.stringify({
      version: 1,

      bankName: bankData.bankName,

      branch: bankData.branch,

      account: bankData.account,

      accountType: bankData.accountType,

      holderName: bankData.holderName,

      pixKey: bankData.pixKey || null,
    }),

    `${application.id}:bankData`,
  );

  try {
    await submitFormalizationBankData(formalization.id, protectedPayload);
  } catch (error) {
    if (error instanceof FormalizationLockedError) {
      return {
        success: false as const,

        reason: 'LOCKED' as const,
      };
    }

    throw error;
  }

  return {
    success: true as const,
  };
}
