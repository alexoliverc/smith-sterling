import type {
  NextConfig,
} from 'next';

const securityHeaders = [
  {
    key:
      'Content-Security-Policy',

    value:
      "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  },
  {
    key:
      'Strict-Transport-Security',

    value:
      'max-age=31536000',
  },
  {
    key:
      'X-Content-Type-Options',

    value:
      'nosniff',
  },
  {
    key:
      'X-Frame-Options',

    value:
      'DENY',
  },
  {
    key:
      'Referrer-Policy',

    value:
      'strict-origin-when-cross-origin',
  },
  {
    key:
      'Permissions-Policy',

    value:
      'geolocation=(), microphone=(), usb=()',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader:
    false,

  async headers() {
    return [
      {
        source:
          '/:path*',

        headers:
          securityHeaders,
      },
    ];
  },
};

export default nextConfig;
