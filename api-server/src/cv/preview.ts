import { writeFileSync, readFileSync } from "fs";
import { generateCVPdfDataUrl, type CVData } from "./pdfGenerator.js";

const EXEMPLES = "/home/runner/workspace/artifacts/headshot-pro/public/exemples";

function photo(name: string): string {
  const buf = readFileSync(`${EXEMPLES}/${name}.png`);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const samples: Array<{ slug: string; photoName: string; data: CVData }> = [
  {
    slug: "camille",
    photoName: "camille",
    data: {
      firstName: "Camille", lastName: "Moreau", jobTitle: "Directrice Artistique",
      email: "camille.moreau@email.com", phone: "+33 6 12 34 56 78", city: "Lyon",
      linkedin: "linkedin.com/in/camillemoreau",
      summary: "Directrice artistique avec 8 ans d'expérience dans l'identité visuelle et la direction de campagnes pour des marques internationales.",
      experiences: [
        { title: "Directrice Artistique Senior", company: "Atelier Nova", startDate: "2022", endDate: "2025", description: "Diriger l'identité de 12 marques\nEncadrer 6 designers\n4 awards remportés" },
        { title: "Directrice Artistique", company: "Studio Pixel", startDate: "2019", endDate: "2022", description: "Refonte d'un groupe e-commerce\n30+ campagnes livrées" },
      ],
      education: [{ degree: "Master Direction Artistique", school: "ENSAD Paris", startDate: "2015", endDate: "2017" }],
      skills: ["Direction artistique", "Branding", "Typographie", "Figma", "Photoshop"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Anglais", level: "Courant" }],
      interests: ["Photographie", "Cinéma"],
    },
  },
  {
    slug: "karim",
    photoName: "karim",
    data: {
      firstName: "Karim", lastName: "Benali", jobTitle: "Développeur Full-Stack",
      email: "karim.benali@email.com", phone: "+33 6 22 11 33 44", city: "Paris",
      linkedin: "linkedin.com/in/karimbenali",
      summary: "Développeur full-stack passionné, 6 ans d'expérience sur des applications SaaS à fort trafic. Spécialiste TypeScript et architecture cloud.",
      experiences: [
        { title: "Lead Developer", company: "Doctolib", startDate: "2023", endDate: "2025", description: "Refonte du module RDV (4M utilisateurs)\nMentorat de 4 juniors" },
        { title: "Développeur Senior", company: "Qonto", startDate: "2020", endDate: "2023", description: "API paiements (PSD2)\nMigration monorepo" },
      ],
      education: [{ degree: "Ingénieur Informatique", school: "EPITA", startDate: "2015", endDate: "2020" }],
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Anglais", level: "Courant" }, { name: "Arabe", level: "Courant" }],
      interests: ["Open source", "Escalade"],
    },
  },
  {
    slug: "lea",
    photoName: "lea",
    data: {
      firstName: "Léa", lastName: "Dubois", jobTitle: "Chef de Projet Marketing",
      email: "lea.dubois@email.com", phone: "+33 6 78 90 12 34", city: "Bordeaux",
      linkedin: "linkedin.com/in/leadubois",
      summary: "Chef de projet marketing avec 5 ans d'expérience en campagnes omnicanales et performance digitale pour des marques DTC.",
      experiences: [
        { title: "Senior Marketing Manager", company: "Sézane", startDate: "2022", endDate: "2025", description: "Lancement de 3 collections (+18% CA)\nÉquipe de 4 personnes" },
        { title: "Chef de Projet Marketing", company: "Le Slip Français", startDate: "2020", endDate: "2022", description: "Campagnes paid (ROAS x2,4)\nInfluence + CRM" },
      ],
      education: [{ degree: "Master Marketing", school: "ESSEC", startDate: "2017", endDate: "2019" }],
      skills: ["Stratégie marketing", "SEO/SEA", "Google Analytics", "Notion", "Klaviyo"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Anglais", level: "Bilingue" }, { name: "Espagnol", level: "Intermédiaire" }],
      interests: ["Yoga", "Voyage"],
    },
  },
  {
    slug: "marc",
    photoName: "marc",
    data: {
      firstName: "Marc", lastName: "Lefèvre", jobTitle: "Consultant Finance",
      email: "marc.lefevre@email.com", phone: "+33 6 45 67 89 01", city: "Paris",
      linkedin: "linkedin.com/in/marclefevre",
      summary: "Consultant en finance d'entreprise, 10 ans d'expérience sur des missions M&A et restructuration pour des ETI françaises.",
      experiences: [
        { title: "Senior Manager", company: "Mazars", startDate: "2021", endDate: "2025", description: "12 deals M&A bouclés (>200M€)\nPilotage de 6 consultants" },
        { title: "Manager", company: "EY", startDate: "2017", endDate: "2021", description: "Audit financier grands comptes\nDue diligence" },
      ],
      education: [{ degree: "Master Finance", school: "HEC Paris", startDate: "2013", endDate: "2015" }],
      skills: ["M&A", "Modélisation financière", "Excel", "PowerPoint", "IFRS"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Anglais", level: "Bilingue" }],
      interests: ["Tennis", "Vin"],
    },
  },
  {
    slug: "margaux",
    photoName: "margaux",
    data: {
      firstName: "Margaux", lastName: "Petit", jobTitle: "Étudiante M2 Marketing — Alternance",
      email: "margaux.petit@etu.univ-lyon3.fr", phone: "+33 6 14 22 87 09", city: "Lyon",
      linkedin: "linkedin.com/in/margauxpetit",
      summary: "Étudiante en Master 2 Marketing Digital à la recherche d'une alternance de 12 mois. Première expérience en agence et en startup, à l'aise avec les outils data et les réseaux sociaux.",
      experiences: [
        { title: "Stagiaire Marketing", company: "Doctolib", startDate: "2025", endDate: "2025", description: "Campagnes paid social (Meta, TikTok)\nReporting hebdo, +22% conversions" },
        { title: "Chargée de communication", company: "BDE EM Lyon", startDate: "2023", endDate: "2024", description: "Animation Instagram (3,8k abonnés)\nOrganisation de 4 événements campus" },
      ],
      education: [
        { degree: "Master Marketing Digital", school: "IAE Lyon 3", startDate: "2024", endDate: "2026" },
        { degree: "Licence Économie-Gestion", school: "Université Lyon 2", startDate: "2021", endDate: "2024", description: "Mention bien" },
      ],
      skills: ["Meta Ads", "Google Analytics", "Canva", "Notion", "SEO", "Excel"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Anglais", level: "C1" }, { name: "Espagnol", level: "B2" }],
      interests: ["Tennis", "Voyages"],
    },
  },
  {
    slug: "liam",
    photoName: "liam",
    data: {
      firstName: "Liam", lastName: "Bertrand", jobTitle: "Étudiant ingénieur — Stage 6 mois",
      email: "liam.bertrand@insa-lyon.fr", phone: "+33 6 78 33 41 90", city: "Lyon",
      linkedin: "linkedin.com/in/liambertrand",
      summary: "Étudiant ingénieur INSA Lyon en 4ème année, spécialité informatique. Recherche un stage de fin d'études de 6 mois en développement logiciel ou data engineering.",
      experiences: [
        { title: "Stagiaire Développeur", company: "Decathlon Technology", startDate: "2025", endDate: "2025", description: "Microservice Java (Spring Boot)\nMigration CI/CD GitLab" },
        { title: "Projet associatif — Dev backend", company: "INSA Junior Conseil", startDate: "2024", endDate: "2025", description: "API REST pour client client PME\nDocker + Postgres" },
      ],
      education: [
        { degree: "Ingénieur Informatique", school: "INSA Lyon", startDate: "2022", endDate: "2027" },
        { degree: "Classe prépa MPSI/MP", school: "Lycée du Parc", startDate: "2020", endDate: "2022" },
      ],
      skills: ["Java", "Python", "SQL", "Docker", "Git", "Linux"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Anglais", level: "B2" }, { name: "Allemand", level: "B1" }],
      interests: ["Escalade", "Échecs"],
    },
  },
  {
    slug: "mei",
    photoName: "mei",
    data: {
      firstName: "Mei", lastName: "Tran", jobTitle: "Étudiante Design — Alternance UX/UI",
      email: "mei.tran@strate.design", phone: "+33 6 47 88 12 03", city: "Paris",
      linkedin: "linkedin.com/in/meitran",
      summary: "Étudiante en 4ème année à Strate École de Design, spécialité UX/UI. Recherche une alternance d'1 an en design produit ou design system pour septembre 2026.",
      experiences: [
        { title: "Stagiaire UX Designer", company: "BlaBlaCar", startDate: "2025", endDate: "2025", description: "Tests utilisateurs (12 sessions)\nPrototypes Figma sur le parcours réservation" },
        { title: "Designer freelance", company: "Indépendante", startDate: "2024", endDate: "2025", description: "Refonte de 3 sites vitrines\nIdentité visuelle pour 2 marques" },
      ],
      education: [
        { degree: "Master Design Interactif", school: "Strate École de Design", startDate: "2022", endDate: "2027" },
      ],
      skills: ["Figma", "Adobe XD", "Illustrator", "Prototypage", "User research", "HTML/CSS"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Vietnamien", level: "Courant" }, { name: "Anglais", level: "C1" }],
      interests: ["Illustration", "Cinéma d'auteur"],
    },
  },
  {
    slug: "sofia",
    photoName: "sofia",
    data: {
      firstName: "Sofia", lastName: "Garcia", jobTitle: "UX Designer",
      email: "sofia.garcia@email.com", phone: "+33 6 33 44 55 66", city: "Nantes",
      linkedin: "linkedin.com/in/sofiagarcia",
      summary: "UX Designer centrée utilisateur, 7 ans d'expérience sur des produits B2B et B2C. Recherche, prototypage, design systems.",
      experiences: [
        { title: "Lead UX Designer", company: "BlaBlaCar", startDate: "2022", endDate: "2025", description: "Refonte du parcours covoiturage\nDesign system v2" },
        { title: "UX Designer", company: "Back Market", startDate: "2019", endDate: "2022", description: "Tests utilisateurs hebdo\nA/B testing checkout (+12%)" },
      ],
      education: [{ degree: "Master Design", school: "Strate École de Design", startDate: "2016", endDate: "2018" }],
      skills: ["Figma", "User research", "Prototypage", "Design system", "Accessibilité"],
      languages: [{ name: "Français", level: "Maternelle" }, { name: "Espagnol", level: "Maternelle" }, { name: "Anglais", level: "Courant" }],
      interests: ["Illustration", "Randonnée"],
    },
  },
];

(async () => {
  for (const s of samples) {
    const url = await generateCVPdfDataUrl(s.data, photo(s.photoName), "classique", "fr");
    const b64 = url.split(",")[1];
    writeFileSync(`/tmp/cv-${s.slug}.pdf`, Buffer.from(b64, "base64"));
    // eslint-disable-next-line no-console
    console.log(`wrote /tmp/cv-${s.slug}.pdf`);
  }
})();
