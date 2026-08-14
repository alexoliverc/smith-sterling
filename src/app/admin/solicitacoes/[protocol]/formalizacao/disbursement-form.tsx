'use client';

import { useActionState } from 'react';

import { registerDisbursement, type DisbursementState } from './actions';

const initialState: DisbursementState = {};

export function DisbursementForm({ protocol }: { protocol: string }) {
  const action = registerDisbursement.bind(null, protocol);

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="reference" className="block text-sm font-semibold text-slate-700">
          Referência da transferência
        </label>

        <input
          id="reference"
          name="reference"
          type="text"
          required
          minLength={4}
          maxLength={160}
          autoComplete="off"
          placeholder="Ex.: identificador da transferência"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Informe uma referência que permita localizar posteriormente a transferência realizada.
          Esse valor será armazenado de forma criptografada.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <input type="checkbox" name="confirmed" required className="mt-1 h-4 w-4 shrink-0" />

        <span className="text-sm font-medium leading-6 text-amber-900">
          Confirmo que a transferência financeira já foi efetivamente realizada e estou apenas
          registrando sua conclusão no sistema.
        </span>
      </label>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-800">Ação final</p>

        <p className="mt-2 text-sm leading-6 text-red-700">
          Depois de registrar a liberação, a formalização passará para
          <strong> Crédito liberado</strong> e não poderá retornar para a etapa anterior.
        </p>
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#071522] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#102a43] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Registrando liberação...' : 'Registrar crédito como liberado'}
      </button>
    </form>
  );
}
