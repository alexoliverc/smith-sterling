import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { institution } from '@/config/institution';
import { getPublicCreditOfferForSession } from '@/server/dal/public-credit-offer';

import { OfferDecisionPanel } from './offer-decision-panel';

const PUBLIC_APPLICATION_COOKIE =
  'smith_application_session';

type PublicCreditOfferPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function PublicCreditOfferPage({
  params,
}: PublicCreditOfferPageProps) {
  const { protocol } =
    await params;

  const cookieStore =
    await cookies();

  const accessToken =
    cookieStore.get(
      PUBLIC_APPLICATION_COOKIE,
    )?.value;

  if (!accessToken) {
    redirect('/acompanhar');
  }

  const result =
    await getPublicCreditOfferForSession(
      protocol,
      accessToken,
    );

  if (!result) {
    redirect('/acompanhar');
  }

  if (!result.allowed) {
    redirect(
      `/solicitacao/${encodeURIComponent(
        protocol,
      )}/analise`,
    );
  }

  const offer =
    result.offer;

  const protocolLabel =
    result.application.protocol;

  if (!offer) {
    return (
      <PublicShell
        protocol={
          protocolLabel
        }
      >
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
            Proposta de crédito
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#071522]">
            Sua análise foi aprovada
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            As condições finais da proposta ainda estão sendo preparadas. Quando estiverem disponíveis, elas aparecerão nesta área para sua consulta antes de qualquer decisão.
          </p>

          <Link
            href={`/solicitacao/${encodeURIComponent(
              protocolLabel,
            )}/analise`}
            className="mt-6 inline-flex rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            Voltar ao acompanhamento
          </Link>
        </div>
      </PublicShell>
    );
  }

  const institutionalIdentityReady =
    !institution.document.isPlaceholder &&
    !institution.address.isPlaceholder &&
    !institution.support.emailIsPlaceholder;

  const effectivelyExpired =
    offer.status ===
      'PRESENTED' &&
    offer.expiresAt <=
      new Date();

  return (
    <PublicShell
      protocol={
        protocolLabel
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <div className="flex flex-col gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
                Sua proposta de crédito
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#071522] md:text-4xl">
                Confira as condições
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Versão{' '}
                {offer.version}
              </p>
            </div>

            <OfferStatusBadge
              status={
                effectivelyExpired
                  ? 'EXPIRED'
                  : offer.status
              }
            />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <HighlightCard
              label="Valor principal aprovado"
              value={formatMoney(
                offer.principalCents,
              )}
            />

            <HighlightCard
              label="Valor líquido a liberar"
              value={formatMoney(
                offer.netDisbursementCents,
              )}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#071522]">
              Pagamento
            </h2>

            <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <OfferRow
                label="Número de parcelas"
                value={String(
                  offer.installmentCount,
                )}
              />

              <OfferRow
                label="Valor da parcela"
                value={formatMoney(
                  offer.installmentCents,
                )}
              />

              <OfferRow
                label="Prazo da operação"
                value={`${offer.months} meses`}
              />

              <OfferRow
                label="Total da operação"
                value={formatMoney(
                  offer.totalRepaymentCents,
                )}
                strong
              />

              <OfferRow
                label="Primeiro vencimento"
                value={formatDate(
                  offer.firstDueDate,
                )}
              />
            </dl>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#071522]">
              Taxas e custos
            </h2>

            <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <OfferRow
                label="Taxa efetiva mensal"
                value={`${formatPercentage(
                  offer.monthlyRatePercent,
                )}% a.m.`}
              />

              <OfferRow
                label="Taxa efetiva anual"
                value={`${formatPercentage(
                  offer.annualRatePercent,
                )}% a.a.`}
              />

              <OfferRow
                label="CET anual"
                value={`${formatPercentage(
                  offer.cetAnnualPercent,
                )}% a.a.`}
                strong
              />

              <OfferRow
                label="IOF"
                value={formatMoney(
                  offer.iofCents,
                )}
              />

              <OfferRow
                label="Outros encargos"
                value={formatMoney(
                  offer.otherFeesCents,
                )}
              />
            </dl>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#071522]">
              Composição do CET
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-600">
                {offer.cetCompositionDescription ??
                  'O detalhamento da composição do CET não está disponível nesta versão histórica da proposta.'}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#071522]">
              Atraso e inadimplemento
            </h2>

            <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              <OfferRow
                label="Juros de mora"
                value={
                  offer.lateInterestMonthlyPercent !== null
                    ? `${formatPercentage(
                        offer.lateInterestMonthlyPercent,
                      )}% a.m.`
                    : 'Não informado nesta versão'
                }
              />

              <OfferRow
                label="Multa por atraso"
                value={
                  offer.latePenaltyPercent !== null
                    ? `${formatPercentage(
                        offer.latePenaltyPercent,
                      )}%`
                    : 'Não informado nesta versão'
                }
              />
            </dl>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Outros encargos de atraso
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {offer.lateOtherChargesDescription ??
                    'Não informado nesta versão histórica da proposta.'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Consequências do inadimplemento
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {offer.defaultConsequences ??
                    'Não informado nesta versão histórica da proposta.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-950">
              Liquidação antecipada
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              Você poderá liquidar antecipadamente o débito, total ou parcialmente, com a redução proporcional dos juros e demais acréscimos aplicáveis, conforme a legislação e as condições da operação.
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#071522]">
              Identificação da credora
            </h2>

            {institutionalIdentityReady ? (
              <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                <p className="font-semibold text-[#071522]">
                  {institution.legalName}
                </p>

                <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                  <p>
                    CNPJ: {institution.document.value}
                  </p>

                  <p>
                    Endereço: {institution.address.value}
                  </p>

                  <p>
                    Contato eletrônico: {institution.support.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="font-semibold text-amber-950">
                  Dados institucionais ainda não configurados para produção
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Esta instalação ainda utiliza dados institucionais provisórios. CNPJ, endereço e contato oficiais deverão ser configurados antes da disponibilização comercial da plataforma.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Condições apresentadas
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {offer.termsVersion}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Confira todos os valores e condições exibidos nesta página antes de registrar sua decisão.
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Validade da proposta
            </p>

            <p className="mt-3 text-2xl font-semibold text-[#071522]">
              {formatDate(
                offer.expiresAt,
              )}
            </p>

            {offer.presentedAt && (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Apresentada em{' '}
                {formatDateTime(
                  offer.presentedAt,
                )}
              </p>
            )}
          </section>

          {offer.status ===
            'PRESENTED' &&
          !effectivelyExpired ? (
            <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#071522]">
                Sua decisão
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Analise as condições antes de escolher se deseja continuar com a contratação.
              </p>

              <div className="mt-6">
                <OfferDecisionPanel
                  protocol={
                    protocolLabel
                  }
                  version={
                    offer.version
                  }
                />
              </div>
            </section>
          ) : offer.status ===
            'ACCEPTED' ? (
            <DecisionResult
              title="Proposta aceita"
              description="Seu aceite foi registrado. Você pode continuar para a formalização da operação."
              tone="success"
            >
              <Link
                href={`/solicitacao/${encodeURIComponent(
                  protocolLabel,
                )}/formalizacao`}
                className="mt-5 flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold !text-white"
              >
                <span>
                  Continuar formalização
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </DecisionResult>
          ) : offer.status ===
            'DECLINED' ? (
            <DecisionResult
              title="Proposta recusada"
              description="Sua decisão foi registrada. Esta proposta não seguirá para contratação."
              tone="neutral"
            />
          ) : (
            <DecisionResult
              title={
                effectivelyExpired ||
                offer.status ===
                  'EXPIRED'
                  ? 'Proposta expirada'
                  : 'Proposta indisponível'
              }
              description={
                effectivelyExpired ||
                offer.status ===
                  'EXPIRED'
                  ? 'O prazo de validade desta proposta foi encerrado.'
                  : 'Esta versão da proposta não está mais disponível para decisão.'
              }
              tone="warning"
            />
          )}

          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm font-semibold text-[#071522]">
              Importante
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Você não precisa informar senha bancária, token, código SMS ou credenciais de acesso ao banco para consultar ou aceitar esta proposta.
            </p>
          </section>
        </aside>
      </div>
    </PublicShell>
  );
}

function PublicShell({
  protocol,
  children,
}: {
  protocol: string;
  children:
    React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <div>
              <p className="font-semibold text-[#071522]">
                Smith Sterling
              </p>

              <p className="text-xs text-slate-500">
                Área do cliente
              </p>
            </div>
          </Link>

          <Link
            href={`/solicitacao/${encodeURIComponent(
              protocol,
            )}/analise`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Acompanhamento
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-8">
          <p className="font-mono text-xs text-slate-400">
            Protocolo{' '}
            {protocol}
          </p>
        </div>

        {children}
      </section>
    </main>
  );
}

function HighlightCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-blue-50 p-5">
      <p className="text-sm text-blue-700">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#071522]">
        {value}
      </p>
    </div>
  );
}

function OfferRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <dt className="text-sm text-slate-500">
        {label}
      </dt>

      <dd
        className={
          strong
            ? 'text-right text-sm font-bold text-[#071522]'
            : 'text-right text-sm font-semibold text-slate-700'
        }
      >
        {value}
      </dd>
    </div>
  );
}

function DecisionResult({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description: string;
  tone:
    | 'success'
    | 'warning'
    | 'neutral';
  children?:
    React.ReactNode;
}) {
  const classes = {
    success:
      'border-emerald-200 bg-emerald-50',
    warning:
      'border-amber-200 bg-amber-50',
    neutral:
      'border-slate-200 bg-white',
  };

  return (
    <section
      className={`rounded-3xl border p-6 ${classes[tone]}`}
    >
      <h2 className="text-lg font-semibold text-[#071522]">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

      {children}
    </section>
  );
}

function OfferStatusBadge({
  status,
}: {
  status: string;
}) {
  const presentations: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    PRESENTED: {
      label:
        'Disponível para decisão',
      className:
        'bg-blue-50 text-blue-700',
    },

    ACCEPTED: {
      label:
        'Aceita',
      className:
        'bg-emerald-50 text-emerald-700',
    },

    DECLINED: {
      label:
        'Recusada',
      className:
        'bg-slate-100 text-slate-600',
    },

    EXPIRED: {
      label:
        'Expirada',
      className:
        'bg-amber-50 text-amber-700',
    },

    CANCELLED: {
      label:
        'Substituída',
      className:
        'bg-slate-100 text-slate-500',
    },

    DRAFT: {
      label:
        'Em preparação',
      className:
        'bg-slate-100 text-slate-600',
    },
  };

  const presentation =
    presentations[status] ??
    presentations.DRAFT;

  return (
    <span
      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}

function formatMoney(
  cents: number,
) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(cents / 100);
}

function formatPercentage(
  value: unknown,
) {
  const number =
    Number(String(value));

  if (
    !Number.isFinite(number)
  ) {
    return String(value);
  }

  return new Intl.NumberFormat(
    'pt-BR',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    },
  ).format(number);
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
