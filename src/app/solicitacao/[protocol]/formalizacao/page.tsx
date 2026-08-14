import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { formatCurrency } from '@/lib/credit';
import { getFormalizationForSession } from '@/server/dal/credit-formalization';

const APPLICATION_SESSION_COOKIE = 'smith_application_session';

type FormalizationPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function FormalizationPage({ params }: FormalizationPageProps) {
  const { protocol } = await params;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get(APPLICATION_SESSION_COOKIE)?.value;

  if (!accessToken) {
    redirect('/solicitacao');
  }

  const result = await getFormalizationForSession(protocol, accessToken);

  if (!result) {
    notFound();
  }

  if (!result.allowed) {
    redirect(`/solicitacao/${encodeURIComponent(protocol)}/analise`);
  }

  const { application, formalization } = result;

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <div>
              <p className="font-semibold tracking-tight text-[#071522]">Smith Sterling</p>

              <p className="text-xs text-slate-500">Formalização de crédito</p>
            </div>
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Protocolo
            </p>

            <p className="mt-1 font-mono text-sm font-semibold text-[#071522]">{protocol}</p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                Crédito aprovado
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-[#071522] md:text-4xl">
                Vamos formalizar sua operação
              </h1>

              <p className="mt-4 leading-7 text-slate-600">
                Sua análise de crédito foi concluída. Agora precisamos concluir as etapas
                necessárias para preparar a operação para liberação.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Status
              </p>

              <p className="mt-2 font-semibold text-emerald-950">
                {formatFormalizationStatus(formalization.status)}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Protocolo" value={protocol} mono />

            <SummaryCard label="Valor aprovado" value={formatCurrency(application.amount)} />

            <SummaryCard label="Prazo" value={`${application.months} meses`} />
          </div>

          <div className="mt-10 border-t border-slate-200 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
              Próxima etapa
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#071522]">
              Conta para recebimento
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Na próxima etapa você informará os dados da conta destinada ao recebimento do crédito.
            </p>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  i
                </div>

                <div>
                  <p className="font-semibold text-[#071522]">
                    Seus dados bancários serão protegidos
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    As informações financeiras serão tratadas no servidor e armazenadas de forma
                    protegida. Não envie senha, token bancário ou código de autenticação.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="mt-7 w-full cursor-not-allowed rounded-xl bg-slate-100 px-5 py-4 text-sm font-semibold text-slate-400 sm:w-auto sm:min-w-64"
            >
              Informar conta bancária
            </button>

            <p className="mt-3 text-xs text-slate-400">
              O formulário será habilitado na próxima etapa.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-[#071522]">Importante</p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nunca informe senha bancária, código de segurança, token, código recebido por SMS ou
            credenciais de acesso ao seu banco.
          </p>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>

      <p
        className={`mt-2 break-words font-semibold text-[#071522] ${
          mono ? 'font-mono text-sm' : 'text-lg'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatFormalizationStatus(
  status:
    'PENDING' | 'BANK_DETAILS_SUBMITTED' | 'READY_FOR_DISBURSEMENT' | 'DISBURSED' | 'CANCELLED',
) {
  const labels = {
    PENDING: 'Aguardando formalização',

    BANK_DETAILS_SUBMITTED: 'Dados bancários recebidos',

    READY_FOR_DISBURSEMENT: 'Pronta para liberação',

    DISBURSED: 'Crédito liberado',

    CANCELLED: 'Formalização encerrada',
  };

  return labels[status];
}
