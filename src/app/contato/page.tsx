import type { Metadata } from 'next';
import Link from 'next/link';

import {
  InstitutionalDataNotice,
} from '@/components/layout/institutional-data-notice';

import {
  InstitutionalPage,
} from '@/components/layout/institutional-page';

import {
  institution,
} from '@/config/institution';

export const metadata: Metadata = {
  title:
    'Contato e atendimento | Smith Sterling',

  description:
    'Acompanhamento, atendimento, privacidade e orientações de segurança da Smith Sterling.',
};

export default function ContactPage() {
  const supportEmail =
    institution.support.emailIsPlaceholder
      ? null
      : institution.support.email;

  const supportPhone =
    institution.support.phoneIsPlaceholder
      ? null
      : institution.support.phone;

  const supportHours =
    institution.support.hoursIsPlaceholder
      ? null
      : institution.support.hours;

  const privacyEmail =
    institution.privacy.emailIsPlaceholder
      ? null
      : institution.privacy.email;

  return (
    <InstitutionalPage
      eyebrow="Atendimento"
      title="Como podemos ajudar?"
      description="Encontre os canais adequados para acompanhar uma solicitação, falar com a Smith Sterling ou tratar de assuntos relacionados à privacidade e segurança."
    >
      <div className="space-y-8">
        <InstitutionalDataNotice />

        <div className="grid gap-6 lg:grid-cols-2">
          <ContactCard
            eyebrow="Já sou cliente"
            title="Acompanhar solicitação"
            description="Consulte o andamento da sua solicitação, proposta e formalização utilizando a área segura de acompanhamento."
          >
            <Link
              href="/acompanhar"
              className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Acompanhar solicitação
            </Link>
          </ContactCard>

          <ContactCard
            eyebrow="Atendimento geral"
            title="Fale com a Smith Sterling"
            description="Utilize somente os canais oficiais publicados nesta página."
          >
            {supportEmail ||
            supportPhone ||
            supportHours ? (
              <dl className="space-y-3 text-sm">
                {supportEmail && (
                  <ContactRow
                    label="E-mail"
                    value={supportEmail}
                  />
                )}

                {supportPhone && (
                  <ContactRow
                    label="Telefone / WhatsApp"
                    value={supportPhone}
                  />
                )}

                {supportHours && (
                  <ContactRow
                    label="Horário"
                    value={supportHours}
                  />
                )}
              </dl>
            ) : (
              <UnavailableChannel />
            )}
          </ContactCard>

          <ContactCard
            eyebrow="Privacidade e LGPD"
            title="Proteção de dados"
            description="Para solicitações relacionadas a dados pessoais, privacidade e exercício de direitos, utilize o canal específico de proteção de dados."
          >
            {privacyEmail ? (
              <div>
                <p className="text-sm font-semibold text-[#0b1f33]">
                  {privacyEmail}
                </p>

                <Link
                  href="/privacidade"
                  className="mt-4 inline-flex text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Consultar Política de Privacidade →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <UnavailableChannel />

                <Link
                  href="/privacidade"
                  className="inline-flex text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Consultar Política de Privacidade →
                </Link>
              </div>
            )}
          </ContactCard>

          <ContactCard
            eyebrow="Segurança"
            title="Proteja seus dados e seu dinheiro"
            description="Desconfie de contatos que solicitem informações ou pagamentos incompatíveis com o processo oficial."
          >
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              <SecurityItem>
                Nunca informe senha bancária, senha de aplicativo financeiro ou credenciais de internet banking.
              </SecurityItem>

              <SecurityItem>
                Nunca informe código recebido por SMS, token de autenticação ou código do aplicativo do banco.
              </SecurityItem>

              <SecurityItem>
                Nunca informe CVV ou senha do cartão para consultar, aceitar ou formalizar uma proposta.
              </SecurityItem>

              <SecurityItem>
                Não realize depósito, Pix ou pagamento antecipado destinado a desbloquear, autorizar ou liberar um crédito.
              </SecurityItem>

              <SecurityItem>
                Seguro ou outro serviço adicional não deve ser apresentado como condição obrigatória para liberar os recursos.
              </SecurityItem>
            </ul>
          </ContactCard>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <p className="font-semibold text-[#0b1f33]">
            Recebeu um contato em nome da Smith Sterling?
          </p>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Antes de compartilhar dados ou realizar qualquer ação financeira, confirme se o canal utilizado está listado oficialmente nesta página. Enquanto os canais estiverem em configuração, nenhum contato externo deve ser considerado oficial apenas por utilizar o nome ou a identidade visual da Smith Sterling.
          </p>
        </div>
      </div>
    </InstitutionalPage>
  );
}

function ContactCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#0b1f33]">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

function ContactRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="font-medium text-slate-500">
        {label}
      </dt>

      <dd className="font-semibold text-[#0b1f33] sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function UnavailableChannel() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">
        Canal em configuração
      </p>

      <p className="mt-1 text-xs leading-5 text-amber-800">
        Os dados oficiais serão publicados antes da disponibilização comercial da plataforma.
      </p>
    </div>
  );
}

function SecurityItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700"
      >
        ✓
      </span>

      <span>
        {children}
      </span>
    </li>
  );
}
