import { ButtonLink } from "@/components/ui/Button";
export default function NotFound() {
  return (
    <main className="wrap flex min-h-dvh flex-col items-start justify-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="display mt-3 text-7xl">Page introuvable</h1>
      <ButtonLink href="/" className="mt-8" arrow>Retour à l’accueil</ButtonLink>
    </main>
  );
}
