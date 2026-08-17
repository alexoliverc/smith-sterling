import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smith Sterling | Crédito digital',
  description: 'Plataforma digital da Smith Sterling para simulação e solicitação de crédito.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <GoogleTagManager gtmId="GTM-K4LWQKTM" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
