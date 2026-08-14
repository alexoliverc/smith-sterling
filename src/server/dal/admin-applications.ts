import 'server-only';

import { prisma } from '@/lib/prisma';
import { decryptPii } from '@/lib/security/pii';

export async function listAdminApplications() {
  const applications = await prisma.creditApplication.findMany({
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

      formalization: {
        select: {
          status: true,
        },
      },

      offers: {
        orderBy: {
          version: 'desc',
        },

        take: 1,

        select: {
          version: true,
          status: true,
          expiresAt: true,
          presentedAt: true,
          acceptedAt: true,
          declinedAt: true,
          expiredAt: true,
          cancelledAt: true,
        },
      },
    },
  });

  const now = new Date();

  return applications.map(({ offers, ...application }) => {
    const latestOffer = offers[0] ?? null;

    const effectiveStatus =
      latestOffer?.status === 'PRESENTED' &&
      latestOffer.expiresAt <= now
        ? 'EXPIRED'
        : latestOffer?.status ?? null;

    const acceptedOffer =
      latestOffer?.status === 'ACCEPTED'
        ? {
            version: latestOffer.version,
            acceptedAt: latestOffer.acceptedAt,
          }
        : null;

    return {
      ...application,

      latestOffer: latestOffer
        ? {
            ...latestOffer,
            effectiveStatus,
          }
        : null,

      acceptedOffer,
    };
  });
}

export async function getAdminApplicationByProtocol(protocol: string) {
  const application = await prisma.creditApplication.findUnique({
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
      updatedAt: true,

      applicantData: {
        select: {
          nameEncrypted: true,
          cpfEncrypted: true,
          birthDateEncrypted: true,
          emailEncrypted: true,
          phoneEncrypted: true,
          addressEncrypted: true,
          employmentEncrypted: true,
          incomeEncrypted: true,
        },
      },

      statusHistory: {
        orderBy: {
          createdAt: 'asc',
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
  });

  if (!application) {
    return null;
  }

  const operatorIds = [
    ...new Set(
      application.statusHistory
        .filter((event) => event.actorType === 'OPERATOR' && event.actorId)
        .map((event) => event.actorId as string),
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

  const operatorNameById = new Map(operators.map((operator) => [operator.id, operator.name]));

  const statusHistory = application.statusHistory.map((event) => ({
    ...event,

    actorName:
      event.actorType === 'OPERATOR' && event.actorId
        ? (operatorNameById.get(event.actorId) ?? 'Operador não encontrado')
        : null,
  }));

  if (!application.applicantData) {
    return {
      id: application.id,
      publicProtocol: application.publicProtocol,
      status: application.status,
      amount: application.amount,
      months: application.months,
      submittedAt: application.submittedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,

      applicant: null,

      statusHistory,
    };
  }

  const applicationId = application.id;

  const applicantData = application.applicantData;

  const address = parseJsonObject(
    decryptPii(applicantData.addressEncrypted, `${applicationId}:address`),
  );

  const employment = parseJsonObject(
    decryptPii(applicantData.employmentEncrypted, `${applicationId}:employment`),
  );

  return {
    id: application.id,

    publicProtocol: application.publicProtocol,

    status: application.status,

    amount: application.amount,

    months: application.months,

    submittedAt: application.submittedAt,

    createdAt: application.createdAt,

    updatedAt: application.updatedAt,

    applicant: {
      name: decryptPii(applicantData.nameEncrypted, `${applicationId}:name`),

      cpf: decryptPii(applicantData.cpfEncrypted, `${applicationId}:cpf`),

      birthDate: decryptPii(applicantData.birthDateEncrypted, `${applicationId}:birthDate`),

      email: decryptPii(applicantData.emailEncrypted, `${applicationId}:email`),

      phone: decryptPii(applicantData.phoneEncrypted, `${applicationId}:phone`),

      income: decryptPii(applicantData.incomeEncrypted, `${applicationId}:income`),

      address: {
        cep: readString(address, 'cep'),

        street: readString(address, 'street'),

        number: readString(address, 'number'),

        complement: readString(address, 'complement'),

        neighborhood: readString(address, 'neighborhood'),

        city: readString(address, 'city'),

        state: readString(address, 'state'),
      },

      employment: {
        employmentType: readString(employment, 'employmentType'),

        occupation: readString(employment, 'occupation'),
      },
    },

    statusHistory,
  };
}

export async function findAdminApplicationForTransition(protocol: string) {
  return prisma.creditApplication.findUnique({
    where: {
      publicProtocol: protocol,
    },

    select: {
      id: true,
      status: true,
      publicProtocol: true,
    },
  });
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

function readString(object: Record<string, unknown>, key: string) {
  const value = object[key];

  return typeof value === 'string' ? value : '';
}


