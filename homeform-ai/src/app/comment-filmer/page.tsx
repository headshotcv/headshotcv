import { MarketingShell, PageHero } from "@/components/marketing/MarketingShell";
import { VideoLoop } from "@/components/media/VideoLoop";
export const metadata = { title: "Comment se filmer pour une analyse fiable", description: "Distance, angle, lumière, cadrage : le guide pour filmer ton squat ou tes pompes." };
const RULES = [
  ["De profil", "Place le téléphone sur le côté, à hauteur de hanche. C’est l’angle qui permet de mesurer la flexion des genoux et des coudes."],
  ["2 à 3 mètres", "Tête, mains et pieds doivent rester dans le cadre pendant toute la série. En pompes, passe le téléphone en format paysage."],
  ["Lumière devant toi", "Évite le contre-jour (fenêtre derrière toi). Une pièce bien éclairée suffit."],
  ["Téléphone immobile", "Pose-le au sol ou contre un objet. Une vidéo tenue à la main fausse les mesures."],
  ["3 à 10 répétitions", "Une seule série, à vitesse contrôlée. Entre 8 et 45 secondes de vidéo."],
  ["Seul dans le cadre", "Une autre personne dans l’image peut perturber le repérage."],
];
export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Guide" clip="terracePushups" pos="60% 50%" title={<>Bien se filmer<br /><span className="text-volt">en 30 secondes.</span></>} intro="Six règles simples. Une bonne vidéo, c’est une analyse plus fiable." />
      <section className="wrap grid gap-10 py-16 lg:grid-cols-[1fr_1fr] lg:items-start">
        <ol className="space-y-3">
          {RULES.map(([t, d], i) => <li key={t} className="flex gap-4 rounded-2xl border border-line p-5"><span className="display text-4xl text-volt">{i + 1}</span><div><p className="text-lg font-bold [font-stretch:85%]">{t}</p><p className="text-bone/70">{d}</p></div></li>)}
        </ol>
        <div className="space-y-4 lg:sticky lg:top-24">
          <figure className="overflow-hidden rounded-[24px] border border-line"><div className="aspect-video"><VideoLoop clip="livingPushups" /></div><figcaption className="p-4 text-sm"><span className="text-volt">✓ Bon cadrage</span> · de profil, corps entier visible, lumière face à la personne.</figcaption></figure>
          <figure className="overflow-hidden rounded-[24px] border border-line"><div className="aspect-video"><VideoLoop clip="terraceFront" /></div><figcaption className="p-4 text-sm"><span className="text-flare">✕ Analyse peu fiable</span> · filmé de face : l’angle du coude et l’alignement ne sont pas mesurables correctement.</figcaption></figure>
        </div>
      </section>
    </MarketingShell>
  );
}
