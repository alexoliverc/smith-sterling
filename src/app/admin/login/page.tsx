import { LoginForm } from './login-form';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071522] px-6 py-16">
      <section className="w-full max-w-md rounded-[32px] border border-white/10 bg-white p-8 shadow-2xl md:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b1f33] text-lg font-semibold text-white">
          SS
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
          Smith Sterling
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
          Acesso administrativo
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Entre com suas credenciais para acessar o backoffice de análise de crédito.
        </p>

        <LoginForm />

        <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs leading-5 text-slate-500">
          Área restrita a operadores autorizados da Smith Sterling.
        </p>
      </section>
    </main>
  );
}
