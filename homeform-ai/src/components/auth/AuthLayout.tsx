import { Logo } from "@/components/ui/Logo";
import { TrainingScene } from "@/components/figure/TrainingScene";
import { LocalModeBanner } from "@/components/app/LocalModeBanner";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <LocalModeBanner />
      <div className="grid min-h-dvh lg:grid-cols-2">
        <div className="flex flex-col px-[var(--gutter)] py-6">
          <Logo />
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <h1 className="display text-5xl sm:text-6xl">{title}</h1>
            <p className="mb-8 mt-3 text-bone/70">{subtitle}</p>
            {children}
          </div>
        </div>
        <TrainingScene exercise="pushup" ratio="tall" skeleton variant="bedroom" className="hidden lg:block" />
      </div>
    </div>
  );
}
