import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'Component Vault', description: 'Errl Component Archiver' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="flex min-h-screen"><Sidebar /><div className="flex-1 ml-64">{children}</div></div>
      </body>
    </html>
  );
}
