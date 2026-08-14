import 'server-only';

import { prisma } from '@/lib/prisma';
import { findApplicationForSession } from '@/server/dal/credit-application';

export async function getFormalizationForSession(protocol: string, accessToken: string) {
  const publicApplication = await findApplicationForSession(protocol, accessToken);

  if (!publicApplication) {
    return null;
  }

  /*
   * Formalização somente existe no
   * fluxo público depois da aprovação.
   */
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

  /*
   * O upsert também cobre propostas
   * de teste aprovadas antes da criação
   * desta nova etapa.
   */
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
