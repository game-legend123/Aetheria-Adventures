import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Literata } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Cuộc phiêu lưu ở Aetheria',
  description: 'Một game nhập vai phiêu lưu bằng chữ do AI điều khiển.',
};

const literata = Literata({
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  variable: '--font-literata',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark ${literata.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
