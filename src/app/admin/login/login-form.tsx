'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { loginAdmin, type AdminLoginState } from './actions';

const initialState: AdminLoginState = {};

export function LoginForm() {
  const [state, action] = useActionState(loginAdmin, initialState);

  return (
    <form action={action} className="mt-10 space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          E-mail
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Senha
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Digite sua senha"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-[#0b1f33] px-6 py-4 font-semibold text-white transition hover:bg-[#14324f] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Entrando...' : 'Entrar no backoffice'}
    </button>
  );
}
