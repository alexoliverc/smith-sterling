import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b1f33] text-lg font-semibold text-white">
            S
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-[#0b1f33]">
              Smith Sterling
            </p>

            <p className="hidden text-xs text-slate-500 sm:block">
              Crédito simples. Decisão clara.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link
            href="/#como-funciona"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Como funciona
          </Link>

          <Link
            href="/#seguranca"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Segurança
          </Link>

          <Link
            href="/sobre"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Sobre
          </Link>

          <Link
            href="/contato"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Contato
          </Link>

          <Link
            href="/acompanhar"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Acompanhar
          </Link>
        </nav>

        <Link
          href="/solicitacao"
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5"
        >
          <span className="sm:hidden">
            Solicitar
          </span>

          <span className="hidden sm:inline">
            Solicitar crédito
          </span>
        </Link>
      </div>
    </header>
  );
}
