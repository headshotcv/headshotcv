"use client";
import { AccountProvider } from "@/lib/store/AccountProvider";
import { AppShell } from "@/components/app/AppShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountProvider><AppShell>{children}</AppShell></AccountProvider>;
}
