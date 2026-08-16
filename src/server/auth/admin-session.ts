import 'server-only';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import {
  prisma,
} from '@/lib/prisma';

export const ADMIN_SESSION_COOKIE =
  'smith_admin_session';

/*
 * Limite absoluto da sessão.
 *
 * Mesmo com atividade contínua, uma
 * autenticação nunca ultrapassa 8 horas.
 */
export const ADMIN_SESSION_MAX_AGE =
  60 * 60 * 8;

/*
 * Uma sessão administrativa sem atividade
 * por 30 minutos deixa de ser válida.
 */
export const ADMIN_SESSION_IDLE_TIMEOUT =
  60 * 30;

/*
 * Não precisamos gravar lastUsedAt em
 * cada request.
 *
 * Atualizamos no máximo a cada 5 minutos,
 * reduzindo write amplification no banco.
 */
export const ADMIN_SESSION_TOUCH_INTERVAL =
  60 * 5;

function hashSessionToken(
  token:
    string,
) {
  return createHash(
    'sha256',
  )
    .update(
      token,
    )
    .digest(
      'hex',
    );
}

export async function createAdminSession(
  userId:
    string,
) {
  const token =
    randomBytes(
      32,
    ).toString(
      'base64url',
    );

  const tokenHash =
    hashSessionToken(
      token,
    );

  const now =
    new Date();

  const expiresAt =
    new Date(
      now.getTime() +
        ADMIN_SESSION_MAX_AGE *
          1000,
    );

  await prisma
    .adminSession
    .create({
      data: {
        userId,
        tokenHash,
        expiresAt,

        /*
         * Sessões novas começam com uma
         * referência explícita de atividade.
         */
        lastUsedAt:
          now,
      },
    });

  return {
    token,
    expiresAt,
  };
}

export async function findAdminSession(
  token:
    string,
) {
  const tokenHash =
    hashSessionToken(
      token,
    );

  const session =
    await prisma
      .adminSession
      .findUnique({
        where: {
          tokenHash,
        },

        select: {
          id:
            true,

          expiresAt:
            true,

          lastUsedAt:
            true,

          createdAt:
            true,

          user: {
            select: {
              id:
                true,

              name:
                true,

              email:
                true,

              role:
                true,

              isActive:
                true,
            },
          },
        },
      });

  if (
    !session
  ) {
    return null;
  }

  const now =
    new Date();

  const nowMs =
    now.getTime();

  /*
   * Expiração absoluta continua tendo
   * precedência sobre qualquer atividade.
   */
  if (
    session.expiresAt.getTime() <=
    nowMs
  ) {
    await prisma
      .adminSession
      .deleteMany({
        where: {
          id:
            session.id,
        },
      });

    return null;
  }

  /*
   * Administrador desativado não mantém
   * sessão residual no banco.
   */
  if (
    !session.user.isActive
  ) {
    await prisma
      .adminSession
      .deleteMany({
        where: {
          id:
            session.id,
        },
      });

    return null;
  }

  /*
   * Compatibilidade com sessões criadas
   * antes da ativação de lastUsedAt:
   * createdAt funciona como referência.
   */
  const activityAt =
    session.lastUsedAt ??
    session.createdAt;

  const idleTimeMs =
    nowMs -
    activityAt.getTime();

  if (
    idleTimeMs >=
    ADMIN_SESSION_IDLE_TIMEOUT *
      1000
  ) {
    await prisma
      .adminSession
      .deleteMany({
        where: {
          id:
            session.id,
        },
      });

    return null;
  }

  /*
   * Atualizamos atividade somente depois
   * do intervalo de touch.
   *
   * updateMany evita recriar/resuscitar uma
   * sessão removida concorrencialmente.
   */
  if (
    idleTimeMs >=
    ADMIN_SESSION_TOUCH_INTERVAL *
      1000
  ) {
    const touched =
      await prisma
        .adminSession
        .updateMany({
          where: {
            id:
              session.id,

            expiresAt: {
              gt:
                now,
            },
          },

          data: {
            lastUsedAt:
              now,
          },
        });

    /*
     * Logout/reset concorrente pode ter
     * removido a sessão entre o read e o
     * touch. Nesse caso, a requisição não
     * recebe uma sessão válida.
     */
    if (
      touched.count !==
      1
    ) {
      return null;
    }
  }

  return {
    sessionId:
      session.id,

    user:
      session.user,

    expiresAt:
      session.expiresAt,
  };
}

export async function deleteAdminSession(
  token:
    string,
) {
  const tokenHash =
    hashSessionToken(
      token,
    );

  await prisma
    .adminSession
    .deleteMany({
      where: {
        tokenHash,
      },
    });
}
