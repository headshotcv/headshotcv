export const SITE = {
  name: "HOMEFORM",
  suffix: "AI",
  tagline: "Filme ton mouvement. Améliore ta technique. Progresse chez toi.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: "contact@homeform.example", // [À COMPLÉTER]
  company: {
    legalName: "[Raison sociale — À COMPLÉTER]",
    form: "[Forme juridique et capital — À COMPLÉTER]",
    address: "[Adresse du siège — À COMPLÉTER]",
    siren: "[SIREN / RCS — À COMPLÉTER]",
    vat: "[N° TVA intracommunautaire — À COMPLÉTER]",
    director: "[Directeur·rice de la publication — À COMPLÉTER]",
    host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
  },
  /** durée de conservation des données d'analyse (jours) */
  retentionDays: 365,
};
