import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingShell";
import { POSTS } from "@/lib/blog/posts";
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = POSTS.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : { title: "Article" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POSTS.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <MarketingShell>
      <PageHero eyebrow={`${new Date(p.date).toLocaleDateString("fr-FR", { dateStyle: "long" })} · ${p.read}`} clip={p.clip} pos={p.pos} title={p.title} intro={p.excerpt} />
      <article className="wrap max-w-3xl py-16"><Prose>{p.body}</Prose><Link href="/blog" className="mt-12 inline-block font-mono text-xs uppercase tracking-[0.14em] text-volt">← Tous les articles</Link></article>
    </MarketingShell>
  );
}
