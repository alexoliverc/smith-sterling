import Link from 'next/link';

import { AdminHeader } from '@/components/admin/admin-header';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { ApplicationStatus } from '@/generated/prisma/client';
import { formatCurrency } from '@/lib/credit';
import {
  ADMIN_SESSION_COOKIE,
  findAdminSession,
} from '@/server/auth/admin-session';
import { listAdminApplications } from '@/server/dal/admin-applications';

const QUEUE_FILTERS = [
  {
    value: 'all',
    label: 'Todas',
  },
  {
    value: 'submitted',
    label: 'Recebidas',
  },
  {
    value: 'under-review',
    label: 'Em análise',
  },
  {
    value: 'create-offer',
    label: 'Criar proposta',
  },
  {
    value: 'waiting-acceptance',
    label: 'Aguardando aceite',
  },
  {
    value: 'offer-declined',
    label: 'Propostas recusadas',
  },
  {
    value: 'offer-expired',
    label: 'Propostas expiradas',
  },
  {
    value: 'waiting-bank',
    label: 'Aguardando dados',
  },
  {
    value: 'bank-received',
    label: 'Dados recebidos',
  },
  {
    value: 'ready',
    label: 'Prontas para liberação',
  },
  {
    value: 'disbursed',
    label: 'Crédito liberado',
  },
  {
    value: 'rejected',
    label: 'Não aprovadas',
  },
] as const;

type QueueFilter =
  (typeof QUEUE_FILTERS)[number]['value'];

type AdminApplication =
  Awaited<
    ReturnType<
      typeof listAdminApplications
    >
  >[number];

type OperationalStage =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'create-offer'
  | 'waiting-acceptance'
  | 'offer-declined'
  | 'offer-expired'
  | 'waiting-bank'
  | 'bank-received'
  | 'ready'
  | 'disbursed'
  | 'formalization-cancelled'
  | 'rejected'
  | 'cancelled'
  | 'inconsistent';

type AdminApplicationsPageProps = {
  searchParams: Promise<{
    filtro?: string;
  }>;
};

