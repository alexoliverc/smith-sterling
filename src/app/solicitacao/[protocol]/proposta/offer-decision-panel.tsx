'use client';

import { useActionState } from 'react';

import {
  decideOffer,
  type PublicOfferDecisionState,
} from './actions';

type OfferDecisionPanelProps = {
  protocol: string;
  version: number;
};

const initialState: PublicOfferDecisionState = {};

export function OfferDecisionPanel({
  protocol,
  version,
}: OfferDecisionPanelProps) {
  const acceptAction =
    decideOffer.bind(
      null,
      protocol,
      version,
      'ACCEPT',
    );

  const declineAction =
    decideOffer.bind(
      null,
      protocol,
      version,
      'DECLINE',
    );

  const [
    acceptState,
    acceptFormAction,
    acceptPending,
  ] = useActionState(
    acceptAction,
    initialState,
  );

  const [
    declineState,
    declineFormAction,
    declinePending,
  ] = useActionState(
    declineAction,
    initialState,
  );

  const pending =
    acceptPending ||
    declinePending;

  return (
    <div className="space-y-5">
      <form
        action={acceptFormAction}
        className="space-y-5"
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            name="acceptTerms"
            required
            disabled={pending}
            className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
          />

          <span className="text-sm leading-6 text-slate-600">
            Li as condições apresentadas nesta proposta, incluindo valores, prazo, taxas, CET e sua composição, encargos, total da operação, vencimento, validade, juros de mora, multa e demais condições de atraso, consequências do inadimplemento e informações sobre liquidação antecipada, e desejo continuar com a contratação.
          </span>
        </label>

        {acceptState.error && (
          <ErrorMessage
            message={
              acceptState.error
            }
          />
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold !text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {acceptPending
            ? 'Registrando aceite...'
            : 'Aceitar proposta e continuar'}
        </button>
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          ou
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form
        action={declineFormAction}
      >
        {declineState.error && (
          <div className="mb-4">
            <ErrorMessage
              message={
                declineState.error
              }
            />
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {declinePending
            ? 'Registrando decisão...'
            : 'Não quero continuar com esta proposta'}
        </button>
      </form>

      <p className="text-center text-xs leading-5 text-slate-400">
        Nenhuma cobrança é necessária para consultar ou decidir sobre esta proposta.
      </p>
    </div>
  );
}

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <p className="text-sm leading-6 text-red-700">
        {message}
      </p>
    </div>
  );
}
