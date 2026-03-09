import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ruleta Filosófica 🎡',
  description: 'Gira la ruleta y descubre una frase que va a cambiar tu día. ¡Perfecto para TikTok!',
  openGraph: {
    title: 'Ruleta Filosófica 🎡',
    description: 'Gira la ruleta y descubre una frase que va a cambiar tu día.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
