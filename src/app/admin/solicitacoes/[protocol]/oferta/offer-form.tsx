'use client';

import { useActionState } from 'react';

import {
  publishOffer,
  type PublishOfferState,
} from './actions';

type CreditOfferFormProps = {
  protocol: string;
  requestedAmount: number;
  requestedMonths: number;
};

const initialState: PublishOfferState = {};

export function CreditOfferForm({
  protocol,
  requestedAmount,
  requestedMonths,
}: CreditOfferFormProps) {
  const action =
    publishOffer.bind(
      null,
      protocol,
    );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState,
  );

  const amountDefault =
    requestedAmount
      .toFixed(2)
      .replace('.', ',');

  return (
    <form
      action={formAction}
      className="space-y-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <MoneyField
          label="Valor principal aprovado"
          name="principal"
          defaultValue={amountDefault}
        />

        <MoneyField
          label="Valor líquido a liberar"
          name="netDisbursement"
          defaultValue={amountDefault}
        />

        <MoneyField
          label="Valor da parcela"
          name="installment"
          placeholder="0,00"
        />

        <MoneyField
          label="Total da operação"
          name="totalRepayment"
          placeholder="0,00"
        />

        <MoneyField
          label="IOF"
          name="iof"
          defaultValue="0,00"
        />

        <MoneyField
          label="Outros encargos"
          name="otherFees"
          defaultValue="0,00"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <NumberField
          label="Prazo em meses"
          name="months"
          defaultValue={
            requestedMonths
          }
        />

        <NumberField
          label="Número de parcelas"
          name="installmentCount"
          defaultValue={
            requestedMonths
          }
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <PercentageField
          label="Taxa efetiva mensal"
          name="monthlyRate"
        />

        <PercentageField
          label="Taxa efetiva anual"
          name="annualRate"
        />

        <PercentageField
          label="CET anual"
          name="cetAnnual"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <DateField
          label="Primeiro vencimento"
          name="firstDueDate"
        />

        <DateField
          label="Validade da proposta"
          name="expiresAt"
        />
      </div>

      <div>
        <label
          htmlFor="termsVersion"
          className="text-sm font-semibold text-slate-700"
        >
          Versão dos termos
        </label>

        <input
          id="termsVersion"
          name="termsVersion"
          type="text"
          required
          maxLength={50}
          placeholder="CREDIT_TERMS_V1"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Identifique a versão das condições que serão apresentadas ao cliente.
        </p>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-medium leading-6 text-red-700">
            {state.error}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">
          Publicação auditável
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Ao publicar, uma nova versão da proposta será registrada. Uma proposta apresentada anteriormente será encerrada antes da nova publicação.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold !text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? 'Publicando proposta...'
          : 'Publicar proposta'}
      </button>
    </form>
  );
}

function MoneyField({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">
          R$
        </span>

        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          required
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        min="1"
        max="120"
        step="1"
        required
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function PercentageField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          required
          placeholder="0,000000"
          className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-400">
          %
        </span>
      </div>
    </div>
  );
}

function DateField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="date"
        required
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
