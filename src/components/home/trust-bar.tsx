import Link from 'next/link';

const items = [
  {
    label: 'Solicitação 100% digital',
  },
  {
    label: 'Processo simples e transparente',
  },
  {
    label: 'Acompanhamento online',
  },
  {
    label: 'Central de atendimento',
    href: '/contato',
  },
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 lg:grid-cols-4 lg:px-8">
        {items.map((item) => {
          const content = (
            <>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                ✓
              </div>

              <span className="text-sm font-medium text-slate-600">
                {item.label}
              </span>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-xl transition hover:bg-slate-50"
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={item.label}
              className="flex items-center gap-3"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
