import { notFound } from "next/navigation";
import Link from "next/link";
import { LEGAL } from "../content";
import { Logo } from "@/components/ui/Logo";
import { Footer } from "@/components/landing/Footer";

export function generateStaticParams() {
  return Object.keys(LEGAL).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: LEGAL[slug]?.title ?? "Légal" };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL[slug];
  if (!doc) notFound();
  return (
    <>
      <header className="border-b border-line"><div className="wrap flex h-16 items-center justify-between"><Logo /><Link href="/" className="text-sm text-bone/70">Accueil</Link></div></header>
      <main className="wrap max-w-3xl py-16">
        <p className="eyebrow">Mis à jour le {doc.updated}</p>
        <h1 className="display mt-3 text-5xl sm:text-7xl">{doc.title}</h1>
        <article className="mt-10 space-y-4 leading-relaxed text-bone/80 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-bone [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">{doc.body}</article>
      </main>
      <Footer />
    </>
  );
}
