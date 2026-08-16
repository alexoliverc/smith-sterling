import Link from 'next/link';

export default function AdminApplicationNotFound() {
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
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Registro indisponível
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#071522]">
            Solicitação não localizada
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Não foi possível localizar uma operação disponível para este endereço. Retorne à fila operacional para continuar o atendimento.
          </p>

          <Link
            href="/admin/solicitacoes"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold !text-white hover:bg-blue-700"
          >
            Voltar para solicitações
          </Link>
        </div>
      </section>
    </main>
  );
}