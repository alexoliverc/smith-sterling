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
  title: 'Sobre nós | Smith Sterling',
  description:
    'Conheça a proposta institucional da Smith Sterling.',
};

export default function AboutPage() {
  return (
    <InstitutionalPage
      eyebrow="Institucional"
      title={`Sobre a ${institution.tradeName}`}
      description="Uma experiência digital de crédito construída para combinar clareza, tecnologia e acompanhamento em cada etapa."
    >
      <div className="space-y-8 text-slate-600">
        <InstitutionalDataNotice />

        <div>
          <h2 className="text-xl font-semibold text-[#0b1f33]">
            Nossa proposta
          </h2>

          <p className="mt-3 leading-7">
            A {institution.tradeName} desenvolve uma jornada digital para solicitação, análise, apresentação de proposta e formalização de operações de crédito.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0b1f33]">
            Clareza em cada etapa
          </h2>

          <p className="mt-3 leading-7">
            O cliente acompanha a evolução da solicitação e recebe as condições da proposta antes de decidir pelo aceite ou pela recusa.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#0b1f33]">
            Estrutura regulatória
          </h2>

          <p className="mt-3 leading-7">
            Modelo pretendido: {institution.regulatory.intendedModel}.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {institution.regulatory.status}.
          </p>
        </div>
      </div>
    </InstitutionalPage>
  );
}
