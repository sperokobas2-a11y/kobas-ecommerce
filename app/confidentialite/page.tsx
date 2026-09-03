import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Kobas Tech
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Politique de confidentialité
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-zinc-400">
          <div>
            <h2 className="text-lg font-bold text-white">
              1. Données collectées
            </h2>
            <p className="mt-3">
              Lors de votre utilisation du site, Kobas Tech peut collecter
              les données suivantes :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Nom, prénom</li>
              <li>Adresse e-mail</li>
              <li>Numéro WhatsApp</li>
              <li>Adresse de livraison et ville (si renseignées)</li>
              <li>Historique de commandes</li>
              <li>Mot de passe (stocké de façon chiffrée)</li>
            </ul>
            <p className="mt-3">
              Aucune donnée bancaire (numéro de carte) n&apos;est collectée
              ni stockée par Kobas Tech ; les paiements sont traités
              directement via les services Mobile Money concernés.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              2. Finalité du traitement
            </h2>
            <p className="mt-3">Ces données sont utilisées pour :</p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Traiter et livrer vos commandes</li>
              <li>Gérer votre compte client</li>
              <li>Vous contacter concernant votre commande</li>
              <li>Répondre à vos demandes via le formulaire de contact</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              3. Partage des données
            </h2>
            <p className="mt-3">
              Vos données ne sont ni vendues ni louées à des tiers. Elles
              peuvent être transmises à des prestataires techniques
              strictement nécessaires au fonctionnement du site :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>MongoDB Atlas (hébergement de la base de données)</li>
              <li>Vercel (hébergement du site)</li>
              <li>Resend (envoi des e-mails transactionnels)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              4. Conservation des données
            </h2>
            <p className="mt-3">
              Vos données sont conservées aussi longtemps que votre compte
              reste actif, ou selon les obligations légales applicables en
              matière de conservation des données commerciales.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              5. Vos droits
            </h2>
            <p className="mt-3">
              Conformément à la législation béninoise applicable en matière
              de protection des données personnelles (loi n° 2017-20 portant
              Code du numérique en République du Bénin), vous disposez d&apos;un
              droit d&apos;accès, de rectification et de suppression de vos
              données. Pour exercer ces droits, contactez-nous à
              sperokobas2@gmail.com.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">6. Cookies</h2>
            <p className="mt-3">
              Le site utilise uniquement des cookies techniques nécessaires
              à son fonctionnement (notamment pour maintenir votre session
              de connexion). Aucun cookie publicitaire ou de suivi tiers
              n&apos;est utilisé à ce jour.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">7. Contact</h2>
            <p className="mt-3">
              Pour toute question relative à cette politique de
              confidentialité, contactez-nous à sperokobas2@gmail.com ou via
              le{" "}
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
