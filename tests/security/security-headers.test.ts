import {
  describe,
  expect,
  it,
} from 'vitest';

import nextConfig from '../../next.config';

async function getConfiguredHeaders() {
  if (!nextConfig.headers) {
    throw new Error(
      'next.config.ts precisa definir headers().',
    );
  }

  return nextConfig.headers();
}

describe(
  'security headers',
  () => {
    it(
      'remove a divulgação automática da tecnologia Next.js',
      () => {
        expect(
          nextConfig.poweredByHeader,
        ).toBe(false);
      },
    );

    it(
      'aplica os headers de segurança a todas as rotas',
      async () => {
        const rules =
          await getConfiguredHeaders();

        expect(
          rules,
        ).toHaveLength(1);

        expect(
          rules[0]?.source,
        ).toBe(
          '/:path*',
        );
      },
    );

    it(
      'mantém exatamente o baseline de headers esperado',
      async () => {
        const rules =
          await getConfiguredHeaders();

        const headers =
          Object.fromEntries(
            (
              rules[0]?.headers ??
              []
            ).map(
              ({
                key,
                value,
              }) => [
                key,
                value,
              ],
            ),
          );

        expect(
          headers,
        ).toEqual({
          'Content-Security-Policy':
            "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",

          'Strict-Transport-Security':
            'max-age=31536000',

          'X-Content-Type-Options':
            'nosniff',

          'X-Frame-Options':
            'DENY',

          'Referrer-Policy':
            'strict-origin-when-cross-origin',

          'Permissions-Policy':
            'geolocation=(), microphone=(), usb=()',
        });
      },
    );

    it(
      'não ativa CSP de scripts antes da estratégia de nonce',
      async () => {
        const rules =
          await getConfiguredHeaders();

        const csp =
          (
            rules[0]?.headers ??
            []
          ).find(
            (header) =>
              header.key ===
              'Content-Security-Policy',
          )?.value;

        expect(
          csp,
        ).toBe(
          "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
        );

        expect(
          csp,
        ).not.toContain(
          'script-src',
        );

        expect(
          csp,
        ).not.toContain(
          'style-src',
        );
      },
    );
  },
);
