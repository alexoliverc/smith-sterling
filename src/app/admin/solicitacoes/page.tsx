import { AdminLogoutButton } from '@/components/admin/logout-button';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { ApplicationStatus } from '@/generated/prisma/client';
import { formatCurrency } from '@/lib/credit';
import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { listAdminApplications } from '@/server/dal/admin-applications';

export default async function AdminApplicationsPage() {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const session = await findAdminSession(token);

  if (!session) {
    redirect('/admin/login');
  }

  const applications = await listAdminApplications();

  const total = applications.length;

  const submitted = applications.filter((application) => application.status === 'SUBMITTED').length;

  const underReview = applications.filter(
    (application) => application.status === 'UNDER_REVIEW',
  ).length;

  const approved = applications.filter((application) => application.status === 'APPROVED').length;

  const rejected = applications.filter((application) => application.status === 'REJECTED').length;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#071522]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f33]">
              SS
            </div>

            <div>
              <p className="font-semibold text-white">Smith Sterling</p>

              <p className="text-xs text-slate-400">Backoffice de crédito</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{session.user.name}</p>

              <p className="text-xs text-slate-400">{formatRole(session.user.role)}</p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
            Operações
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
            Solicitações de crédito
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Acompanhe as propostas recebidas e o estágio atual de cada operação.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total" value={total} />

          <MetricCard label="Recebidas" value={submitted} />

          <MetricCard label="Em análise" value={underReview} />

          <MetricCard label="Aprovadas" value={approved} />

          <MetricCard label="Não aprovadas" value={rejected} />
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0b1f33]">Fila de solicitações</h2>

              <p className="mt-1 text-sm text-slate-500">
                Exibindo até as 100 solicitações mais recentes.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              {total} {total === 1 ? 'registro' : 'registros'}
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-medium text-slate-700">Nenhuma solicitação encontrada.</p>

              <p className="mt-2 text-sm text-slate-500">
                Novas solicitações aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.5fr_1fr_0.8fr_1fr_1.1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <span>Protocolo</span>
                <span>Valor</span>
                <span>Prazo</span>
                <span>Status</span>
                <span>Recebida em</span>
              </div>

              <div className="divide-y divide-slate-200">
                {applications.map((application) => (
                  <ApplicationRow
                    key={application.publicProtocol}
                    protocol={application.publicProtocol ?? 'Sem protocolo'}
                    amount={application.amount}
                    months={application.months}
                    status={application.status}
                    submittedAt={application.submittedAt ?? application.createdAt}
                    formalizationStatus={application.formalization?.status ?? null}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0b1f33]">{value}</p>
    </div>
  );
}

type FormalizationStatusValue =
  | 'PENDING'
  | 'BANK_DETAILS_SUBMITTED'
  | 'READY_FOR_DISBURSEMENT'
  | 'DISBURSED'
  | 'CANCELLED';

function ApplicationRow({
  protocol,
  amount,
  months,
  status,
  submittedAt,
  formalizationStatus,
}: {
  protocol: string;
  amount: number;
  months: number;
  status: ApplicationStatus;
  submittedAt: Date;
  formalizationStatus: FormalizationStatusValue | null;
}) {
  const statusPresentation =
    getStatusPresentation(status);

  const formalizationPresentation =
    status === 'APPROVED'
      ? getFormalizationPresentation(
          formalizationStatus,
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
      <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.5fr_1fr_0.8fr_1fr_1.1fr] lg:items-center lg:gap-4">
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
            {formatCurrency(amount)}
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
            {statusPresentation.label}
          </span>

          {formalizationPresentation && (
            <p
              className={`mt-2 text-xs font-semibold ${formalizationPresentation.className}`}
            >
              {formalizationPresentation.label}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">
            Recebida em
          </p>

          <p className="mt-1 text-sm text-slate-600 lg:mt-0">
            {formatDateTime(submittedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function getFormalizationPresentation(
  status: FormalizationStatusValue | null,
) {
  switch (status) {
    case 'PENDING':
      return {
        label: '• Aguardando dados bancários',
        className: 'text-amber-700',
      };

    case 'BANK_DETAILS_SUBMITTED':
      return {
        label: '• Dados bancários recebidos',
        className: 'text-blue-700',
      };

    case 'READY_FOR_DISBURSEMENT':
      return {
        label: '• Pronta para liberação',
        className: 'text-violet-700',
      };

    case 'DISBURSED':
      return {
        label: '✓ Crédito liberado',
        className: 'text-emerald-700',
      };

    case 'CANCELLED':
      return {
        label: '• Formalização encerrada',
        className: 'text-slate-500',
      };

    default:
      return {
        label: '• Formalização pendente',
        className: 'text-slate-500',
      };
  }
}
function getStatusPresentation(
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
) {
  switch (status) {
    case 'DRAFT':
      return {
        label: 'Rascunho',
        className: 'bg-slate-100 text-slate-700',
      };

    case 'SUBMITTED':
      return {
        label: 'Recebida',
        className: 'bg-blue-50 text-blue-700',
      };

    case 'UNDER_REVIEW':
      return {
        label: 'Em análise',
        className: 'bg-amber-50 text-amber-700',
      };

    case 'APPROVED':
      return {
        label: 'Aprovada',
        className: 'bg-emerald-50 text-emerald-700',
      };

    case 'REJECTED':
      return {
        label: 'Não aprovada',
        className: 'bg-red-50 text-red-700',
      };

    case 'CANCELLED':
      return {
        label: 'Cancelada',
        className: 'bg-slate-100 text-slate-500',
      };
  }
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}

function formatRole(role: 'SUPER_ADMIN' | 'ANALYST') {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super administrador';

    case 'ANALYST':
      return 'Analista';
  }
}

