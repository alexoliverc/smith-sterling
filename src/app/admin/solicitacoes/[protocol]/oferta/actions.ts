'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as z from 'zod';

import {
  ADMIN_SESSION_COOKIE,
  findAdminSession,
} from '@/server/auth/admin-session';

import { getAdminCreditOfferWorkspace } from '@/server/dal/admin-credit-offers';

import {
  CreditOfferAlreadyAcceptedError,
  CreditOfferApplicationNotApprovedError,
  publishCreditOffer,
} from '@/server/workflows/credit-offer';

const protocolSchema =
  z.string().trim().min(4).max(24);

const moneySchema =
  z
    .string()
    .trim()
    .regex(
      /^\d{1,9}([.,]\d{1,2})?$/,
      'Informe um valor monetário válido.',
    );

const percentageSchema =
  z
    .string()
    .trim()
    .regex(
      /^\d{1,3}([.,]\d{1,8})?$/,
      'Informe um percentual válido.',
    );

const dateSchema =
  z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Informe uma data válida.',
    );

const offerSchema =
  z.object({
    protocol:
      protocolSchema,

    principal:
      moneySchema,

    netDisbursement:
      moneySchema,

    installment:
      moneySchema,

    totalRepayment:
      moneySchema,

    iof:
      moneySchema,

    otherFees:
      moneySchema,

    months:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(120),

    installmentCount:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(120),

    monthlyRate:
      percentageSchema,

    annualRate:
      percentageSchema,

    cetAnnual:
      percentageSchema,

    firstDueDate:
      dateSchema,

    expiresAt:
      dateSchema,

    termsVersion:
      z
        .string()
        .trim()
        .min(
          3,
          'Informe a versão dos termos.',
        )
        .max(
          50,
          'A versão dos termos pode ter no máximo 50 caracteres.',
        ),
  });

export type PublishOfferState = {
  error?: string;
};

function normalizeDecimal(
  value: string,
) {
  return value.replace(',', '.');
}

function moneyToCents(
  value: string,
) {
  const normalized =
    normalizeDecimal(value);

  const [
    integerPart,
    decimalPart = '',
  ] = normalized.split('.');

  return (
    Number(integerPart) * 100 +
    Number(
      decimalPart
        .padEnd(2, '0')
        .slice(0, 2),
    )
  );
}

function dateFromInput(
  value: string,
  endOfDay = false,
) {
  return new Date(
    endOfDay
      ? `${value}T23:59:59-03:00`
      : `${value}T12:00:00-03:00`,
  );
}

