import { cn } from "@/lib/cn";

/** Infinite ticker. Pure CSS, paused for reduced-motion users. */
export function Marquee({ items, className, reverse, speed = 40 }: { items: React.ReactNode[]; className?: string; reverse?: boolean; speed?: number }) {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10" aria-hidden>
      {items.map((it, i) => <span key={i} className="flex items-center gap-10">{it}<span className="h-2 w-2 rotate-45 bg-current opacity-60" /></span>)}
    </div>
  );
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div className="flex min-w-full shrink-0 animate-[marquee_var(--d)_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none" style={{ ["--d" as string]: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        {row}{row}
      </div>
    </div>
  );
}
