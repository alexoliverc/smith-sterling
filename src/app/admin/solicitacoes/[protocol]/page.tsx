import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import type {
  AdminRole,
  ApplicationStatus,
  ApplicationStatusActor,
} from '@/generated/prisma/client';
import { AdminLogoutButton } from '@/components/admin/logout-button';
import { getApplicationStatusPresentation } from '@/lib/application-status';
import { formatCurrency } from '@/lib/credit';
import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { getAdminApplicationByProtocol } from '@/server/dal/admin-applications';

import { DecisionPanel } from './decision-panel';
import { StartAnalysisButton } from './start-analysis-button';

type AdminApplicationPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function AdminApplicationPage({ params }: AdminApplicationPageProps) {
  const cookieStore = await cookies();

  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const session = await findAdminSession(token);

  if (!session) {
    redirect('/admin/login');
  }

  const { protocol } = await params;

  const application = await getAdminApplicationByProtocol(protocol);

  if (!application) {
    notFound();
  }

  const statusPresentation = getApplicationStatusPresentation(application.status);

  const protocolLabel = application.publicProtocol ?? protocol;

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
        <Link
          href="/admin/solicitacoes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          ← Voltar para solicitações
        </Link>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Proposta de crédito
            </p>

            <h1 className="mt-3 font-mono text-3xl font-semibold tracking-[-0.03em] text-[#0b1f33] md:text-4xl">
              {protocolLabel}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-500">
              Visualização interna da solicitação, dados cadastrais, perfil financeiro e histórico
              operacional.
            </p>
          </div>

          <div className="min-w-52 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status atual
            </p>

            <div className="mt-3">
              <StatusBadge status={application.status} />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">{statusPresentation.eyebrow}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Card title="Resumo da operação" description="Condições solicitadas pelo cliente.">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Valor solicitado" value={formatCurrency(application.amount)} />

                <Detail label="Prazo" value={`${application.months} meses`} />

                <Detail
                  label="Recebida em"
                  value={formatDateTime(application.submittedAt ?? application.createdAt)}
                />

                <Detail label="Última atualização" value={formatDateTime(application.updatedAt)} />
              </div>
            </Card>

            {application.applicant ? (
              <>
                <Card
                  title="Dados cadastrais"
                  description="Informações de identificação e contato fornecidas na solicitação."
                >
                  <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                    <Detail label="Nome completo" value={application.applicant.name} />

                    <Detail label="CPF" value={formatCpf(application.applicant.cpf)} />

                    <Detail
                      label="Data de nascimento"
                      value={formatBirthDate(application.applicant.birthDate)}
                    />

                    <Detail label="Telefone" value={application.applicant.phone} />

                    <Detail label="E-mail" value={application.applicant.email} />
                  </div>
                </Card>

                <Card
                  title="Endereço residencial"
                  description="Endereço declarado pelo solicitante."
                >
                  <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                    <Detail label="CEP" value={application.applicant.address.cep} />

                    <Detail label="Logradouro" value={application.applicant.address.street} />

                    <Detail label="Número" value={application.applicant.address.number} />

                    <Detail label="Complemento" value={application.applicant.address.complement} />

                    <Detail label="Bairro" value={application.applicant.address.neighborhood} />

                    <Detail
                      label="Cidade / UF"
                      value={formatCityState(
                        application.applicant.address.city,
                        application.applicant.address.state,
                      )}
                    />
                  </div>
                </Card>

                <Card
                  title="Perfil financeiro"
                  description="Informações profissionais e de renda declaradas pelo cliente."
                >
                  <div className="grid gap-x-8 gap-y-7 md:grid-cols-3">
                    <Detail
                      label="Situação profissional"
                      value={formatEmploymentType(application.applicant.employment.employmentType)}
                    />

                    <Detail
                      label="Profissão / ocupação"
                      value={application.applicant.employment.occupation}
                    />

                    <Detail label="Renda mensal declarada" value={application.applicant.income} />
                  </div>
                </Card>
              </>
            ) : (
              <Card title="Dados cadastrais" description="Informações protegidas do solicitante.">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-medium text-amber-800">Dados cadastrais não encontrados.</p>

                  <p className="mt-2 text-sm leading-6 text-amber-700">
                    Esta proposta não possui um registro ApplicantData associado.
                  </p>
                </div>
              </Card>
            )}
          </div>

          <aside className="space-y-6">
            <Card
              title="Histórico da operação"
              description="Trilha auditável do ciclo de vida da proposta."
            >
              {application.statusHistory.length === 0 ? (
                <p className="text-sm leading-6 text-slate-500">
                  Nenhum evento de status registrado para esta proposta.
                </p>
              ) : (
                <div className="space-y-0">
                  {application.statusHistory.map((event, index) => (
                    <div key={event.id} className="relative pb-8 pl-7 last:pb-0">
                      {index !== application.statusHistory.length - 1 && (
                        <div className="absolute bottom-0 left-[5px] top-3 w-px bg-slate-200" />
                      )}

                      <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />

                      <p className="text-sm font-semibold text-[#0b1f33]">
                        {formatStatus(event.fromStatus)}

                        <span className="mx-2 text-slate-300">→</span>

                        {formatStatus(event.toStatus)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(event.createdAt)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {formatActor(event.actorType)}
                        </span>

                        {event.actorName && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            Operador: {event.actorName}
                          </span>
                        )}
                      </div>

                      {event.reason && (
                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          {event.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-[#0b1f33]">Dados protegidos</p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                As informações cadastrais desta página são descriptografadas somente no ambiente
                servidor após a validação da sessão administrativa.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Operações
              </p>

              <h2 className="mt-3 text-lg font-semibold text-[#0b1f33]">Ações do analista</h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                As ações disponíveis dependem do status atual da proposta e do nível de autorização
                do operador.
              </p>

              <div className="mt-5">
                {application.status === 'SUBMITTED' ? (
                  <StartAnalysisButton protocol={protocolLabel} />
                ) : application.status === 'UNDER_REVIEW' ? (
                  session.user.role === 'SUPER_ADMIN' ? (
                    <DecisionPanel protocol={protocolLabel} />
                  ) : (
                    <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-center text-sm font-medium leading-6 text-slate-600">
                      A decisão final está restrita a um super administrador.
                    </div>
                  )
                ) : application.status === 'APPROVED' ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                      <p className="text-sm font-semibold text-emerald-900">✓ Crédito aprovado</p>

                      <p className="mt-2 text-sm leading-6 text-emerald-700">
                        A análise foi concluída. Acompanhe agora a formalização e a etapa de
                        liberação da operação.
                      </p>
                    </div>

                    {session.user.role === 'SUPER_ADMIN' ? (
                      <Link
                        href={`/admin/solicitacoes/${encodeURIComponent(
                          protocolLabel,
                        )}/formalizacao`}
                        className="group flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold !text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                      >
                        <span>Abrir formalização</span>

                        <span aria-hidden="true" className="text-lg">
                          →
                        </span>
                      </Link>
                    ) : (
                      <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-center text-sm font-medium leading-6 text-slate-600">
                        A formalização financeira está restrita a um super administrador.
                      </div>
                    )}
                  </div>
                ) : application.status === 'REJECTED' ? (
                  <div className="rounded-xl bg-red-50 px-4 py-3.5 text-center text-sm font-semibold leading-6 text-red-700">
                    Solicitação não aprovada. Nenhuma formalização foi iniciada.
                  </div>
                ) : application.status === 'CANCELLED' ? (
                  <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-center text-sm font-semibold leading-6 text-slate-500">
                    Esta solicitação foi encerrada.
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-center text-sm font-semibold leading-6 text-slate-500">
                    Nenhuma ação disponível.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div>
        <h2 className="text-xl font-semibold text-[#0b1f33]">{title}</h2>

        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>

      <div className="mt-7">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>

      <p className="mt-2 break-words font-medium leading-6 text-slate-800">{value || '—'}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const presentation = getStatusBadgePresentation(status);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}

function getStatusBadgePresentation(status: ApplicationStatus) {
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

function formatBirthDate(value: string) {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatCpf(value: string) {
  const cpf = value.replace(/\D/g, '');

  if (cpf.length !== 11) {
    return value;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function formatCityState(city: string, state: string) {
  if (!city && !state) {
    return '—';
  }

  if (!city) {
    return state;
  }

  if (!state) {
    return city;
  }

  return `${city} / ${state}`;
}

function formatEmploymentType(value: string) {
  const labels: Record<string, string> = {
    clt: 'Empregado CLT',
    autonomo: 'Autônomo',
    empresario: 'Empresário',
    servidor: 'Servidor público',
    aposentado: 'Aposentado / Pensionista',
    outro: 'Outro',
  };

  return labels[value] ?? value;
}

function formatStatus(status: ApplicationStatus) {
  const labels: Record<ApplicationStatus, string> = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Recebida',
    UNDER_REVIEW: 'Em análise',
    APPROVED: 'Aprovada',
    REJECTED: 'Não aprovada',
    CANCELLED: 'Cancelada',
  };

  return labels[status];
}

function formatActor(actor: ApplicationStatusActor) {
  return actor === 'SYSTEM' ? 'Sistema' : 'Operador';
}

function formatRole(role: AdminRole) {
  return role === 'SUPER_ADMIN' ? 'Super administrador' : 'Analista';
}

