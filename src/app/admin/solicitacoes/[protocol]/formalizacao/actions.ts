'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { encryptPii } from '@/lib/security/pii';
import {
  ADMIN_SESSION_COOKIE,
  findAdminSession,
} from '@/server/auth/admin-session';
import { findAdminFormalizationForTransition } from '@/server/dal/admin-formalization';

import {
  ConcurrentFormalizationStatusTransitionError,
  FormalizationOfferNotAcceptedError,
  InvalidFormalizationStatusTransitionError,
  registerFormalizationDisbursement,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

const protocolSchema =
  z.string().trim().min(4).max(24);

const disbursementSchema =
  z.object({
    protocol:
      protocolSchema,

    reference:
      z
        .string()
        .trim()
        .min(
          4,
          'Informe a referência da transferência.',
        )
        .max(
          160,
          'A referência pode ter no máximo 160 caracteres.',
        ),
  });

export type ConfirmReadyState = {
  error?: string;
};

export type DisbursementState = {
  error?: string;
};

export async function confirmFormalizationReady(
  protocol: string,
  previousState: ConfirmReadyState,
  formData: FormData,
): Promise<ConfirmReadyState> {
  void previousState;
  void formData;

  const parsed =
    protocolSchema.safeParse(
      protocol,
    );

  if (!parsed.success) {
    return {
      error:
        'Protocolo inválido.',
    };
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_SESSION_COOKIE,
    )?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const session =
    await findAdminSession(
      token,
    );

  if (!session) {
    redirect('/admin/login');
  }

  if (
    session.user.role !==
    'SUPER_ADMIN'
  ) {
    return {
      error:
        'Seu perfil não possui autorização para confirmar a liberação.',
    };
  }

  const application =
    await findAdminFormalizationForTransition(
      parsed.data,
    );

  if (
    !application ||
    !application.formalization
  ) {
    return {
      error:
        'Formalização não encontrada.',
    };
  }

  if (
    application.status !==
    'APPROVED'
  ) {
    return {
      error:
        'A solicitação não está aprovada.',
    };
  }

  if (
    application.formalization.status !==
    'BANK_DETAILS_SUBMITTED'
  ) {
    return {
      error:
        'A formalização não está aguardando conferência bancária.',
    };
  }

  if (
    !application.formalization
      .bankDataEncrypted
  ) {
    return {
      error:
        'Não existem dados bancários para conferir.',
    };
  }

  try {
    await transitionFormalizationStatus(
      application.formalization.id,
      'READY_FOR_DISBURSEMENT',
      {
        actorType:
          'OPERATOR',

        actorId:
          session.user.id,

        reason:
          'Dados bancários conferidos e operação preparada para liberação.',
      },
    );
  } catch (error) {
    if (
      error instanceof
      FormalizationOfferNotAcceptedError
    ) {
      return {
        error:
          'A operação não pode avançar porque não existe uma proposta aceita pelo cliente.',
      };
    }

    if (
      error instanceof
        InvalidFormalizationStatusTransitionError ||
      error instanceof
        ConcurrentFormalizationStatusTransitionError
    ) {
      return {
        error:
          'O status da formalização mudou e a operação não pôde ser concluída.',
      };
    }

    console.error(
      'Falha ao confirmar formalização.',
      error instanceof Error
        ? error.message
        : 'Erro desconhecido',
    );

    return {
      error:
        'Não foi possível confirmar a conferência.',
    };
  }

  revalidateFormalizationPaths(
    parsed.data,
  );

  redirect(
    `/admin/solicitacoes/${encodeURIComponent(
      parsed.data,
    )}/formalizacao`,
  );
}

export async function registerDisbursement(
  protocol: string,
  previousState: DisbursementState,
  formData: FormData,
): Promise<DisbursementState> {
  void previousState;

  /*
   * A confirmação de transferência
   * também é validada no servidor.
   */
  const confirmed =
    formData.get(
      'confirmed',
    ) === 'on';

  if (!confirmed) {
    return {
      error:
        'Confirme que a transferência já foi efetivamente realizada.',
    };
  }

  const parsed =
    disbursementSchema.safeParse({
      protocol,

      reference:
        formData.get(
          'reference',
        ),
    });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]
          ?.message ??
        'Dados da liberação inválidos.',
    };
  }

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_SESSION_COOKIE,
    )?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const session =
    await findAdminSession(
      token,
    );

  if (!session) {
    redirect('/admin/login');
  }

  if (
    session.user.role !==
    'SUPER_ADMIN'
  ) {
    return {
      error:
        'Seu perfil não possui autorização para registrar a liberação.',
    };
  }

  const application =
    await findAdminFormalizationForTransition(
      parsed.data.protocol,
    );

  if (
    !application ||
    !application.formalization
  ) {
    return {
      error:
        'Formalização não encontrada.',
    };
  }

  if (
    application.status !==
    'APPROVED'
  ) {
    return {
      error:
        'A solicitação não está aprovada.',
    };
  }

  if (
    application.formalization.status !==
    'READY_FOR_DISBURSEMENT'
  ) {
    return {
      error:
        'Esta operação ainda não está pronta para registrar a liberação.',
    };
  }

  const protectedReference =
    encryptPii(
      parsed.data.reference,

      `${application.id}:disbursementReference`,
    );

  try {
    await registerFormalizationDisbursement(
      application.formalization.id,
      protectedReference,
      {
        actorType:
          'OPERATOR',

        actorId:
          session.user.id,

        reason:
          'Liberação financeira confirmada pelo operador.',
      },
    );
  } catch (error) {
    if (
      error instanceof
      FormalizationOfferNotAcceptedError
    ) {
      return {
        error:
          'A operação não pode avançar porque não existe uma proposta aceita pelo cliente.',
      };
    }

    if (
      error instanceof
        InvalidFormalizationStatusTransitionError ||
      error instanceof
        ConcurrentFormalizationStatusTransitionError
    ) {
      return {
        error:
          'O status da formalização mudou e a liberação não pôde ser registrada.',
      };
    }

    console.error(
      'Falha ao registrar liberação financeira.',
      error instanceof Error
        ? error.message
        : 'Erro desconhecido',
    );

    return {
      error:
        'Não foi possível registrar a liberação.',
    };
  }

  revalidateFormalizationPaths(
    parsed.data.protocol,
  );

  redirect(
    `/admin/solicitacoes/${encodeURIComponent(
      parsed.data.protocol,
    )}/formalizacao`,
  );
}

function revalidateFormalizationPaths(
  protocol: string,
) {
  revalidatePath(
    '/admin/solicitacoes',
  );

  revalidatePath(
    `/admin/solicitacoes/${protocol}`,
  );

  revalidatePath(
    `/admin/solicitacoes/${protocol}/formalizacao`,
  );

  revalidatePath(
    `/solicitacao/${protocol}/formalizacao`,
  );
}
