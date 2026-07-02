import type { Metadata } from 'next';
import './globals.css';
import { PrimaryLayout } from '../components/layout/PrimaryLayout';

export const metadata: Metadata = {
  title: 'Super App',
  description: 'A lightweight marketplace MVP built with the existing core modules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PrimaryLayout>{children}</PrimaryLayout>
      </body>
    </html>
  );
}
