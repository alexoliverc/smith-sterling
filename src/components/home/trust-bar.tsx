export function TrustBar() {
  const items = [
    'Solicitação 100% digital',
    'Processo simples e transparente',
    'Acompanhamento online',
    'Atendimento ao cliente',
  ];

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
              ✓
            </div>

            <span className="text-sm font-medium text-slate-600">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
