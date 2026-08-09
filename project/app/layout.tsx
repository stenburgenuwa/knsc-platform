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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="/classical/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
