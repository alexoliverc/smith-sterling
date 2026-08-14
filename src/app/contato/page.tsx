import type { Metadata } from 'next';
import Link from 'next/link';

import { InstitutionalPage } from '@/components/layout/institutional-page';

export const metadata: Metadata = {
  title: 'Contato | Smith Sterling',
  description: 'Canais de contato e acompanhamento da Smith Sterling.',
};

export default function ContactPage() {
  return (
    <InstitutionalPage
      eyebrow="Contato"
      title="Como podemos ajudar?"
      description="Utilize os canais oficiais da Smith Sterling para acompanhar sua solicitação e acessar as informações disponíveis sobre sua operação."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Já possui uma solicitação?
          </p>

          <h2 className="mt-3 text-xl font-semibold text-[#0b1f33]">
            Acompanhe online
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Consulte o andamento utilizando os dados de recuperação da sua solicitação.
          </p>

          <Link
            href="/acompanhar"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Acompanhar solicitação
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Atendimento
          </p>

          <h2 className="mt-3 text-xl font-semibold text-[#0b1f33]">
            Canal institucional
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Os canais oficiais de atendimento serão disponibilizados nesta página antes da publicação do site em produção.
          </p>
        </div>
      </div>
    </InstitutionalPage>
  );
}
