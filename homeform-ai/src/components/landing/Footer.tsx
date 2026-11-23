import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { TrainingScene } from "@/components/figure/TrainingScene";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <TrainingScene exercise="pushup" ratio="landscape" skeleton className="absolute inset-0 h-full w-full opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/20" />
      <div className="wrap relative py-28 sm:py-40">
        <h2 className="display max-w-3xl text-[15vw] sm:text-[120px]">Prochaine série :<br /><span className="text-volt">filmée.</span></h2>
        <p className="mt-6 max-w-md text-lg text-bone/75">Ta première analyse est gratuite. Il te faut un téléphone et deux mètres de sol.</p>
        <ButtonLink href="/analyser" size="lg" arrow className="mt-8">Analyser mon mouvement</ButtonLink>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line py-14 text-sm">
      <div className="wrap grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-bone/60">Coaching de musculation à domicile, avec analyse vidéo dans le navigateur.</p>
          <p className="mt-6 max-w-xs text-xs leading-relaxed text-mute">HOMEFORM n’est pas un dispositif médical. Consulte un professionnel de santé avant de commencer un programme si tu as un doute sur ton état de santé.</p>
        </div>
        <nav aria-label="Produit"><p className="eyebrow mb-4">Produit</p><ul className="space-y-2 text-bone/70"><li><Link href="/analyser" className="hover:text-bone">Analyser un mouvement</Link></li><li><Link href="/#programme" className="hover:text-bone">Programmes</Link></li><li><Link href="/#tarifs" className="hover:text-bone">Tarifs</Link></li><li><Link href="/connexion" className="hover:text-bone">Connexion</Link></li></ul></nav>
        <nav aria-label="Légal"><p className="eyebrow mb-4">Légal</p><ul className="space-y-2 text-bone/70"><li><Link href="/legal/mentions-legales" className="hover:text-bone">Mentions légales</Link></li><li><Link href="/legal/cgv" className="hover:text-bone">CGU / CGV</Link></li><li><Link href="/legal/confidentialite" className="hover:text-bone">Confidentialité</Link></li><li><Link href="/legal/cookies" className="hover:text-bone">Cookies</Link></li><li><Link href="/legal/avertissement-sante" className="hover:text-bone">Avertissement santé</Link></li></ul></nav>
        <div><p className="eyebrow mb-4">Commencer</p><ButtonLink href="/analyser" size="sm" arrow>Première analyse gratuite</ButtonLink></div>
      </div>
      <div className="wrap mt-12 flex flex-col justify-between gap-2 border-t border-line pt-6 text-xs text-mute sm:flex-row">
        <p>© {new Date().getFullYear()} HOMEFORM AI — nom de travail</p>
        <p>Illustrations originales · aucune photo de stock</p>
      </div>
    </footer>
  );
}
