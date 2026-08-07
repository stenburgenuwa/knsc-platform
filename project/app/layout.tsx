import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KNSCL - Kilifi North Sub County League',
  description: 'Official website of the Kilifi North Sub County League',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Lora:wght@400;600&display=swap"
        />
        <link rel="stylesheet" href="/classical/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
