const steps = [
  {
    number: '01',
    title: 'Faça uma simulação',
    description:
      'Escolha um valor e um prazo para visualizar uma estimativa inicial. A simulação não representa aprovação ou oferta de crédito.',
  },
  {
    number: '02',
    title: 'Envie sua solicitação',
    description:
      'Preencha os dados necessários para registrar seu pedido e permitir o início da análise.',
  },
  {
    number: '03',
    title: 'Acompanhe a análise',
    description:
      'Consulte o andamento pela área do cliente enquanto sua solicitação é analisada.',
  },
  {
    number: '04',
    title: 'Confira sua proposta',
    description:
      'Se houver uma proposta disponível, consulte valores, parcelas, taxas, CET, encargos, vencimentos e demais condições antes de decidir.',
  },
  {
    number: '05',
    title: 'Aceite ou recuse',
    description:
      'A decisão é sua. Uma proposta apresentada não obriga a contratação e pode ser recusada diretamente pela plataforma.',
  },
  {
    number: '06',
    title: 'Conclua a formalização',
    description:
      'Depois do aceite de uma proposta válida, siga para as etapas necessárias à formalização da operação.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
              Como funciona
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33] md:text-5xl">
              Você acompanha cada etapa antes de decidir.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Da primeira simulação à formalização, a jornada foi estruturada para deixar claro o que acontece em cada momento.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-[#0b1f33]">
              Aprovação não significa contratação automática
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Mesmo após uma análise aprovada, você poderá consultar as condições de uma eventual proposta antes de aceitar ou recusar.
            </p>
          </div>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-8 hidden h-px bg-slate-200 lg:block"
          />

          <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="group rounded-3xl border border-slate-200 bg-[#f8fafc] p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-sm font-bold text-blue-600 shadow-sm">
                    {step.number}
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-xl text-slate-300 transition group-hover:text-blue-500"
                  >
                    →
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-semibold tracking-[-0.02em] text-[#0b1f33]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#0b1f33] px-7 py-7 text-white sm:flex-row sm:items-center md:px-9">
          <div>
            <p className="font-semibold">
              Quer começar?
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-300">
              Faça uma simulação inicial e avance somente se desejar continuar.
            </p>
          </div>

          <a
            href="#simulador"
            className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0b1f33] transition hover:bg-blue-50"
          >
            Fazer simulação
          </a>
        </div>
      </div>
    </section>
  );
}
