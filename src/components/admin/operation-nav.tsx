import Link from 'next/link';

type OperationSection =
  | 'application'
  | 'offer'
  | 'formalization';

type AdminOperationNavProps = {
  protocol: string;
  current: OperationSection;
  offerAvailable: boolean;
  formalizationAvailable: boolean;
};

type NavItem = {
  key: OperationSection;
  label: string;
  href: string;
  available: boolean;
};

export function AdminOperationNav({
  protocol,
  current,
  offerAvailable,
  formalizationAvailable,
}: AdminOperationNavProps) {
  const encodedProtocol =
    encodeURIComponent(protocol);

  const items: NavItem[] = [
    {
      key: 'application',
      label: 'Solicitação',
      href: `/admin/solicitacoes/${encodedProtocol}`,
      available: true,
    },
    {
      key: 'offer',
      label: 'Proposta',
      href: `/admin/solicitacoes/${encodedProtocol}/oferta`,
      available: offerAvailable,
    },
    {
      key: 'formalization',
      label: 'Formalização',
      href: `/admin/solicitacoes/${encodedProtocol}/formalizacao`,
      available: formalizationAvailable,
    },
  ];

  return (
    <nav
      aria-label="Navegação da operação"
      className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        {items.map((item) => {
          const active =
            item.key === current;

          if (active) {
            return (
              <span
                key={item.key}
                aria-current="page"
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#071522] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {item.label}
              </span>
            );
          }

          if (!item.available) {
            return (
              <span
                key={item.key}
                aria-disabled="true"
                className="flex min-h-11 cursor-not-allowed items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-medium text-slate-300"
              >
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}