import Link from 'next/link';

export function Footer() {
  return (
    <footer
      id="ajuda"
      className="border-t border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="text-xl font-semibold tracking-tight text-[#0b1f33]">
              Smith Sterling
            </p>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              Tecnologia e simplicidade para uma nova experiência de crédito.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Institucional
            </p>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <Link
                href="/sobre"
                className="transition hover:text-slate-900"
              >
                Sobre nós
              </Link>

              <Link
                href="/#como-funciona"
                className="transition hover:text-slate-900"
              >
                Como funciona
              </Link>

              <Link
                href="/contato"
                className="transition hover:text-slate-900"
              >
                Contato
              </Link>

              <Link
                href="/acompanhar"
                className="transition hover:text-slate-900"
              >
                Acompanhar solicitação
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Legal
            </p>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <Link
                href="/privacidade"
                className="transition hover:text-slate-900"
              >
                Política de Privacidade
              </Link>

              <Link
                href="/termos"
                className="transition hover:text-slate-900"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-sm text-slate-400">
          © {new Date().getFullYear()} Smith Sterling. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
