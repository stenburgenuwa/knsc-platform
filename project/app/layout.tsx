import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KNSCL - Kenya National Sub County League',
  description: 'Official website of the Kenya National Sub County League',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
