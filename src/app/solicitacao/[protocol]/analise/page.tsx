import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AutoStatusRefresh } from './auto-status-refresh';

import type { ApplicationStatus } from '@/generated/prisma/client';
import { formatCurrency } from '@/lib/credit';
import { findApplicationForSession } from '@/server/dal/credit-application';

const APPLICATION_SESSION_COOKIE = 'smith_application_session';

type AnalysisPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { protocol } = await params;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get(APPLICATION_SESSION_COOKIE)?.value;

  if (!accessToken) {
    redirect('/acompanhar');
  }

  const application = await findApplicationForSession(protocol, accessToken);

  if (!application) {
    redirect('/acompanhar');
  }

  const presentation = getStatusPresentation(application.status);

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <AutoStatusRefresh
      active={
        application.status ===
          'SUBMITTED' ||
        application.status ===
          'UNDER_REVIEW'
      }
    />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <div>
              <p className="font-semibold tracking-tight text-[#071522]">Smith Sterling</p>

              <p className="text-xs text-slate-500">Crédito com clareza</p>
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

      <section className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className={`border-b px-6 py-8 md:px-10 ${presentation.headerClassName}`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${presentation.iconClassName}`}
              >
                {presentation.icon}
              </div>

              <div>
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.14em] ${presentation.eyebrowClassName}`}
                >
                  {presentation.eyebrow}
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#071522] md:text-4xl">
                  {presentation.title}
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  {presentation.description}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="grid gap-5 sm:grid-cols-3">
              <SummaryItem label="Protocolo" value={protocol} mono />

              <SummaryItem label="Valor solicitado" value={formatCurrency(application.amount)} />

              <SummaryItem label="Prazo" value={`${application.months} meses`} />
            </div>

            <div className="mt-10">
              <Progress status={application.status} />
            </div>

            <StatusContent
              status={application.status}
              protocol={protocol}
            />

            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#071522]">Guarde seu protocolo</p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Ele identifica esta solicitação dentro da Smith Sterling.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm font-semibold text-[#071522]">
                  {protocol}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-slate-400">
          Esta página apresenta somente o andamento da sua solicitação. Nunca compartilhe
          informações pessoais ou credenciais com terceiros.
        </p>
      </section>
    </main>
  );
}

