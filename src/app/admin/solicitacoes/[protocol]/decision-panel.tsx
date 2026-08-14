'use client';

import { useActionState } from 'react';

import { decideApplication, type DecisionState } from './actions';

type Decision = 'APPROVED' | 'REJECTED';

const initialState: DecisionState = {};

export function DecisionPanel({ protocol }: { protocol: string }) {
  return (
    <div className="space-y-6">
      <DecisionForm protocol={protocol} decision="APPROVED" />

      <div className="border-t border-slate-200" />

      <DecisionForm protocol={protocol} decision="REJECTED" />
    </div>
  );
}

function DecisionForm({ protocol, decision }: { protocol: string; decision: Decision }) {
  const action = decideApplication.bind(null, protocol, decision);

  const [state, formAction, pending] = useActionState(action, initialState);

  const isApproval = decision === 'APPROVED';

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor={`reason-${decision}`}
          className="block text-sm font-semibold text-slate-700"
        >
          {isApproval ? 'Justificativa da aprovação' : 'Justificativa da não aprovação'}
        </label>

        <textarea
          id={`reason-${decision}`}
          name="reason"
          required
          minLength={10}
          maxLength={500}
          rows={4}
          placeholder={
            isApproval
              ? 'Registre a justificativa operacional da decisão...'
              : 'Registre a justificativa operacional da decisão...'
          }
          className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={
          isApproval
            ? 'w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60'
            : 'w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60'
        }
      >
        {pending
          ? 'Registrando decisão...'
          : isApproval
            ? 'Aprovar solicitação'
            : 'Não aprovar solicitação'}
      </button>

      {state.error && (
        <p role="alert" className="text-sm leading-6 text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
