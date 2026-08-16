'use client';

import Link from 'next/link';

type GlobalErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalError({
  reset,
}: GlobalErrorProps) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4 py-16">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              Smith Sterling
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#071522]">
              Serviço temporariamente indisponível
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              Não foi possível carregar a aplicação neste momento. Tente novamente ou retorne à página inicial.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="min-h-12 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
              >
                Tentar novamente
              </button>

              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}