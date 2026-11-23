import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "light" | "outline";
const styles: Record<Variant, string> = {
  primary: "bg-volt text-ink hover:bg-[#e1ff6b] active:bg-volt-dim",
  light: "bg-bone text-ink hover:bg-white",
  ghost: "text-bone hover:bg-white/5",
  outline: "border border-bone/25 text-bone hover:border-bone/60 hover:bg-white/[0.03]",
};

export function buttonClass(variant: Variant = "primary", size: "md" | "lg" | "sm" = "md", extra?: string) {
  return cn(
    "focus-ring group relative inline-flex text-center leading-tight select-none items-center justify-center gap-3 rounded-full font-semibold tracking-tight transition-[background,border,color,transform] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    size === "lg" && "min-h-14 px-7 py-3 text-[15px]",
    size === "md" && "min-h-12 px-6 py-2.5 text-[15px]",
    size === "sm" && "min-h-10 px-4 py-2 text-sm",
    styles[variant],
    extra,
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5", className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" strokeLinecap="square" />
    </svg>
  );
}

export function ButtonLink({ href, children, variant = "primary", size = "md", className, arrow }: { href: string; children: React.ReactNode; variant?: Variant; size?: "md" | "lg" | "sm"; className?: string; arrow?: boolean }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({ variant = "primary", size = "md", className, children, arrow, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "md" | "lg" | "sm"; arrow?: boolean }) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
