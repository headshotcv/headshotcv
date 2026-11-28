import Link from "next/link";
import { MarketingShell, PageHero } from "@/components/marketing/MarketingShell";
import { VideoLoop } from "@/components/media/VideoLoop";
import { POSTS } from "@/lib/blog/posts";
export const metadata = { title: "Blog", description: "Conseils pour s’entraîner à la maison : débuter, progresser aux pompes, se filmer." };
export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Blog" clip="handsCloseup" title={<>S’entraîner chez soi,<br /><span className="text-volt">bien.</span></>} intro="Des guides courts et concrets." cta={false} />
      <section className="wrap grid gap-4 py-16 md:grid-cols-3">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="focus-ring group overflow-hidden rounded-[22px] border border-line bg-ink-2 hover:border-bone/30">
            <div className="aspect-[16/10] overflow-hidden"><VideoLoop clip={p.clip} objectPosition={p.pos} className="transition-transform duration-700 group-hover:scale-105" /></div>
            <div className="p-5"><p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{new Date(p.date).toLocaleDateString("fr-FR", { dateStyle: "long" })} · {p.read}</p><h2 className="mt-2 text-xl font-bold leading-snug [font-stretch:85%]">{p.title}</h2><p className="mt-2 text-sm text-bone/70">{p.excerpt}</p></div>
          </Link>
        ))}
      </section>
    </MarketingShell>
  );
}
