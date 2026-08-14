import Link from 'next/link';

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
        <section>
          <div className="mb-10">
            <p className="text-sm font-semibold text-blue-600">ETAPA 1 DE 5</p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/5 rounded-full bg-blue-600" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Vamos começar
            </p>

            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
              Conte um pouco sobre você.
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Precisamos de algumas informações para iniciar sua solicitação e dar continuidade ao
              processo de análise.
            </p>

            <form className="mt-10 grid gap-6">
              <div>
                <label htmlFor="nome" className="mb-2 block text-sm font-medium text-slate-700">
                  Nome completo
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  placeholder="Digite seu nome completo"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="mb-2 block text-sm font-medium text-slate-700">
                  CPF
                </label>

                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="nascimento"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Data de nascimento
                </label>

                <input
                  id="nascimento"
                  name="nascimento"
                  type="date"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="mt-4 rounded-xl bg-[#0b1f33] px-6 py-4 font-semibold text-white transition hover:bg-[#14324f]"
              >
                Continuar
              </button>
            </form>
          </div>
        </section>

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
