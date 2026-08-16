'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import { getPublicCreditOfferDecisionContext } from '@/server/dal/public-credit-offer';

import {
  CreditOfferFormalizationConflictError,
  CreditOfferNotAvailableError,
  CreditOfferNotFoundError,
  decidePublicCreditOffer,
  type PublicCreditOfferDecision,
} from '@/server/workflows/public-credit-offer';

const PUBLIC_APPLICATION_COOKIE =
  'smith_application_session';

const decisionInputSchema =
  z.object({
    protocol:
      z
        .string()
        .trim()
        .min(4)
        .max(24),

    version:
      z
        .number()
        .int()
        .positive(),

    decision:
      z.enum([
        'ACCEPT',
        'DECLINE',
      ]),
  });

export type PublicOfferDecisionState = {
  error?: string;
};

export async function decideOffer(
  protocol: string,
  version: number,
  decision: PublicCreditOfferDecision,
  previousState: PublicOfferDecisionState,
  formData: FormData,
): Promise<PublicOfferDecisionState> {
  void previousState;

  const parsed =
    decisionInputSchema.safeParse({
      protocol,
      version,
      decision,
    });

  if (!parsed.success) {
    return {
      error:
        'Não foi possível validar a proposta selecionada.',
    };
  }

  /*
   * O aceite exige confirmação explícita.
   *
   * O formulário público terá uma caixa:
   *
   * "Li as condições apresentadas
   * nesta proposta e desejo aceitá-la."
   */
  if (
    parsed.data.decision ===
      'ACCEPT' &&
    formData.get(
      'acceptTerms',
    ) !== 'on'
  ) {
    return {
      error:
        'Confirme que leu as condições da proposta e deseja aceitá-la antes de continuar.',
    };
  }

  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      PUBLIC_APPLICATION_COOKIE,
    )?.value;

  if (!accessToken) {
    redirect('/acompanhar');
  }

  /*
   * Nunca confiamos em applicationId
   * ou offerId enviados pelo navegador.
   *
   * Eles são resolvidos novamente no
   * servidor a partir da sessão válida.
   */
  const context =
    await getPublicCreditOfferDecisionContext(
      parsed.data.protocol,
      accessToken,
      parsed.data.version,
    );

  if (!context) {
    redirect('/acompanhar');
  }

  if (!context.allowed) {
    redirect(
      `/solicitacao/${encodeURIComponent(
        parsed.data.protocol,
      )}/analise`,
    );
  }

  if (!context.found) {
    return {
      error:
        'Esta proposta não está mais disponível. Atualize a página para consultar a situação atual.',
    };
  }

  let outcome:
    | 'ACCEPTED'
    | 'DECLINED';

  try {
    const result =
      await decidePublicCreditOffer({
        applicationId:
          context.applicationId,

        version:
          parsed.data.version,

        decision:
          parsed.data.decision,
      });

    if (!result.success) {
      if (
        result.reason ===
        'EXPIRED'
      ) {
        revalidatePath(
          `/solicitacao/${parsed.data.protocol}/proposta`,
        );

        return {
          error:
            'O prazo de validade desta proposta foi encerrado. Atualize a página para consultar a situação atual.',
        };
      }

      return {
        error:
          'Não foi possível registrar sua decisão.',
      };
    }

    outcome =
      result.outcome;
  } catch (error) {
    if (
      error instanceof
        CreditOfferNotFoundError ||
      error instanceof
        CreditOfferNotAvailableError
    ) {
      return {
        error:
          'A situação desta proposta mudou. Atualize a página antes de tentar novamente.',
      };
    }

    if (
      error instanceof
      CreditOfferFormalizationConflictError
    ) {
      return {
        error:
          'A situação atual da operação não permite concluir esta ação. Consulte o andamento da solicitação.',
      };
    }

    console.error(
      'Falha ao registrar decisão pública da proposta.'
    );

    return {
      error:
        'Não foi possível registrar sua decisão neste momento.',
    };
  }

  /*
   * Atualizamos tanto a área pública
   * quanto o backoffice.
   */
  revalidatePath(
    '/admin/solicitacoes',
  );

  revalidatePath(
    `/admin/solicitacoes/${parsed.data.protocol}`,
  );

  revalidatePath(
    `/admin/solicitacoes/${parsed.data.protocol}/oferta`,
  );

  revalidatePath(
    `/solicitacao/${parsed.data.protocol}/analise`,
  );

  revalidatePath(
    `/solicitacao/${parsed.data.protocol}/proposta`,
  );

  revalidatePath(
    `/solicitacao/${parsed.data.protocol}/formalizacao`,
  );

  if (
    outcome ===
    'ACCEPTED'
  ) {
    redirect(
      `/solicitacao/${encodeURIComponent(
        parsed.data.protocol,
      )}/formalizacao`,
    );
  }

  redirect(
    `/solicitacao/${encodeURIComponent(
      parsed.data.protocol,
    )}/proposta`,
  );
}
