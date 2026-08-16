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
    'Saiba como a Smith Sterling coleta, utiliza, protege e trata dados pessoais.',
};

export default function PrivacyPage() {
  const legalName =
    institution.legalNameIsPlaceholder
      ? null
      : institution.legalName;

  const privacyEmail =
    institution.privacy.emailIsPlaceholder
      ? null
      : institution.privacy.email;

  const privacyOfficer =
    institution.privacy.officerIsPlaceholder
      ? null
      : institution.privacy.officer;

  const document =
    institution.document.isPlaceholder
      ? null
      : institution.document.value;

  const address =
    institution.address.isPlaceholder
      ? null
      : institution.address.value;

  return (
    <InstitutionalPage
      eyebrow="Privacidade e proteção de dados"
      title="Política de Privacidade"
      description="Esta Política explica como os dados pessoais são tratados durante o acesso, a solicitação de crédito, a análise, a proposta e a formalização na plataforma Smith Sterling."
    >
      <div className="space-y-10 text-slate-600">
        <InstitutionalDataNotice />

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <p className="font-semibold text-blue-950">
            Versão de desenvolvimento
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Esta minuta foi estruturada para refletir o funcionamento atual da plataforma. A versão definitiva deverá passar por revisão jurídica e receber os dados cadastrais e regulatórios oficiais antes da publicação em produção.
          </p>
        </div>

        <PolicySection
          number="1"
          title="Quem é responsável pelo tratamento dos dados?"
        >
          <p>
            Para as atividades descritas nesta Política, o controlador dos dados pessoais será:
          </p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-5">
            {legalName ? (
              <p className="font-semibold text-[#0b1f33]">
                {legalName}
              </p>
            ) : (
              <p className="font-semibold text-[#0b1f33]">
                Identificação jurídica definitiva em configuração
              </p>
            )}

            <p className="mt-1">
              Nome de uso: {institution.tradeName}
            </p>

            {document && (
              <p className="mt-1">
                CNPJ: {document}
              </p>
            )}

            {address && (
              <p className="mt-1">
                Endereço: {address}
              </p>
            )}
          </div>
        </PolicySection>

        <PolicySection
          number="2"
          title="Quais dados pessoais podemos tratar?"
        >
          <p>
            Os dados tratados dependem da etapa da jornada utilizada pelo cliente.
          </p>

          <PolicyList
            items={[
              'Dados de identificação, como nome completo, CPF e data de nascimento.',
              'Dados de contato, como telefone e endereço de e-mail.',
              'Dados de endereço residencial.',
              'Informações profissionais, de ocupação, vínculo e renda declarada.',
              'Informações relativas à solicitação de crédito, como valor e prazo pretendidos.',
              'Informações das propostas de crédito apresentadas, incluindo condições financeiras, versões, aceite, recusa e validade.',
              'Dados bancários informados para a formalização de uma operação aceita.',
              'Protocolos, registros de sessão, eventos de segurança e informações técnicas necessárias ao funcionamento da plataforma.',
              'Registros de auditoria relacionados às ações do cliente, do sistema e dos operadores administrativos.',
            ]}
          />

          <p className="mt-4 text-sm leading-6 text-slate-500">
            A plataforma não solicita senha bancária, senha de aplicativo financeiro, código de autenticação, código recebido por SMS, CVV ou credenciais de internet banking para a formalização da operação.
          </p>
        </PolicySection>

        <PolicySection
          number="3"
          title="Para quais finalidades utilizamos os dados?"
        >
          <PolicyList
            items={[
              'Receber e registrar uma solicitação de crédito.',
              'Identificar o solicitante e manter meios de contato relacionados à solicitação.',
              'Realizar procedimentos de análise e decisão de crédito.',
              'Apresentar condições de uma proposta ao cliente.',
              'Registrar o aceite ou a recusa de uma proposta.',
              'Permitir o acompanhamento da solicitação e a recuperação segura do acesso.',
              'Formalizar operações cuja proposta tenha sido aceita.',
              'Conferir dados necessários à preparação da liberação financeira.',
              'Manter registros de auditoria, rastreabilidade e integridade operacional.',
              'Prevenir fraudes, abusos, acessos indevidos e outros eventos de segurança.',
              'Atender obrigações legais, regulatórias, contratuais e ordens de autoridades competentes.',
              'Exercer ou defender direitos em processos administrativos, arbitrais ou judiciais.',
            ]}
          />
        </PolicySection>

        <PolicySection
          number="4"
          title="Quais fundamentos podem justificar o tratamento?"
        >
          <p>
            O fundamento jurídico aplicável depende da finalidade específica e da etapa da relação com o titular.
          </p>

          <PolicyList
            items={[
              'Execução de procedimentos preliminares relacionados a uma possível contratação, quando solicitados pelo titular.',
              'Execução de contrato, quando houver relação contratual formalizada.',
              'Cumprimento de obrigação legal ou regulatória aplicável.',
              'Exercício regular de direitos.',
              'Proteção do crédito, quando aplicável.',
              'Legítimo interesse, nos casos legalmente admitidos e após avaliação de necessidade, proporcionalidade e impacto aos direitos do titular.',
              'Consentimento, quando ele for efetivamente a base adequada para uma finalidade específica.',
            ]}
          />

          <p className="mt-4">
            A Smith Sterling deverá documentar internamente a base legal aplicável a cada atividade de tratamento antes da entrada da plataforma em produção.
          </p>
        </PolicySection>

        <PolicySection
          number="5"
          title="Análise e decisão de crédito"
        >
          <p>
            Os dados fornecidos podem ser utilizados para avaliar a solicitação e subsidiar a decisão de crédito.
          </p>

          <p className="mt-4">
            A arquitetura atual separa a análise da solicitação, a apresentação das condições da proposta e a decisão posterior do cliente de aceitar ou recusar essas condições.
          </p>

          <p className="mt-4">
            Caso futuramente sejam adotados processos decisórios exclusivamente automatizados que produzam efeitos relevantes sobre o titular, as informações e mecanismos exigidos pela legislação aplicável deverão ser incorporados à plataforma.
          </p>
        </PolicySection>

        <PolicySection
          number="6"
          title="Propostas e formalização"
        >
          <p>
            A aprovação da análise não equivale ao aceite das condições financeiras pelo cliente.
          </p>

          <p className="mt-4">
            Quando uma proposta for apresentada, suas condições serão disponibilizadas para decisão do cliente. A formalização da operação somente poderá avançar depois do registro do aceite de uma proposta válida.
          </p>

          <p className="mt-4">
            Os dados bancários informados na formalização são utilizados para os procedimentos relacionados à conta indicada para recebimento e para a conferência operacional necessária à continuidade da operação.
          </p>
        </PolicySection>

        <PolicySection
          number="7"
          title="Com quem os dados podem ser compartilhados?"
        >
          <p>
            Quando necessário para as finalidades descritas nesta Política e respeitados os requisitos legais aplicáveis, dados poderão ser compartilhados com categorias de destinatários como:
          </p>

          <PolicyList
            items={[
              'Prestadores de infraestrutura, hospedagem, banco de dados, segurança e tecnologia.',
              'Prestadores necessários à comunicação e ao atendimento.',
              'Prestadores envolvidos na prevenção e detecção de fraude, quando aplicável.',
              'Instituições, prestadores e infraestruturas envolvidos na execução da operação financeira, quando juridicamente aplicável.',
              'Consultores, auditores, contadores e assessores jurídicos sujeitos a deveres de confidencialidade.',
              'Autoridades públicas, reguladores e órgãos competentes quando houver obrigação ou fundamento jurídico para o compartilhamento.',
            ]}
          />

          <p className="mt-4">
            O simples uso de um fornecedor não autoriza utilização irrestrita dos dados. Contratos, instruções de tratamento, controles de acesso e demais salvaguardas deverão ser utilizados conforme o papel de cada parte.
          </p>
        </PolicySection>

        <PolicySection
          number="8"
          title="Transferências internacionais"
        >
          <p>
            Alguns fornecedores de tecnologia poderão utilizar infraestrutura localizada fora do Brasil.
          </p>

          <p className="mt-4">
            Quando isso ocorrer e caracterizar transferência internacional de dados pessoais, deverão ser observados os requisitos e mecanismos previstos na legislação e regulamentação aplicáveis.
          </p>
        </PolicySection>

        <PolicySection
          number="9"
          title="Por quanto tempo armazenamos os dados?"
        >
          <p>
            Os dados não devem ser armazenados indefinidamente sem justificativa.
          </p>

          <p className="mt-4">
            Os períodos de retenção deverão considerar a finalidade do tratamento, a existência da relação contratual, obrigações legais ou regulatórias, prevenção a fraude, prazos prescricionais e a necessidade de exercício regular de direitos.
          </p>

          <p className="mt-4">
            Encerrado o período necessário, os dados deverão ser eliminados, anonimizados ou mantidos somente quando houver fundamento jurídico para sua conservação.
          </p>
        </PolicySection>

        <PolicySection
          number="10"
          title="Como protegemos os dados?"
        >
          <p>
            A plataforma adota controles técnicos e organizacionais destinados a reduzir riscos de acesso não autorizado, perda, alteração, divulgação ou uso inadequado de dados.
          </p>

          <PolicyList
            items={[
              'Proteção de dados pessoais armazenados em campos sensíveis da aplicação.',
              'Controle de acesso administrativo e autenticação de usuários autorizados.',
              'Separação entre áreas públicas e administrativas.',
              'Registros de auditoria das principais alterações de estado da operação.',
              'Restrições para impedir que dados pessoais sejam incluídos desnecessariamente em URLs, logs ou armazenamento do navegador.',
              'Controles transacionais para evitar alterações concorrentes ou inconsistentes no fluxo da operação.',
            ]}
          />

          <p className="mt-4">
            Nenhuma medida de segurança elimina integralmente todos os riscos, por isso os controles devem ser continuamente avaliados e aprimorados.
          </p>
        </PolicySection>

        <PolicySection
          number="11"
          title="Incidentes de segurança"
        >
          <p>
            Incidentes envolvendo dados pessoais serão avaliados conforme sua natureza, extensão, dados afetados, consequências e riscos aos titulares.
          </p>

          <p className="mt-4">
            Quando estiverem presentes os requisitos previstos na legislação e na regulamentação da Autoridade Nacional de Proteção de Dados, serão adotados os procedimentos de comunicação aplicáveis às autoridades e aos titulares.
          </p>
        </PolicySection>

        <PolicySection
          number="12"
          title="Cookies e tecnologias necessárias"
        >
          <p>
            A plataforma poderá utilizar cookies ou mecanismos técnicos estritamente necessários para manter sessões, autenticação, segurança e funcionamento da jornada digital.
          </p>

          <p className="mt-4">
            Caso sejam adicionadas posteriormente ferramentas de publicidade, mensuração comportamental ou tecnologias não estritamente necessárias, a política e os mecanismos de escolha do usuário deverão ser revisados antes da ativação desses recursos.
          </p>
        </PolicySection>

        <PolicySection
          number="13"
          title="Quais são os direitos do titular?"
        >
          <p>
            Nos termos da legislação aplicável, o titular poderá solicitar o exercício de direitos relacionados aos seus dados pessoais.
          </p>

          <PolicyList
            items={[
              'Confirmação da existência de tratamento.',
              'Acesso aos dados pessoais.',
              'Correção de dados incompletos, inexatos ou desatualizados.',
              'Anonimização, bloqueio ou eliminação nos casos previstos em lei.',
              'Portabilidade, quando aplicável e observada a regulamentação.',
              'Informações sobre compartilhamento de dados.',
              'Informações relacionadas ao consentimento, quando essa for a base utilizada.',
              'Revogação do consentimento, quando aplicável.',
              'Oposição ao tratamento nos casos previstos em lei.',
              'Demais direitos assegurados pela legislação de proteção de dados.',
            ]}
          />

          <p className="mt-4">
            Algumas solicitações poderão não resultar na eliminação imediata de todos os dados quando sua manutenção for necessária para cumprimento de obrigação legal ou regulatória, exercício regular de direitos ou outra hipótese autorizada pela legislação.
          </p>
        </PolicySection>

        <PolicySection
          number="14"
          title="Como exercer seus direitos?"
        >
          {privacyEmail ? (
            <>
              <p>
                Solicitações relacionadas à privacidade e proteção de dados podem ser enviadas para:
              </p>

              <p className="mt-4 font-semibold text-[#0b1f33]">
                {privacyEmail}
              </p>
            </>
          ) : (
            <p>
              O canal oficial para exercício de direitos será disponibilizado antes da publicação da plataforma em produção.
            </p>
          )}

          {privacyOfficer && (
            <p className="mt-4">
              Encarregado: {privacyOfficer}
            </p>
          )}

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Poderemos solicitar informações adicionais estritamente necessárias para verificar a identidade do solicitante e proteger os dados contra pedidos fraudulentos.
          </p>
        </PolicySection>

        <PolicySection
          number="15"
          title="Alterações desta Política"
        >
          <p>
            Esta Política poderá ser atualizada para refletir alterações legais, regulatórias, operacionais ou tecnológicas.
          </p>

          <p className="mt-4">
            Quando uma alteração for relevante, a versão atualizada deverá ser disponibilizada nesta página com identificação de sua vigência.
          </p>
        </PolicySection>

        <PolicySection
          number="16"
          title="Versão e vigência"
        >
          <div className="rounded-2xl bg-slate-50 p-5 text-sm">
            <p>
              Versão: desenvolvimento-1
            </p>

            <p className="mt-1">
              Situação: aguardando revisão jurídica e dados institucionais definitivos.
            </p>
          </div>
        </PolicySection>
      </div>
    </InstitutionalPage>
  );
}

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#0b1f33]">
            {title}
          </h2>

          <div className="mt-4 leading-7">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function PolicyList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3"
        >
          <span
            aria-hidden="true"
            className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
          />

          <span className="leading-7">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
