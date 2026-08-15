'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  calculateCreditSimulation,
  formatCurrency,
} from '@/lib/credit';

export function Hero() {
  const router = useRouter();

  const [amount, setAmount] =
    useState(5000);

  const [months, setMonths] =
    useState(12);

  const simulation = useMemo(
    () =>
      calculateCreditSimulation(
        amount,
        months,
      ),
    [amount, months],
  );

  function handleContinue() {
    const params =
      new URLSearchParams({
        valor: String(amount),
        prazo: String(months),
      });

    router.push(
      `/solicitacao?${params.toString()}`,
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#f7f8fa]">
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-100/40 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-48 left-1/3 h-[420px] w-[420px] rounded-full bg-slate-200/40 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-blue-500"
            />

            Uma nova experiência digital de crédito
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-[#0b1f33] md:text-6xl lg:text-[68px] lg:leading-[1.02]">
            Crédito com clareza em cada decisão.
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
            Simule uma condição inicial, envie sua solicitação e acompanhe cada etapa online. Se uma proposta for apresentada, você consulta todas as condições antes de decidir.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#simulador"
              className="rounded-xl bg-[#0b1f33] px-7 py-4 text-center text-base font-semibold !text-white shadow-sm transition hover:bg-[#14324f]"
            >
              Simular meu crédito
            </a>

            <Link
              href="/acompanhar"
              className="rounded-xl border border-slate-300 bg-white px-7 py-4 text-center text-base font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Já tenho uma solicitação
            </Link>
          </div>

          <div className="mt-6">
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
            >
              Entenda toda a jornada
              <span aria-hidden="true">
                →
              </span>
            </a>
          </div>

          <div className="mt-10 grid max-w-xl gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <TrustItem>
              Processo digital
            </TrustItem>

            <TrustItem>
              Acompanhamento online
            </TrustItem>

            <TrustItem>
              Decisão do cliente
            </TrustItem>
          </div>
        </div>

        <div
          id="simulador"
          className="relative scroll-mt-24"
        >
          <div className="absolute -inset-3 rounded-[36px] bg-gradient-to-br from-blue-100/70 to-transparent blur-xl" />

          <div className="relative rounded-[32px] border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-300/50 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                  Simulação inicial
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#0b1f33]">
                  Escolha valor e prazo
                </h2>
              </div>

              <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                Ilustrativa
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium text-slate-500">
                Quanto você precisa?
              </p>

              <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
                {formatCurrency(
                  amount,
                )}
              </p>

              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className="mt-7 w-full cursor-pointer accent-blue-600"
                aria-label="Valor do crédito"
              />

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>
                  R$ 500
                </span>

                <span>
                  R$ 10.000
                </span>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Prazo desejado
                </p>

                <p className="font-semibold text-[#0b1f33]">
                  {months} meses
                </p>
              </div>

              <input
                type="range"
                min="3"
                max="24"
                step="1"
                value={months}
                onChange={(event) =>
                  setMonths(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                className="mt-5 w-full cursor-pointer accent-blue-600"
                aria-label="Prazo do crédito"
              />

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>
                  3 meses
                </span>

                <span>
                  24 meses
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <SimulationRow
                label="Parcela estimada"
                value={formatCurrency(
                  simulation.installment,
                )}
                primary
              />

              <SimulationRow
                label="Total estimado"
                value={formatCurrency(
                  simulation.totalAmount,
                )}
              />

              <SimulationRow
                label="Taxa usada na simulação"
                value={`${(
                  simulation.monthlyRate *
                  100
                )
                  .toFixed(2)
                  .replace(
                    '.',
                    ',',
                  )}% a.m.`}
                last
              />
            </div>

            <button
              type="button"
              onClick={
                handleContinue
              }
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Continuar minha solicitação
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Esta simulação não representa aprovação nem oferta de crédito. Valores, taxas e demais condições definitivas dependem da análise e de eventual proposta apresentada ao cliente.
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs text-slate-500">
                Já iniciou o processo?
              </p>

              <Link
                href="/acompanhar"
                className="mt-2 inline-flex text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Consultar minha solicitação →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700"
      >
        ✓
      </span>

      <span>
        {children}
      </span>
    </div>
  );
}

function SimulationRow({
  label,
  value,
  primary = false,
  last = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        last
          ? 'flex items-center justify-between gap-5 pt-4'
          : 'flex items-center justify-between gap-5 border-b border-slate-200 pb-4 pt-4 first:pt-0'
      }
    >
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={
          primary
            ? 'text-lg font-semibold text-[#0b1f33]'
            : 'text-sm font-semibold text-slate-800'
        }
      >
        {value}
      </span>
    </div>
  );
}
