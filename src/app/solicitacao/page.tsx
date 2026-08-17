import { FunnelEventBeacon } from '@/components/analytics/funnel-event-beacon';
import { FUNNEL_EVENTS } from '@/lib/analytics/funnel-events';
import Link from 'next/link';

import {
  ApplicationWizard,
} from '@/components/application/application-wizard';

import {
  formatCurrency,
} from '@/lib/credit';

type SolicitationPageProps = {
  searchParams: Promise<{
    valor?: string;
    prazo?: string;
  }>;
};

const DEFAULT_AMOUNT = 5000;
const DEFAULT_MONTHS = 12;

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 10000;

const MIN_MONTHS = 3;
const MAX_MONTHS = 24;

function normalizeIntegerParameter(
  value: string | undefined,
  {
    minimum,
    maximum,
    fallback,
  }: {
    minimum: number;
    maximum: number;
    fallback: number;
  },
) {
  if (!value) {
    return fallback;
  }

  /*
   * Aceitamos somente a representação
   * decimal inteira esperada pela URL.
   *
   * Isso evita coerções como:
   * "5000.5", "5e3", "0x10" etc.
   */
  if (!/^\d+$/.test(value)) {
    return fallback;
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < minimum ||
    parsed > maximum
  ) {
    return fallback;
  }

  return parsed;
}

export default async function SolicitationPage({
  searchParams,
}: SolicitationPageProps) {
  const params =
    await searchParams;

  const amount =
    normalizeIntegerParameter(
      params.valor,
      {
        minimum:
          MIN_AMOUNT,

        maximum:
          MAX_AMOUNT,

        fallback:
          DEFAULT_AMOUNT,
      },
    );

  const months =
    normalizeIntegerParameter(
      params.prazo,
      {
        minimum:
          MIN_MONTHS,

        maximum:
          MAX_MONTHS,

        fallback:
          DEFAULT_MONTHS,
      },
    );

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-[#0b1f33]"
          >
            Smith Sterling
          </Link>

          <span className="text-sm font-medium text-slate-500">
            Solicitação de crédito
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <FunnelEventBeacon
          event={FUNNEL_EVENTS.applicationStart}
          parameters={{
            funnel_stage: 'application_start',
          }}
        />
        <ApplicationWizard
          amount={amount}
          months={months}
        />

        <aside>
          <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-7">
            <p className="text-sm font-medium text-slate-500">
              Sua simulação
            </p>

            <div className="mt-6 border-b border-slate-200 pb-5">
              <p className="text-sm text-slate-500">
                Valor solicitado
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#0b1f33]">
                {formatCurrency(
                  amount,
                )}
              </p>
            </div>

            <div className="py-5">
              <p className="text-sm text-slate-500">
                Prazo escolhido
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {months} meses
              </p>
            </div>

            <Link
              href="/#simulador"
              className="mt-2 block text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Alterar simulação
            </Link>

            <p className="mt-7 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-400">
              A simulação não representa aprovação ou contratação definitiva.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
