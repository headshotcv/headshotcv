import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { VideoLoop } from "@/components/media/VideoLoop";
import { ButtonLink } from "@/components/ui/Button";
import type { ClipKey } from "@/components/media/clips";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (<><Header /><main className="pt-16">{children}</main><Footer /></>);
}

export function PageHero({ eyebrow, title, intro, clip, pos, cta = true }: { eyebrow: string; title: React.ReactNode; intro: React.ReactNode; clip: ClipKey; pos?: string; cta?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10"><VideoLoop clip={clip} objectPosition={pos} eager /></div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink to-transparent" />
      <div className="wrap py-20 sm:py-28">
        <p className="eyebrow mb-5 flex items-center gap-3 !text-bone/70"><span className="h-px w-8 bg-volt" />{eyebrow}</p>
        <h1 className="display max-w-4xl text-[13vw] sm:text-7xl lg:text-8xl">{title}</h1>
        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-bone/80">{intro}</div>
        {cta && <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/analyser" size="lg" arrow>Analyser mon mouvement</ButtonLink></div>}
      </div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 text-[17px] leading-relaxed text-bone/80 [&_h2]:display [&_h2]:mt-14 [&_h2]:text-4xl [&_h2]:text-bone sm:[&_h2]:text-5xl [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-bone [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-bone [&_ul]:space-y-2">{children}</div>;
}
