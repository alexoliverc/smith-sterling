import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smith Sterling',
  description: 'Plataforma digital Smith Sterling',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
