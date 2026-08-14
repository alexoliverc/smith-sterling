import { logoutAdmin } from '@/app/admin/actions';

export function AdminLogoutButton() {
  return (
    <form action={logoutAdmin}>
      <button
        type="submit"
        className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
      >
        Sair
      </button>
    </form>
  );
}
