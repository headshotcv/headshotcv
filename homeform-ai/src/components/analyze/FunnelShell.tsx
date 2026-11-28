"use client";
import { AccountProvider, useAccount } from "@/lib/store/AccountProvider";
import { hasAccess } from "@/lib/store/types";
import { AnalyzerFlow } from "./AnalyzerFlow";
import { Logo } from "@/components/ui/Logo";
import { LocalModeBanner } from "@/components/app/LocalModeBanner";
import Link from "next/link";

function Inner() {
  const { user, data, loading } = useAccount();
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-16 items-center justify-between">
          <Logo />
          {user ? <Link href="/app" className="text-sm text-bone/70 hover:text-bone">Mon espace</Link> : <Link href="/connexion?next=/analyser" className="text-sm text-bone/70 hover:text-bone">Connexion</Link>}
        </div>
      </header>
      <LocalModeBanner />
      <main className="wrap py-10 sm:py-14">{!loading && <AnalyzerFlow mode="public" user={user} fullAccess={hasAccess(data.subscription)} />}</main>
    </>
  );
}

export function FunnelShell() {
  return <AccountProvider><Inner /></AccountProvider>;
}
