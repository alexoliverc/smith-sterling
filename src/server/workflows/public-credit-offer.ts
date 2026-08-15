import 'server-only';

import { prisma } from '@/lib/prisma';

export type PublicCreditOfferDecision =
  | 'ACCEPT'
  | 'DECLINE';

export class CreditOfferNotFoundError extends Error {
  constructor() {
    super(
      'A proposta não foi encontrada.',
    );

    this.name =
      'CreditOfferNotFoundError';
  }
}

export class CreditOfferNotAvailableError extends Error {
  constructor() {
    super(
      'A proposta não está mais disponível para decisão.',
    );

    this.name =
      'CreditOfferNotAvailableError';
  }
}

export class CreditOfferFormalizationConflictError extends Error {
  constructor() {
    super(
      'A situação atual da formalização não permite concluir o aceite.',
    );

    this.name =
      'CreditOfferFormalizationConflictError';
  }
}

type DecidePublicCreditOfferInput = {
  applicationId: string;
  version: number;
  decision: PublicCreditOfferDecision;
};

export async function decidePublicCreditOffer(
  input: DecidePublicCreditOfferInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const now = new Date();

      /*
       * Serializa a decisão do cliente com
       * a publicação de novas versões.
       *
       * publishCreditOffer usa a mesma linha
       * de CreditApplication como ponto de
       * serialização dentro da transação.
       *
       * Assim, publicação e decisão não podem
       * alterar simultaneamente versões da
       * mesma solicitação.
       */
      await tx.creditApplication.update({
        where: {
          id:
            input.applicationId,
        },

        data: {
          updatedAt:
            now,
        },

        select: {
          id: true,
        },
      });

      const offer =
        await tx.creditOffer.findUnique({
          where: {
            applicationId_version: {
              applicationId:
                input.applicationId,

              version:
                input.version,
            },
          },

          select: {
            id: true,
            applicationId: true,
            version: true,
            status: true,
            expiresAt: true,
          },
        });

      if (!offer) {
        throw new CreditOfferNotFoundError();
      }

      /*
       * Se a validade terminou enquanto
       * a página estava aberta, registramos
       * a expiração de forma auditável.
       */
      if (
        offer.status ===
          'PRESENTED' &&
        offer.expiresAt <= now
      ) {
        const expired =
          await tx.creditOffer.updateMany({
            where: {
              id: offer.id,
              applicationId:
                input.applicationId,
              version:
                input.version,
              status:
                'PRESENTED',
            },

            data: {
              status:
                'EXPIRED',

              expiredAt:
                now,
            },
          });

        if (expired.count === 1) {
          await tx.creditOfferStatusHistory.create({
            data: {
              offerId:
                offer.id,

              fromStatus:
                'PRESENTED',

              toStatus:
                'EXPIRED',

              actorType:
                'SYSTEM',

              actorId:
                null,

              reason:
                'Prazo de validade da proposta encerrado antes da decisão do cliente.',
            },
          });
        }

        return {
          success: false as const,
          reason:
            'EXPIRED' as const,
        };
      }

      if (
        offer.status !==
        'PRESENTED'
      ) {
        /*
         * Aceite repetido da mesma versão
         * pode ser tratado de forma
         * idempotente pela aplicação.
         */
        if (
          input.decision ===
            'ACCEPT' &&
          offer.status ===
            'ACCEPTED'
        ) {
          return {
            success: true as const,
            outcome:
              'ACCEPTED' as const,
            alreadyDecided:
              true,
          };
        }

        if (
          input.decision ===
            'DECLINE' &&
          offer.status ===
            'DECLINED'
        ) {
          return {
            success: true as const,
            outcome:
              'DECLINED' as const,
            alreadyDecided:
              true,
          };
        }

        throw new CreditOfferNotAvailableError();
      }

      /*
       * =====================================================
       * ACEITE
       * =====================================================
       */
      if (
        input.decision ===
        'ACCEPT'
      ) {
        const existingFormalization =
          await tx.creditFormalization.findUnique({
            where: {
              applicationId:
                input.applicationId,
            },

            select: {
              id: true,
              status: true,
              acceptedOfferId: true,
            },
          });

        /*
         * Durante a migração, propostas
         * antigas já possuem uma
         * formalização PENDING criada
         * automaticamente.
         *
         * Também toleramos estados já
         * avançados para não destruir
         * dados legados.
         *
         * CANCELLED e DISBURSED não podem
         * ser reabertos por um novo aceite.
         */
        if (
          existingFormalization &&
          (
            existingFormalization.status ===
              'CANCELLED' ||
            existingFormalization.status ===
              'DISBURSED'
          )
        ) {
          throw new CreditOfferFormalizationConflictError();
        }


        /*
         * Uma formalização já vinculada a uma
         * proposta não pode ser reutilizada para
         * aceitar outra versão.
         *
         * Registros legados com acceptedOfferId
         * nulo serão vinculados abaixo no upsert.
         */
        if (
          existingFormalization?.acceptedOfferId
        ) {
          throw new CreditOfferFormalizationConflictError();
        }

        const accepted =
          await tx.creditOffer.updateMany({
            where: {
              id:
                offer.id,

              applicationId:
                input.applicationId,

              version:
                input.version,

              status:
                'PRESENTED',

              expiresAt: {
                gt: now,
              },
            },

            data: {
              status:
                'ACCEPTED',

              acceptedAt:
                now,
            },
          });

        /*
         * Outra requisição pode ter
         * decidido a mesma proposta
         * simultaneamente.
         */
        if (
          accepted.count !== 1
        ) {
          throw new CreditOfferNotAvailableError();
        }

        await tx.creditOfferStatusHistory.create({
          data: {
            offerId:
              offer.id,

            fromStatus:
              'PRESENTED',

            toStatus:
              'ACCEPTED',

            actorType:
              'APPLICANT',

            actorId:
              null,

            reason:
              'Proposta aceita pelo cliente na área autenticada da solicitação.',
          },
        });

        /*
         * No fluxo novo, é aqui que a
         * formalização nasce.
         *
         * O upsert mantém compatibilidade
         * temporária com solicitações
         * aprovadas antes da migração.
         */
        await tx.creditFormalization.upsert({
          where: {
            applicationId:
              input.applicationId,
          },

          update: {
            acceptedOfferId:
              offer.id,
          },

          create: {
            applicationId:
              input.applicationId,

            acceptedOfferId:
              offer.id,

            status:
              'PENDING',
          },
        });

        return {
          success: true as const,
          outcome:
            'ACCEPTED' as const,
          alreadyDecided:
            false,
        };
      }

      /*
       * =====================================================
       * RECUSA
       * =====================================================
       *
       * Não apagamos eventual
       * CreditFormalization legado.
       *
       * Quando concluirmos a migração,
       * o acesso à formalização exigirá
       * uma CreditOffer ACCEPTED.
       */
      const declined =
        await tx.creditOffer.updateMany({
          where: {
            id:
              offer.id,

            applicationId:
              input.applicationId,

            version:
              input.version,

            status:
              'PRESENTED',

            expiresAt: {
              gt: now,
            },
          },

          data: {
            status:
              'DECLINED',

            declinedAt:
              now,
          },
        });

      if (
        declined.count !== 1
      ) {
        throw new CreditOfferNotAvailableError();
      }

      await tx.creditOfferStatusHistory.create({
        data: {
          offerId:
            offer.id,

          fromStatus:
            'PRESENTED',

          toStatus:
            'DECLINED',

          actorType:
            'APPLICANT',

          actorId:
            null,

          reason:
            'Proposta recusada pelo cliente na área autenticada da solicitação.',
        },
      });

      return {
        success: true as const,
        outcome:
          'DECLINED' as const,
        alreadyDecided:
          false,
      };
    },
  );
}
