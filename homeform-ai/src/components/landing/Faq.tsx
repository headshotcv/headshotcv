import { SectionHead } from "@/components/ui/SectionHead";
import { PLANS, formatPrice } from "@/config/pricing";
import Link from "next/link";

const QA: [string, React.ReactNode][] = [
  ["Est-ce que j’ai besoin d’une salle ?", "Non. Tous les programmes sont conçus pour un salon, une chambre ou un jardin. Il te faut environ 2 m × 1 m de sol libre."],
  ["Est-ce que je dois acheter du matériel ?", "Non. Tout peut se faire au poids du corps. Si tu as une chaise, un élastique, des haltères ou une barre de traction, tu peux l’indiquer et le programme en tiendra compte."],
  ["Comment filmer mon exercice ?", "Pose ton téléphone au sol ou sur un meuble bas, à 2–3 m, de profil. Ton corps entier (tête, mains, pieds) doit rester visible pendant toute la série. Lumière devant toi, pas dans ton dos. Fais 3 à 10 répétitions."],
  ["Est-ce que l’IA remplace un coach ?", "Non. L’analyse décrit ce qui est mesurable sur la vidéo (angles, amplitude, rythme, alignement) et propose des exercices adaptés. Elle ne remplace ni un coach diplômé, ni un avis médical, et ne détecte pas de blessure. En cas de douleur, arrête et consulte."],
  ["Comment fonctionne l’abonnement ?", <>Ta première analyse est gratuite. L’abonnement complet coûte {formatPrice(PLANS.monthly.price)} par mois ou {formatPrice(PLANS.annual.price)} par an (TTC) et se renouvelle automatiquement à la fin de chaque période. Le prix est toujours affiché avant le paiement.</>],
  ["Puis-je annuler mon abonnement ?", "Oui, à tout moment depuis « Mon compte ». L’annulation prend effet à la fin de la période déjà payée : tu gardes l’accès jusque-là et tu n’es plus prélevé ensuite."],
  ["Que deviennent mes vidéos ?", <>Elles ne quittent pas ton appareil : l’analyse est réalisée dans ton navigateur. Seuls les résultats chiffrés (angles, répétitions, observations) sont enregistrés dans ton compte. Tu peux garder la vidéo sur ton appareil pour la revoir, ou la supprimer à tout moment. Détails dans la <Link className="underline" href="/legal/confidentialite">politique de confidentialité</Link>.</>],
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-line py-24 sm:py-32" aria-labelledby="faq-title">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHead index="07" eyebrow="FAQ" title={<span id="faq-title">Questions<br />fréquentes</span>} />
        <div className="divide-y divide-line border-y border-line">
          {QA.map(([q, a]) => (
            <details key={q} className="group py-2">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold [font-stretch:90%]">
                {q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line font-mono text-mute transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="pb-5 pr-12 leading-relaxed text-bone/70">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
