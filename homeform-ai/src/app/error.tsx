"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="wrap flex min-h-dvh flex-col items-start justify-center">
      <p className="eyebrow !text-flare">Erreur</p>
      <h1 className="display mt-3 text-6xl">Un problème est survenu</h1>
      <button onClick={reset} className="mt-8 rounded-full bg-volt px-6 py-3 font-semibold text-ink">Réessayer</button>
    </main>
  );
}
