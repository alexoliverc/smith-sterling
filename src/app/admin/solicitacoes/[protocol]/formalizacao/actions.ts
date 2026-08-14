'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { findAdminFormalizationForTransition } from '@/server/dal/admin-formalization';
import {
  ConcurrentFormalizationStatusTransitionError,
  InvalidFormalizationStatusTransitionError,
  transitionFormalizationStatus,
} from '@/server/workflows/formalization-status';

const protocolSchema = z.string().trim().min(4).max(24);

export type ConfirmReadyState = {
  error?: string;
};

export async function confirmFormalizationReady(
  protocol: string,
  previousState: ConfirmReadyState,
  formData: FormData,
): Promise<ConfirmReadyState> {
  void previousState;
  void formData;

  const parsed = protocolSchema.safeParse(protocol);

  if (!parsed.success) {
    return {
      error: 'Protocolo inválido.',
    };
  }

  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const session = await findAdminSession(token);

  if (!session) {
    redirect('/admin/login');
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    return {
      error: 'Seu perfil não possui autorização para confirmar a liberação.',
    };
  }

  const application = await findAdminFormalizationForTransition(parsed.data);

  if (!application || !application.formalization) {
    return {
      error: 'Formalização não encontrada.',
    };
  }

  if (application.status !== 'APPROVED') {
    return {
      error: 'A solicitação não está aprovada.',
    };
  }

  if (application.formalization.status !== 'BANK_DETAILS_SUBMITTED') {
    return {
      error: 'A formalização não está aguardando conferência bancária.',
    };
  }

  if (!application.formalization.bankDataEncrypted) {
    return {
      error: 'Não existem dados bancários para conferir.',
    };
  }

  try {
    await transitionFormalizationStatus(application.formalization.id, 'READY_FOR_DISBURSEMENT', {
      actorType: 'OPERATOR',

      actorId: session.user.id,

      reason: 'Dados bancários conferidos e operação preparada para liberação.',
    });
  } catch (error) {
    if (
      error instanceof InvalidFormalizationStatusTransitionError ||
      error instanceof ConcurrentFormalizationStatusTransitionError
    ) {
      return {
        error: 'O status da formalização mudou e a operação não pôde ser concluída.',
      };
    }

    console.error(
      'Falha ao confirmar formalização.',
      error instanceof Error ? error.message : 'Erro desconhecido',
    );

    return {
      error: 'Não foi possível confirmar a conferência.',
    };
  }

  revalidatePath(`/admin/solicitacoes/${parsed.data}`);

  revalidatePath(`/admin/solicitacoes/${parsed.data}/formalizacao`);

  revalidatePath(`/solicitacao/${parsed.data}/formalizacao`);

  redirect(`/admin/solicitacoes/${encodeURIComponent(parsed.data)}/formalizacao`);
}
