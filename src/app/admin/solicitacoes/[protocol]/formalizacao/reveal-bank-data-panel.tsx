'use client';

import {
  useState,
  useTransition,
} from 'react';

import {
  revealBankData,
  type RevealedBankData,
} from './actions';

type RevealBankDataPanelProps = {
  protocol: string;
  allowed: boolean;
};

export function RevealBankDataPanel({
  protocol,
  allowed,
}: RevealBankDataPanelProps) {
  const [
    data,
    setData,
  ] =
    useState<RevealedBankData | null>(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    pending,
    startTransition,
  ] =
    useTransition();

  function handleReveal() {
    setError(null);

    startTransition(async () => {
      try {
        const result =
          await revealBankData(
            protocol,
          );

        if (!result.data) {
          setData(null);

          setError(
            result.error ??
              'Não foi possível revelar os dados bancários.',
          );

          return;
        }

        setData(
          result.data,
        );
      } catch {
        setData(null);

        setError(
          'Não foi possível revelar os dados bancários.',
        );
      }
    });
  }

  function handleHide() {
    setData(null);
    setError(null);
  }

  if (!allowed) {
    return (
      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-700">
          Exibição protegida
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Os dados completos não ficam disponíveis fora da etapa operacional de preparação da liberação.
        </p>
      </div>
    );
  }

  if (data) {
    return (
      <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Dados completos revelados
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">
              Utilize estas informações somente para conferir e executar a transferência desta operação.
            </p>
          </div>

          <button
            type="button"
            onClick={handleHide}
            className="shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Ocultar dados
          </button>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-6 border-t border-amber-200 pt-5 md:grid-cols-2">
          <Detail
            label="Banco"
            value={data.bankName}
          />

          <Detail
            label="Tipo da conta"
            value={formatAccountType(
              data.accountType,
            )}
          />

          <Detail
            label="Agência completa"
            value={data.branch}
          />

          <Detail
            label="Conta completa"
            value={data.account}
          />

          <Detail
            label="Titular completo"
            value={data.holderName}
          />

          <Detail
            label="Chave Pix completa"
            value={
              data.pixKey ||
              'Não informada'
            }
          />
        </div>

        <p className="mt-5 text-xs leading-5 text-amber-800">
          Não copie estes dados para mensagens, planilhas ou registros externos à operação.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-700">
        Exibição protegida
      </p>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Agência, conta, titular e chave Pix permanecem protegidos na visualização padrão. Revele os dados completos somente durante a conferência ou execução da transferência.
      </p>

      <button
        type="button"
        disabled={pending}
        onClick={handleReveal}
        className="mt-4 rounded-xl bg-[#071522] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#102a43] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? 'Validando acesso...'
          : 'Revelar dados para transferência'}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm leading-6 text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-semibold text-amber-950">
        {value}
      </p>
    </div>
  );
}

function formatAccountType(
  value: string,
) {
  switch (value) {
    case 'CHECKING':
      return 'Conta corrente';

    case 'SAVINGS':
      return 'Conta poupança';

    case 'PAYMENT':
      return 'Conta de pagamento';

    default:
      return value;
  }
}