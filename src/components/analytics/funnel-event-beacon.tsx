'use client';

import { useEffect, useRef } from 'react';

import {
  pushFunnelEvent,
  pushFunnelEventOnce,
} from '@/lib/analytics/funnel-event-client';
import type {
  FunnelEventName,
  FunnelEventParameters,
} from '@/lib/analytics/funnel-events';

type FunnelEventBeaconProps = {
  event: FunnelEventName;
  parameters?: FunnelEventParameters;
  dedupeKey?: string;
};

export function FunnelEventBeacon({
  event,
  parameters,
  dedupeKey,
}: FunnelEventBeaconProps) {
  const lastIdentityRef =
    useRef<string | null>(null);

  useEffect(() => {
    const identity =
      `${event}:${dedupeKey ?? 'mount'}`;

    if (
      lastIdentityRef.current ===
      identity
    ) {
      return;
    }

    lastIdentityRef.current =
      identity;

    if (dedupeKey) {
      pushFunnelEventOnce(
        event,
        dedupeKey,
        parameters,
      );

      return;
    }

    pushFunnelEvent(
      event,
      parameters,
    );
  }, [
    dedupeKey,
    event,
    parameters,
  ]);

  return null;
}
