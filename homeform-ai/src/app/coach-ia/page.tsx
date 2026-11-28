import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingShell";
export const metadata = { title: "Coach IA pour s’entraîner à la maison", description: "Un assistant conversationnel spécialisé dans l’entraînement à domicile, qui tient compte de ton programme si tu l’y autorises." };
const Q = ["Je n’ai que 15 minutes aujourd’hui, tu me proposes quoi ?", "Comment progresser vers ma première pompe complète ?", "J’ai des courbatures, je m’entraîne quand même ?", "Remplace les dips : je n’ai pas de chaise stable."];
export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Coach IA" clip="loftWorkout" title={<>Une question ?<br /><span className="text-volt">Demande.</span></>} intro="Le coach IA répond sur l’entraînement à domicile : séance express, variante plus facile, organisation de la semaine. Avec ton accord, il tient compte de ton profil, de tes dernières séances et de ta dernière analyse." />
      <section className="wrap grid gap-10 py-16 lg:grid-cols-2">
        <div className="space-y-3">
          {Q.map((q, i) => <p key={q} className={i % 2 ? "ml-auto max-w-[85%] rounded-2xl border border-line bg-ink-2 px-4 py-3" : "max-w-[85%] rounded-2xl bg-bone px-4 py-3 text-ink"}>{q}</p>)}
          <p className="text-xs text-mute">Exemples de questions. Les réponses sont générées au moment où tu poses la question.</p>
        </div>
        <Prose>
          <h3>Ce qu’il fait</h3>
          <ul><li>Propose des séances adaptées à ton temps et à ton matériel.</li><li>Explique un exercice, donne une variante plus facile ou plus difficile.</li><li>T’aide à organiser ta semaine et à rester régulier.</li></ul>
          <h3>Ce qu’il ne fait pas</h3>
          <ul><li>Il n’est ni médecin, ni kinésithérapeute, ni diététicien : pas de diagnostic, pas de traitement.</li><li>Il ne promet aucun résultat physique.</li><li>Il ne voit pas tes vidéos : il connaît seulement les mesures de ton rapport, si tu l’autorises.</li></ul>
          <h3>Tes données</h3>
          <p>Le partage de ton historique est désactivé par défaut et se règle en un clic. Les messages sont envoyés à notre fournisseur d’IA uniquement pour générer la réponse.</p>
        </Prose>
      </section>
    </MarketingShell>
  );
}
