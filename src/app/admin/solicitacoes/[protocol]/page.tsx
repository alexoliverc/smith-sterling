import Link from 'next/link';

import { AdminHeader } from '@/components/admin/admin-header';
import { AdminOperationNav } from '@/components/admin/operation-nav';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import type {
  AdminRole,
  ApplicationStatus,
  ApplicationStatusActor,
} from '@/generated/prisma/client';

import { getApplicationStatusPresentation } from '@/lib/application-status';
import { formatCurrency } from '@/lib/credit';
import {
  ADMIN_SESSION_COOKIE,
  findAdminSession,
} from '@/server/auth/admin-session';
import { getAdminApplicationByProtocol } from '@/server/dal/admin-applications';

import { DecisionPanel } from './decision-panel';
import { StartAnalysisButton } from './start-analysis-button';

type AdminApplicationPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

type AdminApplication =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getAdminApplicationByProtocol
      >
    >
  >;

export default async function AdminApplicationPage({
  params,
}: AdminApplicationPageProps) {
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
    await getAdminApplicationByProtocol(
      protocol,
    );

  if (!application) {
    notFound();
  }

  const statusPresentation =
    getApplicationStatusPresentation(
      application.status,
    );

  const protocolLabel =
    application.publicProtocol ??
    protocol;

  const operationalState =
    getOperationalState(
      application,
    );

  return (
    <main className="min-h-screen bg-slate-50">
      <AdminHeader
        userName={session.user.name}
        roleLabel={formatRole(session.user.role)}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
        <Link
          href="/admin/solicitacoes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          ← Voltar para solicitações
        </Link>

        <AdminOperationNav
          protocol={protocolLabel}
          current="application"
          offerAvailable={
            session.user.role === 'SUPER_ADMIN' &&
            application.status === 'APPROVED'
          }
          formalizationAvailable={
            session.user.role === 'SUPER_ADMIN' &&
            application.formalization !== null
          }
        />

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Operação de crédito
            </p>

            <h1 className="mt-3 font-mono text-3xl font-semibold tracking-[-0.03em] text-[#0b1f33] md:text-4xl">
              {protocolLabel}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-slate-500">
              Cockpit interno da análise, proposta, formalização e estágio operacional da solicitação.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm lg:w-auto lg:min-w-52">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Status da análise
            </p>

            <div className="mt-3">
              <StatusBadge
                status={
                  application.status
                }
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {
                statusPresentation.eyebrow
              }
            </p>
          </div>
        </div>

        <div className="mt-8">
          <OperationalOverview
            application={
              application
            }
            protocol={
              protocolLabel
            }
            role={
              session.user.role
            }
            state={
              operationalState
            }
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <Card
              title="Resumo da operação"
              description="Condições solicitadas pelo cliente."
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Detail
                  label="Valor solicitado"
                  value={formatCurrency(
                    application.amount,
                  )}
                />

                <Detail
                  label="Prazo"
                  value={`${application.months} meses`}
                />

                <Detail
                  label="Recebida em"
                  value={formatDateTime(
                    application.submittedAt ??
                      application.createdAt,
                  )}
                />

                <Detail
                  label="Última atualização"
                  value={formatDateTime(
                    application.updatedAt,
                  )}
                />
              </div>
            </Card>

            {application.applicant ? (
              <>
                <Card
                  title="Dados cadastrais"
                  description="Informações de identificação e contato fornecidas na solicitação."
                >
                  <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                    <Detail
                      label="Nome completo"
                      value={
                        application.applicant
                          .name
                      }
                    />

                    <Detail
                      label="CPF"
                      value={formatCpf(
                        application.applicant
                          .cpf,
                      )}
                    />

                    <Detail
                      label="Data de nascimento"
                      value={formatBirthDate(
                        application.applicant
                          .birthDate,
                      )}
                    />

                    <Detail
                      label="Telefone"
                      value={
                        application.applicant
                          .phone
                      }
                    />

                    <Detail
                      label="E-mail"
                      value={
                        application.applicant
                          .email
                      }
                    />
                  </div>
                </Card>

                <Card
                  title="Endereço residencial"
                  description="Endereço declarado pelo solicitante."
                >
                  <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                    <Detail
                      label="CEP"
                      value={
                        application.applicant
                          .address.cep
                      }
                    />

                    <Detail
                      label="Logradouro"
                      value={
                        application.applicant
                          .address.street
                      }
                    />

                    <Detail
                      label="Número"
                      value={
                        application.applicant
                          .address.number
                      }
                    />

                    <Detail
                      label="Complemento"
                      value={
                        application.applicant
                          .address.complement
                      }
                    />

                    <Detail
                      label="Bairro"
                      value={
                        application.applicant
                          .address.neighborhood
                      }
                    />

                    <Detail
                      label="Cidade / UF"
                      value={formatCityState(
                        application.applicant
                          .address.city,

                        application.applicant
                          .address.state,
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
                      value={formatEmploymentType(
                        application.applicant
                          .employment
                          .employmentType,
                      )}
                    />

                    <Detail
                      label="Profissão / ocupação"
                      value={
                        application.applicant
                          .employment.occupation
                      }
                    />

                    <Detail
                      label="Renda mensal declarada"
                      value={
                        application.applicant
                          .income
                      }
                    />
                  </div>
                </Card>
              </>
            ) : (
              <Card
                title="Dados cadastrais"
                description="Informações protegidas do solicitante."
              >
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-medium text-amber-800">
                    Dados cadastrais não encontrados.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-700">
                    Esta solicitação não possui um registro ApplicantData associado.
                  </p>
                </div>
              </Card>
            )}
          </div>

          <aside className="space-y-6">
            <Card
              title="Histórico da análise"
              description="Trilha auditável do ciclo de vida da solicitação."
            >
              {application.statusHistory
                .length === 0 ? (
                <p className="text-sm leading-6 text-slate-500">
                  Nenhum evento de status registrado.
                </p>
              ) : (
                <div className="space-y-0">
                  {application.statusHistory.map(
                    (event, index) => (
                      <div
                        key={event.id}
                        className="relative pb-8 pl-7 last:pb-0"
                      >
                        {index !==
                          application
                            .statusHistory
                            .length -
                            1 && (
                          <div className="absolute bottom-0 left-[5px] top-3 w-px bg-slate-200" />
                        )}

                        <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100" />

                        <p className="text-sm font-semibold text-[#0b1f33]">
                          {formatStatus(
                            event.fromStatus,
                          )}

                          <span className="mx-2 text-slate-300">
                            →
                          </span>

                          {formatStatus(
                            event.toStatus,
                          )}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatDateTime(
                            event.createdAt,
                          )}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {formatActor(
                              event.actorType,
                            )}
                          </span>

                          {event.actorName && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                              Operador:{' '}
                              {
                                event.actorName
                              }
                            </span>
                          )}
                        </div>

                        {event.reason && (
                          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                            {event.reason}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </Card>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-[#0b1f33]">
                Dados protegidos
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                As informações cadastrais desta página são descriptografadas somente no servidor após a validação da sessão administrativa.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Decisão de crédito
              </p>

              <h2 className="mt-3 text-lg font-semibold text-[#0b1f33]">
                Ações da análise
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Estas ações controlam somente a etapa de análise de crédito.
              </p>

              <div className="mt-5">
                {application.status ===
                'SUBMITTED' ? (
                  <StartAnalysisButton
                    protocol={
                      protocolLabel
                    }
                  />
                ) : application.status ===
                  'UNDER_REVIEW' ? (
                  session.user.role ===
                  'SUPER_ADMIN' ? (
                    <DecisionPanel
                      protocol={
                        protocolLabel
                      }
                    />
                  ) : (
                    <RestrictedMessage>
                      A decisão final está restrita a um super administrador.
                    </RestrictedMessage>
                  )
                ) : application.status ===
                  'APPROVED' ? (
                  <StatusMessage tone="success">
                    A análise de crédito foi concluída com aprovação.
                  </StatusMessage>
                ) : application.status ===
                  'REJECTED' ? (
                  <StatusMessage tone="danger">
                    Solicitação não aprovada.
                  </StatusMessage>
                ) : application.status ===
                  'CANCELLED' ? (
                  <RestrictedMessage>
                    Esta solicitação foi encerrada.
                  </RestrictedMessage>
                ) : (
                  <RestrictedMessage>
                    Nenhuma ação de análise disponível.
                  </RestrictedMessage>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function OperationalOverview({
  application,
  protocol,
  role,
  state,
}: {
  application: AdminApplication;
  protocol: string;
  role: AdminRole;
  state: OperationalState;
}) {
  const offer =
    getOfferPresentation(
      application,
    );

  const formalization =
    getFormalizationPresentation(
      application,
    );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Jornada operacional
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#071522]">
            Visão geral da operação
          </h2>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${state.className}`}
        >
          {state.label}
        </span>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <JourneyStep
          number="1"
          title="Análise"
          label={
            formatStatus(
              application.status,
            )
          }
          description={
            getAnalysisDescription(
              application.status,
            )
          }
          tone={
            application.status ===
              'APPROVED'
              ? 'success'
              : application.status ===
                  'REJECTED' ||
                application.status ===
                  'CANCELLED'
                ? 'neutral'
                : 'active'
          }
        />

        <JourneyStep
          number="2"
          title="Proposta"
          label={offer.label}
          description={
            offer.description
          }
          tone={offer.tone}
        />

        <JourneyStep
          number="3"
          title="Formalização"
          label={
            formalization.label
          }
          description={
            formalization.description
          }
          tone={
            formalization.tone
          }
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Próxima ação
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-[#071522]">
              {state.actionTitle}
            </p>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {
                state.actionDescription
              }
            </p>
          </div>

          {role ===
            'SUPER_ADMIN' &&
            state.actionHref &&
            state.actionLabel && (
              <Link
                href={
                  state.actionHref(
                    protocol,
                  )
                }
                className="group flex shrink-0 items-center justify-between gap-6 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-blue-700"
              >
                <span className="!text-white">
                  {
                    state.actionLabel
                  }
                </span>

                <span
                  aria-hidden="true"
                  className="!text-white"
                >
                  →
                </span>
              </Link>
            )}
        </div>
      </div>
    </section>
  );
}

type OperationalTone =
  | 'neutral'
  | 'active'
  | 'success'
  | 'warning'
  | 'danger';

type OperationalState = {
  label: string;
  className: string;

  actionTitle: string;
  actionDescription: string;

  actionLabel?: string;

  actionHref?: (
    protocol: string,
  ) => string;
};

function getOperationalState(
  application: AdminApplication,
): OperationalState {
  if (
    application.status ===
    'SUBMITTED'
  ) {
    return {
      label:
        'Aguardando análise',

      className:
        'bg-blue-50 text-blue-700',

      actionTitle:
        'Iniciar análise de crédito',

      actionDescription:
        'A solicitação foi recebida e ainda precisa entrar em análise.',
    };
  }

  if (
    application.status ===
    'UNDER_REVIEW'
  ) {
    return {
      label:
        'Em análise',

      className:
        'bg-amber-50 text-amber-700',

      actionTitle:
        'Concluir análise',

      actionDescription:
        'A solicitação está em análise e aguarda uma decisão de crédito.',
    };
  }

  if (
    application.status ===
    'REJECTED'
  ) {
    return {
      label:
        'Não aprovada',

      className:
        'bg-red-50 text-red-700',

      actionTitle:
        'Operação encerrada',

      actionDescription:
        'A análise foi concluída sem aprovação e nenhuma formalização foi iniciada.',
    };
  }

  if (
    application.status ===
    'CANCELLED'
  ) {
    return {
      label:
        'Cancelada',

      className:
        'bg-slate-100 text-slate-600',

      actionTitle:
        'Operação encerrada',

      actionDescription:
        'A solicitação foi cancelada.',
    };
  }

  if (
    application.status !==
    'APPROVED'
  ) {
    return {
      label:
        'Rascunho',

      className:
        'bg-slate-100 text-slate-600',

      actionTitle:
        'Nenhuma ação disponível',

      actionDescription:
        'Esta solicitação ainda não entrou no fluxo operacional.',
    };
  }

  const formalization =
    application.formalization;

  if (formalization) {
    switch (
      formalization.status
    ) {
      case 'PENDING':
        return {
          label:
            'Aguardando dados bancários',

          className:
            'bg-amber-50 text-amber-700',

          actionTitle:
            'Aguardar dados bancários do cliente',

          actionDescription:
            'A proposta foi aceita e a formalização está aguardando o envio da conta de recebimento.',

          actionLabel:
            'Abrir formalização',

          actionHref:
            formalizationUrl,
        };

      case 'BANK_DETAILS_SUBMITTED':
        return {
          label:
            'Dados bancários recebidos',

          className:
            'bg-blue-50 text-blue-700',

          actionTitle:
            'Conferir dados bancários',

          actionDescription:
            'Os dados da conta foram enviados e precisam ser conferidos antes de preparar a liberação.',

          actionLabel:
            'Abrir formalização',

          actionHref:
            formalizationUrl,
        };

      case 'READY_FOR_DISBURSEMENT':
        return {
          label:
            'Pronta para liberação',

          className:
            'bg-violet-50 text-violet-700',

          actionTitle:
            'Registrar liberação após a transferência',

          actionDescription:
            'A conferência foi concluída. Registre a liberação somente depois que a transferência externa tiver sido efetivamente realizada.',

          actionLabel:
            'Abrir formalização',

          actionHref:
            formalizationUrl,
        };

      case 'DISBURSED':
        return {
          label:
            'Crédito liberado',

          className:
            'bg-emerald-50 text-emerald-700',

          actionTitle:
            'Operação concluída',

          actionDescription:
            'O sistema registra que o operador confirmou a realização externa da transferência.',

          actionLabel:
            'Consultar formalização',

          actionHref:
            formalizationUrl,
        };

      case 'CANCELLED':
        return {
          label:
            'Formalização encerrada',

          className:
            'bg-slate-100 text-slate-600',

          actionTitle:
            'Operação encerrada',

          actionDescription:
            'A formalização desta operação foi cancelada.',

          actionLabel:
            'Consultar formalização',

          actionHref:
            formalizationUrl,
        };
    }
  }

  if (
    application.acceptedOffer
  ) {
    return {
      label:
        'Inconsistência operacional',

      className:
        'bg-red-50 text-red-700',

      actionTitle:
        'Formalização ausente após aceite',

      actionDescription:
        'Existe uma proposta aceita, mas não existe uma formalização associada. Verifique a auditoria antes de prosseguir.',

      actionLabel:
        'Abrir proposta',

      actionHref:
        offerUrl,
    };
  }

  switch (
    application.latestOffer
      ?.effectiveStatus
  ) {
    case 'PRESENTED':
      return {
        label:
          'Aguardando aceite',

        className:
          'bg-blue-50 text-blue-700',

        actionTitle:
          'Aguardar decisão do cliente',

        actionDescription:
          `A versão ${application.latestOffer.version} está disponível para aceite ou recusa pelo cliente.`,

        actionLabel:
          'Abrir proposta',

        actionHref:
          offerUrl,
      };

    case 'DECLINED':
      return {
        label:
          'Proposta recusada',

        className:
          'bg-slate-100 text-slate-600',

        actionTitle:
          'Avaliar nova proposta',

        actionDescription:
          `O cliente recusou a versão ${application.latestOffer.version}. Uma nova versão pode ser criada se a operação continuar elegível.`,

        actionLabel:
          'Criar nova proposta',

        actionHref:
          offerUrl,
      };

    case 'EXPIRED':
      return {
        label:
          'Proposta expirada',

        className:
          'bg-amber-50 text-amber-700',

        actionTitle:
          'Publicar nova proposta',

        actionDescription:
          `A validade da versão ${application.latestOffer.version} terminou. Uma nova versão pode ser preparada.`,

        actionLabel:
          'Criar nova proposta',

        actionHref:
          offerUrl,
      };

    case 'ACCEPTED':
      return {
        label:
          'Inconsistência operacional',

        className:
          'bg-red-50 text-red-700',

        actionTitle:
          'Formalização ausente após aceite',

        actionDescription:
          'A proposta está marcada como aceita, mas a formalização correspondente não foi encontrada.',

        actionLabel:
          'Abrir proposta',

        actionHref:
          offerUrl,
      };

    case 'CANCELLED':
    case 'DRAFT':
    case null:
    case undefined:
    default:
      return {
        label:
          'Criar proposta',

        className:
          'bg-orange-50 text-orange-700',

        actionTitle:
          'Criar e publicar proposta',

        actionDescription:
          'A análise foi aprovada, mas ainda não existe uma proposta ativa para apresentação ao cliente.',

        actionLabel:
          'Criar proposta',

        actionHref:
          offerUrl,
      };
  }
}

function JourneyStep({
  number,
  title,
  label,
  description,
  tone,
}: {
  number: string;
  title: string;
  label: string;
  description: string;
  tone: OperationalTone;
}) {
  const presentation =
    getJourneyTonePresentation(
      tone,
    );

  return (
    <div
      className={`rounded-2xl border p-5 ${presentation.container}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${presentation.number}`}
        >
          {number}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </p>
      </div>

      <p
        className={`mt-4 font-semibold ${presentation.label}`}
      >
        {label}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function getJourneyTonePresentation(
  tone: OperationalTone,
) {
  switch (tone) {
    case 'success':
      return {
        container:
          'border-emerald-200 bg-emerald-50/50',

        number:
          'bg-emerald-600 text-white',

        label:
          'text-emerald-900',
      };

    case 'active':
      return {
        container:
          'border-blue-200 bg-blue-50/50',

        number:
          'bg-blue-600 text-white',

        label:
          'text-blue-900',
      };

    case 'warning':
      return {
        container:
          'border-amber-200 bg-amber-50/50',

        number:
          'bg-amber-500 text-white',

        label:
          'text-amber-900',
      };

    case 'danger':
      return {
        container:
          'border-red-200 bg-red-50/50',

        number:
          'bg-red-600 text-white',

        label:
          'text-red-900',
      };

    case 'neutral':
    default:
      return {
        container:
          'border-slate-200 bg-slate-50',

        number:
          'bg-slate-300 text-slate-700',

        label:
          'text-slate-700',
      };
  }
}

function getOfferPresentation(
  application: AdminApplication,
): {
  label: string;
  description: string;
  tone: OperationalTone;
} {
  if (
    application.status !==
    'APPROVED'
  ) {
    return {
      label:
        'Não iniciada',

      description:
        'A proposta só é criada depois da aprovação da análise.',

      tone:
        'neutral',
    };
  }

  if (
    application.acceptedOffer
  ) {
    return {
      label:
        `Aceita · versão ${application.acceptedOffer.version}`,

      description:
        application.acceptedOffer
          .acceptedAt
          ? `Aceite registrado em ${formatDateTime(
              application.acceptedOffer
                .acceptedAt,
            )}.`
          : 'Aceite registrado pelo cliente.',

      tone:
        'success',
    };
  }

  const offer =
    application.latestOffer;

  switch (
    offer?.effectiveStatus
  ) {
    case 'PRESENTED':
      return {
        label:
          `Aguardando aceite · versão ${offer.version}`,

        description:
          `Proposta válida até ${formatDateTime(
            offer.expiresAt,
          )}.`,

        tone:
          'active',
      };

    case 'DECLINED':
      return {
        label:
          `Recusada · versão ${offer.version}`,

        description:
          offer.declinedAt
          ? `Recusada em ${formatDateTime(
              offer.declinedAt,
            )}.`
          : 'O cliente recusou esta versão.',

        tone:
          'neutral',
      };

    case 'EXPIRED':
      return {
        label:
          `Expirada · versão ${offer.version}`,

        description:
          `A validade terminou em ${formatDateTime(
            offer.expiresAt,
          )}.`,

        tone:
          'warning',
      };

    case 'CANCELLED':
      return {
        label:
          `Cancelada · versão ${offer.version}`,

        description:
          'Esta versão não está mais disponível para decisão.',

        tone:
          'neutral',
      };

    case 'ACCEPTED':
      return {
        label:
          `Aceita · versão ${offer.version}`,

        description:
          'O aceite foi registrado.',

        tone:
          'success',
      };

    case 'DRAFT':
      return {
        label:
          `Rascunho · versão ${offer.version}`,

        description:
          'Esta versão ainda não está disponível ao cliente.',

        tone:
          'neutral',
      };

    default:
      return {
        label:
          'Ainda não criada',

        description:
          'Nenhuma proposta foi publicada para esta solicitação.',

        tone:
          'neutral',
      };
  }
}

function getFormalizationPresentation(
  application: AdminApplication,
): {
  label: string;
  description: string;
  tone: OperationalTone;
} {
  const formalization =
    application.formalization;

  if (!formalization) {
    return {
      label:
        'Ainda não iniciada',

      description:
        application.acceptedOffer
          ? 'O aceite existe, mas a formalização correspondente não foi encontrada.'
          : 'A formalização começa somente depois do aceite da proposta.',

      tone:
        application.acceptedOffer
          ? 'danger'
          : 'neutral',
    };
  }

  switch (
    formalization.status
  ) {
    case 'PENDING':
      return {
        label:
          'Aguardando dados bancários',

        description:
          'O cliente ainda precisa informar a conta para recebimento.',

        tone:
          'active',
      };

    case 'BANK_DETAILS_SUBMITTED':
      return {
        label:
          'Dados bancários recebidos',

        description:
          formalization
            .bankDataSubmittedAt
            ? `Recebidos em ${formatDateTime(
                formalization
                  .bankDataSubmittedAt,
              )}.`
            : 'Os dados da conta foram enviados.',

        tone:
          'active',
      };

    case 'READY_FOR_DISBURSEMENT':
      return {
        label:
          'Pronta para liberação',

        description:
          formalization.readyAt
          ? `Conferência concluída em ${formatDateTime(
              formalization.readyAt,
            )}.`
          : 'A conferência dos dados foi concluída.',

        tone:
          'success',
      };

    case 'DISBURSED':
      return {
        label:
          'Crédito liberado',

        description:
          formalization.disbursedAt
          ? `Liberação registrada em ${formatDateTime(
              formalization.disbursedAt,
            )}.`
          : 'A liberação foi registrada como concluída.',

        tone:
          'success',
      };

    case 'CANCELLED':
      return {
        label:
          'Encerrada',

        description:
          formalization.cancelledAt
          ? `Formalização encerrada em ${formatDateTime(
              formalization.cancelledAt,
            )}.`
          : 'A formalização foi encerrada.',

        tone:
          'neutral',
      };
  }
}

function getAnalysisDescription(
  status: ApplicationStatus,
) {
  switch (status) {
    case 'DRAFT':
      return 'A solicitação ainda não foi enviada.';

    case 'SUBMITTED':
      return 'A solicitação foi recebida e aguarda início da análise.';

    case 'UNDER_REVIEW':
      return 'A análise de crédito está em andamento.';

    case 'APPROVED':
      return 'A análise foi concluída com aprovação.';

    case 'REJECTED':
      return 'A análise foi concluída sem aprovação.';

    case 'CANCELLED':
      return 'A solicitação foi cancelada.';
  }
}

function offerUrl(
  protocol: string,
) {
  return `/admin/solicitacoes/${encodeURIComponent(
    protocol,
  )}/oferta`;
}

function formalizationUrl(
  protocol: string,
) {
  return `/admin/solicitacoes/${encodeURIComponent(
    protocol,
  )}/formalizacao`;
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
        <h2 className="text-xl font-semibold text-[#0b1f33]">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      <div className="mt-7">
        {children}
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words font-medium leading-6 text-slate-800">
        {value || '—'}
      </p>
    </div>
  );
}

function StatusMessage({
  children,
  tone,
}: {
  children: ReactNode;
  tone:
    | 'success'
    | 'danger';
}) {
  const className =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700';

  return (
    <div
      className={`rounded-xl border px-4 py-3.5 text-center text-sm font-semibold leading-6 ${className}`}
    >
      {children}
    </div>
  );
}

function RestrictedMessage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-100 px-4 py-3.5 text-center text-sm font-medium leading-6 text-slate-600">
      {children}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const presentation =
    getStatusBadgePresentation(
      status,
    );

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}

function getStatusBadgePresentation(
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

function formatBirthDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value.split('-');

  if (
    !year ||
    !month ||
    !day
  ) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatCpf(
  value: string,
) {
  const cpf =
    value.replace(
      /\D/g,
      '',
    );

  if (
    cpf.length !==
    11
  ) {
    return value;
  }

  return `${cpf.slice(
    0,
    3,
  )}.${cpf.slice(
    3,
    6,
  )}.${cpf.slice(
    6,
    9,
  )}-${cpf.slice(9)}`;
}

function formatCityState(
  city: string,
  state: string,
) {
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

function formatEmploymentType(
  value: string,
) {
  const labels: Record<
    string,
    string
  > = {
    clt:
      'Empregado CLT',

    autonomo:
      'Autônomo',

    empresario:
      'Empresário',

    servidor:
      'Servidor público',

    aposentado:
      'Aposentado / Pensionista',

    outro:
      'Outro',
  };

  return labels[value] ??
    value;
}

function formatStatus(
  status: ApplicationStatus,
) {
  const labels: Record<
    ApplicationStatus,
    string
  > = {
    DRAFT:
      'Rascunho',

    SUBMITTED:
      'Recebida',

    UNDER_REVIEW:
      'Em análise',

    APPROVED:
      'Aprovada',

    REJECTED:
      'Não aprovada',

    CANCELLED:
      'Cancelada',
  };

  return labels[status];
}

function formatActor(
  actor:
    ApplicationStatusActor,
) {
  switch (actor) {
    case 'SYSTEM':
      return 'Sistema';

    case 'OPERATOR':
      return 'Operador';

    case 'APPLICANT':
      return 'Cliente';
  }
}

function formatRole(
  role: AdminRole,
) {
  return role ===
    'SUPER_ADMIN'
    ? 'Super administrador'
    : 'Analista';
}
