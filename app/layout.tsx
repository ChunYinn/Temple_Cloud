import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/lib/toast-context';
import './globals.css';

const notoSansTC = Noto_Sans_TC({
  variable: '--font-noto-sans-tc',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900']
});

export const metadata: Metadata = {
  title: '廟務雲 - 為您的寺廟打造專屬數位門戶',
  description: '一個連結，連接信眾與寺廟。線上香油錢、活動報名、法會資訊，一鍵分享'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="zh-TW">
        <body className={`${notoSansTC.variable} antialiased font-sans bg-stone-50`}>
          <ToastProvider>
            {children}
          </ToastProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
