"use client";
import { AccountProvider } from "@/lib/store/AccountProvider";
import { AppShell } from "@/components/app/AppShell";
import { demoRepo } from "@/lib/demo/demoRepo";

/** Internal product demo for filming: sample data, isolated storage, one-click reset. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountProvider repo={demoRepo} base="/demo" demo><AppShell>{children}</AppShell></AccountProvider>;
}
