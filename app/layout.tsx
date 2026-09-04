import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://kobas-ecommerce.vercel.app"),
  title: {
    default: "Kobas Tech | Solutions digitales et technologiques",
    template: "%s | Kobas Tech",
  },
  description:
    "Kobas Tech propose des produits et services technologiques et des solutions digitales au Bénin.",
  keywords: [
    "Kobas Tech",
    "technologie",
    "solutions digitales",
    "produits technologiques",
    "services numériques",
    "Bénin",
    "Cotonou",
  ],
  authors: [
    {
      name: "Kobas Tech",
    },
  ],
  creator: "Kobas Tech",
  verification: {
    google: "A3Du6NESia-amFVttH14hBsIyEnhvgWc32MtOkK6yVU",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://kobas-ecommerce.vercel.app",
    siteName: "Kobas Tech",
    title: "Kobas Tech | Solutions digitales et technologiques",
    description:
      "Découvrez les produits et services technologiques de Kobas Tech au Bénin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kobas Tech | Solutions digitales et technologiques",
    description:
      "Découvrez les produits et services technologiques de Kobas Tech au Bénin.",
  },
  alternates: {
    canonical: "https://kobas-ecommerce.vercel.app",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={
        geistSans.variable +
        " " +
        geistMono.variable +
        " h-full antialiased"
      }
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
