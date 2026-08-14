'use client';

import { useActionState } from 'react';

import { startApplicationAnalysis, type StartAnalysisState } from './actions';

const initialState: StartAnalysisState = {};

export function StartAnalysisButton({ protocol }: { protocol: string }) {
  const action = startApplicationAnalysis.bind(null, protocol);

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Iniciando análise...' : 'Iniciar análise'}
      </button>

      {state.error && (
        <p role="alert" className="mt-3 text-sm leading-6 text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
