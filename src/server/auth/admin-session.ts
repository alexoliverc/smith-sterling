import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

import { prisma } from '@/lib/prisma';

export const ADMIN_SESSION_COOKIE = 'smith_admin_session';

export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString('base64url');

  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE * 1000);

  await prisma.adminSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function findAdminSession(token: string) {
  const tokenHash = hashSessionToken(token);

  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash,
    },

    select: {
      id: true,
      expiresAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  return {
    sessionId: session.id,

    user: session.user,

    expiresAt: session.expiresAt,
  };
}

export async function deleteAdminSession(token: string) {
  const tokenHash = hashSessionToken(token);

  await prisma.adminSession.deleteMany({
    where: {
      tokenHash,
    },
  });
}
