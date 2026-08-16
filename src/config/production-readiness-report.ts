import {
  getProductionInstitutionalReadiness,
  type ProductionInstitutionalRequirementCode,
} from './institution';

export type ProductionReadinessDomain =
  | 'EMPRESA'
  | 'ATENDIMENTO'
  | 'PRIVACIDADE'
  | 'REGULATORIO';

type RequirementMetadata = {
  domain:
    ProductionReadinessDomain;

  label:
    string;
};

const requirementMetadata = {
  LEGAL_NAME: {
    domain:
      'EMPRESA',

    label:
      'Razão social definitiva',
  },

  DOCUMENT: {
    domain:
      'EMPRESA',

    label:
      'Documento institucional definitivo',
  },

  ADDRESS: {
    domain:
      'EMPRESA',

    label:
      'Endereço institucional definitivo',
  },

  SUPPORT_EMAIL: {
    domain:
      'ATENDIMENTO',

    label:
      'E-mail de atendimento definitivo',
  },

  SUPPORT_PHONE: {
    domain:
      'ATENDIMENTO',

    label:
      'Telefone de atendimento definitivo',
  },

  SUPPORT_HOURS: {
    domain:
      'ATENDIMENTO',

    label:
      'Horário de atendimento definitivo',
  },

  PRIVACY_EMAIL: {
    domain:
      'PRIVACIDADE',

    label:
      'Canal de privacidade definitivo',
  },

  PRIVACY_OFFICER: {
    domain:
      'PRIVACIDADE',

    label:
      'Responsável de privacidade definido',
  },

  REGULATORY_AUTHORIZATION: {
    domain:
      'REGULATORIO',

    label:
      'Situação regulatória confirmada',
  },
} satisfies Record<
  ProductionInstitutionalRequirementCode,
  RequirementMetadata
>;

export function getProductionReadinessReport() {
  const institutional =
    getProductionInstitutionalReadiness();

  const blockers =
    institutional.missingRequirements.map(
      (code) => ({
        code,
        ...requirementMetadata[code],
      }),
    );

  return {
    ready:
      institutional.ready,

    blockers,
  };
}
