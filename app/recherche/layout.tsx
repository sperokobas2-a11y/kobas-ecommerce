import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recherche | Kobas Tech",
  description: "Recherchez un produit dans la boutique Kobas Tech.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RechercheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
