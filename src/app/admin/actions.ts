'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_SESSION_COOKIE, deleteAdminSession } from '@/server/auth/admin-session';

export async function logoutAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    try {
      await deleteAdminSession(token);
    } catch (error) {
      console.error(
        'Falha ao remover sessão administrativa.',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }

  /*
   * A sessão administrativa foi criada com path="/admin".
   * Por isso expiramos explicitamente o cookie no mesmo path.
   */
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: 0,
  });

  redirect('/admin/login');
}