function SummaryItem({
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

function Progress({ status }: { status: ApplicationStatus }) {
  if (status === 'DRAFT') {
    return (
      <section aria-labelledby="application-progress-title">
        <p
          id="application-progress-title"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
        >
          Andamento
        </p>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">
            Solicitação ainda não enviada
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            O envio precisa ser concluído antes do início da análise.
          </p>
        </div>
      </section>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <section aria-labelledby="application-progress-title">
        <p
          id="application-progress-title"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
        >
          Andamento
        </p>

        <div
          role="status"
          className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white"
            >
              ×
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Solicitação encerrada
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Este protocolo não está mais em andamento.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentStep = getCurrentStep(status);

  const steps = [
    {
      number: 1,
      title: 'Recebida',
      description: 'Solicitação registrada',
    },
    {
      number: 2,
      title: 'Análise',
      description: 'Avaliação da solicitação',
    },
    {
      number: 3,
      title: 'Decisão',
      description: 'Resultado da análise',
    },
  ];

  return (
    <section aria-labelledby="application-progress-title">
      <p
        id="application-progress-title"
        className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
      >
        Andamento
      </p>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const completed =
            step.number < currentStep;

          const active =
            step.number === currentStep;

          return (
            <li
              key={step.number}
              aria-current={
                active ? 'step' : undefined
              }
              className={`rounded-2xl border p-4 transition ${
                completed
                  ? 'border-emerald-200 bg-emerald-50'
                  : active
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
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
                      completed
                        ? 'text-emerald-800'
                        : active
                          ? 'text-blue-800'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StatusContent({
  status,
  protocol,
}: {
  status: ApplicationStatus;
  protocol: string;
}) {
  if (status === 'DRAFT') {
    return (
      <StatusBox
        title="Sua solicitação ainda não foi enviada"
        description="Existem informações pendentes antes que a proposta possa seguir para análise."
      />
    );
  }

  if (status === 'SUBMITTED') {
    return (
      <StatusBox
        title="Recebemos sua solicitação"
        description="Seus dados foram registrados com sucesso. Sua solicitação está aguardando o início da análise."
      />
    );
  }

  if (status === 'UNDER_REVIEW') {
    return (
      <StatusBox
        title="Sua solicitação está sendo analisada"
        description="As informações da sua solicitação estão em análise. O resultado será apresentado nesta área assim que o processo for concluído."
      />
    );
  }

  if (status === 'APPROVED') {
    return (
      <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
            ✓
          </div>

          <div>
            <h2 className="text-xl font-semibold text-emerald-950">Sua solicitação foi aprovada</h2>

            <p className="mt-3 leading-7 text-emerald-800">
              A análise de crédito foi concluída com resultado positivo. As próximas etapas
              necessárias para formalização da operação serão apresentadas separadamente.
            </p>

            <p className="mt-4 text-sm leading-6 text-emerald-700">
              A aprovação apresentada nesta página não solicita pagamento antecipado para consulta
              do resultado.
            </p>
            <Link
              href={`/solicitacao/${encodeURIComponent(
                protocol,
              )}/proposta`}
              className="group mt-6 flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold !text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto sm:min-w-72"
            >
              <span className="!text-white">
                Consultar próximas condições
              </span>

              <span
                aria-hidden="true"
                className="ml-6 text-lg !text-white transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-[#071522]">Solicitação não aprovada</h2>

        <p className="mt-3 leading-7 text-slate-600">
          A análise desta proposta foi concluída e, neste momento, não foi possível seguir com a
          operação de crédito.
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Uma nova solicitação poderá estar sujeita a uma nova análise e às condições aplicáveis
          naquele momento.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
      <h2 className="text-xl font-semibold text-[#071522]">Solicitação encerrada</h2>

      <p className="mt-3 leading-7 text-slate-600">Esta solicitação não está mais ativa.</p>
    </div>
  );
}

function StatusBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-10 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 md:p-8">
      <h2 className="text-xl font-semibold text-[#071522]">{title}</h2>

      <p className="mt-3 leading-7 text-slate-600">{description}</p>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/70 p-4">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
          i
        </div>

        <p className="text-sm leading-6 text-slate-600">
          O status desta página é atualizado automaticamente enquanto sua solicitação estiver em análise.
        </p>
      </div>
    </div>
  );
}

function getCurrentStep(status: ApplicationStatus) {
  switch (status) {
    case 'DRAFT':
    case 'SUBMITTED':
      return 1;

    case 'UNDER_REVIEW':
      return 2;

    case 'APPROVED':
    case 'REJECTED':
    case 'CANCELLED':
      return 3;
  }
}

function getStatusPresentation(status: ApplicationStatus) {
  switch (status) {
    case 'DRAFT':
      return {
        eyebrow: 'Solicitação em andamento',
        title: 'Continue sua solicitação',
        description: 'Ainda existem etapas pendentes antes do envio para análise.',
        icon: '1',
        headerClassName: 'border-slate-200 bg-slate-50',
        iconClassName: 'bg-slate-200 text-slate-700',
        eyebrowClassName: 'text-slate-500',
      };

    case 'SUBMITTED':
      return {
        eyebrow: 'Solicitação recebida',
        title: 'Recebemos seus dados',
        description: 'Sua solicitação foi registrada e está aguardando análise.',
        icon: '✓',
        headerClassName: 'border-blue-100 bg-blue-50',
        iconClassName: 'bg-blue-600 text-white',
        eyebrowClassName: 'text-blue-700',
      };

    case 'UNDER_REVIEW':
      return {
        eyebrow: 'Crédito em análise',
        title: 'Estamos analisando sua solicitação',
        description: 'Sua solicitação está passando pelo processo de análise de crédito.',
        icon: '•••',
        headerClassName: 'border-amber-100 bg-amber-50',
        iconClassName: 'bg-amber-500 text-white',
        eyebrowClassName: 'text-amber-700',
      };

    case 'APPROVED':
      return {
        eyebrow: 'Análise concluída',
        title: 'Solicitação aprovada',
        description: 'A análise da sua solicitação foi concluída com resultado positivo. A contratação ainda depende da apresentação das condições e da sua decisão.',
        icon: '✓',
        headerClassName: 'border-emerald-100 bg-emerald-50',
        iconClassName: 'bg-emerald-600 text-white',
        eyebrowClassName: 'text-emerald-700',
      };

    case 'REJECTED':
      return {
        eyebrow: 'Análise concluída',
        title: 'Solicitação não aprovada',
        description: 'A análise foi concluída e a operação não poderá seguir neste momento.',
        icon: '—',
        headerClassName: 'border-slate-200 bg-slate-50',
        iconClassName: 'bg-slate-700 text-white',
        eyebrowClassName: 'text-slate-600',
      };

    case 'CANCELLED':
      return {
        eyebrow: 'Solicitação encerrada',
        title: 'Esta solicitação foi encerrada',
        description: 'O processo referente a este protocolo não está mais ativo.',
        icon: '×',
        headerClassName: 'border-slate-200 bg-slate-50',
        iconClassName: 'bg-slate-500 text-white',
        eyebrowClassName: 'text-slate-500',
      };
  }
}


