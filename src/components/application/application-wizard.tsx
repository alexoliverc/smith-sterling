'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { createCreditApplication } from '@/app/solicitacao/actions';
import { formatCep, formatIncome, formatPhone } from '@/lib/formatters';
import { applicationSchema, type ApplicationFormData } from '@/lib/schemas/application';
import { formatCpf } from '@/lib/validation/cpf';

type ApplicationWizardProps = {
  amount: number;
  months: number;
};

const stepFields: Record<number, Array<keyof ApplicationFormData>> = {
  1: ['name', 'cpf', 'birthDate'],
  2: ['email', 'phone'],
  3: ['cep', 'street', 'number', 'neighborhood', 'city', 'state'],
  4: ['occupation', 'monthlyIncome', 'employmentType'],
};

export function ApplicationWizard({ amount, months }: ApplicationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [applicationId, setApplicationId] = useState<string | null>(null);

  const {
    register,
    trigger,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),

    defaultValues: {
      name: '',
      cpf: '',
      birthDate: '',

      email: '',
      phone: '',

      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',

      occupation: '',
      monthlyIncome: '',
      employmentType: '',
    },
  });

  const values = useWatch({
    control,
  });

  async function nextStep() {
    const fields = stepFields[currentStep];

    if (!fields) {
      return;
    }

    const valid = await trigger(fields);

    if (!valid) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 5));
  }

  function previousStep() {
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function submitApplication(data: ApplicationFormData) {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await createCreditApplication(amount, months);

      if ('message' in result) {
        setSubmitError(result.message);
        return;
      }

      setApplicationId(result.applicationId);

      console.log('Solicitação criada no backend:', result.applicationId);

      // Os dados pessoais permanecem somente em memória nesta etapa.
      void data;
    } catch (error) {
      console.error('Erro inesperado ao criar solicitação:', error);

      setSubmitError('Ocorreu um erro inesperado. Tente novamente em alguns instantes.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const progress = `${currentStep * 20}%`;

  if (applicationId) {
    return (
      <section>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-700">
            ✓
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Solicitação iniciada
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
            Registro criado com sucesso.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            O registro estrutural da sua solicitação foi criado no servidor.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Identificador da solicitação</p>

            <p className="mt-2 break-all font-mono text-sm font-medium text-slate-900">
              {applicationId}
            </p>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            Os dados cadastrais ainda não foram persistidos nesta etapa.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-10">
        <div className="flex items-center justify-between gap-6">
          <p className="text-sm font-semibold text-blue-600">ETAPA {currentStep} DE 5</p>

          <p className="text-right text-sm text-slate-500">
            {amount.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
            {' · '}
            {months} meses
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: progress,
            }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(submitApplication)}
        className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10"
        noValidate
      >
        {currentStep === 1 && (
          <>
            <StepHeader
              eyebrow="Identificação"
              title="Conte um pouco sobre você."
              description="Precisamos destas informações para iniciar sua solicitação."
            />

            <Fields>
              <Field label="Nome completo" error={errors.name?.message}>
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="Digite seu nome completo"
                  className={inputClass}
                />
              </Field>

              <Field label="CPF" error={errors.cpf?.message}>
                <input
                  {...register('cpf', {
                    onChange(event) {
                      setValue('cpf', formatCpf(event.target.value), {
                        shouldDirty: true,
                      });
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className={inputClass}
                />
              </Field>

              <Field label="Data de nascimento" error={errors.birthDate?.message}>
                <input {...register('birthDate')} type="date" className={inputClass} />
              </Field>
            </Fields>
          </>
        )}

        {currentStep === 2 && (
          <>
            <StepHeader
              eyebrow="Contato"
              title="Como podemos falar com você?"
              description="Informe seus principais dados de contato."
            />

            <Fields>
              <Field label="E-mail" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Celular" error={errors.phone?.message}>
                <input
                  {...register('phone', {
                    onChange(event) {
                      setValue('phone', formatPhone(event.target.value), {
                        shouldDirty: true,
                      });
                    },
                  })}
                  type="text"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  className={inputClass}
                />
              </Field>
            </Fields>
          </>
        )}

        {currentStep === 3 && (
          <>
            <StepHeader
              eyebrow="Endereço"
              title="Onde você mora?"
              description="Informe seu endereço residencial atual."
            />

            <Fields>
              <Field label="CEP" error={errors.cep?.message}>
                <input
                  {...register('cep', {
                    onChange(event) {
                      setValue('cep', formatCep(event.target.value), {
                        shouldDirty: true,
                      });
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="00000-000"
                  className={inputClass}
                />
              </Field>

              <Field label="Rua / Avenida" error={errors.street?.message}>
                <input
                  {...register('street')}
                  type="text"
                  autoComplete="street-address"
                  placeholder="Nome da rua ou avenida"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Número" error={errors.number?.message}>
                  <input
                    {...register('number')}
                    type="text"
                    placeholder="Número"
                    className={inputClass}
                  />
                </Field>

                <Field label="Complemento">
                  <input
                    {...register('complement')}
                    type="text"
                    placeholder="Apartamento, bloco..."
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Bairro" error={errors.neighborhood?.message}>
                <input
                  {...register('neighborhood')}
                  type="text"
                  placeholder="Bairro"
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-6 md:grid-cols-[1fr_120px]">
                <Field label="Cidade" error={errors.city?.message}>
                  <input
                    {...register('city')}
                    type="text"
                    placeholder="Cidade"
                    className={inputClass}
                  />
                </Field>

                <Field label="UF" error={errors.state?.message}>
                  <input
                    {...register('state', {
                      onChange(event) {
                        setValue('state', event.target.value.toUpperCase().slice(0, 2), {
                          shouldDirty: true,
                        });
                      },
                    })}
                    type="text"
                    maxLength={2}
                    placeholder="BA"
                    className={inputClass}
                  />
                </Field>
              </div>
            </Fields>
          </>
        )}

        {currentStep === 4 && (
          <>
            <StepHeader
              eyebrow="Perfil financeiro"
              title="Conte sobre sua renda."
              description="Estas informações serão consideradas na futura análise da solicitação."
            />

            <Fields>
              <Field label="Situação profissional" error={errors.employmentType?.message}>
                <select {...register('employmentType')} className={inputClass}>
                  <option value="">Selecione</option>
                  <option value="clt">Empregado CLT</option>
                  <option value="autonomo">Autônomo</option>
                  <option value="empresario">Empresário</option>
                  <option value="servidor">Servidor público</option>
                  <option value="aposentado">Aposentado / Pensionista</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>

              <Field label="Profissão / ocupação" error={errors.occupation?.message}>
                <input
                  {...register('occupation')}
                  type="text"
                  placeholder="Informe sua profissão ou ocupação"
                  className={inputClass}
                />
              </Field>

              <Field label="Renda mensal aproximada" error={errors.monthlyIncome?.message}>
                <input
                  {...register('monthlyIncome', {
                    onChange(event) {
                      setValue('monthlyIncome', formatIncome(event.target.value), {
                        shouldDirty: true,
                      });
                    },
                  })}
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0"
                  className={inputClass}
                />
              </Field>
            </Fields>
          </>
        )}

        {currentStep === 5 && (
          <>
            <StepHeader
              eyebrow="Revisão"
              title="Confira suas informações."
              description="Revise os dados antes de prosseguir para a próxima fase."
            />

            <div className="mt-10 grid gap-4">
              <ReviewItem label="Nome" value={values.name} />

              <ReviewItem label="CPF" value={maskCpf(values.cpf)} />

              <ReviewItem label="Nascimento" value={formatBirthDate(values.birthDate)} />

              <ReviewItem label="E-mail" value={values.email} />

              <ReviewItem label="Telefone" value={values.phone} />

              <ReviewItem
                label="Endereço"
                value={formatAddress({
                  street: values.street,
                  number: values.number,
                  complement: values.complement,
                  neighborhood: values.neighborhood,
                })}
              />

              <ReviewItem label="Cidade" value={formatCity(values.city, values.state)} />

              <ReviewItem
                label="Situação profissional"
                value={formatEmploymentType(values.employmentType)}
              />

              <ReviewItem label="Ocupação" value={values.occupation} />

              <ReviewItem label="Renda declarada" value={values.monthlyIncome} />
            </div>
          </>
        )}

        {submitError && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={previousStep}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Voltar
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="rounded-xl bg-[#0b1f33] px-8 py-4 font-semibold text-white transition hover:bg-[#14324f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Criando solicitação...' : 'Prosseguir para análise'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

function Fields({ children }: { children: React.ReactNode }) {
  return <div className="mt-10 grid gap-6">{children}</div>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>

      {children}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{eyebrow}</p>

      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">{title}</h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
    </>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-left font-medium text-slate-900 sm:text-right">{value || '—'}</span>
    </div>
  );
}

function maskCpf(value?: string) {
  if (!value) {
    return '—';
  }

  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== 11) {
    return '***.***.***-**';
  }

  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

function formatBirthDate(value?: string) {
  if (!value) {
    return '—';
  }

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatAddress({
  street,
  number,
  complement,
  neighborhood,
}: {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
}) {
  const mainAddress = [street, number].filter(Boolean).join(', ');

  const details = [complement, neighborhood].filter(Boolean).join(' - ');

  if (!mainAddress && !details) {
    return '—';
  }

  if (!details) {
    return mainAddress;
  }

  return `${mainAddress} - ${details}`;
}

function formatCity(city?: string, state?: string) {
  if (!city && !state) {
    return '—';
  }

  if (!state) {
    return city;
  }

  return `${city || ''} / ${state}`;
}

function formatEmploymentType(value?: string) {
  const labels: Record<string, string> = {
    clt: 'Empregado CLT',
    autonomo: 'Autônomo',
    empresario: 'Empresário',
    servidor: 'Servidor público',
    aposentado: 'Aposentado / Pensionista',
    outro: 'Outro',
  };

  if (!value) {
    return '—';
  }

  return labels[value] ?? value;
}
