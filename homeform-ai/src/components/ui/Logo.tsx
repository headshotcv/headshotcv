import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("focus-ring inline-flex items-center gap-2", className)} aria-label="HOMEFORM AI — accueil">
      <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden>
        <path d="M6 5v18M22 5v18M6 14h16" stroke="currentColor" strokeWidth="3.4" strokeLinecap="square" />
        <circle cx="22" cy="5" r="2.6" fill="var(--color-volt)" />
      </svg>
      <span className="text-[17px] font-extrabold tracking-tight [font-stretch:75%]">
        HOMEFORM<span className="ml-1 font-mono text-[11px] font-medium tracking-[0.2em] text-volt">AI</span>
      </span>
    </Link>
  );
}
