import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  notFound,
  redirect,
} from 'next/navigation';

import { AdminLogoutButton } from '@/components/admin/logout-button';
import {
  ADMIN_SESSION_COOKIE,
  findAdminSession,
} from '@/server/auth/admin-session';
import { getAdminCreditOfferWorkspace } from '@/server/dal/admin-credit-offers';

import { CreditOfferForm } from './offer-form';

type AdminCreditOfferPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

type CreditOfferWorkspace =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getAdminCreditOfferWorkspace
      >
    >
  >;

type OfferAuditEvent =
  CreditOfferWorkspace['offers'][number]['statusHistory'][number];

export default async function AdminCreditOfferPage({
  params,
}: AdminCreditOfferPageProps) {
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

  const { protocol } =
    await params;

  const application =
    await getAdminCreditOfferWorkspace(
      protocol,
    );

  if (!application) {
    notFound();
  }

  if (
    application.status !==
    'APPROVED'
  ) {
    redirect(
      `/admin/solicitacoes/${encodeURIComponent(
        protocol,
      )}`,
    );
  }

  if (
    session.user.role !==
    'SUPER_ADMIN'
  ) {
    redirect(
      `/admin/solicitacoes/${encodeURIComponent(
        protocol,
      )}`,
    );
  }

  const protocolLabel =
    application.publicProtocol ??
    protocol;

  const acceptedOffer =
    application.offers.find(
      (offer) =>
        offer.status ===
        'ACCEPTED',
    ) ?? null;

  const hasPublishedOffers =
    application.offers.length > 0;

  let pageTitle =
    'Criar e publicar proposta';

  let pageDescription =
    'Defina as condições financeiras que serão apresentadas ao cliente após a aprovação da análise de crédito.';

  let sectionTitle =
    'Condições da nova proposta';

  let sectionDescription =
    'A primeira proposta publicada será registrada como versão 1 e ficará disponível para decisão do cliente.';

  if (hasPublishedOffers) {
    pageTitle =
      'Criar nova versão da proposta';

    pageDescription =
      'Revise as condições antes de publicar uma nova versão para decisão do cliente.';

    sectionTitle =
      'Condições da nova versão';

    sectionDescription =
      'Os campos abaixo criam uma nova versão. A versão apresentada anteriormente será encerrada conforme as regras da operação.';
  }

  if (acceptedOffer) {
    pageTitle =
      'Proposta aceita pelo cliente';

    pageDescription =
      'A proposta aceita encerrou a etapa de negociação desta operação.';

    sectionTitle =
      'Condições da proposta aceita';

    sectionDescription =
      'As condições da versão aceita estão fechadas e nenhuma nova versão pode ser publicada.';
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#071522]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f33]">
              SS
            </div>

            <div>
              <p className="font-semibold text-white">
                Smith Sterling
              </p>

              <p className="text-xs text-slate-400">
                Backoffice de crédito
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {session.user.name}
              </p>

              <p className="text-xs text-slate-400">
                Super administrador
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
        <Link
          href={`/admin/solicitacoes/${encodeURIComponent(
            protocolLabel,
          )}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          ← Voltar para a solicitação
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
            Oferta de crédito
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#071522] md:text-4xl">
            {pageTitle}
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            {pageDescription}
          </p>

          <p className="mt-3 font-mono text-sm text-slate-400">
            {protocolLabel}
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div>
              <h2 className="text-xl font-semibold text-[#071522]">
                {sectionTitle}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {sectionDescription}
              </p>
            </div>

            <div className="mt-8">
              {acceptedOffer ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                  <p className="text-sm font-semibold text-emerald-900">
                    Proposta aceita pelo cliente
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    A versão {acceptedOffer.version} foi aceita. As condições da operação estão fechadas e uma nova proposta não pode ser publicada.
                  </p>
                </div>
              ) : (
                <CreditOfferForm
                  protocol={protocolLabel}
                  requestedAmount={
                    application.amount
                  }
                  requestedMonths={
                    application.months
                  }
                />
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Solicitação original
              </p>

              <div className="mt-5">
                <p className="text-sm text-slate-500">
                  Valor solicitado
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#071522]">
                  {formatMoneyFromReais(
                    application.amount,
                  )}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-sm text-slate-500">
                  Prazo solicitado
                </p>

                <p className="mt-1 text-lg font-semibold text-[#071522]">
                  {application.months}{' '}
                  meses
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-sm text-slate-500">
                  Status da análise
                </p>

                <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  Aprovada
                </span>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Histórico
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-[#071522]">
                    Versões publicadas
                  </h2>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {application.offers.length}
                </span>
              </div>

              {application.offers.length ===
              0 ? (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-700">
                    Nenhuma proposta publicada.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    A primeira versão aparecerá aqui depois da publicação.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {application.offers.map(
                    (offer) => (
                      <article
                        key={offer.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-[#071522]">
                              Versão{' '}
                              {
                                offer.version
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDateTime(
                                offer.presentedAt ??
                                  offer.createdAt,
                              )}
                            </p>
                          </div>

                          <OfferStatusBadge
                            status={
                              offer.status
                            }
                          />
                        </div>

                        <dl className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                          <OfferDetail
                            label="Valor aprovado"
                            value={formatMoneyFromCents(
                              offer.principalCents,
                            )}
                          />

                          <OfferDetail
                            label="Valor líquido"
                            value={formatMoneyFromCents(
                              offer.netDisbursementCents,
                            )}
                          />

                          <OfferDetail
                            label="Parcelas"
                            value={`${offer.installmentCount} × ${formatMoneyFromCents(
                              offer.installmentCents,
                            )}`}
                          />

                          <OfferDetail
                            label="Total"
                            value={formatMoneyFromCents(
                              offer.totalRepaymentCents,
                            )}
                          />

                          <OfferDetail
                            label="Taxa mensal"
                            value={`${formatPercentage(
                              offer.monthlyRatePercent,
                            )}% a.m.`}
                          />

                          <OfferDetail
                            label="CET"
                            value={`${formatPercentage(
                              offer.cetAnnualPercent,
                            )}% a.a.`}
                          />

                          <OfferDetail
                            label="Validade"
                            value={formatDate(
                              offer.expiresAt,
                            )}
                          />

                          <OfferDetail
                            label="Termos"
                            value={
                              offer.termsVersion
                            }
                          />
                        </dl>

                        <OfferAuditTimeline
                          events={
                            offer.statusHistory
                          }
                        />
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>

            {acceptedOffer ? (
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Próxima etapa
                </p>

                <h2 className="mt-2 text-lg font-semibold text-emerald-950">
                  Formalização liberada
                </h2>

                <p className="mt-3 text-sm leading-6 text-emerald-800">
                  O cliente aceitou a versão {acceptedOffer.version} da proposta. A operação pode seguir para a formalização.
                </p>

                <Link
                  href={`/admin/solicitacoes/${encodeURIComponent(
                    protocolLabel,
                  )}/formalizacao`}
                  className="group mt-5 flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold !text-white shadow-sm transition hover:bg-blue-700"
                >
                  <span className="!text-white">
                    Abrir formalização
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-lg !text-white"
                  >
                    →
                  </span>
                </Link>
              </section>
            ) : (
              <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Formalização
                </p>

                <h2 className="mt-2 text-lg font-semibold text-[#071522]">
                  Aguardando aceite
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  A formalização ficará disponível somente depois que o cliente aceitar uma proposta válida.
                </p>
              </section>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function OfferAuditTimeline({
  events,
}: {
  events: OfferAuditEvent[];
}) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Auditoria
          </p>

          <h3 className="mt-1 text-sm font-semibold text-[#071522]">
            Histórico da versão
          </h3>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          {events.length}{' '}
          {events.length === 1
            ? 'evento'
            : 'eventos'}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs leading-5 text-slate-500">
            Nenhum evento de auditoria registrado para esta versão.
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-5">
          {events.map(
            (event, index) => {
              const actor =
                getOfferActorPresentation(
                  event,
                );

              return (
                <li
                  key={event.id}
                  className="relative pl-6"
                >
                  {index <
                    events.length -
                      1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[5px] top-4 h-[calc(100%+8px)] w-px bg-slate-200"
                    />
                  )}

                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ${actor.dotClassName}`}
                  />

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p
                      className={`text-xs font-semibold ${actor.className}`}
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

                  <p className="mt-1 text-xs font-semibold text-slate-700">
                    {formatOfferStatus(
                      event.fromStatus,
                    )}{' '}
                    →{' '}
                    {formatOfferStatus(
                      event.toStatus,
                    )}
                  </p>

                  {event.reason && (
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {event.reason}
                    </p>
                  )}
                </li>
              );
            },
          )}
        </ol>
      )}
    </div>
  );
}

