'use server';

import {
  cookies,
  headers,
} from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { recoverApplicationAccess } from '@/server/dal/credit-application';
import { consumeApplicationRecoveryRateLimit } from '@/server/security/application-recovery-rate-limit';

const recoverySchema = z.object({
  protocol: z
    .string()
    .trim()
    .min(
      4,
      'Informe o protocolo.',
    )
    .max(
      24,
      'Protocolo inválido.',
    ),

  cpf: z
    .string()
    .trim()
    .min(
      11,
      'Informe o CPF.',
    )
    .max(
      14,
      'CPF inválido.',
    ),

  birthDate: z
    .string()
    .trim()
    .min(
      10,
      'Informe a data de nascimento.',
    )
    .max(
      10,
      'Data de nascimento inválida.',
    ),
});

export type RecoveryState = {
  error?: string;

  fieldErrors?: {
    protocol?: string;
    cpf?: string;
    birthDate?: string;
  };
};

/*
 * Reduz discrepâncias grandes entre
 * falhas de protocolo inexistente,
 * CPF incorreto e nascimento incorreto.
 *
 * Não é uma garantia matemática de
 * constant-time, mas elimina o
 * "quick exit" mais evidente na UI.
 */
const MINIMUM_FAILURE_TIME_MS = 450;

async function waitForMinimumFailureTime(
  startedAt: number,
) {
  const elapsed =
    Date.now() - startedAt;

  const remaining =
    MINIMUM_FAILURE_TIME_MS -
    elapsed;

  if (remaining <= 0) {
    return;
  }

  await new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        remaining,
      );
    },
  );
}

function getRequestOrigin(
  forwardedFor: string | null,
  realIp: string | null,
  userAgent: string | null,
) {
  /*
   * Esse valor serve SOMENTE como
   * sinal auxiliar de rate limit.
   *
   * Nunca deve ser utilizado para
   * autenticação ou autorização.
   */
  const firstForwardedAddress =
    forwardedFor
      ?.split(',')[0]
      ?.trim();

  const normalizedRealIp =
    realIp?.trim();

  if (normalizedRealIp) {
    return `ip:${normalizedRealIp}`;
  }

  if (firstForwardedAddress) {
    return `ip:${firstForwardedAddress}`;
  }

  /*
   * Em desenvolvimento local ou em
   * ambiente sem endereço propagado,
   * usamos UA apenas para evitar que
   * todo tráfego vire literalmente
   * a mesma chave "unknown".
   *
   * O limite por protocolo continua
   * sendo a proteção principal.
   */
  return `fallback:${(
    userAgent ??
    'unknown-agent'
  ).slice(0, 160)}`;
}

export async function recoverApplication(
  previousState: RecoveryState,
  formData: FormData,
): Promise<RecoveryState> {
  void previousState;

  const parsed =
    recoverySchema.safeParse({
      protocol:
        formData.get(
          'protocol',
        ),

      cpf:
        formData.get(
          'cpf',
        ),

      birthDate:
        formData.get(
          'birthDate',
        ),
    });

  if (!parsed.success) {
    const flattened =
      z.flattenError(
        parsed.error,
      );

    return {
      error:
        'Revise os dados informados.',

      fieldErrors: {
        protocol:
          flattened
            .fieldErrors
            .protocol?.[0],

        cpf:
          flattened
            .fieldErrors
            .cpf?.[0],

        birthDate:
          flattened
            .fieldErrors
            .birthDate?.[0],
      },
    };
  }

  const startedAt =
    Date.now();

  const requestHeaders =
    await headers();

  const origin =
    getRequestOrigin(
      requestHeaders.get(
        'x-forwarded-for',
      ),

      requestHeaders.get(
        'x-real-ip',
      ),

      requestHeaders.get(
        'user-agent',
      ),
    );

  const rateLimit =
    await consumeApplicationRecoveryRateLimit({
      origin,
      protocol:
        parsed.data.protocol,
    });

  if (!rateLimit.allowed) {
    await waitForMinimumFailureTime(
      startedAt,
    );

    return {
      error:
        'Não foi possível validar o acesso agora. Aguarde alguns minutos e tente novamente.',
    };
  }

  const result =
    await recoverApplicationAccess(
      parsed.data,
    );

  if (!result.success) {
    await waitForMinimumFailureTime(
      startedAt,
    );

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

      path:
        '/solicitacao',

      maxAge:
        60 * 30,
    },
  );

  redirect(
    `/solicitacao/${encodeURIComponent(
      result.protocol,
    )}/analise`,
  );
}
