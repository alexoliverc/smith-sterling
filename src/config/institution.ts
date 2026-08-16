export const institution = {
  legalName:
    'Smith Sterling Crédito Digital Ltda.',
  legalNameIsPlaceholder:
    true,

  tradeName:
    'Smith Sterling',

  document: {
    value:
      '00.000.000/0000-00',

    isPlaceholder:
      true,
  },

  address: {
    value:
      'A definir',

    isPlaceholder:
      true,
  },

  support: {
    email:
      'atendimento@smithsterling.com.br',

    emailIsPlaceholder:
      true,

    phone:
      'A definir',

    phoneIsPlaceholder:
      true,

    hours:
      'A definir',

    hoursIsPlaceholder:
      true,
  },

  privacy: {
    email:
      'privacidade@smithsterling.com.br',

    emailIsPlaceholder:
      true,

    officer:
      'Encarregado de Proteção de Dados — a definir',

    officerIsPlaceholder:
      true,
  },

  regulatory: {
    intendedModel:
      'Sociedade de Crédito Direto — SCD',

    status:
      'Em estruturação / autorização ainda não confirmada',

    authorization:
      'Não possui informação de autorização para publicação neste momento.',

    authorizationConfirmed:
      false,
  },
} as const;

export const productionInstitutionalRequirements = [
  {
    code: 'LEGAL_NAME',
    ready:
      !institution.legalNameIsPlaceholder,
  },
  {
    code: 'DOCUMENT',
    ready:
      !institution.document.isPlaceholder,
  },
  {
    code: 'ADDRESS',
    ready:
      !institution.address.isPlaceholder,
  },
  {
    code: 'SUPPORT_EMAIL',
    ready:
      !institution.support.emailIsPlaceholder,
  },
  {
    code: 'SUPPORT_PHONE',
    ready:
      !institution.support.phoneIsPlaceholder,
  },
  {
    code: 'SUPPORT_HOURS',
    ready:
      !institution.support.hoursIsPlaceholder,
  },
  {
    code: 'PRIVACY_EMAIL',
    ready:
      !institution.privacy.emailIsPlaceholder,
  },
  {
    code: 'PRIVACY_OFFICER',
    ready:
      !institution.privacy.officerIsPlaceholder,
  },
  {
    code: 'REGULATORY_AUTHORIZATION',
    ready:
      institution.regulatory.authorizationConfirmed,
  },
] as const;

export type ProductionInstitutionalRequirementCode =
  (typeof productionInstitutionalRequirements)[number]['code'];

export function getProductionInstitutionalReadiness() {
  const missingRequirements =
    productionInstitutionalRequirements
      .filter(
        (requirement) =>
          !requirement.ready,
      )
      .map(
        (requirement) =>
          requirement.code,
      );

  return {
    ready:
      missingRequirements.length === 0,

    missingRequirements,
  };
}

export function hasProductionInstitutionalData() {
  return getProductionInstitutionalReadiness().ready;
}
