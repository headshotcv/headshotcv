import { openai } from "@workspace/integrations-openai-ai-server";
import type { CVData } from "./pdfGenerator.js";
import { logger } from "../lib/logger.js";

// Decide which fields are "empty enough" to be worth asking the AI to fill in.
function isBlank(s?: string | null): boolean {
  return !s || s.trim().length < 3;
}

interface EnrichmentRequest {
  needSummary: boolean;
  needJobTitle: boolean;
  needSkills: boolean;
  needInterests: boolean;
  needSoftSkills: boolean;
  needAchievements: boolean;
  needAvailability: boolean;
  needMobility: boolean;
  needLanguages: boolean;
  expIndexesNeedingDesc: number[];
  eduIndexesNeedingDesc: number[];
}

function analyse(cv: CVData): EnrichmentRequest {
  // On ne demande des "réalisations clés" à l'IA QUE si on a au moins une
  // expérience avec une description : sans matière première à reformuler,
  // on risque de fabriquer des accomplissements imaginaires.
  const hasExpMaterial = (cv.experiences ?? []).some(
    (e) => !isBlank(e.title) && (!isBlank(e.description) || !isBlank(e.company)),
  );
  return {
    needSummary: isBlank(cv.summary),
    needJobTitle: isBlank(cv.jobTitle),
    needSkills: !cv.skills || cv.skills.length === 0,
    needInterests: !cv.interests || cv.interests.length === 0,
    needSoftSkills: !cv.softSkills || cv.softSkills.length === 0,
    needAchievements: (!cv.achievements || cv.achievements.length === 0) && hasExpMaterial,
    needAvailability: isBlank(cv.availability),
    needMobility: isBlank(cv.mobility),
    needLanguages: !cv.languages || cv.languages.length === 0,
    expIndexesNeedingDesc:
      cv.experiences?.map((e, i) => (isBlank(e.description) ? i : -1)).filter((i) => i >= 0) ?? [],
    eduIndexesNeedingDesc:
      cv.education?.map((e, i) => (isBlank(e.description) ? i : -1)).filter((i) => i >= 0) ?? [],
  };
}

// Garanties déterministes : si l'IA n'a pas renvoyé ces champs (ou si l'appel a
// échoué), on remplit avec des valeurs neutres et sûres pour que le CV ne reste
// jamais visuellement vide sur ces sections.
function applyDeterministicFallbacks(cv: CVData, req: EnrichmentRequest): CVData {
  const out: CVData = { ...cv };
  if (req.needAvailability && isBlank(out.availability)) {
    out.availability = "Disponible immédiatement";
  }
  if (req.needMobility && isBlank(out.mobility)) {
    out.mobility = "Mobilité nationale, télétravail possible";
  }
  if (req.needLanguages && (!out.languages || out.languages.length === 0)) {
    out.languages = [{ name: "Français", level: "Langue maternelle" }];
  } else if (out.languages && !out.languages.some((l) => /français/i.test(l.name))) {
    // L'IA a renvoyé une liste sans le français : on l'ajoute en premier.
    out.languages = [{ name: "Français", level: "Langue maternelle" }, ...out.languages];
  }
  return out;
}

function needsAnything(req: EnrichmentRequest): boolean {
  return (
    req.needSummary ||
    req.needJobTitle ||
    req.needSkills ||
    req.needInterests ||
    req.needSoftSkills ||
    req.needAchievements ||
    req.needAvailability ||
    req.needMobility ||
    req.needLanguages ||
    req.expIndexesNeedingDesc.length > 0 ||
    req.eduIndexesNeedingDesc.length > 0
  );
}

interface EnrichmentResponse {
  jobTitle?: string;
  summary?: string;
  skills?: string[];
  interests?: string[];
  softSkills?: string[];
  achievements?: string[];
  availability?: string;
  mobility?: string;
  languages?: { name: string; level: string }[];
  experienceDescriptions?: Record<string, string>;
  educationDescriptions?: Record<string, string>;
}

