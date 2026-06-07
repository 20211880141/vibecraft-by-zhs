import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from './providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GitHub Profiles',
  description:
    'Search and explore GitHub developer profiles — view user info, stats, and top repositories.',
  openGraph: {
    title: 'GitHub Profiles',
    description:
      'Search and explore GitHub developer profiles — view user info, stats, and top repositories.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans text-foreground antialiased transition-colors">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}