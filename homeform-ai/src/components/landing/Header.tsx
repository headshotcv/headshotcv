"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const LINKS = [
  ["#analyse", "Analyse"],
  ["#programme", "Programme"],
  ["#suivi", "Suivi"],
  ["#tarifs", "Tarifs"],
  ["#faq", "FAQ"],
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-[background,border] duration-300", scrolled || open ? "border-b border-line bg-ink/80 backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-ink/70 to-transparent")}>
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {LINKS.map(([h, l]) => (
            <a key={h} href={h} className="focus-ring rounded-full px-4 py-2 text-sm text-bone/70 transition-colors hover:text-bone">{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/connexion" className="focus-ring hidden rounded-full px-4 py-2 text-sm text-bone/70 hover:text-bone sm:block">Connexion</Link>
          <span className="hidden sm:block"><ButtonLink href="/analyser" size="sm">Analyser mon mouvement</ButtonLink></span>
          <button className="focus-ring -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((o) => !o)}>
            <span className="relative block h-3 w-5">
              <span className={cn("absolute left-0 h-[1.5px] w-5 bg-bone transition-transform", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-[1.5px] w-5 bg-bone transition-transform", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </div>
      <div id="mobile-menu" hidden={!open} className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ink lg:hidden">
        <nav className="wrap flex flex-col py-6" aria-label="Navigation mobile">
          {LINKS.map(([h, l], i) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="focus-ring flex items-baseline justify-between border-b border-line py-5">
              <span className="display text-5xl">{l}</span>
              <span className="font-mono text-xs text-mute">0{i + 1}</span>
            </a>
          ))}
          <div className="mt-8 grid gap-3">
            <ButtonLink href="/analyser" size="lg" arrow>Analyser mon mouvement</ButtonLink>
            <ButtonLink href="/connexion" size="lg" variant="outline">Connexion</ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
