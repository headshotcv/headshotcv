import { VideoLoop } from "@/components/media/VideoLoop";
import { Marquee } from "./Marquee";

const TICKER = ["Squat", "Pompes", "Fentes", "Gainage", "Pont fessier", "Mountain climbers", "Dips sur chaise", "Superman", "Chaise contre le mur", "Tractions"];

const FACTS = [
  { k: "33", u: "repères", d: "points du corps suivis image par image" },
  { k: "0", u: "vidéo envoyée", d: "l’analyse tourne dans ton navigateur" },
  { k: "4", u: "semaines", d: "de programme adapté à ton matériel" },
  { k: "20", u: "exercices", d: "avec démonstration et variante facile" },
];

/** Ticker + giant logo with real training footage playing inside the letters + key facts. */
export function BrandBand() {
  return (
    <section aria-label="HOMEFORM en chiffres" className="relative">
      <div className="-rotate-1 bg-volt py-3 text-ink">
        <Marquee speed={45} items={TICKER.map((t) => <span key={t} className="display text-3xl sm:text-4xl">{t}</span>)} />
      </div>
      <div className="relative mt-16 overflow-hidden sm:mt-24">
        {/* video shows through the white letters (multiply) */}
        <div className="absolute inset-0"><VideoLoop clip="womanPushups" objectPosition="50% 40%" /></div>
        <div className="relative bg-ink mix-blend-multiply">
          <p className="display select-none whitespace-nowrap text-center text-[25vw] leading-[0.8] text-white" aria-hidden>HOMEFORM</p>
        </div>
      </div>
      <div className="wrap mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FACTS.map((f, i) => (
          <div key={f.u} className="group relative overflow-hidden rounded-[22px] border border-line bg-gradient-to-b from-white/[0.05] to-transparent p-5 sm:p-6" style={{ animation: `float-y 6s ease-in-out ${i * 0.7}s infinite` }}>
            <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-volt/10 blur-2xl transition-opacity group-hover:opacity-100" />
            <p className="display text-6xl text-volt tabular sm:text-7xl">{f.k}</p>
            <p className="mt-1 font-semibold uppercase tracking-wide [font-stretch:85%]">{f.u}</p>
            <p className="mt-1 text-sm text-bone/60">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
