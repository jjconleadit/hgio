import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://r00mba.art'),
  title: 'r00mba - the next 10,000 runner y0u are ab0ut t0 miss',
  description:
    "t̶h̶e̶ ̶1̶0̶,̶0̶0̶0̶ ̶r̶u̶n̶n̶e̶r̶ ̶y̶0̶u̶ ̶m̶i̶s̶s̶e̶d̶. the next 10,000 runner y0u are ab0ut t0 miss.",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'r00mba — the next 10,000 runner y0u are ab0ut t0 miss',
    description:
      '10,000 r00mbas crawling 0nt0 chain. WL applicati0ns 0pen. d0n\u2019t be the screensh0t.',
    images: ['/art/r00mba_002.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@r00mba_',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
