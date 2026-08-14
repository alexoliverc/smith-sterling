import type { Metadata } from 'next';

import { InstitutionalPage } from '@/components/layout/institutional-page';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Smith Sterling',
  description: 'Política de Privacidade da Smith Sterling.',
};

export default function PrivacyPage() {
  return (
    <InstitutionalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description="Informações sobre tratamento e proteção de dados na plataforma Smith Sterling."
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-900">
          Documento em revisão
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          A versão jurídica definitiva desta Política de Privacidade será publicada antes da entrada da plataforma em produção.
        </p>
      </div>
    </InstitutionalPage>
  );
}
