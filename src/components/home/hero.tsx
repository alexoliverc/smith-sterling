'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { calculateCreditSimulation, formatCurrency } from '@/lib/credit';

export function Hero() {
  const router = useRouter();

  const [amount, setAmount] = useState(5000);
  const [months, setMonths] = useState(12);


  const simulation = useMemo(() => calculateCreditSimulation(amount, months), [amount, months]);
  function handleContinue() {
    const params = new URLSearchParams({
      valor: String(amount),
      prazo: String(months),
    });

    router.push(`/solicitacao?${params.toString()}`);
  }


  return (
    <section className="relative overflow-hidden bg-[#f7f8fa]">
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Crédito pensado para a vida real
          </div>

          <h1 className="max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-[#0b1f33] md:text-6xl">
            Crédito direto, simples e transparente.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Faça sua simulação, envie seus dados e acompanhe sua análise em uma experiência
            totalmente digital.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#simulador"
              className="rounded-xl bg-[#0b1f33] px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-[#14324f]"
            >
              Simular meu crédito
            </a>

            <a
              href="#como-funciona"
              className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Como funciona
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
            <span>✓ Processo digital</span>
            <span>✓ Análise simplificada</span>
            <span>✓ Acompanhamento online</span>
          </div>
        </div>

        <div id="simulador" className="relative">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/60">
            <div>
              <p className="text-sm font-medium text-slate-500">Quanto você precisa?</p>

              <p className="mt-3 text-4xl font-semibold tracking-tight text-[#0b1f33]">
                {formatCurrency(amount)}
              </p>
            </div>

            <div className="mt-8">
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="w-full cursor-pointer accent-blue-600"
                aria-label="Valor do crédito"
              />

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>R$ 500</span>
                <span>R$ 10.000</span>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Prazo</p>

                <p className="font-semibold text-[#0b1f33]">{months} meses</p>
              </div>

              <input
                type="range"
                min="3"
                max="24"
                step="1"
                value={months}
                onChange={(event) => setMonths(Number(event.target.value))}
                className="mt-4 w-full cursor-pointer accent-blue-600"
                aria-label="Prazo do crédito"
              />

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>3 meses</span>
                <span>24 meses</span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-sm text-slate-500">Parcela estimada</span>

                <span className="text-xl font-semibold text-[#0b1f33]">
                  {formatCurrency(simulation.installment)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 py-4">
                <span className="text-sm text-slate-500">Total estimado</span>

                <span className="font-semibold text-slate-800">
                  {formatCurrency(simulation.totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-slate-500">Taxa ilustrativa</span>

                <span className="font-semibold text-slate-800">
                  {(simulation.monthlyRate * 100).toFixed(2).replace('.', ',')}% a.m.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Continuar simulação
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Simulação meramente ilustrativa. Valores e condições finais dependem de análise e da
              proposta apresentada ao cliente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
