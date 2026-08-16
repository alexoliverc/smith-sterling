'use client';

import Link from 'next/link';

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  reset,
}: ErrorPageProps) {
  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-xl font-bold text-amber-700">
            !
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
            Instabilidade temporária
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#071522]">
            Não foi possível carregar esta página
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Ocorreu uma falha inesperada. Nenhum detalhe técnico é necessário para continuar: tente carregar novamente ou retorne ao início.
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
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}