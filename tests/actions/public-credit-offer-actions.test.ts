import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const mocks = vi.hoisted(() => ({
  cookies:
    vi.fn(),

  redirect:
    vi.fn(),

  revalidatePath:
    vi.fn(),

  getDecisionContext:
    vi.fn(),

  decidePublicCreditOffer:
    vi.fn(),
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
  '@/server/dal/public-credit-offer',
  () => ({
    getPublicCreditOfferDecisionContext:
      mocks.getDecisionContext,
  }),
);

vi.mock(
  '@/server/workflows/public-credit-offer',
  () => ({
    CreditOfferFormalizationConflictError:
      class CreditOfferFormalizationConflictError
        extends Error {},

    CreditOfferNotAvailableError:
      class CreditOfferNotAvailableError
        extends Error {},

    CreditOfferNotFoundError:
      class CreditOfferNotFoundError
        extends Error {},

    decidePublicCreditOffer:
      mocks.decidePublicCreditOffer,
  }),
);

import {
  decideOffer,
} from '@/app/solicitacao/[protocol]/proposta/actions';

describe(
  'decideOffer',
  () => {
    beforeEach(() => {
      vi.clearAllMocks();

      mocks.cookies.mockResolvedValue({
        get: vi.fn(() => undefined),
      });

      mocks.redirect.mockImplementation(
        (destination: string) => {
          throw new Error(
            `REDIRECT:${destination}`,
          );
        },
      );
    });

    it(
      'bloqueia aceite sem confirmação explícita das condições',
      async () => {
        const formData =
          new FormData();

        const result =
          await decideOffer(
            'SS-TESTE',
            1,
            'ACCEPT',
            {},
            formData,
          );

        expect(result).toEqual({
          error:
            'Confirme que leu as condições da proposta e deseja aceitá-la antes de continuar.',
        });

        expect(
          mocks.cookies,
        ).not.toHaveBeenCalled();

        expect(
          mocks.getDecisionContext,
        ).not.toHaveBeenCalled();

        expect(
          mocks.decidePublicCreditOffer,
        ).not.toHaveBeenCalled();
      },
    );

    it(
      'aceite confirmado prossegue para validação da sessão',
      async () => {
        const formData =
          new FormData();

        formData.set(
          'acceptTerms',
          'on',
        );

        await expect(
          decideOffer(
            'SS-TESTE',
            1,
            'ACCEPT',
            {},
            formData,
          ),
        ).rejects.toThrow(
          'REDIRECT:/acompanhar',
        );

        expect(
          mocks.cookies,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      'recusa não exige confirmação de leitura das condições',
      async () => {
        const formData =
          new FormData();

        await expect(
          decideOffer(
            'SS-TESTE',
            1,
            'DECLINE',
            {},
            formData,
          ),
        ).rejects.toThrow(
          'REDIRECT:/acompanhar',
        );

        expect(
          mocks.cookies,
        ).toHaveBeenCalledTimes(1);
      },
    );
  },
);