export async function publishOffer(
  protocol: string,
  previousState: PublishOfferState,
  formData: FormData,
): Promise<PublishOfferState> {
  void previousState;

  const parsed =
    offerSchema.safeParse({
      protocol,

      principal:
        formData.get(
          'principal',
        ),

      netDisbursement:
        formData.get(
          'netDisbursement',
        ),

      installment:
        formData.get(
          'installment',
        ),

      totalRepayment:
        formData.get(
          'totalRepayment',
        ),

      iof:
        formData.get(
          'iof',
        ),

      otherFees:
        formData.get(
          'otherFees',
        ),

      months:
        formData.get(
          'months',
        ),

      installmentCount:
        formData.get(
          'installmentCount',
        ),

      monthlyRate:
        formData.get(
          'monthlyRate',
        ),

      annualRate:
        formData.get(
          'annualRate',
        ),

      cetAnnual:
        formData.get(
          'cetAnnual',
        ),

      firstDueDate:
        formData.get(
          'firstDueDate',
        ),

      expiresAt:
        formData.get(
          'expiresAt',
        ),

      termsVersion:
        formData.get(
          'termsVersion',
        ),
    });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]
          ?.message ??
        'Revise as condições da proposta.',
    };
  }

  const principalCents =
    moneyToCents(
      parsed.data.principal,
    );

  const netDisbursementCents =
    moneyToCents(
      parsed.data.netDisbursement,
    );

  const installmentCents =
    moneyToCents(
      parsed.data.installment,
    );

  const totalRepaymentCents =
    moneyToCents(
      parsed.data.totalRepayment,
    );

  const iofCents =
    moneyToCents(
      parsed.data.iof,
    );

  const otherFeesCents =
    moneyToCents(
      parsed.data.otherFees,
    );

  if (
    principalCents <= 0 ||
    netDisbursementCents <= 0 ||
    installmentCents <= 0 ||
    totalRepaymentCents <= 0
  ) {
    return {
      error:
        'Os valores principais da proposta devem ser maiores que zero.',
    };
  }

  if (
    netDisbursementCents >
    principalCents
  ) {
    return {
      error:
        'O valor líquido a liberar não pode ser superior ao valor principal aprovado.',
    };
  }

  if (
    totalRepaymentCents <
    netDisbursementCents
  ) {
    return {
      error:
        'O total da operação não pode ser inferior ao valor líquido liberado.',
    };
  }

  const firstDueDate =
    dateFromInput(
      parsed.data.firstDueDate,
    );

  const expiresAt =
    dateFromInput(
      parsed.data.expiresAt,
      true,
    );

  const now = new Date();

  if (
    Number.isNaN(
      firstDueDate.getTime(),
    ) ||
    Number.isNaN(
      expiresAt.getTime(),
    )
  ) {
    return {
      error:
        'Uma das datas informadas é inválida.',
    };
  }

  if (
    firstDueDate <= now
  ) {
    return {
      error:
        'O primeiro vencimento precisa ocorrer no futuro.',
    };
  }

  if (
    expiresAt <= now
  ) {
    return {
      error:
        'A validade da proposta precisa terminar no futuro.',
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
        'Seu perfil não possui autorização para publicar propostas.',
    };
  }

  const application =
    await getAdminCreditOfferWorkspace(
      parsed.data.protocol,
    );

  if (!application) {
    return {
      error:
        'Solicitação não encontrada.',
    };
  }

  if (
    application.status !==
    'APPROVED'
  ) {
    return {
      error:
        'Somente solicitações aprovadas podem receber uma proposta.',
    };
  }

  try {
    await publishCreditOffer(
      application.id,
      {
        principalCents,
        netDisbursementCents,
        installmentCents,
        totalRepaymentCents,

        iofCents,
        otherFeesCents,

        months:
          parsed.data.months,

        installmentCount:
          parsed.data.installmentCount,

        monthlyRatePercent:
          normalizeDecimal(
            parsed.data.monthlyRate,
          ),

        annualRatePercent:
          normalizeDecimal(
            parsed.data.annualRate,
          ),

        cetAnnualPercent:
          normalizeDecimal(
            parsed.data.cetAnnual,
          ),

        firstDueDate,
        expiresAt,

        termsVersion:
          parsed.data.termsVersion,
      },
      {
        actorId:
          session.user.id,
      },
    );
  } catch (error) {
    if (
      error instanceof
        CreditOfferApplicationNotApprovedError ||
      error instanceof
        CreditOfferAlreadyAcceptedError
    ) {
      return {
        error:
          error.message,
      };
    }

    console.error(
      'Falha ao publicar proposta de crédito.',
      error instanceof Error
        ? error.message
        : 'Erro desconhecido',
    );

    return {
      error:
        'Não foi possível publicar a proposta.',
    };
  }

  revalidatePath(
    '/admin/solicitacoes',
  );

  revalidatePath(
    `/admin/solicitacoes/${parsed.data.protocol}`,
  );

  revalidatePath(
    `/admin/solicitacoes/${parsed.data.protocol}/oferta`,
  );

  redirect(
    `/admin/solicitacoes/${encodeURIComponent(
      parsed.data.protocol,
    )}/oferta`,
  );
}
