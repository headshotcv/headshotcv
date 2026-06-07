import { openai } from "@workspace/integrations-openai-ai-server";
import type { CVData } from "./pdfGenerator.js";
import { logger } from "../lib/logger.js";

interface TranslatableFields {
  jobTitle?: string;
  summary?: string;
  skills?: string[];
  softSkills?: string[];
  interests?: string[];
  achievements?: string[];
  availability?: string;
  mobility?: string;
  experienceTitles?: Record<string, string>;
  experienceDescriptions?: Record<string, string>;
  educationDegrees?: Record<string, string>;
  educationDescriptions?: Record<string, string>;
  languageNames?: Record<string, string>;
  languageLevels?: Record<string, string>;
}

const SYSTEM_PROMPT = [
  "You are a professional French-to-English CV translator.",
  "",
  "RULES:",
  "- Translate from French to natural, idiomatic professional English (US English).",
  "- Keep the tone HUMAN and natural — exactly like a real candidate, NOT corporate jargon or AI-speak.",
  "- Preserve the original meaning, structure, line breaks (\\n), bullet markers (•), and punctuation.",
  "- Keep tag-like skills SHORT (1-4 words max): 'Normes HACCP' → 'HACCP Standards', 'Sens du contact' → 'People Skills', 'Mixologie' → 'Mixology', 'Rapidité' → 'Speed', 'Esprit d'équipe' → 'Team Spirit', 'Résistance au stress' → 'Stress Resistance'.",
  "- For job titles: 'Barman' → 'Bartender', 'Serveur' → 'Waiter', etc.",
  "- For language names: 'Français' → 'French', 'Anglais' → 'English', 'Espagnol' → 'Spanish'.",
  "- For language levels: 'Langue maternelle' → 'Native', 'Courant' → 'Fluent', 'Intermédiaire' → 'Intermediate', keep CEFR codes (A1/B2/C1) as-is.",
  "- For availability: 'Disponible immédiatement' → 'Available immediately', 'Disponible sous 1 mois' → 'Available within 1 month'.",
  "- For mobility: 'Mobilité nationale, télétravail possible' → 'Nationwide mobility, remote work possible'.",
  "",
  "FORBIDDEN: Corporate buzzwords ('synergize', 'leverage', 'spearhead', 'drive value'), AI-speak fillers, robotic translations.",
  "",
  "RESPOND ONLY in valid JSON, no markdown, no comments.",
].join("\n");

function buildPayload(cv: CVData): {
  jobTitle?: string;
  summary?: string;
  skills?: string[];
  softSkills?: string[];
  interests?: string[];
  achievements?: string[];
  availability?: string;
  mobility?: string;
  experienceTitles?: Record<string, string>;
  experienceDescriptions?: Record<string, string>;
  educationDegrees?: Record<string, string>;
  educationDescriptions?: Record<string, string>;
  languageNames?: Record<string, string>;
  languageLevels?: Record<string, string>;
} {
  const payload: ReturnType<typeof buildPayload> = {};
  if (cv.jobTitle) payload.jobTitle = cv.jobTitle;
  if (cv.summary) payload.summary = cv.summary;
  if (cv.skills?.length) payload.skills = cv.skills;
  if (cv.softSkills?.length) payload.softSkills = cv.softSkills;
  if (cv.interests?.length) payload.interests = cv.interests;
  if (cv.achievements?.length) payload.achievements = cv.achievements;
  if (cv.availability) payload.availability = cv.availability;
  if (cv.mobility) payload.mobility = cv.mobility;
  if (cv.experiences?.length) {
    const titles: Record<string, string> = {};
    const descs: Record<string, string> = {};
    cv.experiences.forEach((e, i) => {
      if (e.title) titles[String(i)] = e.title;
      if (e.description) descs[String(i)] = e.description;
    });
    if (Object.keys(titles).length) payload.experienceTitles = titles;
    if (Object.keys(descs).length) payload.experienceDescriptions = descs;
  }
  if (cv.education?.length) {
    const degrees: Record<string, string> = {};
    const descs: Record<string, string> = {};
    cv.education.forEach((e, i) => {
      if (e.degree) degrees[String(i)] = e.degree;
      if (e.description) descs[String(i)] = e.description;
    });
    if (Object.keys(degrees).length) payload.educationDegrees = degrees;
    if (Object.keys(descs).length) payload.educationDescriptions = descs;
  }
  if (cv.languages?.length) {
    const names: Record<string, string> = {};
    const levels: Record<string, string> = {};
    cv.languages.forEach((l, i) => {
      if (l.name) names[String(i)] = l.name;
      if (l.level) levels[String(i)] = l.level;
    });
    if (Object.keys(names).length) payload.languageNames = names;
    if (Object.keys(levels).length) payload.languageLevels = levels;
  }
  return payload;
}

