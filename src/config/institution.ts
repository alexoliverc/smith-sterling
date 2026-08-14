export const institution = {
  legalName:
    'Smith Sterling Crédito Digital Ltda.',

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

export function hasProductionInstitutionalData() {
  return (
    !institution.document.isPlaceholder &&
    !institution.address.isPlaceholder &&
    !institution.support.emailIsPlaceholder &&
    !institution.support.phoneIsPlaceholder &&
    !institution.privacy.emailIsPlaceholder &&
    !institution.privacy.officerIsPlaceholder &&
    institution.regulatory.authorizationConfirmed
  );
}
