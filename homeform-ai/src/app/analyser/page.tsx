import type { Metadata } from "next";
import { FunnelShell } from "@/components/analyze/FunnelShell";

export const metadata: Metadata = { title: "Analyser mon mouvement", description: "Filme ton squat ou tes pompes et reçois une analyse de ta technique, gratuitement." };

export default function Page() {
  return <FunnelShell />;
}
