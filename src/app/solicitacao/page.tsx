import Link from 'next/link';

import { ApplicationWizard } from '@/components/application/application-wizard';
import { formatCurrency } from '@/lib/credit';

type SolicitationPageProps = {
  searchParams: Promise<{
    valor?: string;
    prazo?: string;
  }>;
};

export default async function SolicitationPage({ searchParams }: SolicitationPageProps) {
  const params = await searchParams;

  const amount = Number(params.valor) || 5000;
  const months = Number(params.prazo) || 12;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-[#0b1f33]">
            Smith Sterling
          </Link>

          <span className="text-sm font-medium text-slate-500">Solicitação de crédito</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_360px]">
        <ApplicationWizard amount={amount} months={months} />

        <aside>
          <div className="sticky top-8 rounded-3xl border border-slate-200 bg-white p-7">
            <p className="text-sm font-medium text-slate-500">Sua simulação</p>

            <div className="mt-6 border-b border-slate-200 pb-5">
              <p className="text-sm text-slate-500">Valor solicitado</p>

              <p className="mt-1 text-2xl font-semibold text-[#0b1f33]">{formatCurrency(amount)}</p>
            </div>

            <div className="py-5">
              <p className="text-sm text-slate-500">Prazo escolhido</p>

              <p className="mt-1 font-semibold text-slate-900">{months} meses</p>
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
