import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import type { FormalizationStatus } from '@/generated/prisma/client';
import { formatCurrency } from '@/lib/credit';
import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { getAdminFormalizationByProtocol } from '@/server/dal/admin-formalization';

import { ConfirmReadyButton } from './confirm-ready-button';

type AdminFormalizationPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function AdminFormalizationPage({ params }: AdminFormalizationPageProps) {
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

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect(`/admin/solicitacoes/${encodeURIComponent(protocol)}`);
  }

  const application = await getAdminFormalizationByProtocol(protocol);

  if (!application) {
    notFound();
  }

  if (!application.formalization) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/admin/solicitacoes/${encodeURIComponent(protocol)}`}
            className="text-sm font-semibold text-blue-600"
          >
            ← Voltar para a proposta
          </Link>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-[#071522]">Formalização não encontrada</h1>

            <p className="mt-3 text-slate-600">
              Esta proposta ainda não possui uma formalização associada.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const formalization = application.formalization;

  const protocolLabel = application.publicProtocol ?? protocol;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-[#071522]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="font-semibold text-white">Smith Sterling</p>

            <p className="text-xs text-slate-400">Conferência da formalização</p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-white">{session.user.name}</p>

            <p className="text-xs text-slate-400">Super administrador</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href={`/admin/solicitacoes/${encodeURIComponent(protocol)}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Voltar para a proposta
        </Link>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              Formalização
            </p>

            <h1 className="mt-3 font-mono text-3xl font-semibold text-[#071522]">
              {protocolLabel}
            </h1>

            <p className="mt-3 text-slate-500">
              Conferência dos dados para preparação da liberação.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>

            <p className="mt-2 font-semibold text-[#071522]">
              {formatFormalizationStatus(formalization.status)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <Card title="Resumo da operação">
              <div className="grid gap-6 sm:grid-cols-3">
                <Detail label="Valor aprovado" value={formatCurrency(application.amount)} />

                <Detail label="Prazo" value={`${application.months} meses`} />

                <Detail label="Protocolo" value={protocolLabel} />
              </div>
            </Card>

            <Card title="Conta para recebimento">
              {formalization.bankData ? (
                <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                  <Detail label="Banco" value={formalization.bankData.bankName} />

                  <Detail
                    label="Tipo da conta"
                    value={formatAccountType(formalization.bankData.accountType)}
                  />

                  <Detail label="Agência" value={formalization.bankData.branch} />

                  <Detail label="Conta" value={formalization.bankData.account} />

                  <Detail label="Titular" value={formalization.bankData.holderName} />

                  <Detail
                    label="Chave Pix"
                    value={formalization.bankData.pixKey || 'Não informada'}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-900">
                    Dados bancários ainda não recebidos.
                  </p>
                </div>
              )}

              <div className="mt-7 rounded-2xl border border-red-100 bg-red-50 p-5">
                <p className="text-sm font-semibold text-red-800">Dados financeiros restritos</p>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  Estas informações devem ser utilizadas somente para a conferência e execução da
                  operação. Não copie dados bancários para mensagens, planilhas ou logs.
                </p>
              </div>
            </Card>

            <Card title="Histórico da formalização">
              {formalization.statusHistory.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum evento registrado.</p>
              ) : (
                <div className="space-y-6">
                  {formalization.statusHistory.map((event) => (
                    <div key={event.id} className="border-l-2 border-blue-100 pl-5">
                      <p className="font-semibold text-[#071522]">
                        {formatFormalizationStatus(event.fromStatus)} →{' '}
                        {formatFormalizationStatus(event.toStatus)}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(event.createdAt)}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {event.actorName ? `Operador: ${event.actorName}` : 'Sistema'}
                      </p>

                      {event.reason && (
                        <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          {event.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <aside>
            <Card title="Ações da formalização">
              {formalization.status === 'PENDING' ? (
                <StatusMessage>Aguardando o cliente enviar os dados da conta.</StatusMessage>
              ) : formalization.status === 'BANK_DETAILS_SUBMITTED' ? (
                <>
                  <p className="text-sm leading-6 text-slate-600">
                    Confira cuidadosamente banco, agência, conta, titular e demais informações antes
                    de continuar.
                  </p>

                  <div className="mt-5">
                    <ConfirmReadyButton protocol={protocolLabel} />
                  </div>
                </>
              ) : formalization.status === 'READY_FOR_DISBURSEMENT' ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-semibold text-emerald-900">✓ Conferência concluída</p>

                  <p className="mt-2 text-sm leading-6 text-emerald-700">
                    Esta operação está pronta para seguir para a etapa de liberação.
                  </p>

                  {formalization.readyAt && (
                    <p className="mt-3 text-xs text-emerald-700">
                      Confirmada em {formatDateTime(formalization.readyAt)}
                    </p>
                  )}
                </div>
              ) : formalization.status === 'DISBURSED' ? (
                <StatusMessage>Crédito registrado como liberado.</StatusMessage>
              ) : (
                <StatusMessage>Esta formalização foi encerrada.</StatusMessage>
              )}
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold text-[#071522]">{title}</h2>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>

      <p className="mt-2 break-words font-medium text-slate-800">{value || '—'}</p>
    </div>
  );
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-5 text-sm font-medium leading-6 text-slate-600">
      {children}
    </div>
  );
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

function formatAccountType(value: string) {
  const labels: Record<string, string> = {
    CHECKING: 'Conta corrente',
    SAVINGS: 'Conta poupança',
    PAYMENT: 'Conta de pagamento',
  };

  return labels[value] ?? value;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Bahia',
  }).format(date);
}