function getOfferActorPresentation(
  event: OfferAuditEvent,
) {
  switch (event.actorType) {
    case 'OPERATOR':
      return {
        label:
          event.actorName
            ? `Operador · ${event.actorName}`
            : 'Operador',

        className:
          'text-blue-700',

        dotClassName:
          'bg-blue-500',
      };

    case 'APPLICANT':
      return {
        label:
          'Cliente',

        className:
          'text-emerald-700',

        dotClassName:
          'bg-emerald-500',
      };

    case 'SYSTEM':
    default:
      return {
        label:
          'Sistema',

        className:
          'text-slate-600',

        dotClassName:
          'bg-slate-400',
      };
  }
}

function formatOfferStatus(
  status: string,
) {
  switch (status) {
    case 'DRAFT':
      return 'Rascunho';

    case 'PRESENTED':
      return 'Apresentada';

    case 'ACCEPTED':
      return 'Aceita';

    case 'DECLINED':
      return 'Recusada';

    case 'EXPIRED':
      return 'Expirada';

    case 'CANCELLED':
      return 'Cancelada';

    default:
      return status;
  }
}


function OfferDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-xs text-slate-500">
        {label}
      </dt>

      <dd className="text-right text-xs font-semibold text-slate-700">
        {value}
      </dd>
    </div>
  );
}

