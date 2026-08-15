import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { FormalizationStatus } from '@/generated/prisma/client';
import { formatCurrency } from '@/lib/credit';
import { getFormalizationForSession } from '@/server/dal/credit-formalization';

import { BankDataForm } from './bank-data-form';

const APPLICATION_SESSION_COOKIE = 'smith_application_session';

type FormalizationPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function FormalizationPage({ params }: FormalizationPageProps) {
  const { protocol } = await params;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get(APPLICATION_SESSION_COOKIE)?.value;

  if (!accessToken) {
    redirect('/acompanhar');
  }

  const result = await getFormalizationForSession(protocol, accessToken);

  if (!result) {
    redirect('/acompanhar');
  }

  if (!result.allowed) {
    redirect(`/solicitacao/${encodeURIComponent(protocol)}/analise`);
  }

  const { formalization, offer } = result;

  const bankDataReceived =
    formalization.status === 'BANK_DETAILS_SUBMITTED' ||
    formalization.status === 'READY_FOR_DISBURSEMENT' ||
    formalization.status === 'DISBURSED';

  const locked =
    formalization.status === 'READY_FOR_DISBURSEMENT' ||
    formalization.status === 'DISBURSED' ||
    formalization.status === 'CANCELLED';

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <div>
              <p className="font-semibold tracking-tight text-[#071522]">Smith Sterling</p>

              <p className="text-xs text-slate-500">Formalização de crédito</p>
            </div>
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Protocolo
            </p>

            <p className="mt-1 font-mono text-sm font-semibold text-[#071522]">{protocol}</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-8 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Crédito aprovado
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-[#071522] md:text-4xl">
                  Formalização da operação
                </h1>

                <p className="mt-4 leading-7 text-slate-600">
                  Sua proposta foi aceita. Agora estamos preparando as informações necessárias
                  para concluir a formalização e seguir para as etapas de liberação.
                </p>
              </div>

              <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Formalização
                </p>

                <p className="mt-2 font-semibold text-[#071522]">
                  {formatFormalizationStatus(formalization.status)}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="grid gap-4 sm:grid-cols-3">
              <SummaryCard label="Protocolo" value={protocol} mono />

              <SummaryCard label="Valor contratado" value={formatCurrency(offer.principalCents / 100)} />

              <SummaryCard label="Parcelas" value={`${offer.installmentCount} × ${formatCurrency(offer.installmentCents / 100)}`} />
            </div>

            <div className="mt-10">
              <FormalizationProgress status={formalization.status} />
            </div>

            <div className="mt-10 border-t border-slate-200 pt-10">
              {formalization.status === 'PENDING' ? (
                <>
                  <SectionHeading
                    eyebrow="Etapa 1"
                    title="Conta para recebimento"
                    description="Informe a conta que será utilizada no processo de liberação do crédito."
                  />

                  <div className="mt-8">
                    <BankDataForm protocol={protocol} />
                  </div>
                </>
              ) : formalization.status === 'BANK_DETAILS_SUBMITTED' ? (
                <>
                  <SectionHeading
                    eyebrow="Dados recebidos"
                    title="Conta bancária registrada"
                    description="Os dados bancários foram protegidos e vinculados à sua formalização."
                  />

                  <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                        ✓
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-emerald-950">
                          Dados bancários recebidos
                        </h3>

                        <p className="mt-2 leading-7 text-emerald-800">
                          A conta informada está aguardando a conferência interna necessária antes
                          da preparação da liberação.
                        </p>

                        {formalization.bankDataSubmittedAt && (
                          <p className="mt-3 text-sm text-emerald-700">
                            Recebidos em {formatDateTime(formalization.bankDataSubmittedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {!locked && (
                    <div className="mt-6">
                      <details className="rounded-2xl border border-slate-200 bg-slate-50">
                        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-slate-700">
                          Preciso corrigir os dados bancários
                        </summary>

                        <div className="border-t border-slate-200 p-5">
                          <BankDataForm protocol={protocol} />
                        </div>
                      </details>
                    </div>
                  )}
                </>
              ) : formalization.status === 'READY_FOR_DISBURSEMENT' ? (
                <ReadyForDisbursement />
              ) : formalization.status === 'DISBURSED' ? (
                <DisbursedState date={formalization.disbursedAt} />
              ) : (
                <CancelledState />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              i
            </div>

            <div>
              <p className="text-sm font-semibold text-[#071522]">Segurança da sua conta</p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Nunca informe senha do banco, CVV, token, código SMS, código de autenticação ou
                credenciais de internet banking.
              </p>
            </div>
          </div>
        </div>

        {bankDataReceived && (
          <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-slate-400">
            Os dados bancários não são exibidos novamente nesta página após o envio.
          </p>
        )}
      </section>
    </main>
  );
}

function FormalizationProgress({ status }: { status: FormalizationStatus }) {
  const currentStep = getFormalizationStep(status);

  const steps = [
    {
      number: 1,
      title: 'Dados bancários',
      description: 'Conta para recebimento',
    },

    {
      number: 2,
      title: 'Conferência',
      description: 'Preparação da operação',
    },

    {
      number: 3,
      title: 'Liberação',
      description: 'Crédito enviado',
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        Andamento da formalização
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const completed = step.number < currentStep;

          const active = step.number === currentStep;

          return (
            <div
              key={step.number}
              className={`rounded-2xl border p-4 ${
                completed
                  ? 'border-emerald-200 bg-emerald-50'
                  : active
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    completed
                      ? 'bg-emerald-600 text-white'
                      : active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {completed ? '✓' : step.number}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      completed ? 'text-emerald-800' : active ? 'text-blue-800' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">{eyebrow}</p>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#071522]">{title}</h2>

      <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function ReadyForDisbursement() {
  return (
    <>
      <SectionHeading
        eyebrow="Conferência concluída"
        title="Operação preparada para liberação"
        description="Os dados necessários para a formalização foram conferidos."
      />

      <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-[#071522]">Preparando a liberação</h3>

        <p className="mt-3 leading-7 text-slate-600">
          A operação está pronta para seguir para o processo de envio do crédito à conta informada.
        </p>
      </div>
    </>
  );
}

function DisbursedState({ date }: { date: Date | null }) {
  return (
    <>
      <SectionHeading
        eyebrow="Operação concluída"
        title="Crédito liberado"
        description="A formalização desta operação foi concluída."
      />

      <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
            ✓
          </div>

          <div>
            <h3 className="text-xl font-semibold text-emerald-950">Liberação registrada</h3>

            <p className="mt-3 leading-7 text-emerald-800">
              O processo de liberação desta operação foi registrado como concluído.
            </p>

            {date && (
              <p className="mt-3 text-sm text-emerald-700">Registro em {formatDateTime(date)}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CancelledState() {
  return (
    <>
      <SectionHeading
        eyebrow="Formalização encerrada"
        title="Esta operação foi encerrada"
        description="A formalização referente a este protocolo não está mais ativa."
      />

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <p className="leading-7 text-slate-600">
          Não existem novas etapas disponíveis nesta formalização.
        </p>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>

      <p
        className={`mt-2 break-words font-semibold text-[#071522] ${
          mono ? 'font-mono text-sm' : 'text-lg'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getFormalizationStep(status: FormalizationStatus) {
  switch (status) {
    case 'PENDING':
      return 1;

    case 'BANK_DETAILS_SUBMITTED':
    case 'READY_FOR_DISBURSEMENT':
      return 2;

    case 'DISBURSED':
    case 'CANCELLED':
      return 3;
  }
}

function formatFormalizationStatus(status: FormalizationStatus) {
  const labels: Record<FormalizationStatus, string> = {
    PENDING: 'Aguardando dados bancários',

    BANK_DETAILS_SUBMITTED: 'Dados bancários recebidos',

    READY_FOR_DISBURSEMENT: 'Pronta para liberação',

    DISBURSED: 'Crédito liberado',

    CANCELLED: 'Formalização encerrada',
  };

  return labels[status];
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}
