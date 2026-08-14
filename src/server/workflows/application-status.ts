import 'server-only';

import type { ApplicationStatus, ApplicationStatusActor } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

type TransitionOptions = {
  actorType?: ApplicationStatusActor;
  actorId?: string;
  reason?: string;
};

const allowedTransitions: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],

  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],

  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],

  APPROVED: [],
  REJECTED: [],
  CANCELLED: [],
};

export class InvalidApplicationStatusTransitionError extends Error {
  constructor(fromStatus: ApplicationStatus, toStatus: ApplicationStatus) {
    super(`Transição de ${fromStatus} para ${toStatus} não permitida.`);

    this.name = 'InvalidApplicationStatusTransitionError';
  }
}

export class ConcurrentApplicationStatusTransitionError extends Error {
  constructor() {
    super('O status da solicitação foi alterado por outra operação.');

    this.name = 'ConcurrentApplicationStatusTransitionError';
  }
}

export async function transitionApplicationStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  options: TransitionOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.creditApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!application) {
      throw new Error('Solicitação não encontrada.');
    }

    const fromStatus = application.status;

    const transitionAllowed = allowedTransitions[fromStatus].includes(toStatus);

    if (!transitionAllowed) {
      throw new InvalidApplicationStatusTransitionError(fromStatus, toStatus);
    }

    const updateResult = await tx.creditApplication.updateMany({
      where: {
        id: applicationId,
        status: fromStatus,
      },

      data: {
        status: toStatus,
      },
    });

    if (updateResult.count !== 1) {
      throw new ConcurrentApplicationStatusTransitionError();
    }

    await tx.applicationStatusHistory.create({
      data: {
        applicationId,

        fromStatus,
        toStatus,

        actorType: options.actorType ?? 'SYSTEM',

        actorId: options.actorId ?? null,

        reason: options.reason ?? null,
      },
    });

    /*
     * A aprovação encerra somente a análise de crédito.
     *
     * A CreditFormalization passa a ser criada exclusivamente
     * quando o cliente aceita uma CreditOffer válida.
     */

    return tx.creditApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        status: true,
        publicProtocol: true,
        updatedAt: true,
      },
    });
  });
}
