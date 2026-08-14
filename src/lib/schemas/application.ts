import * as z from 'zod';

import { isValidCpf } from '@/lib/validation/cpf';

export const applicationSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.'),

  cpf: z.string().min(1, 'Informe seu CPF.').refine(isValidCpf, 'Informe um CPF válido.'),

  birthDate: z.string().min(1, 'Informe sua data de nascimento.'),

  email: z.string().trim().min(1, 'Informe seu e-mail.').email('Informe um e-mail válido.'),

  phone: z.string().min(14, 'Informe um telefone válido.'),

  cep: z.string().min(9, 'Informe um CEP válido.'),

  street: z.string().trim().min(3, 'Informe seu endereço.'),

  number: z.string().trim().min(1, 'Informe o número.'),

  complement: z.string().optional(),

  neighborhood: z.string().trim().min(2, 'Informe o bairro.'),

  city: z.string().trim().min(2, 'Informe a cidade.'),

  state: z.string().trim().length(2, 'Informe a UF.'),

  occupation: z.string().trim().min(2, 'Informe sua ocupação.'),

  monthlyIncome: z.string().min(1, 'Informe sua renda mensal.'),

  employmentType: z.string().min(1, 'Selecione sua situação profissional.'),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
