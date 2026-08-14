'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { submitBankData, type BankDataState } from './actions';

const initialState: BankDataState = {};

export function BankDataForm({ protocol }: { protocol: string }) {
  const router = useRouter();

  const action = submitBankData.bind(null, protocol);

  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
            ✓
          </div>

          <div>
            <h3 className="text-lg font-semibold text-emerald-950">Dados bancários recebidos</h3>

            <p className="mt-2 leading-7 text-emerald-800">
              As informações da conta foram registradas de forma protegida e seguirão para
              conferência da operação.
            </p>

            <p className="mt-3 text-sm leading-6 text-emerald-700">
              Você não precisa informar senha, token, código SMS ou qualquer credencial de acesso ao
              seu banco.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field>
          <label htmlFor="bankName" className="text-sm font-semibold text-slate-700">
            Banco
          </label>

          <input
            id="bankName"
            name="bankName"
            type="text"
            required
            maxLength={80}
            autoComplete="off"
            placeholder="Ex.: Itaú, Caixa, Banco do Brasil"
            className={inputClass(Boolean(state.fieldErrors?.bankName))}
          />

          <FieldError message={state.fieldErrors?.bankName} />
        </Field>

        <Field>
          <label htmlFor="accountType" className="text-sm font-semibold text-slate-700">
            Tipo da conta
          </label>

          <select
            id="accountType"
            name="accountType"
            required
            defaultValue=""
            className={inputClass(Boolean(state.fieldErrors?.accountType))}
          >
            <option value="" disabled>
              Selecione
            </option>

            <option value="CHECKING">Conta corrente</option>

            <option value="SAVINGS">Conta poupança</option>

            <option value="PAYMENT">Conta de pagamento</option>
          </select>

          <FieldError message={state.fieldErrors?.accountType} />
        </Field>

        <Field>
          <label htmlFor="branch" className="text-sm font-semibold text-slate-700">
            Agência
          </label>

          <input
            id="branch"
            name="branch"
            type="text"
            required
            maxLength={12}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex.: 1234"
            className={inputClass(Boolean(state.fieldErrors?.branch))}
          />

          <FieldError message={state.fieldErrors?.branch} />
        </Field>

        <Field>
          <label htmlFor="account" className="text-sm font-semibold text-slate-700">
            Conta
          </label>

          <input
            id="account"
            name="account"
            type="text"
            required
            maxLength={20}
            autoComplete="off"
            placeholder="Ex.: 12345-6"
            className={inputClass(Boolean(state.fieldErrors?.account))}
          />

          <FieldError message={state.fieldErrors?.account} />
        </Field>
      </div>

      <Field>
        <label htmlFor="holderName" className="text-sm font-semibold text-slate-700">
          Nome do titular da conta
        </label>

        <input
          id="holderName"
          name="holderName"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          placeholder="Nome completo do titular"
          className={inputClass(Boolean(state.fieldErrors?.holderName))}
        />

        <FieldError message={state.fieldErrors?.holderName} />
      </Field>

      <Field>
        <div>
          <label htmlFor="pixKey" className="text-sm font-semibold text-slate-700">
            Chave Pix
          </label>

          <span className="ml-2 text-xs font-medium text-slate-400">opcional</span>
        </div>

        <input
          id="pixKey"
          name="pixKey"
          type="text"
          maxLength={160}
          autoComplete="off"
          placeholder="CPF, e-mail, telefone ou chave aleatória"
          className={inputClass(Boolean(state.fieldErrors?.pixKey))}
        />

        <FieldError message={state.fieldErrors?.pixKey} />

        <p className="text-xs leading-5 text-slate-500">
          Informe somente a chave Pix. Nunca informe senha ou código de autenticação.
        </p>
      </Field>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-900">Atenção</p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          A Smith Sterling não precisa da sua senha bancária, token de segurança, CVV, código SMS ou
          credenciais de internet banking para receber os dados da conta.
        </p>
      </div>

      {state.error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#071522] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#102a43] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-64"
      >
        {pending ? 'Protegendo e enviando...' : 'Enviar dados bancários'}
      </button>

      <p className="text-xs leading-5 text-slate-400">
        Ao continuar, os dados desta conta serão vinculados exclusivamente a esta formalização.
      </p>
    </form>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-red-600">{message}</p>;
}

function inputClass(hasError: boolean) {
  return [
    'mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400',
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
      : 'border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
  ].join(' ');
}
