import 'server-only';

import type {
  ApplicationStatusActor,
  FormalizationStatus,
} from '@/generated/prisma/client';

import { prisma } from '@/lib/prisma';

type TransitionOptions = {
  actorType?: ApplicationStatusActor;
  actorId?: string;
  reason?: string;
};

const allowedTransitions: Record<
  FormalizationStatus,
  readonly FormalizationStatus[]
> = {
  PENDING: [
    'BANK_DETAILS_SUBMITTED',
    'CANCELLED',
  ],

  BANK_DETAILS_SUBMITTED: [
    'READY_FOR_DISBURSEMENT',
    'CANCELLED',
  ],

  READY_FOR_DISBURSEMENT: [
    'DISBURSED',
    'CANCELLED',
  ],

  DISBURSED: [],

  CANCELLED: [],
};

export class InvalidFormalizationStatusTransitionError extends Error {
  constructor(
    fromStatus: FormalizationStatus,
    toStatus: FormalizationStatus,
  ) {
    super(
      `Transição de formalização de ${fromStatus} para ${toStatus} não permitida.`,
    );

    this.name =
      'InvalidFormalizationStatusTransitionError';
  }
}

export class ConcurrentFormalizationStatusTransitionError extends Error {
  constructor() {
    super(
      'O status da formalização foi alterado por outra operação.',
    );

    this.name =
      'ConcurrentFormalizationStatusTransitionError';
  }
}

export class FormalizationLockedError extends Error {
  constructor() {
    super(
      'Esta formalização não permite mais alteração dos dados bancários.',
    );

    this.name =
      'FormalizationLockedError';
  }
}

/*
 * Invariante central do novo fluxo:
 *
 * nenhuma operação financeira pode
 * avançar sem uma CreditOffer ACCEPTED.
 */
export class FormalizationOfferNotAcceptedError extends Error {
  constructor() {
    super(
      'A formalização não pode avançar sem uma proposta de crédito aceita.',
    );

    this.name =
      'FormalizationOfferNotAcceptedError';
  }
}

export async function transitionFormalizationStatus(
  formalizationId: string,
  toStatus: FormalizationStatus,
  options: TransitionOptions = {},
) {
  return prisma.$transaction(
    async (tx) => {
      const formalization =
        await tx.creditFormalization.findUnique({
          where: {
            id:
              formalizationId,
          },

          select: {
            id: true,

            applicationId:
              true,

            status: true,
          },
        });

      if (!formalization) {
        throw new Error(
          'Formalização não encontrada.',
        );
      }

      /*
       * CANCELLED continua permitido mesmo
       * para registros legados.
       *
       * Qualquer avanço operacional exige
       * proposta aceita.
       */
      if (
        toStatus !==
        'CANCELLED'
      ) {
        const acceptedOffer =
          await tx.creditOffer.findFirst({
            where: {
              applicationId:
                formalization.applicationId,

              status:
                'ACCEPTED',
            },

            select: {
              id: true,
            },
          });

        if (!acceptedOffer) {
          throw new FormalizationOfferNotAcceptedError();
        }
      }

      const fromStatus =
        formalization.status;

      const transitionAllowed =
        allowedTransitions[
          fromStatus
        ].includes(
          toStatus,
        );

      if (!transitionAllowed) {
        throw new InvalidFormalizationStatusTransitionError(
          fromStatus,
          toStatus,
        );
      }

      const now =
        new Date();

      const updateData = {
        status:
          toStatus,

        ...(toStatus ===
        'READY_FOR_DISBURSEMENT'
          ? {
              readyAt:
                now,
            }
          : {}),

        ...(toStatus ===
        'DISBURSED'
          ? {
              disbursedAt:
                now,
            }
          : {}),

        ...(toStatus ===
        'CANCELLED'
          ? {
              cancelledAt:
                now,
            }
          : {}),
      };

      const updateResult =
        await tx.creditFormalization.updateMany({
          where: {
            id:
              formalizationId,

            status:
              fromStatus,
          },

          data:
            updateData,
        });

      if (
        updateResult.count !==
        1
      ) {
        throw new ConcurrentFormalizationStatusTransitionError();
      }

      await tx.formalizationStatusHistory.create({
        data: {
          formalizationId,

          fromStatus,
          toStatus,

          actorType:
            options.actorType ??
            'SYSTEM',

          actorId:
            options.actorId ??
            null,

          reason:
            options.reason ??
            null,
        },
      });

      return tx.creditFormalization.findUnique({
        where: {
          id:
            formalizationId,
        },

        select: {
          id: true,
          status: true,

          bankDataSubmittedAt:
            true,

          readyAt:
            true,

          disbursedAt:
            true,

          cancelledAt:
            true,

          updatedAt:
            true,
        },
      });
    },
  );
}