/**
 * Translate the user-content text fields of a CV from French to English.
 * Returns a new CVData with translations applied. Preserves names, dates,
 * company names, contact info, addresses (proper nouns) untouched.
 * If translation fails, returns the original CV unchanged.
 */
export async function translateCVToEnglish(cv: CVData): Promise<CVData> {
  const payload = buildPayload(cv);
  if (Object.keys(payload).length === 0) return cv;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            "Translate every value in the following JSON from French to English, returning the SAME structure with translated values. Keep object keys identical.\n\n" +
            JSON.stringify(payload, null, 2),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return cv;

    let translated: TranslatableFields;
    try {
      translated = JSON.parse(raw) as TranslatableFields;
    } catch {
      logger.warn({ rawLength: raw.length }, "CV translation returned non-JSON, ignoring");
      return cv;
    }

    const out: CVData = { ...cv };
    if (typeof translated.jobTitle === "string" && translated.jobTitle.trim()) {
      out.jobTitle = translated.jobTitle.trim();
    }
    if (typeof translated.summary === "string" && translated.summary.trim()) {
      out.summary = translated.summary.trim();
    }
    if (Array.isArray(translated.skills) && translated.skills.length === (cv.skills?.length ?? -1)) {
      out.skills = translated.skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(translated.softSkills) && translated.softSkills.length === (cv.softSkills?.length ?? -1)) {
      out.softSkills = translated.softSkills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(translated.interests) && translated.interests.length === (cv.interests?.length ?? -1)) {
      out.interests = translated.interests.map((s) => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(translated.achievements) && translated.achievements.length === (cv.achievements?.length ?? -1)) {
      out.achievements = translated.achievements.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof translated.availability === "string" && translated.availability.trim()) {
      out.availability = translated.availability.trim();
    }
    if (typeof translated.mobility === "string" && translated.mobility.trim()) {
      out.mobility = translated.mobility.trim();
    }
    if (out.experiences) {
      out.experiences = out.experiences.map((e, i) => {
        const key = String(i);
        const newTitle = translated.experienceTitles?.[key];
        const newDesc = translated.experienceDescriptions?.[key];
        return {
          ...e,
          title: newTitle && newTitle.trim() ? newTitle.trim() : e.title,
          description: newDesc && newDesc.trim() ? newDesc.trim() : e.description,
        };
      });
    }
    if (out.education) {
      out.education = out.education.map((e, i) => {
        const key = String(i);
        const newDegree = translated.educationDegrees?.[key];
        const newDesc = translated.educationDescriptions?.[key];
        return {
          ...e,
          degree: newDegree && newDegree.trim() ? newDegree.trim() : e.degree,
          description: newDesc && newDesc.trim() ? newDesc.trim() : e.description,
        };
      });
    }
    if (out.languages) {
      out.languages = out.languages.map((l, i) => {
        const key = String(i);
        const newName = translated.languageNames?.[key];
        const newLevel = translated.languageLevels?.[key];
        return {
          name: newName && newName.trim() ? newName.trim() : l.name,
          level: newLevel && newLevel.trim() ? newLevel.trim() : l.level,
        };
      });
    }
    return out;
  } catch (err) {
    logger.warn({ err }, "CV translation failed, returning original");
    return cv;
  }
}
