import type { Metadata } from 'next';

import {
  institution,
} from '@/config/institution';

import {
  InstitutionalDataNotice,
} from '@/components/layout/institutional-data-notice';

import {
  InstitutionalPage,
} from '@/components/layout/institutional-page';

export const metadata: Metadata = {
  title:
    'Termos de Uso | Smith Sterling',

  description:
    'Termos de Uso da plataforma Smith Sterling.',
};

export default function TermsPage() {
  return (
    <InstitutionalPage
      eyebrow="Legal"
      title="Termos de Uso"
      description="Condições aplicáveis ao acesso e à utilização da plataforma Smith Sterling."
    >
      <div className="space-y-6">
        <InstitutionalDataNotice />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">
            Documento jurídico em revisão
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            A versão definitiva destes Termos de Uso será publicada antes da entrada da plataforma em produção.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-[#0b1f33]">
            Identificação da plataforma
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {institution.tradeName}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {institution.legalName}
          </p>
        </div>
      </div>
    </InstitutionalPage>
  );
}
