"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/lib/store/cart-store";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/categories", label: "Catégories" },
  { href: "/a-propos", label: "À propos" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isCustomerLoggedIn =
    status === "authenticated" &&
    (session?.user as { role?: string })?.role === "customer";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08090d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Kobas Tech"
            width={180}
            height={70}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/recherche"
            aria-label="Rechercher"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white sm:flex"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link
            href="/panier"
            aria-label="Panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {isCustomerLoggedIn ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/compte"
                className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 transition hover:border-white/20 hover:bg-white/5"
              >
                <User className="h-4 w-4 text-blue-400" />
                <span className="max-w-24 truncate text-xs font-semibold text-zinc-300">
                  {session?.user?.name?.split(" ")[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Se déconnecter"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/connexion"
              className="hidden rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:block"
            >
              Se connecter
            </Link>
          )}

          {/* BOUTON MENU MOBILE */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#08090d] md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/recherche"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Recherche
            </Link>

            <div className="mt-2 border-t border-white/10 pt-3">
              {isCustomerLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/compte"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                  >
                    <User className="h-4 w-4 text-blue-400" />
                    Mon compte ({session?.user?.name?.split(" ")[0]})
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/connexion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
