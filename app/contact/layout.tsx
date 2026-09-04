import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.kobas-ecommerce.shop"),

  title: "Contact | Kobas Tech",

  description:
    "Contactez Kobas Tech au Bénin pour toute question, demande d'assistance, projet digital ou besoin en solutions technologiques.",

  keywords: [
    "Kobas Tech",
    "contact Kobas Tech",
    "contact technologie Bénin",
    "solutions digitales Bénin",
    "assistance informatique Bénin",
    "services technologiques Bénin",
  ],

  alternates: {
    canonical: "https://www.kobas-ecommerce.shop/contact",
  },

  openGraph: {
    title: "Contact | Kobas Tech",
    description:
      "Contactez Kobas Tech pour toute question, demande d'assistance, projet digital ou besoin en solutions technologiques.",
    url: "https://www.kobas-ecommerce.shop/contact",
    siteName: "Kobas Tech",
    locale: "fr_BJ",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Contact | Kobas Tech",
    description:
      "Contactez Kobas Tech pour toute question, demande d'assistance, projet digital ou besoin en solutions technologiques.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
