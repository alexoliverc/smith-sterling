export function Security() {
  return (
    <section id="seguranca" className="bg-[#0b1f33] py-24 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
            Confiança em cada etapa
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Clareza antes de qualquer decisão.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Nossa experiência digital é desenhada para apresentar as etapas, informações e condições
            de maneira objetiva.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Condições apresentadas com clareza</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Informações organizadas para facilitar a compreensão antes da contratação.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Jornada digital acompanhável</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              O cliente pode acompanhar as principais etapas da solicitação.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold">Decisão sempre do cliente</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              A apresentação de uma proposta não obriga a contratação.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
