'use client';

import {
  useActionState,
  useState,
} from 'react';

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
  const [
    confirmDecline,
    setConfirmDecline,
  ] = useState(false);

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
            Li as condições apresentadas nesta proposta, incluindo valores, prazo, taxas, CET e sua composição, encargos, total da operação, vencimento, validade, juros de mora, multa e demais condições de atraso, consequências do inadimplemento e informações sobre liquidação antecipada, e desejo aceitar esta proposta e continuar para a formalização.
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

      <div
        className="flex items-center gap-4"
        aria-hidden="true"
      >
        <div className="h-px flex-1 bg-slate-200" />

        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          ou
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {!confirmDecline ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setConfirmDecline(true);
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Não quero continuar com esta proposta
        </button>
      ) : (
        <div
          role="group"
          aria-labelledby="decline-confirmation-title"
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p
            id="decline-confirmation-title"
            className="text-sm font-semibold text-red-900"
          >
            Confirmar recusa da proposta?
          </p>

          <p className="mt-2 text-sm leading-6 text-red-800">
            Ao confirmar, esta proposta será registrada como recusada e não seguirá para formalização.
          </p>

          {declineState.error && (
            <div className="mt-4">
              <ErrorMessage
                message={
                  declineState.error
                }
              />
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setConfirmDecline(false);
              }}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Voltar
            </button>

            <form
              action={declineFormAction}
            >
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {declinePending
                  ? 'Registrando decisão...'
                  : 'Confirmar recusa'}
              </button>
            </form>
          </div>
        </div>
      )}

      <p className="text-center text-xs leading-5 text-slate-400">
        Nenhuma cobrança é necessária para consultar, aceitar ou recusar esta proposta.
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
