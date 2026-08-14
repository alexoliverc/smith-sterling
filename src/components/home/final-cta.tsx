import Link from 'next/link';

export function FinalCta() {
  return (
    <section className="bg-[#f7f8fa] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-white px-7 py-12 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 md:px-12 md:py-16 lg:px-16">
          <div
            aria-hidden="true"
            className="absolute -right-28 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-40 left-20 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
                Próximo passo
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-[#0b1f33] md:text-5xl">
                Comece pela simulação. Decida no seu tempo.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Veja uma estimativa inicial e, se quiser continuar, envie sua solicitação. Uma eventual proposta será apresentada separadamente para sua análise e decisão.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/#simulador"
                  className="rounded-xl bg-blue-600 px-7 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Fazer uma simulação
                </Link>

                <Link
                  href="/acompanhar"
                  className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Acompanhar solicitação
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Antes de continuar
              </p>

              <div className="mt-6 space-y-5">
                <CtaItem>
                  A simulação inicial é apenas ilustrativa.
                </CtaItem>

                <CtaItem>
                  O envio da solicitação não garante aprovação.
                </CtaItem>

                <CtaItem>
                  Uma proposta, quando disponível, poderá ser aceita ou recusada.
                </CtaItem>

                <CtaItem>
                  Nenhum pagamento antecipado deve ser realizado para liberar crédito.
                </CtaItem>
              </div>

              <Link
                href="/contato"
                className="mt-7 inline-flex text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Precisa de ajuda? Acesse o atendimento →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700"
      >
        ✓
      </span>

      <p className="text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}
