import type {
  Metadata,
  Viewport,
} from 'next';

import {
  Geist,
  Geist_Mono,
} from 'next/font/google';

import './globals.css';

import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable:
    '--font-geist-sans',

  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable:
    '--font-geist-mono',

  subsets: ['latin'],
});

export const metadata: Metadata = {
  title:
    'SkyLine AI — Flight Booking Platform',

  description:
    'Modern realtime flight booking platform built with Next.js, Supabase, Zustand, and Tailwind CSS.',

  manifest: '/manifest.json',

  keywords: [
    'flight booking',
    'nextjs',
    'supabase',
    'airline app',
    'flight management',
    'realtime booking',
    'PWA',
  ],

  authors: [
    {
      name: 'Bupana Varshith',
    },
  ],

  icons: {
    icon: '/icon-192.png',

    apple: '/icon-512.png',
  },

  openGraph: {
    title:
      'SkyLine AI — Flight Booking Platform',

    description:
      'Premium realtime airline booking experience.',

    type: 'website',
  },
};

export const viewport: Viewport =
  {
    themeColor: '#020617',
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen overflow-x-hidden bg-black font-sans text-white antialiased">
        {/* Background Glow */}
        <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_40%)]" />

        <div className="fixed inset-0 -z-50 bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_40%)]" />

        {/* Animated Grid */}
        <div className="fixed inset-0 -z-50 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="relative flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/40 px-6 py-8 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-400 md:flex-row">
            <p>
              © 2026 SkyLine AI.
              All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <span>
                Next.js 16
              </span>

              <span>
                Supabase
              </span>

              <span>
                Realtime Seats
              </span>

              <span>
                PWA Enabled
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}