import 'server-only';

import type { ApplicationStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],

  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],

  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],

  APPROVED: [],

  REJECTED: [],

  CANCELLED: [],
};

export class InvalidApplicationStatusTransitionError extends Error {
  constructor(currentStatus: ApplicationStatus, nextStatus: ApplicationStatus) {
    super(`Transição de ${currentStatus} para ${nextStatus} não permitida.`);

    this.name = 'InvalidApplicationStatusTransitionError';
  }
}

export async function transitionApplicationStatus(
  applicationId: string,
  nextStatus: ApplicationStatus,
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
      throw new Error('Solicitação de crédito não encontrada.');
    }

    const allowed = allowedTransitions[application.status].includes(nextStatus);

    if (!allowed) {
      throw new InvalidApplicationStatusTransitionError(application.status, nextStatus);
    }

    return tx.creditApplication.update({
      where: {
        id: application.id,
      },

      data: {
        status: nextStatus,
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
