import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Kobas Tech
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Mentions légales
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-zinc-400">
          <div>
            <h2 className="text-lg font-bold text-white">1. Éditeur du site</h2>
            <p className="mt-3">
              Le site Kobas Tech (kobas-ecommerce.vercel.app) est édité à
              titre individuel dans le cadre d&apos;une activité
              entrepreneuriale en cours de formalisation au Bénin. La
              structure n&apos;est, à ce jour, pas encore immatriculée au
              Registre du Commerce et du Crédit Mobilier (RCCM).
            </p>
            <ul className="mt-3 space-y-1">
              <li>Nom commercial : Kobas Tech</li>
              <li>Pays d&apos;exploitation : Bénin</li>
              <li>Email de contact : sperokobas2@gmail.com</li>
              <li>WhatsApp : +229 01 92 60 49 08</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">2. Hébergement</h2>
            <p className="mt-3">
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, États-Unis. Les données sont stockées via
              MongoDB Atlas, un service de base de données infogéré par
              MongoDB, Inc.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              3. Propriété intellectuelle
            </h2>
            <p className="mt-3">
              L&apos;ensemble des contenus présents sur ce site (textes,
              logo, visuels, structure) est la propriété de Kobas Tech, sauf
              mention contraire. Toute reproduction non autorisée est
              interdite.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              4. Responsabilité
            </h2>
            <p className="mt-3">
              Kobas Tech s&apos;efforce d&apos;assurer l&apos;exactitude des
              informations diffusées sur ce site, mais ne peut garantir
              l&apos;absence d&apos;erreurs ou d&apos;interruptions de
              service. L&apos;utilisation du site se fait sous la
              responsabilité de l&apos;utilisateur.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">5. Contact</h2>
            <p className="mt-3">
              Pour toute question relative à ces mentions légales, vous
              pouvez nous contacter à l&apos;adresse sperokobas2@gmail.com
              ou via notre{" "}
              <a href="/contact" className="text-blue-400 hover:underline">
                formulaire de contact
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
