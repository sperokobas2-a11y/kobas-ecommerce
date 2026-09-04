"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const CONSENT_KEY = "kobas_consent_accepted";

export default function ConsentGate() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    setAccepted(stored === "true");
  }, []);

  useEffect(() => {
    if (accepted === false) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [accepted]);

  function handleAccept() {
    localStorage.setItem(CONSENT_KEY, "true");
    setAccepted(true);
  }

  if (accepted !== false) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0e14] p-7 shadow-2xl sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">
          Avant de continuer
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          En poursuivant votre navigation sur Kobas Tech, vous acceptez
          notre{" "}
          <Link
            href="/confidentialite"
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            politique de confidentialité
          </Link>
          , nos{" "}
          <Link
            href="/cgv"
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            conditions générales de vente
          </Link>{" "}
          et nos{" "}
          <Link
            href="/mentions-legales"
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            mentions légales
          </Link>
          .
        </p>

        <button
          type="button"
          onClick={handleAccept}
          className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-bold text-black transition hover:bg-blue-400"
        >
          J&apos;accepte et je continue
        </button>
      </div>
    </div>
  );
}
