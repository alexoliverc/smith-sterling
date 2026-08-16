import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <div>
              <p className="font-semibold tracking-tight text-[#071522]">
                Smith Sterling
              </p>

              <p className="text-xs text-slate-500">
                Crédito com clareza
              </p>
            </div>
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl justify-center px-4 py-16 sm:px-6 md:py-24">
        <div className="w-full max-w-xl rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">
            404
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Página não encontrada
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#071522] md:text-4xl">
            Não encontramos este endereço
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            O endereço acessado não corresponde a uma página disponível. Confira o link ou escolha uma das opções abaixo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#071522] px-5 py-3 text-sm font-semibold !text-white"
            >
              Voltar ao início
            </Link>

            <Link
              href="/acompanhar"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Acompanhar solicitação
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}