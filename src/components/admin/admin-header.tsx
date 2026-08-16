import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin/logout-button';

type AdminHeaderProps = {
  userName: string;
  roleLabel: string;
  subtitle?: string;
  maxWidth?: '6xl' | '7xl';
};

export function AdminHeader({
  userName,
  roleLabel,
  subtitle = 'Backoffice de crédito',
  maxWidth = '7xl',
}: AdminHeaderProps) {
  const widthClass =
    maxWidth === '6xl'
      ? 'max-w-6xl'
      : 'max-w-7xl';

  return (
    <header className="border-b border-white/10 bg-[#071522]">
      <div
        className={`mx-auto flex ${widthClass} flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5`}
      >
        <Link
          href="/admin/solicitacoes"
          className="flex items-center gap-4"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0b1f33]">
            SS
          </div>

          <div>
            <p className="font-semibold !text-white">
              Smith Sterling
            </p>

            <p className="text-xs !text-slate-400">
              {subtitle}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {userName}
            </p>

            <p className="text-xs text-slate-400">
              {roleLabel}
            </p>
          </div>

          <AdminLogoutButton />
        </div>
      </div>
    </header>
  );
}