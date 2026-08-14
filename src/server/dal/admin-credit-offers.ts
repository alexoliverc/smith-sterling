import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getAdminCreditOfferWorkspace(
  protocol: string,
) {
  return prisma.creditApplication.findUnique({
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
        },
      },
    },
  });
}
