"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount } from "@/lib/store/AccountProvider";
import { Logo } from "@/components/ui/Logo";
import { LocalModeBanner } from "./LocalModeBanner";
import { resetDemo } from "@/lib/demo/demoRepo";
import { cn } from "@/lib/cn";

const NAV = [
  ["", "Aujourd’hui", "M3 12h4l3-8 4 16 3-8h4"],
  ["/programme", "Mon programme", "M4 5h16M4 12h16M4 19h10"],
  ["/analyser", "Analyser", "M12 8a4 4 0 100 8 4 4 0 000-8zM3 7h3l2-3h8l2 3h3v13H3z"],
  ["/analyses", "Mes analyses", "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3"],
  ["/progression", "Ma progression", "M4 20V10M10 20V4M16 20v-7M22 20H2"],
  ["/coach", "Coach IA", "M4 5h16v11H9l-5 4z"],
  ["/compte", "Mon compte", "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c1-4 4-6 8-6s7 2 8 6"],
] as const;

function Icon({ d, className }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" aria-hidden><path d={d} /></svg>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { base, demo, refresh, user } = useAccount();
  const path = usePathname();
  const [more, setMore] = useState(false);
  const active = (href: string) => (href === "" ? path === base : path.startsWith(base + href));
  const mobileMain = [NAV[0], NAV[1], NAV[2], NAV[4]];

  return (
    <div className="min-h-dvh">
      {demo ? (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-4 bg-volt px-4 py-2 text-center text-xs font-semibold text-ink">
          <span>DÉMONSTRATION · données fictives, isolées des vrais comptes</span>
          <button onClick={() => { resetDemo(); refresh(); }} className="rounded-full bg-ink px-3 py-1 text-volt">Réinitialiser</button>
          <button onClick={() => { resetDemo(true); refresh(); }} className="hidden rounded-full border border-ink px-3 py-1 sm:inline">Vider</button>
        </div>
      ) : (
        <LocalModeBanner />
      )}
      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line p-5 lg:flex">
          <Logo href={base} />
          <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Espace personnel">
            {NAV.map(([href, label, d]) => (
              <Link key={href} href={base + href} className={cn("focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors", active(href) ? "bg-white/[0.06] text-bone" : "text-bone/60 hover:text-bone", href === "/analyser" && !active(href) && "text-volt")}>
                <Icon d={d} />{label}
              </Link>
            ))}
          </nav>
          <p className="truncate text-xs text-mute">{user?.email}</p>
        </aside>
        <div className="min-w-0 pb-28 lg:pb-0">
          <header className="flex h-14 items-center justify-between border-b border-line px-[var(--gutter)] lg:hidden">
            <Logo href={base} />
            <Link href={`${base}/compte`} aria-label="Mon compte" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line"><Icon d={NAV[6][2]} className="h-4 w-4" /></Link>
          </header>
          <main className="px-[var(--gutter)] py-8 lg:px-12 lg:py-12">{children}</main>
        </div>
      </div>
      {/* mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Navigation">
        <div className="grid grid-cols-5">
          {mobileMain.map(([href, label, d]) => (
            <Link key={href} href={base + href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px]", active(href) ? "text-bone" : "text-bone/55", href === "/analyser" && "text-volt")}>
              {href === "/analyser" ? <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-volt text-ink shadow-[0_8px_30px_-6px_rgba(212,255,58,0.5)]"><Icon d={d} /></span> : <Icon d={d} />}
              {(() => { const l = label.replace("Mon ", "").replace("Ma ", ""); return l[0].toUpperCase() + l.slice(1); })()}
            </Link>
          ))}
          <button onClick={() => setMore(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10px] text-bone/55" aria-haspopup="dialog">
            <Icon d="M5 12h.01M12 12h.01M19 12h.01" />Plus
          </button>
        </div>
      </nav>
      {more && (
        <div role="dialog" aria-modal="true" aria-label="Plus" className="fixed inset-0 z-50 lg:hidden" onClick={() => setMore(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] border-t border-line bg-ink-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            {[NAV[3], NAV[5], NAV[6]].map(([href, label, d]) => (
              <Link key={href} href={base + href} onClick={() => setMore(false)} className="flex items-center gap-4 rounded-2xl px-4 py-4 text-lg"><Icon d={d} />{label}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
