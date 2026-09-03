import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <Header />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
          Kobas Tech
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight">
          Conditions générales de vente
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-zinc-400">
          <div>
            <h2 className="text-lg font-bold text-white">1. Objet</h2>
            <p className="mt-3">
              Les présentes conditions générales de vente régissent les
              relations contractuelles entre Kobas Tech et toute personne
              effectuant un achat sur le site kobas-ecommerce.vercel.app.
              Toute commande passée sur le site implique l&apos;acceptation
              pleine et entière de ces conditions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              2. Produits et prix
            </h2>
            <p className="mt-3">
              Les prix sont indiqués en Francs CFA (FCFA), toutes taxes
              comprises le cas échéant. Kobas Tech se réserve le droit de
              modifier ses prix à tout moment, les commandes déjà validées
              restant soumises au tarif en vigueur au moment de l&apos;achat.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              3. Commande et paiement
            </h2>
            <p className="mt-3">
              Les commandes sont passées directement sur le site. Le
              paiement s&apos;effectue via Mobile Money (MTN Money, Moov
              Money) ou tout autre moyen proposé au moment de la commande.
              La commande est considérée comme confirmée après vérification
              et validation du paiement par Kobas Tech.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              4. Livraison des produits numériques
            </h2>
            <p className="mt-3">
              Pour les produits numériques (logiciels, fichiers,
              licences...), le lien de téléchargement est envoyé par e-mail
              à l&apos;adresse fournie lors de la commande, dès confirmation
              du paiement. Ce lien reste également accessible depuis
              l&apos;espace client, rubrique &quot;Mes commandes&quot;.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              5. Livraison des produits physiques
            </h2>
            <p className="mt-3">
              Pour les produits physiques, les modalités et délais de
              livraison sont communiqués au client après confirmation de la
              commande, en fonction de sa localisation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              6. Droit de rétractation, retours et remboursements
            </h2>
            <p className="mt-3">
              Kobas Tech accepte les remboursements sous les conditions
              suivantes :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>
                <strong className="text-zinc-300">
                  Produits physiques :
                </strong>{" "}
                un retour ou remboursement peut être demandé dans un délai
                de 48 heures après réception, en cas de produit défectueux,
                non conforme, ou endommagé. Une preuve (photo, description)
                peut être demandée.
              </li>
              <li>
                <strong className="text-zinc-300">
                  Produits numériques :
                </strong>{" "}
                compte tenu de la nature immatérielle de ces produits, aucun
                remboursement n&apos;est possible une fois le fichier
                téléchargé, sauf en cas de fichier corrompu ou non
                conforme à la description, sous réserve de vérification par
                Kobas Tech.
              </li>
              <li>
                Toute demande de remboursement doit être adressée via le{" "}
                
                  href="/contact"
                  className="text-blue-400 hover:underline"
                >
                  formulaire de contact
                </a>{" "}
                ou par WhatsApp, en précisant le numéro de commande.
              </li>
              <li>
                Les remboursements validés sont effectués par le même moyen
                de paiement utilisé lors de l&apos;achat, dans un délai
                raisonnable après validation de la demande.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              7. Responsabilité
            </h2>
            <p className="mt-3">
              Kobas Tech ne saurait être tenu responsable de l&apos;usage
              fait par le client des produits numériques achetés, ni des
              dommages indirects résultant de leur utilisation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">8. Contact</h2>
            <p className="mt-3">
              Pour toute question relative à une commande, contactez-nous à
              sperokobas2@gmail.com ou via le{" "}
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
