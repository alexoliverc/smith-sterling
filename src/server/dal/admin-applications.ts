import 'server-only';

import { prisma } from '@/lib/prisma';

export async function listAdminApplications() {
  return prisma.creditApplication.findMany({
    where: {
      publicProtocol: {
        not: null,
      },
    },

    orderBy: {
      createdAt: 'desc',
    },

    take: 100,

    select: {
      publicProtocol: true,
      status: true,
      amount: true,
      months: true,
      submittedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