function isQueueFilter(
  value: string,
): value is QueueFilter {
  return QUEUE_FILTERS.some(
    (filter) =>
      filter.value === value,
  );
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
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

  const applications =
    await listAdminApplications();

  const query =
    await searchParams;

  const requestedFilter =
    query.filtro ?? 'all';

  const activeFilter: QueueFilter =
    isQueueFilter(
      requestedFilter,
    )
      ? requestedFilter
      : 'all';

  const applicationsWithStage =
    applications.map(
      (application) => ({
        application,
        stage:
          getOperationalStage(
            application,
          ),
      }),
    );

  const filteredApplications =
    applicationsWithStage.filter(
      ({ stage }) => {
        if (
          activeFilter ===
          'all'
        ) {
          return true;
        }

        return (
          stage ===
          activeFilter
        );
      },
    );

  const total =
    applications.length;

  const submitted =
    applicationsWithStage.filter(
      ({ stage }) =>
        stage === 'submitted',
    ).length;

  const underReview =
    applicationsWithStage.filter(
      ({ stage }) =>
        stage ===
        'under-review',
    ).length;

  const createOffer =
    applicationsWithStage.filter(
      ({ stage }) =>
        stage ===
        'create-offer',
    ).length;

  const waitingAcceptance =
    applicationsWithStage.filter(
      ({ stage }) =>
        stage ===
        'waiting-acceptance',
    ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader
        userName={session.user.name}
        roleLabel={formatRole(session.user.role)}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
            Operações
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0b1f33] sm:text-4xl">
            Solicitações de crédito
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Acompanhe cada operação desde a análise de crédito até o aceite da proposta, formalização e liberação.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Total operacional"
            value={total}
          />

          <MetricCard
            label="Recebidas"
            value={submitted}
          />

          <MetricCard
            label="Em análise"
            value={underReview}
          />

          <MetricCard
            label="Criar proposta"
            value={createOffer}
          />

          <MetricCard
            label="Aguardando aceite"
            value={
              waitingAcceptance
            }
          />
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0b1f33]">
                Fila operacional
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Exibindo até as 100 solicitações mais recentes e o estágio operacional atual.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              {
                filteredApplications.length
              }{' '}
              {filteredApplications.length ===
              1
                ? 'registro'
                : 'registros'}

              {activeFilter !==
                'all' && (
                <span className="ml-1 text-slate-400">
                  de {total}
                </span>
              )}
            </div>
          </div>

          <div
            aria-label="Filtros da fila"
            className="border-b border-slate-200 bg-white px-6 py-4"
          >
            <div className="flex flex-wrap gap-2">
              {QUEUE_FILTERS.map(
                (filter) => {
                  const active =
                    activeFilter ===
                    filter.value;

                  const href =
                    filter.value ===
                    'all'
                      ? '/admin/solicitacoes'
                      : `/admin/solicitacoes?filtro=${filter.value}`;

                  return (
                    <Link
                      key={
                        filter.value
                      }
                      href={href}
                      className={
                        active
                          ? 'rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold !text-white shadow-sm'
                          : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                      }
                    >
                      {filter.label}
                    </Link>
                  );
                },
              )}
            </div>
          </div>

          {filteredApplications.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-medium text-slate-700">
                {total === 0
                  ? 'Nenhuma solicitação encontrada.'
                  : 'Nenhuma solicitação encontrada neste filtro.'}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {total === 0
                  ? 'Novas solicitações aparecerão aqui automaticamente.'
                  : 'Selecione outro filtro para visualizar as demais operações.'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_1.25fr_1.1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>
                  Protocolo
                </span>

                <span>
                  Valor
                </span>

                <span>
                  Prazo
                </span>

                <span>
                  Status
                </span>

                <span>
                  Recebida em
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {filteredApplications.map(
                  ({
                    application,
                    stage,
                  }) => (
                    <ApplicationRow
                      key={
                        application.publicProtocol
                      }
                      protocol={
                        application.publicProtocol ??
                        'Sem protocolo'
                      }
                      amount={
                        application.amount
                      }
                      months={
                        application.months
                      }
                      status={
                        application.status
                      }
                      submittedAt={
                        application.submittedAt ??
                        application.createdAt
                      }
                      stage={
                        stage
                      }
                      latestOfferVersion={
                        application.latestOffer
                          ?.version ??
                        null
                      }
                    />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
        {value}
      </p>
    </div>
  );
}

function ApplicationRow({
  protocol,
  amount,
  months,
  status,
  submittedAt,
  stage,
  latestOfferVersion,
}: {
  protocol: string;
  amount: number;
  months: number;
  status: ApplicationStatus;
  submittedAt: Date;
  stage: OperationalStage;
  latestOfferVersion:
    | number
    | null;
}) {
  const statusPresentation =
    getStatusPresentation(
      status,
    );

  const operationalPresentation =
    status === 'APPROVED'
      ? getOperationalPresentation(
          stage,
          latestOfferVersion,
        )
      : null;

  const detailUrl =
    `/admin/solicitacoes/${encodeURIComponent(
      protocol,
    )}`;

  return (
    <Link
      href={detailUrl}
      aria-label={`Abrir solicitação ${protocol}`}
      className="group block cursor-pointer transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
    >
      <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.5fr_1fr_0.8fr_1.25fr_1.1fr] lg:items-center lg:gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
            Protocolo
          </p>

          <div className="mt-1 flex items-center gap-3 lg:mt-0">
            <p className="font-mono text-sm font-semibold text-[#0b1f33]">
              {protocol}
            </p>

            <span
              aria-hidden="true"
              className="text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600"
            >
              →
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
            Valor
          </p>

          <p className="mt-1 font-medium text-slate-800 lg:mt-0">
            {formatCurrency(
              amount,
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
            Prazo
          </p>

          <p className="mt-1 text-sm text-slate-700 lg:mt-0">
            {months} meses
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
            Status
          </p>

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusPresentation.className}`}
          >
            {
              statusPresentation.label
            }
          </span>

          {operationalPresentation && (
            <p
              className={`mt-2 text-xs font-semibold leading-5 ${operationalPresentation.className}`}
            >
              {
                operationalPresentation.label
              }
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
            Recebida em
          </p>

          <p className="mt-1 text-sm text-slate-600 lg:mt-0">
            {formatDateTime(
              submittedAt,
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

function getOperationalStage(
  application: AdminApplication,
): OperationalStage {
  switch (
    application.status
  ) {
    case 'DRAFT':
      return 'draft';

    case 'SUBMITTED':
      return 'submitted';

    case 'UNDER_REVIEW':
      return 'under-review';

    case 'REJECTED':
      return 'rejected';

    case 'CANCELLED':
      return 'cancelled';

    case 'APPROVED':
      break;
  }

  switch (
    application.formalization
      ?.status
  ) {
    case 'PENDING':
      return 'waiting-bank';

    case 'BANK_DETAILS_SUBMITTED':
      return 'bank-received';

    case 'READY_FOR_DISBURSEMENT':
      return 'ready';

    case 'DISBURSED':
      return 'disbursed';

    case 'CANCELLED':
      return 'formalization-cancelled';
  }

  /*
   * Uma proposta aceita deveria criar a
   * formalização na mesma transação.
   *
   * Se isso não aconteceu, exibimos uma
   * inconsistência operacional em vez de
   * fingir que a operação está normal.
   */
  if (
    application.acceptedOffer
  ) {
    return 'inconsistent';
  }

  const offerStatus =
    application.latestOffer
      ?.effectiveStatus;

  switch (offerStatus) {
    case 'PRESENTED':
      return 'waiting-acceptance';

    case 'DECLINED':
      return 'offer-declined';

    case 'EXPIRED':
      return 'offer-expired';

    case 'ACCEPTED':
      return 'inconsistent';

    case 'DRAFT':
    case 'CANCELLED':
    case null:
    case undefined:
      return 'create-offer';
  }

  return 'create-offer';
}

function getOperationalPresentation(
  stage: OperationalStage,
  offerVersion:
    | number
    | null,
) {
  const versionLabel =
    offerVersion
      ? ` · v${offerVersion}`
      : '';

  switch (stage) {
    case 'create-offer':
      return {
        label:
          '• Criar proposta',
        className:
          'text-orange-700',
      };

    case 'waiting-acceptance':
      return {
        label:
          `• Aguardando aceite do cliente${versionLabel}`,
        className:
          'text-blue-700',
      };

    case 'offer-declined':
      return {
        label:
          `• Proposta recusada${versionLabel}`,
        className:
          'text-slate-600',
      };

    case 'offer-expired':
      return {
        label:
          `• Proposta expirada${versionLabel}`,
        className:
          'text-amber-700',
      };

    case 'waiting-bank':
      return {
        label:
          '✓ Proposta aceita · aguardando dados bancários',
        className:
          'text-emerald-700',
      };

    case 'bank-received':
      return {
        label:
          '• Dados bancários recebidos',
        className:
          'text-blue-700',
      };

    case 'ready':
      return {
        label:
          '• Pronta para liberação',
        className:
          'text-violet-700',
      };

    case 'disbursed':
      return {
        label:
          '✓ Crédito liberado',
        className:
          'text-emerald-700',
      };

    case 'formalization-cancelled':
      return {
        label:
          '• Formalização encerrada',
        className:
          'text-slate-500',
      };

    case 'inconsistent':
      return {
        label:
          '⚠ Aceite registrado · formalização ausente',
        className:
          'text-red-700',
      };

    default:
      return null;
  }
}

function getStatusPresentation(
  status: ApplicationStatus,
) {
  switch (status) {
    case 'DRAFT':
      return {
        label:
          'Rascunho',
        className:
          'bg-slate-100 text-slate-700',
      };

    case 'SUBMITTED':
      return {
        label:
          'Recebida',
        className:
          'bg-blue-50 text-blue-700',
      };

    case 'UNDER_REVIEW':
      return {
        label:
          'Em análise',
        className:
          'bg-amber-50 text-amber-700',
      };

    case 'APPROVED':
      return {
        label:
          'Aprovada',
        className:
          'bg-emerald-50 text-emerald-700',
      };

    case 'REJECTED':
      return {
        label:
          'Não aprovada',
        className:
          'bg-red-50 text-red-700',
      };

    case 'CANCELLED':
      return {
        label:
          'Cancelada',
        className:
          'bg-slate-100 text-slate-500',
      };
  }
}

function formatDateTime(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle:
        'short',

      timeStyle:
        'short',

      timeZone:
        'America/Bahia',
    },
  ).format(date);
}

function formatRole(
  role:
    | 'SUPER_ADMIN'
    | 'ANALYST',
) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super administrador';

    case 'ANALYST':
      return 'Analista';
  }
}
