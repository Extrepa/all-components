import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

const mono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono', // We use this CSS variable in Tailwind
});

export const metadata: Metadata = {
  title: 'Errl Galaxy',
  description: 'Spatial Design System Visualizer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${mono.variable} bg-[#050505] text-white overflow-hidden antialiased`}>
        {children}
      </body>
    </html>
  );
}