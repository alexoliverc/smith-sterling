export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1f33] text-lg font-semibold text-white">
            S
          </div>

          <div>
            <p className="text-lg font-semibold tracking-tight text-[#0b1f33]">Smith Sterling</p>
            <p className="text-xs text-slate-500">Crédito simples. Decisão clara.</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
            href="#como-funciona"
          >
            Como funciona
          </a>

          <a className="text-sm font-medium text-slate-600 hover:text-slate-950" href="#seguranca">
            Segurança
          </a>

          <a className="text-sm font-medium text-slate-600 hover:text-slate-950" href="#ajuda">
            Ajuda
          </a>
        </nav>

        <button className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Entrar
        </button>
      </div>
    </header>
  );
}
