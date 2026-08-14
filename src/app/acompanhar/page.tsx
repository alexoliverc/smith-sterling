import Link from 'next/link';

import { RecoveryForm } from './recovery-form';

export default function FollowApplicationPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071522] text-sm font-bold text-white">
              SS
            </div>

            <div>
              <p className="font-semibold tracking-tight text-[#071522]">
                Smith Sterling
              </p>

              <p className="text-xs text-slate-500">
                Crédito com clareza
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl justify-center px-6 py-12 md:py-20">
        <div className="w-full max-w-xl">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
              SS
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
              Área do cliente
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#071522] md:text-4xl">
              Acompanhe sua solicitação
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              Informe os dados utilizados
              na solicitação para recuperar
              o acesso ao acompanhamento do
              seu crédito.
            </p>

            <RecoveryForm />
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-[#071522]">
              Segurança
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Não solicitamos senha bancária,
              token, código SMS ou
              credenciais de acesso ao seu
              banco nesta página.
            </p>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-slate-400">
            Os dados informados são usados
            somente para validar o acesso à
            solicitação correspondente.
          </p>
        </div>
      </section>
    </main>
  );
}
