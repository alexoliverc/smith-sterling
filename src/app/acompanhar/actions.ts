'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { recoverApplicationAccess } from '@/server/dal/credit-application';

const recoverySchema = z.object({
  protocol: z
    .string()
    .trim()
    .min(4, 'Informe o protocolo.')
    .max(24, 'Protocolo inválido.'),

  cpf: z
    .string()
    .trim()
    .min(11, 'Informe o CPF.')
    .max(14, 'CPF inválido.'),

  birthDate: z
    .string()
    .trim()
    .min(10, 'Informe a data de nascimento.')
    .max(10, 'Data de nascimento inválida.'),
});

export type RecoveryState = {
  error?: string;

  fieldErrors?: {
    protocol?: string;
    cpf?: string;
    birthDate?: string;
  };
};

export async function recoverApplication(
  previousState: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  void previousState;

  const parsed =
    recoverySchema.safeParse({
      protocol:
        formData.get('protocol'),

      cpf:
        formData.get('cpf'),

      birthDate:
        formData.get('birthDate'),
    });

  if (!parsed.success) {
    const flattened =
      z.flattenError(parsed.error);

    return {
      error:
        'Revise os dados informados.',

      fieldErrors: {
        protocol:
          flattened.fieldErrors
            .protocol?.[0],

        cpf:
          flattened.fieldErrors
            .cpf?.[0],

        birthDate:
          flattened.fieldErrors
            .birthDate?.[0],
      },
    };
  }

  const result =
    await recoverApplicationAccess(
      parsed.data,
    );

  if (!result.success) {
    return {
      error:
        'Não foi possível localizar uma solicitação com os dados informados.',
    };
  }

  const cookieStore =
    await cookies();

  cookieStore.set(
    'smith_application_session',
    result.accessToken,
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

  redirect(
    `/solicitacao/${encodeURIComponent(
      result.protocol,
    )}/analise`,
  );
}
