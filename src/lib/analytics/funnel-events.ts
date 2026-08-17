/**
 * Contrato canônico compartilhado entre Server e Client Components.
 *
 * Este módulo não contém APIs de navegador.
 */
export const FUNNEL_EVENTS = {
  applicationStart: 'credit_application_start',
  applicationCreated: 'credit_application_created',

  analysisSubmitted: 'credit_analysis_submitted',
  analysisUnderReview: 'credit_analysis_under_review',
  analysisCompleted: 'credit_analysis_completed',

  offerView: 'credit_offer_view',
  offerAccepted: 'credit_offer_accepted',
  offerDeclined: 'credit_offer_declined',

  formalizationView: 'credit_formalization_view',
  bankDetailsSubmitted: 'bank_details_submitted',
  readyForDisbursement: 'credit_ready_for_disbursement',
  disbursed: 'credit_disbursed',
} as const;

export type FunnelEventName =
  (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

export type FunnelEventParameters = {
  funnel_stage?: string;
  offer_status?: string;
  formalization_status?: string;
};
