import { cn } from "@/lib/cn";
/** Clearly marks example / demonstration content. Never remove on sample data. */
export function DemoBadge({ children = "Exemple", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-bone/20 bg-ink/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70 backdrop-blur", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-bone/50" />
      {children}
    </span>
  );
}
