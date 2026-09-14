import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bloom, Acompanhamento de ciclo menstrual',
  description: 'Bloom, acompanhe seu ciclo menstrual com carinho, privacidade e clareza.',
  applicationName: 'Bloom',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Bloom, Seu ciclo, com cuidado',
    description: 'Entenda seu ciclo. Conheça melhor você. Estimativas baseadas nos seus registros.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={quicksand.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
