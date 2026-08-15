import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import type { FormalizationStatus } from '@/generated/prisma/client';
import { formatCurrency } from '@/lib/credit';
import { ADMIN_SESSION_COOKIE, findAdminSession } from '@/server/auth/admin-session';
import { getAdminFormalizationByProtocol } from '@/server/dal/admin-formalization';

import { ConfirmReadyButton } from './confirm-ready-button';
import { DisbursementForm } from './disbursement-form';

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

  const isHistoricalWithoutOffer =
    formalization.acceptedOfferId === null &&
    (formalization.status === 'DISBURSED' ||
      formalization.status === 'CANCELLED');

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
              Conferência, preparação e registro da liberação da operação.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>

            <p className="mt-2 font-semibold text-[#071522]">
              {formatFormalizationStatus(formalization.status)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Card title="Resumo da operação">
              <div className="grid gap-6 sm:grid-cols-3">
                <Detail label="Valor contratado" value={application.acceptedOffer ? formatCurrency(application.acceptedOffer.principalCents / 100) : 'Proposta aceita não localizada'} />

                <Detail label="Parcelas" value={application.acceptedOffer ? `${application.acceptedOffer.installmentCount} × ${formatCurrency(application.acceptedOffer.installmentCents / 100)}` : '—'} />

                <Detail label="Protocolo" value={protocolLabel} />
              </div>
            </Card>

            <Card title="Conta para recebimento">
              {formalization.bankData ? (
                <>
                  <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                    <Detail label="Banco" value={formalization.bankData.bankName} />

                    <Detail
                      label="Tipo da conta"
                      value={formatAccountType(formalization.bankData.accountType)}
                    />

                    <Detail
                      label="Agência"
                      value={maskFinancialValue(formalization.bankData.branch)}
                    />

                    <Detail
                      label="Conta"
                      value={maskFinancialValue(formalization.bankData.account)}
                    />

                    <Detail label="Titular" value={formalization.bankData.holderName} />

                    <Detail
                      label="Chave Pix"
                      value={
                        formalization.bankData.pixKey
                          ? maskFinancialValue(formalization.bankData.pixKey)
                          : 'Não informada'
                      }
                    />
                  </div>

                  <details className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <summary className="cursor-pointer text-sm font-semibold text-amber-900">
                      Mostrar dados completos para conferência
                    </summary>

                    <div className="mt-5 grid gap-x-8 gap-y-7 border-t border-amber-200 pt-5 md:grid-cols-2">
                      <Detail
                        label="Agência completa"
                        value={formalization.bankData.branch}
                      />

                      <Detail
                        label="Conta completa"
                        value={formalization.bankData.account}
                      />

                      <Detail
                        label="Chave Pix completa"
                        value={formalization.bankData.pixKey || 'Não informada'}
                      />
                    </div>

                    <p className="mt-5 text-xs leading-5 text-amber-800">
                      Revele estes dados somente durante a conferência ou execução da operação.
                    </p>
                  </details>
                </>
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
                  Utilize estas informações somente para conferência e execução da operação. Não
                  copie dados bancários para mensagens, planilhas ou logs.
                </p>
              </div>
            </Card>

            <Card title="Histórico da formalização">
              {formalization.statusHistory.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Nenhum evento de auditoria registrado.
                  </p>
                </div>
              ) : (
                <ol className="space-y-6">
                  {formalization.statusHistory.map(
                    (event, index) => {
                      const actor =
                        getFormalizationActorPresentation(
                          event.actorType,
                          event.actorName,
                        );

                      return (
                        <li
                          key={event.id}
                          className="relative pl-8"
                        >
                          {index <
                            formalization.statusHistory.length -
                              1 && (
                            <span
                              aria-hidden="true"
                              className="absolute left-[5px] top-5 h-[calc(100%+12px)] w-px bg-slate-200"
                            />
                          )}

                          <span
                            aria-hidden="true"
                            className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${actor.dotClassName}`}
                          />

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p
                              className={`text-sm font-semibold ${actor.className}`}
                            >
                              {actor.label}
                            </p>

                            <span className="text-xs text-slate-300">
                              ·
                            </span>

                            <time className="text-xs text-slate-400">
                              {formatDateTime(
                                event.createdAt,
                              )}
                            </time>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-[#071522]">
                            {formatFormalizationStatus(
                              event.fromStatus,
                            )}{' '}
                            →{' '}
                            {formatFormalizationStatus(
                              event.toStatus,
                            )}
                          </p>

                          {event.reason && (
                            <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                              {event.reason}
                            </p>
                          )}
                        </li>
                      );
                    },
                  )}
                </ol>
              )}
            </Card>
          </div>

          <aside>
            <Card title="Ações da formalização">
              {!application.acceptedOffer && !isHistoricalWithoutOffer ? (
                <StatusMessage>
                  A operação administrativa está bloqueada porque a proposta aceita vinculada à formalização não foi localizada.
                </StatusMessage>
              ) : formalization.status === 'PENDING' ? (
                <StatusMessage>Aguardando o cliente enviar os dados da conta.</StatusMessage>
              ) : formalization.status === 'BANK_DETAILS_SUBMITTED' ? (
                <>
                  <p className="text-sm leading-6 text-slate-600">
                    Confira cuidadosamente os dados da conta antes de preparar a operação para
                    liberação.
                  </p>

                  <div className="mt-5">
                    <ConfirmReadyButton protocol={protocolLabel} />
                  </div>
                </>
              ) : formalization.status === 'READY_FOR_DISBURSEMENT' ? (
                <>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <p className="font-semibold text-emerald-900">✓ Conferência concluída</p>

                    <p className="mt-2 text-sm leading-6 text-emerald-700">
                      A operação está pronta para liberação.
                    </p>

                    {formalization.readyAt && (
                      <p className="mt-3 text-xs text-emerald-700">
                        Confirmada em {formatDateTime(formalization.readyAt)}
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-[#071522]">Registrar liberação</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Preencha somente depois que a transferência tiver sido efetivamente realizada.
                    </p>

                    <div className="mt-5">
                      <DisbursementForm protocol={protocolLabel} />
                    </div>
                  </div>
                </>
              ) : formalization.status === 'DISBURSED' ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
                    ✓
                  </div>

                  <p className="mt-4 text-lg font-semibold text-emerald-950">Crédito liberado</p>

                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    A liberação financeira desta operação foi registrada como concluída.
                  </p>

                  {formalization.disbursedAt && (
                    <p className="mt-4 text-xs font-medium text-emerald-700">
                      Registrada em {formatDateTime(formalization.disbursedAt)}
                    </p>
                  )}
                </div>
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

function getFormalizationActorPresentation(
  actorType: 'SYSTEM' | 'OPERATOR' | 'APPLICANT',
  actorName: string | null,
) {
  switch (actorType) {
    case 'APPLICANT':
      return {
        label: 'Cliente',
        className: 'text-emerald-700',
        dotClassName: 'bg-emerald-500',
      };

    case 'OPERATOR':
      return {
        label: actorName
          ? `Operador · ${actorName}`
          : 'Operador',
        className: 'text-blue-700',
        dotClassName: 'bg-blue-500',
      };

    case 'SYSTEM':
    default:
      return {
        label: 'Sistema',
        className: 'text-slate-600',
        dotClassName: 'bg-slate-400',
      };
  }
}


function Card({ title, children }: { title: string; children: ReactNode }) {
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

function StatusMessage({ children }: { children: ReactNode }) {
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

function maskFinancialValue(
  value: string,
) {
  const normalized =
    value.trim();

  if (!normalized) {
    return 'Não informada';
  }

  const visibleCount =
    normalized.length <= 4
      ? 2
      : 4;

  const visible =
    normalized.slice(
      -visibleCount,
    );

  const hiddenLength =
    Math.max(
      4,
      normalized.length -
        visibleCount,
    );

  return '•'.repeat(hiddenLength) + visible;
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
