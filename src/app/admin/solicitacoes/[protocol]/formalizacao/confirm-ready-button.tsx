'use client';

import { useActionState } from 'react';

import { confirmFormalizationReady, type ConfirmReadyState } from './actions';

const initialState: ConfirmReadyState = {};

export function ConfirmReadyButton({ protocol }: { protocol: string }) {
  const action = confirmFormalizationReady.bind(null, protocol);

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Confirmando conferência...' : 'Confirmar conferência'}
      </button>

      {state.error && (
        <p role="alert" className="mt-3 text-sm leading-6 text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
