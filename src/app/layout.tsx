import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { LangProvider } from '@/contexts/LangContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KitaabValue — Instant Book Price for Scrap Dealers',
  description:
    'Scan any Indian textbook and get an instant locality-adjusted resale price. Built for kabaadiwalas, book dealers, and buyback shops.',
  keywords: ['book price', 'scrap', 'kabaadi', 'raddi', 'textbook resale', 'India'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
