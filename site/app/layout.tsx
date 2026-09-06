import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { EventBackdrop } from './event-backdrop';
import './globals.css';

const heading = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
});
const mono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Leaderboard Platanus Hack 2026 · WOKI',
  description:
    'Ranking actualizado de votos públicos para los proyectos de Platanus Hack 26 Bogotá.',
  icons: { icon: '/woki-logo.png', apple: '/woki-logo.png' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className={`${heading.variable} ${mono.variable}`}>
        <EventBackdrop />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
