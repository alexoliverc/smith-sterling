'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type AutoStatusRefreshProps = {
  active: boolean;
};

export function AutoStatusRefresh({ active }: AutoStatusRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!active) {
      return;
    }

    const interval = window.setInterval(() => {
      router.refresh();
    }, 10_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [active, router]);

  if (!active) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-lg">
      Atualizando status automaticamente
    </div>
  );
}
