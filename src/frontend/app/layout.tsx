import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'EshopJu - Premium Jersey Store',
  description: 'Buy authentic football jerseys from top clubs and national teams. Fast delivery across Bangladesh.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-black text-white antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#111', color: '#fff', border: '1px solid #222' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#e11d48', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}

