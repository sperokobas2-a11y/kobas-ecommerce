import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte | Kobas Tech",
  description: "Créez votre compte client Kobas Tech.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function InscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
