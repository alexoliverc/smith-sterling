import Link from 'next/link';

const protections = [
  {
    number: '01',
    title: 'Condições antes da decisão',
    description:
      'Quando uma proposta estiver disponível, você poderá consultar valores, parcelas, taxas, CET, encargos, vencimentos e demais condições antes de aceitar ou recusar.',
  },
  {
    number: '02',
    title: 'Suas credenciais são pessoais',
    description:
      'A plataforma não solicita senha bancária, senha do aplicativo do banco, token de autenticação, código recebido por SMS, CVV ou credenciais de internet banking para consultar ou formalizar uma proposta.',
  },
  {
    number: '03',
    title: 'Nada de pagamento para liberar crédito',
    description:
      'Não faça depósito, Pix ou pagamento antecipado com a promessa de desbloquear, autorizar ou liberar os recursos de uma operação.',
  },
  {
    number: '04',
    title: 'A decisão continua sendo sua',
    description:
      'Receber uma proposta não obriga a contratação. Você poderá analisar as condições e registrar seu aceite ou sua recusa pela plataforma.',
  },
];

export function Security() {
  return (
    <section
      id="seguranca"
      className="relative overflow-hidden bg-[#0b1f33] py-24 text-white"
    >
      <div
        aria-hidden="true"
        className="absolute -right-52 top-0 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-60 left-20 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">
              Segurança e transparência
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
              Crédito exige clareza. Segurança também.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A jornada da Smith Sterling foi estruturada para separar análise, proposta, decisão e formalização, deixando claro o que acontece em cada etapa.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-lg text-emerald-300">
                ✓
              </div>

              <div>
                <p className="font-semibold text-white">
                  Regra importante
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Nunca compartilhe senhas ou códigos de autenticação e nunca faça um pagamento destinado apenas a liberar um crédito.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {protections.map((item) => (
            <article
              key={item.number}
              className="group rounded-3xl border border-white/10 bg-white/[0.045] p-7 transition hover:border-blue-300/30 hover:bg-white/[0.07]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-300">
                  Proteção {item.number}
                </span>

                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm text-slate-400 transition group-hover:border-blue-300/30 group-hover:text-blue-300"
                >
                  ✓
                </span>
              </div>

              <h3 className="mt-7 text-xl font-semibold tracking-[-0.02em] text-white">
                {item.title}
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-9">
          <div>
            <p className="text-lg font-semibold text-white">
              Recebeu um contato suspeito?
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Confira os canais oficiais antes de compartilhar dados ou realizar qualquer ação relacionada à sua solicitação.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contato"
              className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-[#0b1f33] transition hover:bg-blue-50"
            >
              Central de atendimento
            </Link>

            <Link
              href="/privacidade"
              className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Privacidade
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 text-xs leading-5 text-slate-400">
          <span
            aria-hidden="true"
            className="mt-0.5 text-blue-300"
          >
            •
          </span>

          <p>
            Produtos ou serviços adicionais eventualmente apresentados devem possuir condições próprias e ser tratados separadamente da decisão sobre a proposta de crédito.
          </p>
        </div>
      </div>
    </section>
  );
}
