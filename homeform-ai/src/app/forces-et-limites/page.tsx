import { MarketingShell, PageHero, Prose } from "@/components/marketing/MarketingShell";
export const metadata = { title: "Forces et limites de l’analyse", description: "Où l’analyse vidéo HOMEFORM est fiable, et où elle peut se tromper." };
export default function Page() {
  return (
    <MarketingShell>
      <PageHero eyebrow="Transparence" clip="loftSquats" title={<>Forces<br /><span className="text-volt">et limites.</span></>} intro="Une analyse automatique peut se tromper. Voici précisément où elle est utile, et où il faut s’en méfier." cta={false} />
      <article className="wrap max-w-3xl py-16"><Prose>
        <h2>En bref</h2>
        <p>HOMEFORM mesure des angles et des durées sur ta vidéo, découpe tes répétitions et compare chaque mesure à des seuils indicatifs. C’est utile pour repérer un défaut qui revient sur plusieurs répétitions. Ce n’est <strong>pas</strong> un coach, ni un avis médical, et l’outil ne détecte pas de blessure.</p>
        <h2>Là où l’analyse est fiable</h2>
        <ul>
          <li>Compter les répétitions d’une série de squats ou de pompes filmée de profil.</li>
          <li>Comparer l’amplitude d’une répétition à l’autre et d’une séance à l’autre.</li>
          <li>Repérer un défaut répété : descente partielle, bassin qui descend, bras pas tendus.</li>
          <li>Refuser une vidéo inexploitable (trop sombre, corps hors champ, mauvais exercice) au lieu d’inventer un résultat.</li>
        </ul>
        <h2>Là où elle peut se tromper</h2>
        <h3>L’angle de caméra change le résultat</h3>
        <p>Les angles sont estimés en 2D. Filmé de face, un genou fléchi paraît moins fléchi. La même série filmée sous deux angles peut donner des retours différents : c’est une limite de la méthode. Le rapport l’indique avec une fiabilité « moyenne » ou « faible ».</p>
        <h3>Les cas limites</h3>
        <p>Quand une mesure est très proche d’un seuil (par exemple un écart d’alignement de 15° pour un seuil de 15°), deux analyses de la même vidéo peuvent donner deux verdicts différents. Regarde la valeur mesurée, pas seulement le titre.</p>
        <h3>Vêtements, objets, autres personnes</h3>
        <p>Des vêtements très amples, un objet devant le corps ou une deuxième personne dans le cadre peuvent fausser le repérage des articulations.</p>
        <h3>L’outil ne connaît pas ton intention</h3>
        <p>Une amplitude volontairement réduite (rééducation, consigne d’un professionnel) sera signalée comme partielle. Si un retour contredit ce qu’un professionnel t’a demandé, c’est le professionnel qui a raison.</p>
        <h3>Deux exercices seulement</h3>
        <p>Pour l’instant, seuls le squat au poids du corps et les pompes sont analysés. Une fente ou un autre mouvement est refusé (« mouvement non reconnu ») plutôt que mal interprété.</p>
        <h2>Ce que nous ne publions pas</h2>
        <p>Nous ne publions pas de taux de précision : il n’existe pas encore de test indépendant de l’outil. Annoncer un chiffre sans méthode publiée serait trompeur. Les seuils sont en cours de validation avec des professionnels qualifiés.</p>
      </Prose></article>
    </MarketingShell>
  );
}
