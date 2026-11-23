import { cn } from "@/lib/cn";
export function SectionHead({ index, eyebrow, title, intro, className, align = "left" }: { index: string; eyebrow: string; title: React.ReactNode; intro?: React.ReactNode; className?: string; align?: "left" | "center" }) {
  return (
    <div className={cn("max-w-4xl", align === "center" && "mx-auto text-center", className)}>
      <div className={cn("eyebrow mb-5 flex items-center gap-3", align === "center" && "justify-center")}>
        <span className="text-volt">{index}</span>
        <span className="h-px w-8 bg-line" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="display text-[44px] sm:text-[64px] lg:text-[88px]">{title}</h2>
      {intro && <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-bone/70 sm:text-lg">{intro}</p>}
    </div>
  );
}
