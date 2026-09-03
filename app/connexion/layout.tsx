import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Kobas Tech",
  description: "Connectez-vous à votre compte client Kobas Tech.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ConnexionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
