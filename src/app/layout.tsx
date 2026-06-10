import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script' // <-- NUEVO: Importamos Script

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://preview-5203d650-92bc-4dad-b6d7-429af441e014.space.chatglm.site'),
  title: "Iglesia EBEN EZER - La Restauración",
  description: "Iglesia Cristiana EBEN EZER - Bienvenidos a la La Restauración. Predicaciones, eventos, reuniones de jóvenes y más.",
  keywords: ["Iglesia", "EBEN EZER", "Cristiana", "Predicaciones", "Fe", "Dios"],
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Iglesia EBEN EZER - La Restauración",
    description: "Iglesia Cristiana EBEN EZER - Bienvenidos a la La Restauración.",
    type: "website",
    images: [{
      url: "/logo.png",
      width: 400,
      height: 400,
      alt: "Iglesia EBEN EZER",
    }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* NUEVO: Código que activa el Service Worker para que se pueda instalar la App */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
        
        {children}
        <Toaster />
      </body>
    </html>
  );
}  