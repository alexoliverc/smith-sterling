'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { identificationSchema, type IdentificationFormData } from '@/lib/schemas/application';
import { formatCpf } from '@/lib/validation/cpf';

type ApplicationWizardProps = {
  amount: number;
  months: number;
};

export function ApplicationWizard({ amount, months }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IdentificationFormData>({
    resolver: zodResolver(identificationSchema),
    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',
    },
  });

  function handleIdentification(data: IdentificationFormData) {
    console.log('Identificação validada:', {
      ...data,
      cpf: '***.***.***-**',
    });

    setCurrentStep(2);
  }

  if (currentStep === 2) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
          Etapa 2 de 5
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
          Identificação concluída.
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Na próxima etapa vamos configurar os dados de contato.
        </p>

        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="mt-8 text-sm font-semibold text-blue-600"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-600">ETAPA 1 DE 5</p>

          <p className="text-sm text-slate-500">
            {amount.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
            {' · '}
            {months} meses
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/5 rounded-full bg-blue-600" />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
          Identificação
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
          Conte um pouco sobre você.
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-600">
          Precisamos destas informações para iniciar sua solicitação.
        </p>

        <form onSubmit={handleSubmit(handleIdentification)} className="mt-10 grid gap-6" noValidate>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Nome completo
            </label>

            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="cpf" className="mb-2 block text-sm font-medium text-slate-700">
              CPF
            </label>

            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              {...register('cpf', {
                onChange(event) {
                  setValue('cpf', formatCpf(event.target.value), {
                    shouldValidate: false,
                  });
                },
              })}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.cpf && <p className="mt-2 text-sm text-red-600">{errors.cpf.message}</p>}
          </div>

          <div>
            <label htmlFor="birthDate" className="mb-2 block text-sm font-medium text-slate-700">
              Data de nascimento
            </label>

            <input
              id="birthDate"
              type="date"
              {...register('birthDate')}
              className="w-full rounded-xl border border-slate-300 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            {errors.birthDate && (
              <p className="mt-2 text-sm text-red-600">{errors.birthDate.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 rounded-xl bg-[#0b1f33] px-6 py-4 font-semibold text-white transition hover:bg-[#14324f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar
          </button>
        </form>
      </div>
    </section>
  );
}
