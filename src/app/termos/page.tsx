import type { Metadata } from 'next';

import { InstitutionalPage } from '@/components/layout/institutional-page';

export const metadata: Metadata = {
  title: 'Termos de Uso | Smith Sterling',
  description: 'Termos de Uso da plataforma Smith Sterling.',
};

export default function TermsPage() {
  return (
    <InstitutionalPage
      eyebrow="Legal"
      title="Termos de Uso"
      description="Condições aplicáveis ao acesso e à utilização da plataforma Smith Sterling."
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-900">
          Documento em revisão
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          A versão jurídica definitiva destes Termos de Uso será publicada antes da entrada da plataforma em produção.
        </p>
      </div>
    </InstitutionalPage>
  );
}
