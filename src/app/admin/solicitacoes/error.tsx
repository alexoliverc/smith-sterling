'use client';

import Link from 'next/link';

type AdminErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function AdminApplicationsError({
  reset,
}: AdminErrorProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-[#071522]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <Link
            href="/admin/solicitacoes"
            className="flex w-fit items-center gap-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f33]">
              SS
            </div>

            <div>
              <p className="font-semibold !text-white">
                Smith Sterling
              </p>

              <p className="text-xs !text-slate-400">
                Backoffice de crédito
              </p>
            </div>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
        <div className="rounded-3xl border border-amber-200 bg-white p-7 shadow-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Contingência operacional
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#071522]">
            Não foi possível carregar o backoffice
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Ocorreu uma falha inesperada durante o carregamento desta área. Tente novamente antes de repetir qualquer ação operacional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="min-h-12 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Tentar novamente
            </button>

            <Link
              href="/admin/solicitacoes"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Voltar para a fila
            </Link>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-500">
            Antes de repetir uma decisão, publicação ou liberação, confirme o estado atual da operação.
          </p>
        </div>
      </section>
    </main>
  );
}