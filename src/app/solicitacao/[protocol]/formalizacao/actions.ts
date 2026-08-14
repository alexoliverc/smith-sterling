'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import * as z from 'zod';

import { saveBankDataForSession } from '@/server/dal/credit-formalization';

const APPLICATION_SESSION_COOKIE = 'smith_application_session';

const protocolSchema = z.string().trim().min(4).max(24);

const bankDataSchema = z.object({
  bankName: z.string().trim().min(2, 'Informe o nome do banco.').max(80, 'Nome do banco inválido.'),

  branch: z
    .string()
    .trim()
    .min(1, 'Informe a agência.')
    .max(12, 'Agência inválida.')
    .regex(/^[0-9A-Za-z-]+$/, 'Use somente números, letras ou hífen na agência.'),

  account: z
    .string()
    .trim()
    .min(1, 'Informe a conta.')
    .max(20, 'Conta inválida.')
    .regex(/^[0-9A-Za-z-]+$/, 'Use somente números, letras ou hífen na conta.'),

  accountType: z.enum(['CHECKING', 'SAVINGS', 'PAYMENT']),

  holderName: z
    .string()
    .trim()
    .min(3, 'Informe o nome do titular.')
    .max(120, 'Nome do titular inválido.'),

  pixKey: z.string().trim().max(160, 'Chave Pix inválida.').optional(),
});

export type BankDataState = {
  success?: boolean;
  error?: string;

  fieldErrors?: {
    bankName?: string;
    branch?: string;
    account?: string;
    accountType?: string;
    holderName?: string;
    pixKey?: string;
  };
};

export async function submitBankData(
  protocol: string,
  previousState: BankDataState,
  formData: FormData,
): Promise<BankDataState> {
  void previousState;

  const parsedProtocol = protocolSchema.safeParse(protocol);

  if (!parsedProtocol.success) {
    return {
      error: 'Protocolo inválido.',
    };
  }

  const parsed = bankDataSchema.safeParse({
    bankName: formData.get('bankName'),

    branch: formData.get('branch'),

    account: formData.get('account'),

    accountType: formData.get('accountType'),

    holderName: formData.get('holderName'),

    pixKey: formData.get('pixKey') || undefined,
  });

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);

    return {
      error: 'Revise os dados bancários informados.',

      fieldErrors: {
        bankName: flattened.fieldErrors.bankName?.[0],

        branch: flattened.fieldErrors.branch?.[0],

        account: flattened.fieldErrors.account?.[0],

        accountType: flattened.fieldErrors.accountType?.[0],

        holderName: flattened.fieldErrors.holderName?.[0],

        pixKey: flattened.fieldErrors.pixKey?.[0],
      },
    };
  }

  const cookieStore = await cookies();

  const accessToken = cookieStore.get(APPLICATION_SESSION_COOKIE)?.value;

  if (!accessToken) {
    return {
      error: 'Sua sessão expirou. Inicie novamente o acesso à solicitação.',
    };
  }

  const result = await saveBankDataForSession(parsedProtocol.data, accessToken, parsed.data);

  if (!result.success) {
    switch (result.reason) {
      case 'UNAUTHORIZED':
        return {
          error: 'Não foi possível validar sua sessão.',
        };

      case 'NOT_APPROVED':
        return {
          error: 'Esta solicitação ainda não está autorizada para formalização.',
        };

      case 'NOT_FOUND':
        return {
          error: 'Solicitação não encontrada.',
        };

      case 'LOCKED':
        return {
          error: 'Os dados bancários desta operação não podem mais ser alterados.',
        };
    }
  }

  revalidatePath(`/solicitacao/${parsedProtocol.data}/formalizacao`);

  return {
    success: true,
  };
}
