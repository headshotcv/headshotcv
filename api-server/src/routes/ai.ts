import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "../lib/logger.js";

const router = Router();

type SuggestField =
  | "jobTitle"
  | "summary"
  | "skills"
  | "interests"
  | "experienceDescription"
  | "educationDescription"
  | "projectDescription";

interface SuggestBody {
  field: SuggestField;
  context?: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    summary?: string;
    skills?: string;
    experiences?: Array<{ title?: string; company?: string; startDate?: string; endDate?: string; description?: string }>;
    education?: Array<{ degree?: string; school?: string; startDate?: string; endDate?: string; description?: string }>;
    currentItemIndex?: number;
    currentProject?: { name?: string };
  };
}

function buildPrompt(field: SuggestField, ctx: SuggestBody["context"]): { system: string; user: string } {
  const who = ctx?.jobTitle
    ? `${ctx.firstName ?? ""} ${ctx.lastName ?? ""}`.trim() + (ctx.jobTitle ? `, ${ctx.jobTitle}` : "")
    : `${ctx?.firstName ?? ""} ${ctx?.lastName ?? ""}`.trim() || "un candidat";

  const expBrief = (ctx?.experiences ?? [])
    .filter((e) => e?.title || e?.company)
    .slice(0, 3)
    .map((e) => `- ${e.title ?? ""} chez ${e.company ?? ""}`)
    .join("\n");

  const system =
    "Tu es un coach carrière français qui aide à rédiger un CV percutant. " +
    "Tu écris UNIQUEMENT en français, dans un style professionnel, concis, orienté résultats et verbes d'action. " +
    "Tu réponds avec UNIQUEMENT le texte demandé, sans guillemets, sans préambule, sans markdown, sans listes à puces sauf si demandé.";

  switch (field) {
    case "jobTitle":
      return {
        system,
        user:
          `Propose UN seul intitulé de poste court et professionnel (3-5 mots max) pour ${who}.\n` +
          (expBrief ? `Expériences récentes :\n${expBrief}\n` : "") +
          `Réponds par l'intitulé seul, sans ponctuation finale.`,
      };
    case "summary":
      return {
        system,
        user:
          `Rédige un résumé professionnel de 3 phrases (40-60 mots) pour le haut d'un CV de ${who}.\n` +
          (expBrief ? `Expériences :\n${expBrief}\n` : "") +
          (ctx?.skills ? `Compétences : ${ctx.skills}\n` : "") +
          `Met en avant l'expertise, les résultats concrets et les ambitions. Ton confiant mais sobre.`,
      };
    case "skills":
      return {
        system,
        user:
          `Propose une liste de 8 à 12 compétences pertinentes pour ${who}, séparées par des virgules.\n` +
          (expBrief ? `Expériences :\n${expBrief}\n` : "") +
          `Mélange compétences techniques (hard skills) et transverses (soft skills). Réponds UNIQUEMENT par la liste séparée par des virgules.`,
      };
    case "interests":
      return {
        system,
        user:
          `Propose 4 à 6 centres d'intérêt crédibles et pertinents pour ${who}, séparés par des virgules.\n` +
          `Évite les clichés (lecture, voyages). Privilégie ce qui dit quelque chose sur la personne.`,
      };
    case "experienceDescription": {
      const exp = ctx?.experiences?.[ctx?.currentItemIndex ?? 0];
      const role = exp?.title ?? "ce poste";
      const company = exp?.company ?? "l'entreprise";
      return {
        system,
        user:
          `Rédige une description percutante (3-4 puces courtes, séparées par des sauts de ligne, chaque puce commence par "•") pour le poste suivant :\n` +
          `Poste : ${role}\nEntreprise : ${company}\n` +
          `Chaque puce commence par un verbe d'action au passé, mentionne un résultat chiffré si plausible (ex : "+30 %", "× 2", "5 personnes"). ` +
          `Reste réaliste et professionnel. Pas plus de 15 mots par puce.`,
      };
    }
    case "educationDescription": {
      const edu = ctx?.education?.[ctx?.currentItemIndex ?? 0];
      const degree = edu?.degree ?? "ce diplôme";
      const school = edu?.school ?? "l'établissement";
      return {
        system,
        user:
          `Rédige une description courte (1-2 phrases, 25 mots max) pour cette formation :\n` +
          `Diplôme : ${degree}\nÉcole : ${school}\n` +
          `Mentionne la spécialisation, un projet notable ou une mention. Reste sobre.`,
      };
    }
    case "projectDescription": {
      const name = ctx?.currentProject?.name ?? "ce projet";
      return {
        system,
        user:
          `Rédige une description percutante (2 phrases, 30 mots max) pour le projet "${name}". ` +
          `Explique ce qui a été fait et l'impact ou résultat obtenu.`,
      };
    }
    default:
      return { system, user: "Réponds simplement : suggestion indisponible." };
  }
}

router.post("/api/ai/suggest", async (req, res) => {
  try {
    const body = req.body as SuggestBody;
    if (!body?.field) {
      return res.status(400).json({ error: "Champ 'field' requis" });
    }

    const { system, user } = buildPrompt(body.field, body.context ?? {});

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return res.status(502).json({ error: "Réponse IA vide" });
    }

    return res.json({ suggestion: text });
  } catch (err) {
    req.log.error({ err }, "AI suggest failed");
    return res.status(500).json({ error: "Erreur IA, réessayez dans un instant." });
  }
});

export default router;
