'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AutoStatusRefreshProps = {
  active: boolean;
};

const REFRESH_INTERVAL_MS = 10_000;

export function AutoStatusRefresh({
  active,
}: AutoStatusRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!active) {
      return;
    }

    const refreshIfVisible = () => {
      if (
        document.visibilityState !==
        'visible'
      ) {
        return;
      }

      router.refresh();
    };

    const interval =
      window.setInterval(
        refreshIfVisible,
        REFRESH_INTERVAL_MS,
      );

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        router.refresh();
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(
        interval,
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
    };
  }, [active, router]);

  if (!active) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-center text-xs font-medium text-slate-600 shadow-lg backdrop-blur sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto sm:rounded-full sm:py-2"
    >
      Status atualizado automaticamente
    </div>
  );
}
