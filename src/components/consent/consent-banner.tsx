'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'smith_sterling_consent_v1';

type ConsentChoice = {
  version: 1;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

type ConsentSignals = {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
};

function isConsentChoice(value: unknown): value is ConsentChoice {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const choice = value as Partial<ConsentChoice>;

  return (
    choice.version === 1 &&
    typeof choice.analytics === 'boolean' &&
    typeof choice.marketing === 'boolean'
  );
}

function readConsentChoice(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isConsentChoice(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function sendConsentUpdate(
  analytics: boolean,
  marketing: boolean,
) {
  const signals: ConsentSignals = {
    analytics_storage: analytics
      ? 'granted'
      : 'denied',

    ad_storage: marketing
      ? 'granted'
      : 'denied',

    ad_user_data: marketing
      ? 'granted'
      : 'denied',

    ad_personalization: marketing
      ? 'granted'
      : 'denied',
  };

  const browserWindow = window as unknown as {
    gtag?: (
      command: 'consent',
      action: 'update',
      values: ConsentSignals,
    ) => void;

    dataLayer?: Array<unknown>;
  };

  if (typeof browserWindow.gtag === 'function') {
    browserWindow.gtag(
      'consent',
      'update',
      signals,
    );
  }

  browserWindow.dataLayer =
    browserWindow.dataLayer || [];

  browserWindow.dataLayer.push({
    event: 'smith_consent_update',
    analytics_consent:
      analytics ? 'granted' : 'denied',
    marketing_consent:
      marketing ? 'granted' : 'denied',
  });
}

function subscribeToNothing() {
  return () => {};
}
export function ConsentBanner() {
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );

  const [sessionChoice, setSessionChoice] =
    useState<ConsentChoice | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const [manageMode, setManageMode] =
    useState(false);

  const [analytics, setAnalytics] =
    useState(false);

  const [marketing, setMarketing] =
    useState(false);

  const storedChoice = hydrated
    ? readConsentChoice()
    : null;

  const currentChoice =
    sessionChoice ?? storedChoice;

  const hasChoice =
    currentChoice !== null;

  function persistChoice(
    nextAnalytics: boolean,
    nextMarketing: boolean,
  ) {
    const choice: ConsentChoice = {
      version: 1,
      analytics: nextAnalytics,
      marketing: nextMarketing,
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(choice),
      );
    } catch {
      // Consentimento continua válido para a sessão
      // mesmo que localStorage esteja indisponível.
    }

    sendConsentUpdate(
      nextAnalytics,
      nextMarketing,
    );

    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setSessionChoice(choice);
    setManageMode(false);
    setIsOpen(false);
  }

  function acceptAll() {
    persistChoice(true, true);
  }

  function rejectNonEssential() {
    persistChoice(false, false);
  }

  function savePreferences() {
    persistChoice(
      analytics,
      marketing,
    );
  }

  function openPreferences() {
    if (currentChoice) {
      setAnalytics(
        currentChoice.analytics,
      );

      setMarketing(
        currentChoice.marketing,
      );
    }

    setManageMode(true);
    setIsOpen(true);
  }

  if (!hydrated) {
    return null;
  }

  if (!isOpen && hasChoice) {
    return (
      <button
        type="button"
        onClick={openPreferences}
        className="fixed bottom-4 left-4 z-[100] rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-lg transition hover:border-blue-300 hover:text-blue-700"
        aria-label="Abrir preferências de cookies"
      >
        Preferências de cookies
      </button>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 sm:p-6"
      role="dialog"
      aria-label="Preferências de privacidade"
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7">
        {!manageMode ? (
          <>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                Privacidade
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#0b1f33] sm:text-2xl">
                Você controla seus dados de navegação
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Utilizamos tecnologias necessárias para o funcionamento
                e a segurança da plataforma. Com sua autorização,
                também podemos utilizar ferramentas de análise e
                publicidade para medir desempenho e melhorar nossas
                campanhas.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Você pode aceitar, recusar tecnologias não essenciais
                ou ajustar suas preferências a qualquer momento.
                Consulte nossa{' '}
                <Link
                  href="/privacidade"
                  className="font-semibold text-blue-700 underline underline-offset-2"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Aceitar todos
              </button>

              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0b1f33] transition hover:bg-slate-50"
              >
                Recusar não essenciais
              </button>

              <button
                type="button"
                onClick={() =>
                  setManageMode(true)
                }
                className="rounded-xl px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Gerenciar preferências
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-600">
                Preferências
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#0b1f33] sm:text-2xl">
                Gerencie suas escolhas
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Cookies e tecnologias estritamente necessários
                permanecem ativos porque são utilizados para segurança,
                sessões e funcionamento da jornada digital.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-[#0b1f33]">
                    Necessários
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Segurança, autenticação, sessões e funcionamento
                    essencial da plataforma.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Sempre ativos
                </span>
              </div>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-[#0b1f33]">
                    Analytics
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Permite medir navegação, desempenho e uso das
                    páginas sem utilizar esses dados para análise de
                    crédito.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) =>
                    setAnalytics(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                  aria-label="Autorizar Analytics"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-[#0b1f33]">
                    Marketing
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Permite medir campanhas e utilizar tecnologias
                    relacionadas a Google Ads e Meta Ads conforme suas
                    preferências.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) =>
                    setMarketing(
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
                  aria-label="Autorizar Marketing"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Salvar preferências
              </button>

              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#0b1f33] transition hover:bg-slate-50"
              >
                Recusar não essenciais
              </button>

              {!hasChoice && (
                <button
                  type="button"
                  onClick={() =>
                    setManageMode(false)
                  }
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Voltar
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


