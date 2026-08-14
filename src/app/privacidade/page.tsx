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
    'Política de Privacidade | Smith Sterling',

  description:
    'Política de Privacidade da Smith Sterling.',
};

export default function PrivacyPage() {
  const privacyEmail =
    institution.privacy.emailIsPlaceholder
      ? null
      : institution.privacy.email;

  const privacyOfficer =
    institution.privacy.officerIsPlaceholder
      ? null
      : institution.privacy.officer;

  return (
    <InstitutionalPage
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description="Informações sobre tratamento e proteção de dados na plataforma Smith Sterling."
    >
      <div className="space-y-6">
        <InstitutionalDataNotice />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">
            Documento jurídico em revisão
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            A versão definitiva desta Política de Privacidade será publicada antes da entrada da plataforma em produção.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-[#0b1f33]">
            Controlador
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {institution.legalName}
          </p>

          {privacyEmail && (
            <p className="mt-2 text-sm text-slate-600">
              Privacidade: {privacyEmail}
            </p>
          )}

          {privacyOfficer && (
            <p className="mt-2 text-sm text-slate-600">
              Encarregado: {privacyOfficer}
            </p>
          )}
        </div>
      </div>
    </InstitutionalPage>
  );
}
