'use client';

export const FUNNEL_EVENTS = {
  applicationStart: 'credit_application_start',
  applicationCreated: 'credit_application_created',

  analysisSubmitted: 'credit_analysis_submitted',
  analysisUnderReview: 'credit_analysis_under_review',
  analysisCompleted: 'credit_analysis_completed',

  offerView: 'credit_offer_view',
  offerAccepted: 'credit_offer_accepted',
  offerDeclined: 'credit_offer_declined',

  formalizationView: 'credit_formalization_view',
  bankDetailsSubmitted: 'bank_details_submitted',
  readyForDisbursement: 'credit_ready_for_disbursement',
  disbursed: 'credit_disbursed',
} as const;

export type FunnelEventName =
  (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

export type FunnelEventParameters = {
  funnel_stage?: string;
  offer_status?: string;
  formalization_status?: string;
};

type DataLayerEntry = {
  event: FunnelEventName;
} & FunnelEventParameters;


function isBrowser() {
  return typeof window !== 'undefined';
}

function buildEntry(
  event: FunnelEventName,
  parameters: FunnelEventParameters = {},
): DataLayerEntry {
  return {
    event,
    ...parameters,
  };
}

/**
 * Envia somente eventos canônicos e parâmetros não identificadores.
 *
 * Nunca adicionar aqui:
 * - nome
 * - CPF
 * - e-mail
 * - telefone
 * - protocolo
 * - endereço
 * - dados bancários
 */
export function pushFunnelEvent(
  event: FunnelEventName,
  parameters: FunnelEventParameters = {},
) {
  if (!isBrowser()) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];

  window.dataLayer.push(
    buildEntry(event, parameters),
  );
}

/**
 * Dispara no máximo uma vez para uma determinada chave
 * dentro da aba atual.
 *
 * O dedupeKey pode conter um identificador interno usado
 * somente localmente. Ele NÃO é enviado ao dataLayer.
 */
export function pushFunnelEventOnce(
  event: FunnelEventName,
  dedupeKey: string,
  parameters: FunnelEventParameters = {},
) {
  if (!isBrowser()) {
    return;
  }

  const storageKey =
    `smith_funnel_event_v1:${event}:${dedupeKey}`;

  try {
    if (
      window.sessionStorage.getItem(storageKey) ===
      '1'
    ) {
      return;
    }
  } catch {
    /**
     * sessionStorage pode estar indisponível em ambientes
     * restritivos. O evento continua podendo ser emitido.
     */
  }

  pushFunnelEvent(event, parameters);

  try {
    window.sessionStorage.setItem(
      storageKey,
      '1',
    );
  } catch {
    /**
     * A persistência da deduplicação é best-effort.
     *
     * Não repetimos o push aqui porque o evento já foi
     * entregue ao dataLayer nesta execução.
     */
  }
}
