'use server';

import {
  cookies,
  headers,
} from 'next/headers';

import {
  redirect,
} from 'next/navigation';

import * as z from 'zod';

import {
  verifyPassword,
  verifyPasswordAgainstPlaceholder,
} from '@/lib/auth/password';

import {
  prisma,
} from '@/lib/prisma';

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
} from '@/server/auth/admin-session';

import {
  checkAdminLoginRateLimit,
  recordAdminLoginFailure,
} from '@/server/security/admin-login-rate-limit';

const loginSchema =
  z.object({
    email:
      z
        .string()
        .trim()
        .email(),

    password:
      z
        .string()
        .min(
          1,
        ),
  });

const MINIMUM_FAILURE_TIME_MS =
  450;

export type AdminLoginState = {
  error?:
    string;
};

async function waitForMinimumFailureTime(
  startedAt:
    number,
) {
  const elapsed =
    Date.now() -
    startedAt;

  const remaining =
    MINIMUM_FAILURE_TIME_MS -
    elapsed;

  if (
    remaining <=
    0
  ) {
    return;
  }

  await new Promise<void>(
    (
      resolve,
    ) => {
      setTimeout(
        resolve,
        remaining,
      );
    },
  );
}

export async function loginAdmin(
  _previousState:
    AdminLoginState,

  formData:
    FormData,
): Promise<AdminLoginState> {
  const parsed =
    loginSchema.safeParse({
      email:
        formData.get(
          'email',
        ),

      password:
        formData.get(
          'password',
        ),
    });

  if (
    !parsed.success
  ) {
    return {
      error:
        'Informe e-mail e senha válidos.',
    };
  }

  const startedAt =
    Date.now();

  const email =
    parsed.data.email
      .toLowerCase();

  const requestHeaders =
    await headers();

  const rateLimit =
    await checkAdminLoginRateLimit({
      forwardedFor:
        requestHeaders.get(
          'x-forwarded-for',
        ),

      realIp:
        requestHeaders.get(
          'x-real-ip',
        ),

      userAgent:
        requestHeaders.get(
          'user-agent',
        ),

      email,
    });

  if (
    !rateLimit.allowed
  ) {
    await waitForMinimumFailureTime(
      startedAt,
    );

    return {
      error:
        'Não foi possível autenticar agora. Aguarde alguns minutos e tente novamente.',
    };
  }

  const admin =
    await prisma
      .adminUser
      .findUnique({
        where: {
          email,
        },

        select: {
          id:
            true,

          passwordHash:
            true,

          isActive:
            true,
        },
      });

  /*
   * Conta inexistente e conta inativa
   * executam o mesmo caminho Argon2.
   */
  const passwordIsValid =
    admin &&
    admin.isActive
      ? await verifyPassword(
          parsed.data.password,
          admin.passwordHash,
        )
      : await verifyPasswordAgainstPlaceholder(
          parsed.data.password,
        );

  if (
    !admin ||
    !admin.isActive ||
    !passwordIsValid
  ) {
    /*
     * Somente uma falha real de
     * autenticação aumenta o contador
     * específico do alvo.
     */
    await recordAdminLoginFailure({
      email,
    });

    await waitForMinimumFailureTime(
      startedAt,
    );

    return {
      error:
        'E-mail ou senha inválidos.',
    };
  }

  const session =
    await createAdminSession(
      admin.id,
    );

  const cookieStore =
    await cookies();

  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    session.token,
    {
      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        'production',

      sameSite:
        'lax',

      path:
        '/admin',

      maxAge:
        ADMIN_SESSION_MAX_AGE,
    },
  );

  redirect(
    '/admin/solicitacoes',
  );
}
