import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { GoogleTagManager } from '@next/third-parties/google';
import { ConsentBanner } from '@/components/consent/consent-banner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const consentBootstrap = `
(function () {
  var STORAGE_KEY = 'smith_sterling_consent_v1';

  var analyticsConsent = 'denied';
  var marketingConsent = 'denied';

  try {
    var rawChoice = window.localStorage.getItem(STORAGE_KEY);

    if (rawChoice) {
      var choice = JSON.parse(rawChoice);

      if (
        choice &&
        choice.version === 1 &&
        typeof choice.analytics === 'boolean' &&
        typeof choice.marketing === 'boolean'
      ) {
        analyticsConsent = choice.analytics
          ? 'granted'
          : 'denied';

        marketingConsent = choice.marketing
          ? 'granted'
          : 'denied';
      }
    }
  } catch (_) {
    analyticsConsent = 'denied';
    marketingConsent = 'denied';
  }

  window.dataLayer = window.dataLayer || [];

  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('consent', 'default', {
    analytics_storage: analyticsConsent,
    ad_storage: marketingConsent,
    ad_user_data: marketingConsent,
    ad_personalization: marketingConsent
  });
})();
`;

export const metadata: Metadata = {
  title: 'Smith Sterling | Crédito digital',
  description:
    'Plataforma digital da Smith Sterling para simulação e solicitação de crédito.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <Script
          id="smith-consent-bootstrap"
          strategy="beforeInteractive"
        >
          {consentBootstrap}
        </Script>
      </head>

      <GoogleTagManager gtmId="GTM-K4LWQKTM" />

      <body className={inter.className}>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
