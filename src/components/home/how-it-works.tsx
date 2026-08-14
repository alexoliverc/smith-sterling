const steps = [
  {
    number: '01',
    title: 'Faça sua simulação',
    description: 'Informe o valor desejado e veja uma estimativa inicial das condições.',
  },
  {
    number: '02',
    title: 'Preencha seus dados',
    description: 'Complete sua solicitação com as informações necessárias para análise.',
  },
  {
    number: '03',
    title: 'Acompanhe a análise',
    description: 'Veja o andamento da solicitação diretamente pela plataforma.',
  },
  {
    number: '04',
    title: 'Confira sua proposta',
    description: 'Caso exista uma oferta disponível, consulte as condições antes de decidir.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Como funciona
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33] md:text-5xl">
            Do pedido à proposta, sem complicação.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Uma jornada digital estruturada para que você entenda cada etapa da solicitação.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-7"
            >
              <span className="text-sm font-semibold text-blue-600">{step.number}</span>

              <h3 className="mt-8 text-xl font-semibold text-[#0b1f33]">{step.title}</h3>

              <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
