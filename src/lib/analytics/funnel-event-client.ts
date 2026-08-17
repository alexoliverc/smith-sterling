'use client';

import type {
  FunnelEventName,
  FunnelEventParameters,
} from '@/lib/analytics/funnel-events';

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

  window.dataLayer =
    window.dataLayer ?? [];

  window.dataLayer.push(
    buildEntry(
      event,
      parameters,
    ),
  );
}

/**
 * Dispara no máximo uma vez para uma determinada chave
 * dentro da aba atual.
 *
 * O dedupeKey pode conter um identificador interno usado
 * somente localmente. Ele nunca faz parte do DataLayerEntry.
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
      window.sessionStorage.getItem(
        storageKey,
      ) === '1'
    ) {
      return;
    }
  } catch {
    /**
     * sessionStorage pode estar indisponível.
     * O evento continua podendo ser emitido.
     */
  }

  pushFunnelEvent(
    event,
    parameters,
  );

  try {
    window.sessionStorage.setItem(
      storageKey,
      '1',
    );
  } catch {
    /**
     * Persistência da deduplicação é best-effort.
     * O evento já foi enviado nesta execução.
     */
  }
}
