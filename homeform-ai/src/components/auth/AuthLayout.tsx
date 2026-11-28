import { Logo } from "@/components/ui/Logo";
import { PoseVideo } from "@/components/media/PoseVideo";
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
        <div className="relative hidden lg:block">
          <PoseVideo clip="terracePushups" objectPosition="62% 50%" className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent" />
          <p className="absolute bottom-8 left-10 right-10 display text-6xl">Chaque répétition<br /><span className="text-volt">compte.</span></p>
        </div>
      </div>
    </div>
  );
}
