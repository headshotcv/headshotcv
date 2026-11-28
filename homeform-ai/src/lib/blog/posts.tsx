import Link from "next/link";
import type { ClipKey } from "@/components/media/clips";

export interface Post { slug: string; title: string; excerpt: string; date: string; read: string; clip: ClipKey; pos?: string; body: React.ReactNode }

export const POSTS: Post[] = [
  {
    slug: "debuter-musculation-maison",
    title: "Débuter la musculation à la maison : les 4 premières semaines",
    excerpt: "Combien de séances, quels exercices, comment progresser sans matériel : un plan simple pour poser une routine qui dure.",
    date: "2026-11-20", read: "6 min", clip: "familyPushups", pos: "45% 50%",
    body: (<>
      <p>Commencer chez soi a un énorme avantage : aucune excuse de trajet. Le piège, c’est de vouloir trop en faire la première semaine. L’objectif du premier mois n’est pas d’être épuisé, c’est d’être <strong>régulier</strong>.</p>
      <h2>Combien de séances ?</h2>
      <p>Deux à trois séances de 20 à 30 minutes par semaine suffisent pour démarrer. Mieux vaut trois séances courtes tenues pendant un mois que cinq séances la première semaine puis plus rien.</p>
      <h2>Quels exercices ?</h2>
      <ul><li><strong>Jambes</strong> : squat, ou squat sur chaise si la descente est difficile.</li><li><strong>Poussée</strong> : pompes inclinées (mains sur un canapé) ou sur les genoux.</li><li><strong>Chaîne postérieure</strong> : pont fessier, superman.</li><li><strong>Gainage</strong> : planche sur les mains.</li></ul>
      <h2>Comment progresser</h2>
      <p>Ajoute une à deux répétitions par semaine, ou cinq secondes sur les maintiens. Quand une variante devient facile (par exemple 15 pompes inclinées propres), passe à la variante suivante.</p>
      <h2>Mesurer pour rester motivé</h2>
      <p>Note tes séances et refais un petit bilan au bout de 4 semaines : maximum de pompes, squats en 60 secondes, temps de planche. Voir les chiffres bouger est le meilleur carburant. C’est exactement ce que fait le <Link href="/programmes">programme HOMEFORM</Link>.</p>
      <p className="text-sm text-mute">En cas de douleur, de pathologie ou de doute sur ta santé, demande l’avis d’un professionnel avant de commencer.</p>
    </>),
  },
  {
    slug: "progresser-aux-pompes",
    title: "Pompes : l’échelle des variantes pour progresser",
    excerpt: "De la pompe inclinée à la pompe complète : comment choisir ta variante et savoir quand passer à la suivante.",
    date: "2026-11-14", read: "5 min", clip: "livingPushups", pos: "55% 50%",
    body: (<>
      <p>La pompe complète demande de soulever une grande partie de ton poids. Plutôt que de forcer avec une mauvaise technique, monte une échelle de variantes.</p>
      <h2>1. Pompes inclinées</h2><p>Mains sur une table, un canapé ou un plan de travail stable. Plus le support est haut, plus c’est facile. Objectif : 3 séries de 12 à 15 avec le corps aligné.</p>
      <h2>2. Pompes sur les genoux</h2><p>Genoux au sol, épaules, hanches et genoux sur une ligne. Objectif : 3 séries de 12.</p>
      <h2>3. Négatives</h2><p>Descends en 3 à 5 secondes depuis la position haute, puis remonte sur les genoux. Elles construisent la force sur toute l’amplitude.</p>
      <h2>4. Pompes complètes</h2><p>Corps gainé des épaules aux chevilles, poitrine proche du sol, bras tendus en haut. Commence par des séries courtes et propres.</p>
      <h2>Les trois défauts les plus fréquents</h2>
      <ul><li><strong>Le bassin qui descend</strong> : serre les fessiers et les abdos, comme en planche.</li><li><strong>La descente partielle</strong> : reviens à une variante plus facile pour travailler toute l’amplitude.</li><li><strong>Les bras pas tendus en haut</strong> : marque une seconde bras tendus à chaque répétition.</li></ul>
      <p>Ces trois points sont mesurés par l’<Link href="/analyse-video">analyse vidéo</Link> quand tu te filmes de profil.</p>
    </>),
  },
  {
    slug: "filmer-ses-exercices",
    title: "Se filmer pour corriger sa technique : les erreurs à éviter",
    excerpt: "Pourquoi l’angle de caméra change tout, et comment obtenir une vidéo exploitable en 30 secondes.",
    date: "2026-11-08", read: "4 min", clip: "terracePushups", pos: "60% 50%",
    body: (<>
      <p>Se filmer est le moyen le plus simple de voir ce qu’on ne sent pas. Encore faut-il que la vidéo montre la bonne chose.</p>
      <h2>Filmer de profil</h2><p>De face, un genou ou un coude fléchi paraît moins fléchi qu’il ne l’est. De profil, les angles sont lisibles. C’est aussi l’angle qu’utilise l’analyse HOMEFORM.</p>
      <h2>Tout le corps dans le cadre</h2><p>Recule jusqu’à voir ta tête, tes mains et tes pieds pendant toute la série, y compris au point bas.</p>
      <h2>La lumière</h2><p>Une fenêtre derrière toi transforme ta silhouette en ombre. Place la source de lumière devant ou sur le côté.</p>
      <h2>Une série courte</h2><p>3 à 10 répétitions suffisent. Au-delà, la fatigue change la technique : c’est intéressant, mais analyse-le séparément.</p>
      <p>Tout est résumé dans le <Link href="/comment-filmer">guide de tournage</Link>.</p>
    </>),
  },
];
