import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "HOMEFORM AI — Ton coach de musculation à la maison", template: "%s · HOMEFORM AI" },
  description: "Filme ton squat ou tes pompes : HOMEFORM AI repère tes articulations, compte tes répétitions et te montre quoi travailler. Programme personnalisé sans salle de sport, directement dans le navigateur.",
  openGraph: { title: "HOMEFORM AI", description: SITE.tagline, type: "website", locale: "fr_FR" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
