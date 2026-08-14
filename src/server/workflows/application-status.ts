import 'server-only';

import type { ApplicationStatus, ApplicationStatusActor } from '@/generated/prisma/client';

import { prisma } from '@/lib/prisma';

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],

  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],

  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],

  APPROVED: [],

  REJECTED: [],

  CANCELLED: [],
};

type TransitionApplicationStatusOptions = {
  actorType?: ApplicationStatusActor;
  actorId?: string;
  reason?: string;
};

export class InvalidApplicationStatusTransitionError extends Error {
  constructor(currentStatus: ApplicationStatus, nextStatus: ApplicationStatus) {
    super(`Transição de ${currentStatus} para ${nextStatus} não permitida.`);

    this.name = 'InvalidApplicationStatusTransitionError';
  }
}

export class ConcurrentApplicationStatusTransitionError extends Error {
  constructor() {
    super('O status da solicitação foi alterado por outro processo.');

    this.name = 'ConcurrentApplicationStatusTransitionError';
  }
}

export async function transitionApplicationStatus(
  applicationId: string,
  nextStatus: ApplicationStatus,
  options: TransitionApplicationStatusOptions = {},
) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.creditApplication.findUnique({
      where: {
        id: applicationId,
      },

      select: {
        id: true,
        status: true,
        publicProtocol: true,
      },
    });

    if (!application) {
      throw new Error('Solicitação de crédito não encontrada.');
    }

    const currentStatus = application.status;

    const allowed = allowedTransitions[currentStatus].includes(nextStatus);

    if (!allowed) {
      throw new InvalidApplicationStatusTransitionError(currentStatus, nextStatus);
    }

    const updateResult = await tx.creditApplication.updateMany({
      where: {
        id: application.id,
        status: currentStatus,
      },

      data: {
        status: nextStatus,
      },
    });

    if (updateResult.count !== 1) {
      throw new ConcurrentApplicationStatusTransitionError();
    }

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: application.id,

        fromStatus: currentStatus,
        toStatus: nextStatus,

        actorType: options.actorType ?? 'SYSTEM',

        actorId: options.actorId ?? null,

        reason: options.reason?.trim() || null,
      },
    });

    return tx.creditApplication.findUniqueOrThrow({
      where: {
        id: application.id,
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
