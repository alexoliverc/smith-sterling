'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSession,
} from '@/server/auth/admin-session';

const loginSchema = z.object({
  email: z.string().trim().email(),

  password: z.string().min(1),
});

export type AdminLoginState = {
  error?: string;
};

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      error: 'Informe e-mail e senha válidos.',
    };
  }

  const email = parsed.data.email.toLowerCase();

  const admin = await prisma.adminUser.findUnique({
    where: {
      email,
    },

    select: {
      id: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (!admin || !admin.isActive) {
    return {
      error: 'E-mail ou senha inválidos.',
    };
  }

  const passwordIsValid = await verifyPassword(parsed.data.password, admin.passwordHash);

  if (!passwordIsValid) {
    return {
      error: 'E-mail ou senha inválidos.',
    };
  }

  const session = await createAdminSession(admin.id);

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, session.token, {
    httpOnly: true,

    secure: process.env.NODE_ENV === 'production',

    sameSite: 'lax',

    path: '/admin',

    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  redirect('/admin/solicitacoes');
}
