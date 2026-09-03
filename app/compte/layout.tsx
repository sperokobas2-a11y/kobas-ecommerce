import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon compte | Kobas Tech",
  description: "Espace personnel des clients Kobas Tech.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
