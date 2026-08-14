'use server';

import * as z from 'zod';

import { prisma } from '@/lib/prisma';

const createApplicationSchema = z.object({
  amount: z.number().int().min(500).max(10000),
  months: z.number().int().min(3).max(24),
});

type CreateApplicationResult =
  | {
      success: true;
      applicationId: string;
    }
  | {
      success: false;
      message: string;
    };

export async function createCreditApplication(
  amount: number,
  months: number,
): Promise<CreateApplicationResult> {
  const parsed = createApplicationSchema.safeParse({
    amount,
    months,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Dados da simulação inválidos.',
    };
  }

  try {
    const application = await prisma.creditApplication.create({
      data: {
        amount: parsed.data.amount,
        months: parsed.data.months,
      },
    });

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    console.error('Erro ao criar solicitação de crédito:', error);

    return {
      success: false,
      message: 'Não foi possível iniciar a solicitação.',
    };
  }
}