const SYSTEM_PROMPT = [
  "Tu es un rédacteur de CV professionnel spécialisé en personal branding.",
  "Tu écris comme le ferait un VRAI candidat qui se vend en entretien, pas une IA.",
  "",
  "TON OBLIGATOIRE :",
  "- Français naturel, dynamique, direct, axé sur l'action concrète.",
  "- Humain et chaleureux. Comme si la personne décrivait son métier à un ami.",
  "- Concret et terre-à-terre : on doit VOIR le geste, la situation, le quotidien du poste.",
  "- Phrases courtes, directes. Pas de tournures alambiquées.",
  "- Vocabulaire simple et précis du métier réel (HACCP, mise en place, coup de feu, caisse, etc.).",
  "",
  "CRÉE UN LIEN NARRATIF entre les expériences (POINT CLÉ) :",
  "- Si le candidat combine formation prestigieuse + expérience terrain (ex : Master HEC + Barman),",
  "  fais ressortir ce qui rend cette combinaison FORTE et HUMAINE.",
  "- Montre comment l'expérience terrain a forgé des compétences réelles transférables :",
  "  psychologie client, gestion du rush, vente directe en up-selling, management d'équipe,",
  "  débrouillardise, pragmatisme opérationnel — un vrai couteau suisse, pas un théoricien.",
  "- L'histoire doit être cohérente : pourquoi cette combinaison fait sens pour le poste visé.",
  "- N'oppose JAMAIS formation et terrain. Les deux se renforcent.",
  "",
  "INTERDICTIONS STRICTES (langue de bois corporate / jargon IA / école de commerce) :",
  "- INTERDIT : « stratégies omnicanales axées performance », « optimiser l'expérience client »,",
  "  « dynamiser le chiffre d'affaires », « synergies », « valeur ajoutée », « excellence opérationnelle »,",
  "  « orienté résultats », « force de proposition », « véritable atout », « pilier », « driver »,",
  "  « leverager », « capitaliser », « adresser un enjeu », « solution disruptive », « écosystème »,",
  "  « vision 360° », « ADN », « mindset », « scaler », « impacter positivement ».",
  "- INTERDIT : phrases vides du type « passionné par mon métier, je mets mes compétences au service de... ».",
  "- INTERDIT : superlatifs auto-promotionnels exagérés (« exceptionnel », « hors pair », « parfait »).",
  "",
  "EXEMPLES DE TON ATTENDU :",
  "- Résumé OK (barman pur) : « Barman passionné et dynamique avec une solide expérience en service et mixologie.",
  "  Réactif et habitué aux coups de feu en salle comme au comptoir, je mise sur un excellent relationnel",
  "  pour fidéliser la clientèle. »",
  "- Résumé OK (marketing + terrain) : « Directeur marketing digital diplômé d'HEC, façonné par plusieurs",
  "  années derrière le bar avant le bureau. Le terrain m'a appris la vraie psychologie client, la gestion du rush",
  "  et la vente en direct — j'en fais aujourd'hui un marketing pragmatique qui parle aux clients, pas aux slides. »",
  "- Réalisation OK : « Création d'une nouvelle carte de cocktails saisonniers qui a beaucoup plu à la clientèle. »",
  "- Réalisation OK : « Mise en place de soirées à thème (quiz, blind tests) ayant dynamisé les milieux de semaine. »",
  "- Puce d'expérience OK : « Accueil, conseil et service d'une clientèle variée au comptoir et en salle. »",
  "- Puce d'expérience OK (terrain → soft skill marketing) : « Vente additionnelle en direct et lecture du client",
  "  en quelques secondes : un vrai labo de psychologie commerciale au quotidien. »",
  "- Compétence OK : « Normes HACCP », « Sens du contact », « Mixologie », « Gestion de caisse », « Résistance au stress ».",
  "- Compétence PAS OK : « Application rigoureuse des normes d'hygiène et de sécurité alimentaire ».",
  "",
  "RÈGLES FACTUELLES :",
  "- N'invente JAMAIS de fait vérifiable absent des données : pas de nom d'entreprise, de date, chiffre, %, ",
  "  taille d'équipe, montant, nom de client, ni résultat chiffré.",
  "- Tu peux seulement (a) étoffer les descriptions des postes déjà saisis avec des missions plausibles non chiffrées,",
  "  (b) générer résumé / compétences / centres d'intérêt cohérents avec le poste et les expériences existantes,",
  "  (c) tisser le lien narratif entre formations et expériences pour rendre le profil mémorable.",
  "- En cas de doute, reste descriptif et général plutôt qu'inventer.",
  "",
  "FORMAT : réponds UNIQUEMENT en JSON valide, sans markdown, sans commentaire.",
].join("\n");

