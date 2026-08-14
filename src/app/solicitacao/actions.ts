'use server';

import { cookies } from 'next/headers';

import {
  creditApplicationRequestSchema,
} from '@/lib/schemas/application';

import {
  createCreditApplicationRecord,
} from '@/server/dal/credit-application';

export type CreateApplicationResult =
  | {
      success: true;
      protocol: string;
    }
  | {
      success: false;
      message: string;
    };

export async function createCreditApplication(
  input: unknown,
): Promise<CreateApplicationResult> {
  const parsed =
    creditApplicationRequestSchema.safeParse(
      input,
    );

  if (!parsed.success) {
    return {
      success: false,
      message:
        'Não foi possível validar os dados da solicitação.',
    };
  }

  try {
    const application =
      await createCreditApplicationRecord(
        parsed.data,
      );

    const cookieStore =
      await cookies();

    cookieStore.set(
      'smith_application_session',
      application.accessToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          'production',

        sameSite: 'lax',

        path: '/solicitacao',

        maxAge: 60 * 30,
      },
    );

    return {
      success: true,
      protocol:
        application.protocol,
    };
  } catch (error) {
    console.error(
      'Falha ao criar solicitação.',
      error instanceof Error
        ? error.message
        : 'Erro desconhecido',
    );

    return {
      success: false,
      message:
        'Não foi possível concluir a solicitação neste momento.',
    };
  }
}
