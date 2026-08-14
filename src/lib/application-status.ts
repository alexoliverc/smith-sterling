import type { ApplicationStatus } from '@/generated/prisma/client';

type StatusPresentation = {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
};

export function getApplicationStatusPresentation(status: ApplicationStatus): StatusPresentation {
  switch (status) {
    case 'DRAFT':
      return {
        eyebrow: 'Solicitação em preenchimento',
        title: 'Sua solicitação ainda não foi enviada.',
        description: 'Conclua as informações necessárias para enviar sua solicitação.',
        label: 'Rascunho',
      };

    case 'SUBMITTED':
      return {
        eyebrow: 'Solicitação recebida',
        title: 'Sua solicitação foi recebida.',
        description: 'Recebemos seus dados e sua solicitação foi registrada para processamento.',
        label: 'Recebida',
      };

    case 'UNDER_REVIEW':
      return {
        eyebrow: 'Análise em andamento',
        title: 'Sua solicitação está em análise.',
        description: 'Estamos processando as informações da sua solicitação de crédito.',
        label: 'Em análise',
      };

    case 'APPROVED':
      return {
        eyebrow: 'Análise concluída',
        title: 'Sua solicitação foi aprovada.',
        description:
          'A análise foi concluída com resultado favorável. As condições finais devem ser apresentadas antes da contratação.',
        label: 'Aprovada',
      };

    case 'REJECTED':
      return {
        eyebrow: 'Análise concluída',
        title: 'Não foi possível aprovar sua solicitação.',
        description:
          'A análise foi concluída e, neste momento, não podemos prosseguir com a concessão solicitada.',
        label: 'Não aprovada',
      };

    case 'CANCELLED':
      return {
        eyebrow: 'Solicitação encerrada',
        title: 'Esta solicitação foi cancelada.',
        description: 'O processamento desta solicitação foi encerrado.',
        label: 'Cancelada',
      };

    default: {
      const exhaustiveCheck: never = status;

      return exhaustiveCheck;
    }
  }
}
