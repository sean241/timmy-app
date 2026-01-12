import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Timmy - La solution de pointage chantier pour l'Afrique",
    template: "%s | Timmy"
  },
  description: "Simplifiez la gestion de vos équipes terrain. Pointage mobile, suivi hors-ligne et rapports automatisés pour le BTP, l'Industrie et le Retail en Afrique.",
  keywords: ["Gestion RH", "Pointage", "Afrique", "BTP", "Chantier", "Ressources Humaines", "Application mobile", "Hors-ligne", "Côte d'Ivoire", "Sénégal", "Cameroun"],
  authors: [{ name: "Timmy Team" }],
  creator: "Timmy SAS",
  publisher: "Timmy SAS",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://timmy.africa",
    siteName: "Timmy",
    title: "Timmy - La solution de pointage chantier pour l'Afrique",
    description: "Simplifiez la gestion de vos équipes terrain. Pointage mobile, suivi hors-ligne et rapports automatisés.",
    images: [
      {
        url: "/images/og-product-suite.png",
        width: 1200,
        height: 630,
        alt: "Timmy Dashboard & Kiosk Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Timmy - La solution de pointage chantier pour l'Afrique",
    description: "Simplifiez la gestion de vos équipes terrain avec Timmy.",
    images: ["/images/og-product-suite.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#0B3B46',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { LanguageProvider } from "./context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={inter.variable}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
