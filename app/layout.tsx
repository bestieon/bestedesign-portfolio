import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bestedesign Portfolio',
  description: 'Modern industrial design portfolio system.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grid-bg" />
        {children}
      </body>
    </html>
  );
}
