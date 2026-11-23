import { SITE } from "@/config/site";
import { PLANS, formatPrice } from "@/config/pricing";

const C = SITE.company;
const todo = <span className="rounded bg-amber-300/10 px-1 text-amber-100">À COMPLÉTER</span>;

export const LEGAL: Record<string, { title: string; updated: string; body: React.ReactNode }> = {
  "mentions-legales": {
    title: "Mentions légales",
    updated: "23 novembre 2026",
    body: (
      <>
        <h2>Éditeur</h2>
        <p>{C.legalName} — {C.form}<br />Siège : {C.address}<br />{C.siren} · {C.vat}<br />Contact : {SITE.contactEmail}<br />Directeur·rice de la publication : {C.director}</p>
        <h2>Hébergement</h2>
        <p>{C.host}. Base de données et authentification : Supabase (région UE à sélectionner lors de la création du projet). Paiements : Stripe Payments Europe Ltd.</p>
        <h2>Propriété intellectuelle</h2>
        <p>Les textes, illustrations et l’interface de HOMEFORM sont originaux et protégés. HOMEFORM AI est un nom de travail, sous réserve de vérification de disponibilité. {todo}</p>
      </>
    ),
  },
  cgv: {
    title: "Conditions générales d’utilisation et de vente",
    updated: "23 novembre 2026",
    body: (
      <>
        <p className="!text-amber-100">Modèle à faire relire par un professionnel du droit avant mise en production.</p>
        <h2>1. Objet</h2>
        <p>HOMEFORM fournit un service en ligne d’aide à l’entraînement à domicile : analyse vidéo de mouvements (squat au poids du corps et pompes), programmes d’entraînement, suivi des séances et coach conversationnel automatisé.</p>
        <h2>2. Nature du service — avertissement</h2>
        <p>Les analyses décrivent des éléments observables sur la vidéo (positions estimées, angles en 2D, amplitude, rythme). Elles peuvent être imprécises. Le service n’est pas un dispositif médical, ne détecte pas de blessure, ne pose aucun diagnostic et ne remplace ni un professionnel de santé ni un coach diplômé. L’utilisateur s’entraîne sous sa propre responsabilité et doit cesser tout exercice en cas de douleur.</p>
        <h2>3. Compte</h2>
        <p>La création d’un compte est nécessaire pour enregistrer analyses, programmes et séances. L’utilisateur doit avoir au moins 16 ans {todo} et fournir une adresse e-mail valide.</p>
        <h2>4. Offre gratuite</h2>
        <p>Une analyse peut être réalisée sans compte ni paiement. Son aperçu présente une partie des résultats ; les autres observations, déjà calculées, sont accessibles avec l’abonnement.</p>
        <h2>5. Abonnement et prix</h2>
        <p>Formule mensuelle : {formatPrice(PLANS.monthly.price)} TTC par mois. Formule annuelle : {formatPrice(PLANS.annual.price)} TTC par an. Le prix applicable est affiché avant tout paiement. Le paiement est traité par Stripe ; HOMEFORM ne conserve pas les données bancaires.</p>
        <h2>6. Renouvellement et résiliation</h2>
        <p>L’abonnement est reconduit tacitement pour une période identique (un mois ou un an) au même prix, sauf résiliation. La résiliation est possible à tout moment depuis « Mon compte » ; elle prend effet à la fin de la période en cours, sans remboursement de la période entamée sauf disposition légale contraire. Pour la formule annuelle, l’utilisateur est informé par e-mail avant le renouvellement. {todo}</p>
        <h2>7. Droit de rétractation</h2>
        <p>L’utilisateur consommateur dispose d’un délai de 14 jours à compter de la souscription pour se rétracter, en écrivant à {SITE.contactEmail}. S’il a demandé l’accès immédiat au service, un montant proportionnel à la période utilisée peut être retenu.</p>
        <h2>8. Disponibilité</h2>
        <p>Le service est fourni en l’état. L’analyse requiert un navigateur récent ; certaines fonctions (caméra) dépendent des autorisations accordées par l’utilisateur.</p>
        <h2>9. Médiation et droit applicable</h2>
        <p>Droit français. En cas de litige, l’utilisateur peut recourir gratuitement au médiateur de la consommation : {todo}.</p>
      </>
    ),
  },
  confidentialite: {
    title: "Politique de confidentialité",
    updated: "23 novembre 2026",
    body: (
      <>
        <h2>Responsable du traitement</h2>
        <p>{C.legalName}, {C.address}. Contact : {SITE.contactEmail}.</p>
        <h2>Vidéos</h2>
        <p>Les vidéos filmées ou importées sont analysées <strong>dans le navigateur de l’utilisateur</strong>. Elles ne sont pas envoyées sur nos serveurs. Si l’utilisateur le choisit, la vidéo est conservée sur son propre appareil (stockage local du navigateur) pour être revue ; il peut la supprimer à tout moment depuis l’analyse ou « Mon compte ».</p>
        <h2>Données traitées</h2>
        <ul>
          <li>Compte : adresse e-mail, mot de passe chiffré (géré par Supabase). Base légale : exécution du contrat.</li>
          <li>Profil d’entraînement, programme, séances, objectifs. Base légale : exécution du contrat.</li>
          <li>Résultats chiffrés des analyses (angles, répétitions, observations) — pas d’image. Base légale : exécution du contrat.</li>
          <li>Abonnement : identifiants Stripe et statut. Base légale : exécution du contrat et obligations comptables.</li>
          <li>Messages au coach IA et, si l’utilisateur y consent, un résumé de son profil et de ses séances, transmis à notre fournisseur d’IA (Anthropic) pour générer la réponse. Base légale : consentement, retirable à tout moment. Les conversations ne sont pas conservées par HOMEFORM. {todo} (vérifier les conditions de conservation du fournisseur)</li>
        </ul>
        <h2>Données de santé</h2>
        <p>HOMEFORM ne demande aucune donnée médicale. Les mesures de mouvement ne sont pas utilisées pour évaluer l’état de santé. Ne renseigne pas d’informations médicales dans le coach.</p>
        <h2>Durées de conservation</h2>
        <p>Données du compte : durée de l’abonnement puis {Math.round(SITE.retentionDays / 30)} mois après la dernière activité, sauf suppression anticipée. Données de facturation : 10 ans (obligation légale).</p>
        <h2>Sous-traitants</h2>
        <p>Vercel (hébergement), Supabase (base de données, authentification), Stripe (paiement), Anthropic (coach IA). Transferts hors UE encadrés par des clauses contractuelles types. {todo}</p>
        <h2>Tes droits</h2>
        <p>Accès, rectification, effacement, portabilité, opposition, limitation, retrait du consentement : depuis « Mon compte » (export JSON, suppression du compte) ou par e-mail. Réclamation possible auprès de la CNIL (cnil.fr).</p>
      </>
    ),
  },
  cookies: {
    title: "Cookies et stockage local",
    updated: "23 novembre 2026",
    body: (
      <>
        <p>HOMEFORM n’utilise <strong>aucun cookie publicitaire ni de mesure d’audience</strong> à ce jour. Aucun bandeau de consentement n’est donc nécessaire.</p>
        <ul>
          <li>Cookies de session d’authentification (strictement nécessaires).</li>
          <li>Stockage local du navigateur : brouillon du questionnaire, dernière analyse avant inscription, vidéos conservées à ta demande.</li>
        </ul>
        <p>Si un outil de mesure d’audience est ajouté, cette page et le recueil du consentement seront mis à jour avant son activation.</p>
      </>
    ),
  },
  "avertissement-sante": {
    title: "Avertissement santé",
    updated: "23 novembre 2026",
    body: (
      <>
        <p>L’activité physique comporte des risques. Avant de commencer un programme, consulte un médecin si tu as une pathologie, une blessure, des douleurs, si tu es enceinte, si tu reprends le sport après une longue interruption ou en cas de doute.</p>
        <p>Arrête immédiatement un exercice en cas de douleur, d’essoufflement anormal, de vertige ou de malaise.</p>
        <p>Les analyses de HOMEFORM sont des estimations à partir d’une vidéo 2D. Elles ne détectent pas de blessure et ne constituent ni un diagnostic, ni un avis médical. Les seuils utilisés sont indicatifs et doivent être validés par des professionnels qualifiés.</p>
        <p>Le coach IA est un programme informatique, pas un professionnel de santé ni un entraîneur diplômé.</p>
      </>
    ),
  },
};
