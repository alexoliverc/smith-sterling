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
    'Condições de uso da plataforma digital Smith Sterling.',
};

export default function TermsPage() {
  const document =
    institution.document.isPlaceholder
      ? null
      : institution.document.value;

  const address =
    institution.address.isPlaceholder
      ? null
      : institution.address.value;

  const supportEmail =
    institution.support.emailIsPlaceholder
      ? null
      : institution.support.email;

  return (
    <InstitutionalPage
      eyebrow="Legal"
      title="Termos de Uso"
      description="Estes Termos disciplinam o acesso e a utilização da plataforma Smith Sterling e descrevem as principais etapas da jornada digital de crédito."
    >
      <div className="space-y-10 text-slate-600">
        <InstitutionalDataNotice />

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <p className="font-semibold text-blue-950">
            Versão de desenvolvimento
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-800">
            Esta minuta reflete o funcionamento atual da plataforma e deverá passar por revisão jurídica e regulatória antes da disponibilização comercial do serviço.
          </p>
        </div>

        <TermsSection
          number="1"
          title="Identificação da plataforma"
        >
          <p>
            A plataforma é apresentada sob o nome {institution.tradeName}.
          </p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-5">
            <p className="font-semibold text-[#0b1f33]">
              {institution.legalName}
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

            {supportEmail && (
              <p className="mt-1">
                Atendimento: {supportEmail}
              </p>
            )}
          </div>

          {!institution.regulatory.authorizationConfirmed && (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              As informações regulatórias definitivas da operação ainda não estão confirmadas para publicação e deverão ser atualizadas antes da entrada da plataforma em produção.
            </p>
          )}
        </TermsSection>

        <TermsSection
          number="2"
          title="Objeto destes Termos"
        >
          <p>
            Estes Termos regulam o uso da plataforma para cadastro, solicitação de crédito, acompanhamento, análise, apresentação de propostas e formalização das operações que venham a ser efetivamente contratadas.
          </p>

          <p className="mt-4">
            Os Termos gerais de uso da plataforma não substituem as condições específicas de cada proposta ou o instrumento contratual da operação de crédito.
          </p>
        </TermsSection>

        <TermsSection
          number="3"
          title="Cadastro e informações fornecidas"
        >
          <p>
            O usuário deverá fornecer informações verdadeiras, atuais e suficientes para o processamento da solicitação.
          </p>

          <p className="mt-4">
            O uso de dados falsos, de terceiros sem autorização ou qualquer tentativa de fraude poderá resultar na interrupção da solicitação e na adoção das medidas juridicamente cabíveis.
          </p>

          <p className="mt-4">
            O tratamento dos dados pessoais observará a Política de Privacidade disponibilizada pela plataforma.
          </p>
        </TermsSection>

        <TermsSection
          number="4"
          title="Solicitação de crédito"
        >
          <p>
            O envio de uma solicitação representa um pedido de análise e não constitui aprovação, contratação, promessa de crédito ou garantia de liberação de recursos.
          </p>

          <p className="mt-4">
            O valor e o prazo inicialmente indicados pelo usuário representam as condições pretendidas na solicitação e poderão ser diferentes das condições eventualmente apresentadas em uma proposta.
          </p>
        </TermsSection>

        <TermsSection
          number="5"
          title="Análise de crédito"
        >
          <p>
            A solicitação poderá ser submetida a procedimentos de análise de crédito e verificação das informações disponíveis.
          </p>

          <p className="mt-4">
            A análise poderá resultar em aprovação, não aprovação ou encerramento da solicitação conforme critérios aplicáveis e observadas as normas legais e regulatórias pertinentes.
          </p>

          <p className="mt-4">
            A aprovação da análise significa apenas que a solicitação poderá avançar para uma proposta. Ela não representa, isoladamente, contratação nem desembolso de recursos.
          </p>
        </TermsSection>

        <TermsSection
          number="6"
          title="Proposta de crédito"
        >
          <p>
            Quando uma solicitação aprovada resultar em uma proposta, o usuário deverá ter acesso às condições financeiras aplicáveis antes de tomar sua decisão.
          </p>

          <TermsList
            items={[
              'Valor principal da operação.',
              'Valor líquido disponibilizado, quando aplicável.',
              'Quantidade e valor das parcelas.',
              'Montante total da operação.',
              'Taxa efetiva mensal.',
              'Custo Efetivo Total — CET.',
              'Tributos, tarifas e demais encargos que componham a operação.',
              'Data prevista para o primeiro vencimento.',
              'Prazo de validade da proposta.',
              'Versão dos termos ou condições vinculadas à proposta.',
            ]}
          />

          <p className="mt-4">
            A proposta terá prazo de validade próprio. Expirado esse prazo sem aceite, as condições poderão deixar de estar disponíveis e uma nova proposta poderá apresentar condições diferentes.
          </p>
        </TermsSection>

        <TermsSection
          number="7"
          title="Aceite e recusa"
        >
          <p>
            A decisão sobre a proposta pertence ao usuário. A plataforma permitirá aceitar ou recusar uma proposta enquanto ela estiver válida e disponível.
          </p>

          <p className="mt-4">
            A recusa não autoriza a formalização daquela proposta.
          </p>

          <p className="mt-4">
            O aceite será registrado eletronicamente e poderá compor os registros de auditoria da operação.
          </p>
        </TermsSection>

        <TermsSection
          number="8"
          title="Formalização"
        >
          <p>
            A formalização somente poderá ser iniciada depois do aceite de uma proposta válida.
          </p>

          <p className="mt-4">
            Nessa etapa poderão ser solicitadas informações necessárias à contratação e ao recebimento dos recursos, incluindo dados da conta bancária indicada pelo usuário.
          </p>

          <p className="mt-4">
            A plataforma não solicita senha bancária, senha de aplicativo financeiro, CVV, código recebido por SMS, token de autenticação ou credenciais de internet banking para a formalização de uma operação.
          </p>
        </TermsSection>

        <TermsSection
          number="9"
          title="Liberação dos recursos"
        >
          <p>
            A liberação deverá observar as condições da operação contratada e a conclusão dos procedimentos legítimos de formalização.
          </p>

          <p className="mt-4">
            No sistema atual, o status de liberação representa o registro administrativo de que uma transferência realizada externamente foi confirmada pelo operador. A plataforma não executa automaticamente transferência bancária por meio desse registro.
          </p>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="font-semibold text-red-900">
              Nenhum pagamento antecipado para liberar crédito
            </p>

            <p className="mt-2 text-sm leading-6 text-red-800">
              A contratação ou liberação de crédito não deverá depender de depósito antecipado, Pix prévio ou pagamento destinado a “desbloquear”, “autorizar” ou “liberar” os recursos.
            </p>
          </div>
        </TermsSection>

        <TermsSection
          number="10"
          title="Produtos e serviços adicionais"
        >
          <p>
            A eventual oferta de seguro, assistência ou outro produto ou serviço acessório deverá ocorrer separadamente e com informação clara sobre suas condições.
          </p>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-semibold text-emerald-950">
              Contratação opcional
            </p>

            <p className="mt-2 text-sm leading-6 text-emerald-800">
              A contratação de seguro ou de qualquer serviço adicional não poderá ser apresentada como requisito obrigatório para aprovação, contratação ou liberação do crédito quando a legislação não permitir tal condicionamento.
            </p>
          </div>
        </TermsSection>

        <TermsSection
          number="11"
          title="Custos e obrigações financeiras"
        >
          <p>
            Os juros, tributos, tarifas e demais encargos da operação deverão estar descritos nos documentos e condições aplicáveis à proposta e ao contrato.
          </p>

          <p className="mt-4">
            O usuário deverá avaliar os custos, o valor das parcelas, o prazo e as consequências do inadimplemento antes da contratação.
          </p>

          <p className="mt-4">
            As regras de pagamento antecipado, liquidação da dívida, encargos de atraso e demais condições financeiras deverão observar o contrato e a legislação aplicável.
          </p>
        </TermsSection>

        <TermsSection
          number="12"
          title="Inadimplemento"
        >
          <p>
            O atraso no pagamento poderá gerar as consequências previstas no contrato e na legislação aplicável, incluindo os encargos informados previamente na contratação.
          </p>

          <p className="mt-4">
            As práticas de cobrança deverão respeitar a legislação de proteção ao consumidor e não poderão envolver ameaça, constrangimento ou exposição indevida.
          </p>
        </TermsSection>

        <TermsSection
          number="13"
          title="Segurança da conta e da solicitação"
        >
          <p>
            O usuário deve preservar a confidencialidade das informações utilizadas para recuperar ou acessar sua solicitação e deve evitar compartilhá-las com terceiros.
          </p>

          <p className="mt-4">
            A Smith Sterling poderá adotar controles de segurança, limitação de tentativas, validações de sessão e outras medidas destinadas a reduzir riscos de fraude ou acesso indevido.
          </p>
        </TermsSection>

        <TermsSection
          number="14"
          title="Disponibilidade da plataforma"
        >
          <p>
            A plataforma poderá passar por manutenção, atualização ou interrupções temporárias por motivos técnicos, operacionais ou de segurança.
          </p>

          <p className="mt-4">
            Isso não afasta direitos já constituídos em contratos ou propostas válidas nos termos da legislação aplicável.
          </p>
        </TermsSection>

        <TermsSection
          number="15"
          title="Propriedade intelectual"
        >
          <p>
            Marcas, identidade visual, textos, interfaces, software e demais conteúdos próprios da plataforma são protegidos na forma da legislação aplicável.
          </p>

          <p className="mt-4">
            O acesso à plataforma não concede ao usuário licença para reprodução comercial, exploração indevida ou utilização não autorizada desses conteúdos.
          </p>
        </TermsSection>

        <TermsSection
          number="16"
          title="Privacidade e proteção de dados"
        >
          <p>
            O tratamento de dados pessoais relacionado à plataforma será disciplinado também pela Política de Privacidade.
          </p>

          <p className="mt-4">
            Em caso de divergência entre estes Termos e regras legalmente obrigatórias de proteção de dados ou defesa do consumidor, prevalecerão as normas legais aplicáveis.
          </p>
        </TermsSection>

        <TermsSection
          number="17"
          title="Alterações destes Termos"
        >
          <p>
            Estes Termos poderão ser atualizados para refletir mudanças jurídicas, regulatórias, tecnológicas ou operacionais.
          </p>

          <p className="mt-4">
            Alterações posteriores não devem ser utilizadas para modificar retroativamente condições financeiras já contratadas, salvo quando houver fundamento jurídico ou acordo válido que autorize a alteração.
          </p>
        </TermsSection>

        <TermsSection
          number="18"
          title="Legislação aplicável e direitos do consumidor"
        >
          <p>
            A utilização da plataforma e as operações celebradas estarão sujeitas à legislação brasileira aplicável.
          </p>

          <p className="mt-4">
            Nenhuma disposição destes Termos deverá ser interpretada como renúncia a direito que a legislação assegure ao consumidor.
          </p>
        </TermsSection>

        <TermsSection
          number="19"
          title="Atendimento e dúvidas"
        >
          {supportEmail ? (
            <p>
              Dúvidas relacionadas à plataforma poderão ser encaminhadas para:
              <span className="ml-1 font-semibold text-[#0b1f33]">
                {supportEmail}
              </span>
            </p>
          ) : (
            <p>
              O canal oficial de atendimento será disponibilizado nesta página antes da entrada da plataforma em produção.
            </p>
          )}
        </TermsSection>

        <TermsSection
          number="20"
          title="Versão e vigência"
        >
          <div className="rounded-2xl bg-slate-50 p-5 text-sm">
            <p>
              Versão: desenvolvimento-1
            </p>

            <p className="mt-1">
              Situação: aguardando revisão jurídica, confirmação regulatória e dados institucionais definitivos.
            </p>
          </div>
        </TermsSection>
      </div>
    </InstitutionalPage>
  );
}

function TermsSection({
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

function TermsList({
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
