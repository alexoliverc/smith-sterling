'use client';

import { useActionState } from 'react';

import {
  recoverApplication,
  type RecoveryState,
} from './actions';

const initialState: RecoveryState = {};

export function RecoveryForm() {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    recoverApplication,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6"
    >
      <Field>
        <label
          htmlFor="protocol"
          className="text-sm font-semibold text-slate-700"
        >
          Protocolo
        </label>

        <input
          id="protocol"
          name="protocol"
          type="text"
          required
          maxLength={24}
          autoComplete="off"
          placeholder="SS-XXXXXXXXXXXX"
          className={inputClass(
            Boolean(
              state.fieldErrors
                ?.protocol,
            ),
          )}
        />

        <FieldError
          message={
            state.fieldErrors
              ?.protocol
          }
        />
      </Field>

      <Field>
        <label
          htmlFor="cpf"
          className="text-sm font-semibold text-slate-700"
        >
          CPF
        </label>

        <input
          id="cpf"
          name="cpf"
          type="text"
          required
          maxLength={14}
          inputMode="numeric"
          autoComplete="off"
          placeholder="000.000.000-00"
          className={inputClass(
            Boolean(
              state.fieldErrors?.cpf,
            ),
          )}
        />

        <FieldError
          message={
            state.fieldErrors?.cpf
          }
        />
      </Field>

      <Field>
        <label
          htmlFor="birthDate"
          className="text-sm font-semibold text-slate-700"
        >
          Data de nascimento
        </label>

        <input
          id="birthDate"
          name="birthDate"
          type="date"
          required
          autoComplete="bday"
          className={inputClass(
            Boolean(
              state.fieldErrors
                ?.birthDate,
            ),
          )}
        />

        <FieldError
          message={
            state.fieldErrors
              ?.birthDate
          }
        />
      </Field>

      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm leading-6 text-red-700">
            {state.error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold !text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? 'Validando acesso...'
          : 'Acessar solicitação'}
      </button>
    </form>
  );
}

function Field({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

function inputClass(
  hasError: boolean,
) {
  return [
    'mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
  ].join(' ');
}