function OfferStatusBadge({
  status,
}: {
  status: string;
}) {
  const presentation =
    getOfferStatusPresentation(
      status,
    );

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}

function getOfferStatusPresentation(
  status: string,
) {
  switch (status) {
    case 'PRESENTED':
      return {
        label: 'Apresentada',
        className:
          'bg-blue-50 text-blue-700',
      };

    case 'ACCEPTED':
      return {
        label: 'Aceita',
        className:
          'bg-emerald-50 text-emerald-700',
      };

    case 'DECLINED':
      return {
        label: 'Recusada',
        className:
          'bg-red-50 text-red-700',
      };

    case 'EXPIRED':
      return {
        label: 'Expirada',
        className:
          'bg-amber-50 text-amber-700',
      };

    case 'CANCELLED':
      return {
        label: 'Cancelada',
        className:
          'bg-slate-100 text-slate-500',
      };

    default:
      return {
        label: 'Rascunho',
        className:
          'bg-slate-100 text-slate-600',
      };
  }
}

function formatMoneyFromReais(
  value: number,
) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(value);
}

function formatMoneyFromCents(
  value: number,
) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(value / 100);
}

function formatPercentage(
  value: unknown,
) {
  const parsed =
    Number(String(value));

  if (
    !Number.isFinite(parsed)
  ) {
    return String(value);
  }

  return new Intl.NumberFormat(
    'pt-BR',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    },
  ).format(parsed);
}

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeZone:
        'America/Bahia',
    },
  ).format(date);
}

function formatDateTime(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone:
        'America/Bahia',
    },
  ).format(date);
}
