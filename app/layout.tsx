import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { PAGES, PRELOAD, SITE } from '@/lib/portfolio';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.label}`,
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: '#e9e6e1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Warm the first few page images before hydration.
  const headStart = PAGES.filter((p) => p.src)
    .slice(0, PRELOAD.ahead + 1)
    .map((p) => p.src as string);

  return (
    <html lang="en" className={inter.className}>
      <head>
        {headStart.map((src) => (
          <link key={src} rel="preload" as="image" href={src} fetchPriority="high" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
