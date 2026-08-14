import * as z from 'zod';

import { isValidCpf } from '@/lib/validation/cpf';

export const identificationSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'Nome muito longo.'),

  cpf: z.string().min(1, 'Informe seu CPF.').refine(isValidCpf, 'Informe um CPF válido.'),

  birthDate: z
    .string()
    .min(1, 'Informe sua data de nascimento.')
    .refine((value) => {
      const birthDate = new Date(`${value}T00:00:00`);

      return !Number.isNaN(birthDate.getTime());
    }, 'Informe uma data válida.'),
});

export type IdentificationFormData = z.infer<typeof identificationSchema>;
