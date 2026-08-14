import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { getApplicationStatusPresentation } from '@/lib/application-status';
import { formatCurrency } from '@/lib/credit';
import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { getAdminApplicationByProtocol } from '@/server/dal/admin-applications';

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

  const status = getApplicationStatusPresentation(application.status);

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

              <p className="text-xs text-slate-400">Análise de crédito</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-white">{session.user.name}</p>

            <p className="text-xs text-slate-400">{formatRole(session.user.role)}</p>
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

            <h1 className="mt-3 font-mono text-3xl font-semibold tracking-[-0.03em] text-[#0b1f33]">
              {application.publicProtocol}
            </h1>

            <p className="mt-3 max-w-2xl text-slate-500">
              Consulte os dados cadastrais, financeiros e o histórico operacional desta solicitação.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status atual
            </p>

            <p className="mt-2 font-semibold text-[#0b1f33]">{status.label}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card title="Resumo da operação">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Valor solicitado" value={formatCurrency(application.amount)} />

                <Detail label="Prazo" value={`${application.months} meses`} />

                <Detail
                  label="Recebida em"
                  value={formatDateTime(application.submittedAt ?? application.createdAt)}
                />

                <Detail label="Status" value={status.label} />
              </div>
            </Card>

            {application.applicant ? (
              <>
                <Card title="Dados cadastrais">
                  <div className="grid gap-6 md:grid-cols-2">
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

                <Card title="Endereço residencial">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Detail label="CEP" value={application.applicant.address.cep} />

                    <Detail label="Endereço" value={formatAddress(application.applicant.address)} />

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

                <Card title="Perfil financeiro">
                  <div className="grid gap-6 md:grid-cols-3">
                    <Detail
                      label="Situação profissional"
                      value={formatEmploymentType(application.applicant.employment.employmentType)}
                    />

                    <Detail
                      label="Profissão / ocupação"
                      value={application.applicant.employment.occupation}
                    />

                    <Detail label="Renda declarada" value={application.applicant.income} />
                  </div>
                </Card>
              </>
            ) : (
              <Card title="Dados cadastrais">
                <p className="text-sm leading-6 text-slate-500">
                  Esta solicitação não possui dados cadastrais associados.
                </p>
              </Card>
            )}
          </div>

          <aside className="space-y-6">
            <Card title="Histórico da operação">
              {application.statusHistory.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum evento registrado.</p>
              ) : (
                <div className="space-y-6">
                  {application.statusHistory.map((event) => (
                    <div key={event.id} className="relative border-l-2 border-slate-200 pl-5">
                      <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600" />

                      <p className="text-sm font-semibold text-[#0b1f33]">
                        {formatStatus(event.fromStatus)}
                        {' → '}
                        {formatStatus(event.toStatus)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(event.createdAt)}
                      </p>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        Origem: {formatActor(event.actorType)}
                      </p>

                      {event.reason && (
                        <p className="mt-3 text-sm leading-6 text-slate-600">{event.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-[#0b1f33]">Área administrativa</p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Os dados exibidos nesta página são destinados ao processamento interno da
                solicitação.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold text-[#0b1f33]">{title}</h2>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>

      <p className="mt-2 break-words font-medium text-slate-800">{value || '—'}</p>
    </div>
  );
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

function formatAddress(address: { street: string; number: string; complement: string }) {
  return [address.street, address.number, address.complement].filter(Boolean).join(', ');
}

function formatCityState(city: string, state: string) {
  if (!city && !state) {
    return '—';
  }

  if (!state) {
    return city;
  }

  if (!city) {
    return state;
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

function formatStatus(
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
) {
  const labels = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Recebida',
    UNDER_REVIEW: 'Em análise',
    APPROVED: 'Aprovada',
    REJECTED: 'Não aprovada',
    CANCELLED: 'Cancelada',
  };

  return labels[status];
}

function formatActor(actor: 'SYSTEM' | 'OPERATOR') {
  return actor === 'SYSTEM' ? 'Sistema' : 'Operador';
}

function formatRole(role: 'SUPER_ADMIN' | 'ANALYST') {
  return role === 'SUPER_ADMIN' ? 'Super administrador' : 'Analista';
}