export async function submitFormalizationBankData(
  formalizationId: string,
  bankDataEncrypted: string,
) {
  return prisma.$transaction(
    async (tx) => {
      const formalization =
        await tx.creditFormalization.findUnique({
          where: {
            id:
              formalizationId,
          },

          select: {
            id: true,

            applicationId:
              true,

            status: true,
          },
        });

      if (!formalization) {
        throw new Error(
          'Formalização não encontrada.',
        );
      }

      /*
       * Mesmo que uma DAL ou Server Action
       * seja chamada incorretamente, os
       * dados bancários não entram no fluxo
       * sem aceite prévio da proposta.
       */
      const acceptedOffer =
        await tx.creditOffer.findFirst({
          where: {
            applicationId:
              formalization.applicationId,

            status:
              'ACCEPTED',
          },

          select: {
            id: true,
          },
        });

      if (!acceptedOffer) {
        throw new FormalizationOfferNotAcceptedError();
      }

      const now =
        new Date();

      if (
        formalization.status ===
        'PENDING'
      ) {
        const updateResult =
          await tx.creditFormalization.updateMany({
            where: {
              id:
                formalizationId,

              status:
                'PENDING',
            },

            data: {
              bankDataEncrypted,

              bankDataSubmittedAt:
                now,

              status:
                'BANK_DETAILS_SUBMITTED',
            },
          });

        if (
          updateResult.count !==
          1
        ) {
          throw new ConcurrentFormalizationStatusTransitionError();
        }

        await tx.formalizationStatusHistory.create({
          data: {
            formalizationId,

            fromStatus:
              'PENDING',

            toStatus:
              'BANK_DETAILS_SUBMITTED',

            actorType:
              'SYSTEM',

            actorId:
              null,

            reason:
              'Dados bancários enviados pelo cliente.',
          },
        });

        return tx.creditFormalization.findUnique({
          where: {
            id:
              formalizationId,
          },

          select: {
            id: true,
            status: true,

            bankDataSubmittedAt:
              true,

            updatedAt:
              true,
          },
        });
      }

      if (
        formalization.status ===
        'BANK_DETAILS_SUBMITTED'
      ) {
        const updateResult =
          await tx.creditFormalization.updateMany({
            where: {
              id:
                formalizationId,

              status:
                'BANK_DETAILS_SUBMITTED',
            },

            data: {
              bankDataEncrypted,

              bankDataSubmittedAt:
                now,
            },
          });

        if (
          updateResult.count !==
          1
        ) {
          throw new ConcurrentFormalizationStatusTransitionError();
        }

        return tx.creditFormalization.findUnique({
          where: {
            id:
              formalizationId,
          },

          select: {
            id: true,
            status: true,

            bankDataSubmittedAt:
              true,

            updatedAt:
              true,
          },
        });
      }

      throw new FormalizationLockedError();
    },
  );
}

export async function registerFormalizationDisbursement(
  formalizationId: string,
  disbursementReferenceEncrypted: string,
  options: TransitionOptions = {},
) {
  return prisma.$transaction(
    async (tx) => {
      const formalization =
        await tx.creditFormalization.findUnique({
          where: {
            id:
              formalizationId,
          },

          select: {
            id: true,

            applicationId:
              true,

            status: true,
          },
        });

      if (!formalization) {
        throw new Error(
          'Formalização não encontrada.',
        );
      }

      /*
       * DISBURSED representa apenas o
       * registro interno de uma
       * transferência que o operador
       * confirma ter ocorrido fora deste
       * sistema.
       *
       * Ainda assim, o registro não pode
       * avançar sem oferta aceita.
       */
      const acceptedOffer =
        await tx.creditOffer.findFirst({
          where: {
            applicationId:
              formalization.applicationId,

            status:
              'ACCEPTED',
          },

          select: {
            id: true,
          },
        });

      if (!acceptedOffer) {
        throw new FormalizationOfferNotAcceptedError();
      }

      const fromStatus =
        formalization.status;

      const toStatus:
        FormalizationStatus =
        'DISBURSED';

      if (
        fromStatus !==
        'READY_FOR_DISBURSEMENT'
      ) {
        throw new InvalidFormalizationStatusTransitionError(
          fromStatus,
          toStatus,
        );
      }

      const now =
        new Date();

      const updateResult =
        await tx.creditFormalization.updateMany({
          where: {
            id:
              formalizationId,

            status:
              'READY_FOR_DISBURSEMENT',
          },

          data: {
            status:
              'DISBURSED',

            disbursementReferenceEncrypted,

            disbursedAt:
              now,
          },
        });

      if (
        updateResult.count !==
        1
      ) {
        throw new ConcurrentFormalizationStatusTransitionError();
      }

      await tx.formalizationStatusHistory.create({
        data: {
          formalizationId,

          fromStatus:
            'READY_FOR_DISBURSEMENT',

          toStatus:
            'DISBURSED',

          actorType:
            options.actorType ??
            'SYSTEM',

          actorId:
            options.actorId ??
            null,

          reason:
            options.reason ??
            null,
        },
      });

      return tx.creditFormalization.findUnique({
        where: {
          id:
            formalizationId,
        },

        select: {
          id: true,
          status: true,

          disbursedAt:
            true,

          updatedAt:
            true,
        },
      });
    },
  );
}
