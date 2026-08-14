'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { findAdminApplicationForTransition } from '@/server/dal/admin-applications';
import {
  ConcurrentApplicationStatusTransitionError,
  InvalidApplicationStatusTransitionError,
  transitionApplicationStatus,
} from '@/server/workflows/application-status';

const protocolSchema = z.string().trim().min(4).max(24);

const decisionSchema = z.enum(['APPROVED', 'REJECTED']);

const decisionInputSchema = z.object({
  protocol: protocolSchema,

  decision: decisionSchema,

  reason: z
    .string()
    .trim()
    .min(10, 'Informe uma justificativa com pelo menos 10 caracteres.')
    .max(500, 'A justificativa pode ter no máximo 500 caracteres.'),
});

export type StartAnalysisState = {
  error?: string;
};

export type DecisionState = {
  error?: string;
};

export async function startApplicationAnalysis(
  protocol: string,
  previousState: StartAnalysisState,
  formData: FormData,
): Promise<StartAnalysisState> {
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

  const application = await findAdminApplicationForTransition(parsed.data);

  if (!application) {
    return {
      error: 'Solicitação não encontrada.',
    };
  }

  if (application.status === 'UNDER_REVIEW') {
    return {
      error: 'Esta solicitação já está em análise.',
    };
  }

  if (application.status !== 'SUBMITTED') {
    return {
      error: 'Esta solicitação não pode iniciar análise no status atual.',
    };
  }

  try {
    await transitionApplicationStatus(application.id, 'UNDER_REVIEW', {
      actorType: 'OPERATOR',

      actorId: session.user.id,

      reason: 'Análise iniciada manualmente pelo operador.',
    });
  } catch (error) {
    if (
      error instanceof InvalidApplicationStatusTransitionError ||
      error instanceof ConcurrentApplicationStatusTransitionError
    ) {
      return {
        error: 'O status da solicitação mudou e a operação não pôde ser concluída.',
      };
    }

    console.error(
      'Falha ao iniciar análise administrativa.',
      error instanceof Error ? error.message : 'Erro desconhecido',
    );

    return {
      error: 'Não foi possível iniciar a análise.',
    };
  }

  revalidatePath('/admin/solicitacoes');

  revalidatePath(`/admin/solicitacoes/${parsed.data}`);

  redirect(`/admin/solicitacoes/${encodeURIComponent(parsed.data)}`);
}

export async function decideApplication(
  protocol: string,
  decision: 'APPROVED' | 'REJECTED',
  previousState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  void previousState;

  const parsed = decisionInputSchema.safeParse({
    protocol,
    decision,
    reason: formData.get('reason'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Dados da decisão inválidos.',
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
      error: 'Seu perfil não possui autorização para registrar a decisão final.',
    };
  }

  const application = await findAdminApplicationForTransition(parsed.data.protocol);

  if (!application) {
    return {
      error: 'Solicitação não encontrada.',
    };
  }

  if (application.status !== 'UNDER_REVIEW') {
    return {
      error: 'A decisão final só pode ser registrada em solicitações que estejam em análise.',
    };
  }

  try {
    await transitionApplicationStatus(application.id, parsed.data.decision, {
      actorType: 'OPERATOR',

      actorId: session.user.id,

      reason: parsed.data.reason,
    });
  } catch (error) {
    if (
      error instanceof InvalidApplicationStatusTransitionError ||
      error instanceof ConcurrentApplicationStatusTransitionError
    ) {
      return {
        error: 'O status da solicitação mudou e a decisão não pôde ser registrada.',
      };
    }

    console.error(
      'Falha ao registrar decisão administrativa.',
      error instanceof Error ? error.message : 'Erro desconhecido',
    );

    return {
      error: 'Não foi possível registrar a decisão.',
    };
  }

  revalidatePath('/admin/solicitacoes');

  revalidatePath(`/admin/solicitacoes/${parsed.data.protocol}`);

  redirect(`/admin/solicitacoes/${encodeURIComponent(parsed.data.protocol)}`);
}
