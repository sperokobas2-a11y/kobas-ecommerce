import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-zinc-400">
            <span className="font-semibold text-white">KOBAS TECH</span>
            <span className="mx-2">•</span>
            Technologie. Simplicité. Confiance.
          </div>

          <p className="text-sm text-zinc-400">
            © {new Date().getFullYear()} Kobas Tech.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/5 pt-5 text-xs text-zinc-600">
  <Link href="/suivi-commande" className="transition hover:text-zinc-400">
    Suivre ma commande
  </Link>
  <Link href="/mentions-legales" className="transition hover:text-zinc-400">
    Mentions légales
  </Link>
  <Link href="/cgv" className="transition hover:text-zinc-400">
    Conditions générales de vente
  </Link>
  <Link href="/confidentialite" className="transition hover:text-zinc-400">
    Politique de confidentialité
  </Link>
  <Link href="/contact" className="transition hover:text-zinc-400">
    Contact
  </Link>
</div>
      </div>
    </footer>
  );
}
