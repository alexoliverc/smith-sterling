import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),

  redirect: vi.fn(),

  revalidatePath: vi.fn(),

  findAdminSession: vi.fn(),

  findAdminFormalizationForTransition:
    vi.fn(),

  transitionFormalizationStatus:
    vi.fn(),

  registerFormalizationDisbursement:
    vi.fn(),

  encryptPii: vi.fn(),
}));

vi.mock(
  'next/headers',
  () => ({
    cookies:
      mocks.cookies,
  }),
);

vi.mock(
  'next/navigation',
  () => ({
    redirect:
      mocks.redirect,
  }),
);

vi.mock(
  'next/cache',
  () => ({
    revalidatePath:
      mocks.revalidatePath,
  }),
);

vi.mock(
  '@/server/auth/admin-session',
  () => ({
    ADMIN_SESSION_COOKIE:
      'admin-session',

    findAdminSession:
      mocks.findAdminSession,
  }),
);

vi.mock(
  '@/server/dal/admin-formalization',
  () => ({
    findAdminFormalizationForTransition:
      mocks.findAdminFormalizationForTransition,
  }),
);

vi.mock(
  '@/lib/security/pii',
  () => ({
    encryptPii:
      mocks.encryptPii,
  }),
);

vi.mock(
  '@/server/workflows/formalization-status',
  () => ({
    ConcurrentFormalizationStatusTransitionError:
      class ConcurrentFormalizationStatusTransitionError
        extends Error {},

    FormalizationOfferNotAcceptedError:
      class FormalizationOfferNotAcceptedError
        extends Error {},

    InvalidFormalizationStatusTransitionError:
      class InvalidFormalizationStatusTransitionError
        extends Error {},

    transitionFormalizationStatus:
      mocks.transitionFormalizationStatus,

    registerFormalizationDisbursement:
      mocks.registerFormalizationDisbursement,
  }),
);

import {
  confirmFormalizationReady,
  registerDisbursement,
} from '@/app/admin/solicitacoes/[protocol]/formalizacao/actions';

describe(
  'actions da formalização administrativa',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.cookies.mockResolvedValue({
        get: vi.fn(() => ({
          value:
            'admin-token',
        })),
      });

      mocks.findAdminSession.mockResolvedValue({
        user: {
          id:
            'admin-1',

          name:
            'Administrador',

          role:
            'SUPER_ADMIN',
        },
      });

      mocks.redirect.mockImplementation(
        (destination: string) => {
          throw new Error(
            `REDIRECT:${destination}`,
          );
        },
      );

      mocks.encryptPii.mockReturnValue(
        'encrypted-reference',
      );
    });

    it(
      'bloqueia conferência quando acceptedOfferId aponta para proposta não aceita',
      async () => {
        mocks.findAdminFormalizationForTransition.mockResolvedValue({
          id:
            'application-1',

          status:
            'APPROVED',

          formalization: {
            id:
              'formalization-1',

            status:
              'BANK_DETAILS_SUBMITTED',

            bankDataEncrypted:
              'encrypted-bank-data',

            acceptedOfferId:
              'offer-1',

            acceptedOffer: {
              id:
                'offer-1',

              status:
                'CANCELLED',
            },
          },
        });

        const result =
          await confirmFormalizationReady(
            'SS-TESTE',
            {},
            new FormData(),
          );

        expect(result).toEqual({
          error:
            'A operação não pode avançar porque a proposta vinculada à formalização não está aceita pelo cliente.',
        });

        expect(
          mocks.transitionFormalizationStatus,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'bloqueia registro da liberação quando a proposta vinculada não está aceita',
      async () => {
        mocks.findAdminFormalizationForTransition.mockResolvedValue({
          id:
            'application-1',

          status:
            'APPROVED',

          formalization: {
            id:
              'formalization-1',

            status:
              'READY_FOR_DISBURSEMENT',

            bankDataEncrypted:
              'encrypted-bank-data',

            acceptedOfferId:
              'offer-1',

            acceptedOffer:
              null,
          },
        });

        const formData =
          new FormData();

        formData.set(
          'confirmed',
          'on',
        );

        formData.set(
          'reference',
          'transfer-123',
        );

        const result =
          await registerDisbursement(
            'SS-TESTE',
            {},
            formData,
          );

        expect(result).toEqual({
          error:
            'A operação não pode avançar porque a proposta vinculada à formalização não está aceita pelo cliente.',
        });

        expect(
          mocks.encryptPii,
        ).not.toHaveBeenCalled();

        expect(
          mocks.registerFormalizationDisbursement,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'mantém compatibilidade temporária para formalização legada sem acceptedOfferId',
      async () => {
        mocks.findAdminFormalizationForTransition.mockResolvedValue({
          id:
            'application-1',

          status:
            'APPROVED',

          formalization: {
            id:
              'formalization-legacy',

            status:
              'BANK_DETAILS_SUBMITTED',

            bankDataEncrypted:
              'encrypted-bank-data',

            acceptedOfferId:
              null,

            acceptedOffer:
              null,
          },
        });

        mocks.transitionFormalizationStatus.mockResolvedValue({
          id:
            'formalization-legacy',

          status:
            'READY_FOR_DISBURSEMENT',
        });

        await expect(
          confirmFormalizationReady(
            'SS-TESTE',
            {},
            new FormData(),
          ),
        ).rejects.toThrow(
          'REDIRECT:/admin/solicitacoes/SS-TESTE/formalizacao',
        );

        expect(
          mocks.transitionFormalizationStatus,
        ).toHaveBeenCalledWith(
          'formalization-legacy',
          'READY_FOR_DISBURSEMENT',
          {
            actorType:
              'OPERATOR',

            actorId:
              'admin-1',

            reason:
              'Dados bancários conferidos e operação preparada para liberação.',
          },
        );
      },
    );
  },
);
