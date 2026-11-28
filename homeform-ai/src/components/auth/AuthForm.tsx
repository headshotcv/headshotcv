"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { repo } from "@/lib/store/repo";
import { claimDraft } from "@/lib/store/claim";
import { Button } from "@/components/ui/Button";
import { getPendingAnalysis } from "@/lib/store/draft";

function safeNext(n: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/app";
}

export function AuthForm({ kind }: { kind: "signup" | "signin" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const plan = sp.get("plan");
  const target = plan ? `${next}${next.includes("?") ? "&" : "?"}plan=${plan}` : next;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    setHasPending(!!getPendingAnalysis());
    repo.currentUser().then((u) => { if (u) router.replace(target); });
  }, [router, target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Adresse e-mail invalide.");
    if (password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");
    if (kind === "signup" && !accept) return setError("Merci d’accepter les conditions pour créer ton compte.");
    setBusy(true);
    try {
      if (kind === "signup") {
        const r = await repo.signUp(email, password);
        if (r.needsConfirmation) { setInfo("Un e-mail de confirmation t’a été envoyé. Clique sur le lien pour activer ton compte, puis reviens ici."); return; }
        await claimDraft(r.user!);
      } else {
        const u = await repo.signIn(email, password);
        await claimDraft(u);
      }
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {kind === "signup" && hasPending && <p className="rounded-2xl border border-volt/30 bg-volt/[0.06] p-4 text-sm">Ton analyse sera rattachée à ton compte.</p>}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm text-bone/80">E-mail</label>
        <input id="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-13 w-full rounded-2xl border border-line bg-ink-2 px-4 py-3.5 text-base outline-none focus:border-volt" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm text-bone/80">Mot de passe {kind === "signup" && <span className="text-mute">(8 caractères minimum)</span>}</label>
        <input id="password" type="password" autoComplete={kind === "signup" ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-line bg-ink-2 px-4 py-3.5 text-base outline-none focus:border-volt" />
      </div>
      {kind === "signup" && (
        <label className="flex items-start gap-3 text-sm text-bone/80">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-1 accent-[var(--color-volt)]" />
          <span>J’accepte les <Link href="/legal/cgv" className="underline" target="_blank">conditions générales</Link> et j’ai lu la <Link href="/legal/confidentialite" className="underline" target="_blank">politique de confidentialité</Link> et l’<Link href="/legal/avertissement-sante" className="underline" target="_blank">avertissement santé</Link>.</span>
        </label>
      )}
      {error && <p role="alert" className="rounded-xl border border-flare/40 bg-flare/[0.06] p-3 text-sm text-flare">{error}</p>}
      {info && <p role="status" className="rounded-xl border border-volt/40 bg-volt/[0.06] p-3 text-sm">{info}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy} arrow>{busy ? "Patiente…" : kind === "signup" ? "Créer mon compte" : "Me connecter"}</Button>
      <p className="text-center text-sm text-mute">
        {kind === "signup" ? <>Déjà un compte ? <Link className="text-bone underline" href={`/connexion?next=${encodeURIComponent(next)}${plan ? `&plan=${plan}` : ""}`}>Connexion</Link></> : <>Pas encore de compte ? <Link className="text-bone underline" href={`/inscription?next=${encodeURIComponent(next)}${plan ? `&plan=${plan}` : ""}`}>Créer un compte</Link></>}
      </p>
    </form>
  );
}
