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
          <a
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            href="#como-funciona"
          >
            Como funciona
          </a>

          <a
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            href="#seguranca"
          >
            Segurança
          </a>

          <Link
            href="/acompanhar"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            Acompanhar
          </Link>

          <a
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
            href="#ajuda"
          >
            Ajuda
          </a>
        </nav>

        <Link
          href="/acompanhar"
          className="shrink-0 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:px-5"
        >
          <span className="sm:hidden">
            Acompanhar
          </span>

          <span className="hidden sm:inline">
            Acompanhar solicitação
          </span>
        </Link>
      </div>
    </header>
  );
}