function buildUserPrompt(cv: CVData, req: EnrichmentRequest): string {
  const fields: string[] = [];
  if (req.needJobTitle) {
    fields.push(
      `- "jobTitle": chaîne, intitulé de poste court (3-5 mots), à déduire des expériences ci-dessous.`,
    );
  }
  if (req.needSummary) {
    fields.push(
      `- "summary": chaîne, 2 à 3 phrases courtes (40-60 mots). ` +
        `Ton humain, direct, dynamique — comme si le candidat se présentait à l'oral à un entretien. ` +
        `Mentionne le métier, 1-2 qualités concrètes liées au quotidien du poste, et ce que le candidat apporte. ` +
        `SI le candidat a une formation marquante ET une expérience terrain de métier différent (ex : Master/École + métier manuel/service), ` +
        `FAIS RESSORTIR ce contraste comme une force : le terrain a forgé des compétences réelles (psychologie client, gestion du rush, vente directe, management) qui complètent la formation. ` +
        `MODÈLE pur métier : « [Métier] passionné et [adjectif concret] avec une solide expérience en [domaine]. [Phrase concrète sur le quotidien]. [Phrase sur ce qu'il apporte]. » ` +
        `MODÈLE hybride formation+terrain : « [Poste visé] diplômé(e) de [école], façonné(e) par [expérience terrain]. [Phrase sur ce que le terrain lui a appris concrètement]. [Phrase sur sa valeur pragmatique aujourd'hui]. »`,
    );
  }
  if (req.needSkills) {
    fields.push(
      `- "skills": tableau de 8 à 12 chaînes (compétences). ` +
        `CHAQUE chaîne fait 1 à 4 mots MAX, comme une étiquette : "Mixologie", "Normes HACCP", "Gestion de caisse", "Service au plateau". ` +
        `INTERDIT : phrases complètes ou descriptions ("Application rigoureuse des normes...").`,
    );
  }
  if (req.needInterests) {
    fields.push(
      `- "interests": tableau de 4 à 5 chaînes (centres d'intérêt crédibles et pertinents, 1-3 mots chacun, éviter les clichés "lecture/voyages").`,
    );
  }
  if (req.needSoftSkills) {
    fields.push(
      `- "softSkills": tableau de 6 chaînes (qualités humaines). ` +
        `CHAQUE chaîne fait 1 à 3 mots MAX, sous forme d'étiquette : "Sens du contact", "Rapidité", "Esprit d'équipe", "Résistance au stress", "Adaptabilité". ` +
        `Choisis-les cohérentes avec le métier réel du poste.`,
    );
  }
  if (req.needAchievements) {
    fields.push(
      `- "achievements": tableau de 3 chaînes (réalisations concrètes). ` +
        `Chaque chaîne = 12-22 mots, ton naturel et humain, décrit un fait CONCRET tiré des missions du poste. ` +
        `MODÈLES : « Création d'une nouvelle carte de cocktails saisonniers qui a beaucoup plu à la clientèle. » | « Optimisation de l'organisation du bar pour fluidifier le service les soirs de grande affluence. » | « Mise en place de soirées à thème (quiz, blind tests) ayant dynamisé les milieux de semaine. ». ` +
        `INTERDIT : chiffres, pourcentages, montants, tailles d'équipe, noms de clients. INTERDIT : jargon corporate.`,
    );
  }
  if (req.needAvailability) {
    fields.push(
      `- "availability": chaîne courte (ex : "Disponible immédiatement", "Disponible sous 1 mois"). Par défaut "Disponible immédiatement".`,
    );
  }
  if (req.needMobility) {
    fields.push(
      `- "mobility": chaîne courte (ex : "France entière, télétravail possible"). Reste générique, sans inventer de ville.`,
    );
  }
  if (req.needLanguages) {
    fields.push(
      `- "languages": tableau d'objets { "name": "...", "level": "..." }. Inclus au minimum { "name": "Français", "level": "Langue maternelle" }. ` +
        `Ajoute "Anglais" niveau "Intermédiaire (B1)" UNIQUEMENT si le poste suggère un contexte international (tech, marketing, conseil, international). Sinon, mets uniquement le français.`,
    );
  }
  if (req.expIndexesNeedingDesc.length > 0) {
    fields.push(
      `- "experienceDescriptions": objet { "0": "...", "1": "..." } avec les indices ${JSON.stringify(req.expIndexesNeedingDesc)}. ` +
        `Pour chaque indice, écris 3 à 4 puces COURTES (séparées par "\\n", chacune commençant par "• "), ` +
        `max 15 mots par puce, décrivant le QUOTIDIEN RÉEL du poste avec un vocabulaire métier concret. ` +
        `MODÈLES (pour un barman) : « • Accueil, conseil et service d'une clientèle variée au comptoir et en salle. » | « • Préparation de cocktails classiques et créations maison, gestion des envois sous pression. » | « • Gestion complète de la caisse, ouverture/clôture du bar et tenue du poste de travail. » | « • Encadrement et intégration des nouveaux serveurs au sein de l'équipe. ». ` +
        `INTERDIT : chiffres, %, taille d'équipe, montants, noms de clients. INTERDIT : jargon corporate.`,
    );
  }
  if (req.eduIndexesNeedingDesc.length > 0) {
    fields.push(
      `- "educationDescriptions": objet { "0": "..." } avec les indices ${JSON.stringify(req.eduIndexesNeedingDesc)}. ` +
        `Pour chaque indice, écris 1 phrase courte (20 mots max) mentionnant spécialisation, mention ou projet notable.`,
    );
  }

  const expBrief =
    cv.experiences?.map((e, i) => ({
      i,
      title: e.title,
      company: e.company,
      dates: `${e.startDate ?? ""} → ${e.endDate ?? "auj."}`,
    })) ?? [];
  const eduBrief =
    cv.education?.map((e, i) => ({
      i,
      degree: e.degree,
      school: e.school,
      dates: `${e.startDate ?? ""} → ${e.endDate ?? ""}`,
    })) ?? [];

  return [
    `Données candidat :`,
    `- Nom : ${cv.firstName} ${cv.lastName}`,
    cv.jobTitle ? `- Poste recherché (déjà saisi) : ${cv.jobTitle}` : null,
    cv.summary ? `- Résumé déjà saisi : ${cv.summary}` : null,
    cv.skills && cv.skills.length ? `- Compétences déjà saisies : ${cv.skills.join(", ")}` : null,
    expBrief.length
      ? `- Expériences :\n${expBrief.map((e) => `  [${e.i}] ${e.title} chez ${e.company} (${e.dates})`).join("\n")}`
      : "- Aucune expérience saisie.",
    eduBrief.length
      ? `- Formations :\n${eduBrief.map((e) => `  [${e.i}] ${e.degree} à ${e.school} (${e.dates})`).join("\n")}`
      : "- Aucune formation saisie.",
    ``,
    `Génère un objet JSON avec UNIQUEMENT les clés suivantes (omets celles non listées) :`,
    ...fields,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Best-effort enrichment of a CV. Never throws — if the AI fails or returns
 * unusable data, returns the original CV unchanged.
 */
export async function enrichCVData(cv: CVData): Promise<CVData> {
  const req = analyse(cv);
  if (!needsAnything(req)) return cv;

  // On part toujours du CV avec les fallbacks déterministes appliqués :
  // si l'appel IA échoue ou si la réponse n'a pas tel champ, on a quand même
  // une valeur neutre pour availability/mobility/languages.
  const base = applyDeterministicFallbacks(cv, req);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(cv, req) },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return base;

    let parsed: EnrichmentResponse;
    try {
      parsed = JSON.parse(raw) as EnrichmentResponse;
    } catch {
      logger.warn({ rawLength: raw.length }, "CV enrichment returned non-JSON, using fallbacks");
      return base;
    }

    const enriched: CVData = { ...cv };

    if (req.needJobTitle && typeof parsed.jobTitle === "string" && parsed.jobTitle.trim()) {
      enriched.jobTitle = parsed.jobTitle.trim();
    }
    if (req.needSummary && typeof parsed.summary === "string" && parsed.summary.trim()) {
      enriched.summary = parsed.summary.trim();
    }
    if (req.needSkills && Array.isArray(parsed.skills)) {
      const cleaned = parsed.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 14);
      if (cleaned.length > 0) enriched.skills = cleaned;
    }
    if (req.needInterests && Array.isArray(parsed.interests)) {
      const cleaned = parsed.interests.map((s) => String(s).trim()).filter(Boolean).slice(0, 6);
      if (cleaned.length > 0) enriched.interests = cleaned;
    }
    if (req.needSoftSkills && Array.isArray(parsed.softSkills)) {
      const cleaned = parsed.softSkills.map((s) => String(s).trim()).filter(Boolean).slice(0, 8);
      if (cleaned.length > 0) enriched.softSkills = cleaned;
    }
    if (req.needAchievements && Array.isArray(parsed.achievements)) {
      const cleaned = parsed.achievements.map((s) => String(s).trim()).filter(Boolean).slice(0, 4);
      if (cleaned.length > 0) enriched.achievements = cleaned;
    }
    if (req.needAvailability && typeof parsed.availability === "string" && parsed.availability.trim()) {
      enriched.availability = parsed.availability.trim();
    }
    if (req.needMobility && typeof parsed.mobility === "string" && parsed.mobility.trim()) {
      enriched.mobility = parsed.mobility.trim();
    }
    if (req.needLanguages && Array.isArray(parsed.languages)) {
      const cleaned = parsed.languages
        .map((l) => ({
          name: String(l?.name ?? "").trim(),
          level: String(l?.level ?? "").trim(),
        }))
        .filter((l) => l.name && l.level)
        .slice(0, 5);
      if (cleaned.length > 0) enriched.languages = cleaned;
    }
    if (parsed.experienceDescriptions && enriched.experiences) {
      enriched.experiences = enriched.experiences.map((e, i) => {
        if (!req.expIndexesNeedingDesc.includes(i)) return e;
        const desc = parsed.experienceDescriptions?.[String(i)];
        return desc && desc.trim() ? { ...e, description: desc.trim() } : e;
      });
    }
    if (parsed.educationDescriptions && enriched.education) {
      enriched.education = enriched.education.map((e, i) => {
        if (!req.eduIndexesNeedingDesc.includes(i)) return e;
        const desc = parsed.educationDescriptions?.[String(i)];
        return desc && desc.trim() ? { ...e, description: desc.trim() } : e;
      });
    }

    // Filet de sécurité : achievements ne doivent contenir aucun chiffre ou %
    // (anti-fabrication chiffres). On purge les puces non conformes.
    if (enriched.achievements && enriched.achievements.length > 0) {
      const numericPattern = /\d|\b(plusieurs|dizaines|centaines|milliers|millions)\b/i;
      enriched.achievements = enriched.achievements
        .filter((a) => !numericPattern.test(a))
        .slice(0, 3);
      if (enriched.achievements.length === 0) delete enriched.achievements;
    }

    // Réapplique les fallbacks au cas où l'IA aurait omis certains champs.
    return applyDeterministicFallbacks(enriched, req);
  } catch (err) {
    logger.warn({ err }, "CV enrichment failed, using fallbacks");
    return base;
  }
}
