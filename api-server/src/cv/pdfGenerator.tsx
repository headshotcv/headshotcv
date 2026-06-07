import React from "react";
import {
  Document as _Document,
  Page as _Page,
  Text as _Text,
  View as _View,
  StyleSheet,
  Image as _Image,
  Svg as _Svg,
  Path as _Path,
  Circle as _Circle,
  Rect as _Rect,
  G as _G,
  renderToBuffer,
} from "@react-pdf/renderer";

import headerViewUrl from "./assets/header-view.jpg";

const Document = _Document as any;
const Page = _Page as any;
const Text = _Text as any;
const View = _View as any;
const Image = _Image as any;
const Svg = _Svg as any;
const Path = _Path as any;
const Circle = _Circle as any;
const Rect = _Rect as any;
const G = _G as any;

export interface CVExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
export interface CVEducation {
  degree: string;
  school: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
export interface CVLanguage {
  name: string;
  level: string;
}
export interface CVCertification {
  name: string;
  issuer?: string;
  year?: string;
}
export interface CVProject {
  name: string;
  description?: string;
  link?: string;
}
export interface CVReference {
  name: string;
  role?: string;
  contact?: string;
}
export interface CVData {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  linkedin?: string;
  summary?: string;
  experiences?: CVExperience[];
  education?: CVEducation[];
  skills?: string[];
  languages?: CVLanguage[];
  certifications?: CVCertification[];
  projects?: CVProject[];
  references?: CVReference[];
  interests?: string[];
  softSkills?: string[];
  achievements?: string[];
  availability?: string;
  mobility?: string;
}

export type Lang = "fr" | "en";

const LABELS = {
  fr: {
    profile: "Profil",
    skills: "Compétences",
    softwares: "Logiciels",
    softSkills: "Qualités",
    languages: "Langues",
    interests: "Centres d'intérêt",
    certifications: "Certifications",
    achievements: "Réalisations",
    experience: "Expérience",
    education: "Formation",
    projects: "Projets",
    references: "Références",
    contact: "Contact",
    present: "Aujourd'hui",
  },
  en: {
    profile: "Profile",
    skills: "Skills",
    softwares: "Software",
    softSkills: "Soft Skills",
    languages: "Languages",
    interests: "Interests",
    certifications: "Certifications",
    achievements: "Achievements",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    references: "References",
    contact: "Contact",
    present: "Present",
  },
} as const;

const FOOTER = {
  fr: { left: "Mis en page avec HeadshotCV", right: "headshotcv.com" },
  en: { left: "Designed with HeadshotCV", right: "headshotcv.com" },
};

function dateRange(start: string | undefined, end: string | undefined, lang: Lang) {
  if (!start && !end) return "";
  if (!end) return `${start} – ${LABELS[lang].present}`;
  return `${start} – ${end}`;
}

// ============================================================
// Palette — merged "tropical / coral / dark" template
// ============================================================
const CORAL = "#e2755f";
const CORAL_DARK = "#c5573f";
const DARK_INK = "#22272f";
const TEXT_DARK = "#1f2937";
const TEXT_MID = "#3b424b";
const TEXT_MUTED = "#6b7280";
const SIDE_RULE = "rgba(255,255,255,0.55)";
const MAIN_RULE = "#d6d8dc";
const TRACK = "#e5e7eb";

// ============================================================
// Icon glyphs (color-prop)
// ============================================================
type GlyphProps = { color?: string };

const PersonGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Circle cx={12} cy={8} r={3.8} fill={color} />
    <Path d="M 3.5 21 C 3.5 15.5 7.3 12.5 12 12.5 C 16.7 12.5 20.5 15.5 20.5 21 Z" fill={color} />
  </G>
);

const PhoneGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <Path
    d="M 4 4 C 4 3.4 4.4 3 5 3 L 8 3 C 8.6 3 9 3.4 9 4 C 9 5.3 9.2 6.6 9.6 7.8 C 9.7 8.2 9.6 8.6 9.3 8.9 L 7.3 10.9 C 8.7 13.7 10.9 15.9 13.7 17.3 L 15.7 15.3 C 16 15 16.4 14.9 16.8 15 C 18 15.4 19.3 15.6 20.6 15.6 C 21.2 15.6 21.6 16 21.6 16.6 L 21.6 19.6 C 21.6 20.2 21.2 20.6 20.6 20.6 C 11.4 20.6 4 13.2 4 4 Z"
    fill={color}
  />
);

const MailGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 3 5 L 21 5 L 21 19 L 3 19 Z" fill="none" stroke={color} strokeWidth={1.6} />
    <Path d="M 3 5 L 12 13 L 21 5" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </G>
);

const PinGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 12 2 C 7.5 2 4 5.5 4 10 C 4 16 12 22 12 22 C 12 22 20 16 20 10 C 20 5.5 16.5 2 12 2 Z" fill={color} />
    <Circle cx={12} cy={10} r={3} fill="#ffffff" />
  </G>
);

const LinkGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Rect x={2} y={4} width={20} height={16} fill={color} />
    <Rect x={5} y={9} width={3} height={8} fill="#ffffff" />
    <Circle cx={6.5} cy={7} r={1.4} fill="#ffffff" />
    <Path d="M 11 17 L 11 11 L 14 11 C 16.5 11 17.5 12.5 17.5 14 L 17.5 17 M 14.5 17 L 14.5 14.2 C 14.5 13.4 14 13 13.2 13 L 11 13" fill="none" stroke="#ffffff" strokeWidth={1.4} />
  </G>
);

const BriefcaseGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 9 6 L 9 8.5 L 15 8.5 L 15 6 C 15 5.2 14.3 4.5 13.5 4.5 L 10.5 4.5 C 9.7 4.5 9 5.2 9 6 Z" fill={color} />
    <Path d="M 3 8.5 L 21 8.5 L 21 20 C 21 20.8 20.3 21 19.5 21 L 4.5 21 C 3.7 21 3 20.8 3 20 Z" fill={color} />
    <Rect x={10} y={12} width={4} height={3} fill="#ffffff" />
  </G>
);

const CapGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 2 9.5 L 12 5 L 22 9.5 L 12 14 Z" fill={color} />
    <Path d="M 6 12.5 L 6 16 C 6 17.5 9 18.5 12 18.5 C 15 18.5 18 17.5 18 16 L 18 12.5 L 12 15.3 Z" fill={color} />
    <Path d="M 21.5 10 L 21.5 16.5" stroke={color} strokeWidth={1} fill="none" />
    <Path d="M 20 17.5 L 23 17.5" stroke={color} strokeWidth={1.2} fill="none" />
  </G>
);

const GearGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path
      d="M 12 2 L 13.6 4.5 L 16.5 4 L 17.5 7 L 20 8.5 L 19.5 11.5 L 21.5 13.5 L 19.5 16 L 18.5 19 L 15.5 19 L 13.5 21.5 L 11 21 L 8.5 22 L 6 19.5 L 3.5 18 L 3.5 15 L 1.5 12.5 L 3 10 L 3.5 7 L 6 6 L 7.5 3.5 L 10.5 4 Z"
      fill={color}
    />
    <Circle cx={12} cy={12} r={3.5} fill="#ffffff" />
  </G>
);

const TranslateGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 2.5 5 L 10.5 5 M 6.5 3.5 L 6.5 5 M 6.5 5.5 C 6.5 9 5 12 2 14 M 3.5 11 C 5.5 13.5 8 14.5 10.5 15"
      stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M 17.5 10 L 13 22 M 22 22 L 17.5 10 M 14.5 18.5 L 20.5 18.5"
      stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </G>
);

const HeartGlyph = ({ color = DARK_INK }: GlyphProps) => (
  <Path
    d="M 12 21 C 5 16 2 12 2 8.5 C 2 6 4 4 6.5 4 C 8.5 4 10.5 5.2 12 7 C 13.5 5.2 15.5 4 17.5 4 C 20 4 22 6 22 8.5 C 22 12 19 16 12 21 Z"
    fill={color}
  />
);

// — small interest icons —
const InterestRun = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Circle cx={15} cy={4.5} r={2} fill={color} />
    <Path d="M 5 11 L 9 9 L 12 11 L 14 14 L 12 18 L 9 22 M 14 14 L 18 13 M 4 19 L 7 20" stroke={color} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </G>
);
const InterestCamera = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 3 8 L 7 8 L 8.5 6 L 15.5 6 L 17 8 L 21 8 L 21 19 L 3 19 Z" fill={color} />
    <Circle cx={12} cy={13.5} r={3.5} fill="#ffffff" />
    <Circle cx={12} cy={13.5} r={2} fill={color} />
  </G>
);
const InterestFilm = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Rect x={3} y={5} width={18} height={14} fill={color} />
    <Rect x={5} y={7} width={2} height={2} fill="#ffffff" />
    <Rect x={5} y={11} width={2} height={2} fill="#ffffff" />
    <Rect x={5} y={15} width={2} height={2} fill="#ffffff" />
    <Rect x={17} y={7} width={2} height={2} fill="#ffffff" />
    <Rect x={17} y={11} width={2} height={2} fill="#ffffff" />
    <Rect x={17} y={15} width={2} height={2} fill="#ffffff" />
    <Rect x={9} y={9} width={6} height={6} fill="#ffffff" />
  </G>
);
const InterestBook = ({ color = DARK_INK }: GlyphProps) => (
  <Path d="M 4 4 L 11 5 L 11 21 L 4 20 Z M 13 5 L 20 4 L 20 20 L 13 21 Z" fill={color} />
);
const InterestMusic = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 9 5 L 19 3 L 19 16" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    <Circle cx={7} cy={17} r={3} fill={color} />
    <Circle cx={17} cy={16} r={3} fill={color} />
  </G>
);
const InterestPlane = ({ color = DARK_INK }: GlyphProps) => (
  <Path d="M 2 14 L 22 7 L 22 11 L 14 13 L 11 20 L 8 19 L 9.5 14 L 5 15 L 4 18 L 2 17 Z" fill={color} />
);
const InterestFood = ({ color = DARK_INK }: GlyphProps) => (
  <G>
    <Path d="M 5 4 L 5 11 M 7 4 L 7 11 M 9 4 L 9 11 C 9 12.5 8 13 7 13 L 7 21 L 6 21 L 6 13 C 5 13 4 12.5 4 11 L 4 4" stroke={color} strokeWidth={1.6} fill="none" />
    <Path d="M 16 4 C 14 4 13 6 13 9 C 13 11 14 12 16 12 L 16 21 L 18 21 L 18 4 Z" fill={color} />
  </G>
);

const INTEREST_ICONS: Record<string, (p: GlyphProps) => React.ReactElement> = {
  default: InterestBook as any,
  run: InterestRun as any,
  camera: InterestCamera as any,
  film: InterestFilm as any,
  book: InterestBook as any,
  music: InterestMusic as any,
  plane: InterestPlane as any,
  food: InterestFood as any,
};

function pickInterestIcon(label: string): (p: GlyphProps) => React.ReactElement {
  const l = label.toLowerCase();
  if (/(course|run|sport|foot|tennis|vélo|velo|cycl|natat|swim|fitness|yoga|randon|hik|bask|judo|box|escal|climb)/.test(l)) return INTEREST_ICONS.run;
  if (/(photo|appareil|camera)/.test(l)) return INTEREST_ICONS.camera;
  if (/(cin[ée]ma|film|s[ée]rie|movie)/.test(l)) return INTEREST_ICONS.film;
  if (/(lecture|livre|read|book|roman|po[ée]sie)/.test(l)) return INTEREST_ICONS.book;
  if (/(musique|music|guitare|piano|chant|sing|concert)/.test(l)) return INTEREST_ICONS.music;
  if (/(voyage|travel|avion|d[ée]couverte|explor)/.test(l)) return INTEREST_ICONS.plane;
  if (/(cuisin|cook|gastr|food|p[âa]tiss|baking)/.test(l)) return INTEREST_ICONS.food;
  return INTEREST_ICONS.default;
}

function Icon({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );
}

// ============================================================
// Skill ring (SVG circle with dasharray)
// ============================================================
function SkillRing({ value, label }: { value: number; label: string }) {
  const r = 18;
  const C = 2 * Math.PI * r;
  const dash = (Math.max(5, Math.min(100, value)) / 100) * C;
  return (
    <View style={{ alignItems: "center", width: 56, marginBottom: 10 }}>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Circle cx={22} cy={22} r={r} stroke="rgba(255,255,255,0.35)" strokeWidth={3.5} fill="none" />
        <G transform="rotate(-90 22 22)">
          <Circle
            cx={22} cy={22} r={r}
            stroke="#ffffff" strokeWidth={3.5} fill="none"
            strokeDasharray={`${dash} ${C}`}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <Text style={{ fontSize: 7.5, color: "#ffffff", marginTop: 4, textAlign: "center", letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function pseudoPercent(label: string, idx: number): number {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return 65 + ((h + idx * 13) % 31); // 65..95
}

// ============================================================
// Styles
// ============================================================
const HEADER_H = 195;
const PHOTO_SIZE = 150;
const SIDEBAR_WIDTH_PCT = "36%";

const ps = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: TEXT_DARK,
    backgroundColor: "#ffffff",
  },

  // ---- header ----
  headerWrap: { height: HEADER_H, position: "relative", backgroundColor: DARK_INK },
  headerImg: {
    position: "absolute", top: 0, left: 0, right: 0, height: HEADER_H, width: "100%",
    objectFit: "cover",
  },
  headerSvg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  headerText: {
    position: "absolute",
    top: 55,
    left: 235,
    right: 30,
  },
  headerFirst: {
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    fontSize: 30,
    letterSpacing: 1.4,
  },
  headerLast: {
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    fontSize: 30,
    letterSpacing: 1.4,
    marginTop: -2,
  },
  rolePill: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: CORAL,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 14,
    paddingRight: 14,
  },
  roleText: {
    color: "#ffffff",
    fontSize: 10,
    letterSpacing: 1.6,
    fontFamily: "Helvetica-Bold",
  },

  // ---- photo bubble (overlaps header) ----
  photoFrame: {
    position: "absolute",
    top: HEADER_H - PHOTO_SIZE / 2 - 18,
    left: 28,
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 4,
    borderColor: "#ffffff",
    overflow: "hidden",
    backgroundColor: "#cfd6dd",
  },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, objectFit: "cover", objectPosition: "center 18%" },
  photoFallback: {
    width: PHOTO_SIZE, height: PHOTO_SIZE,
    alignItems: "center", justifyContent: "flex-end",
    backgroundColor: "#b8c1cc", overflow: "hidden",
  },

  // ---- body ----
  sidebarBg: {
    position: "absolute",
    left: 0,
    top: HEADER_H,
    bottom: 0,
    width: SIDEBAR_WIDTH_PCT,
    backgroundColor: CORAL,
  },
  body: { flexDirection: "row" },
  sidebar: {
    width: SIDEBAR_WIDTH_PCT,
    paddingHorizontal: 18,
    paddingTop: 78, // clears photo bubble bottom
    paddingBottom: 60,
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  mainTop: {
    backgroundColor: DARK_INK,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  mainBottom: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
    flexGrow: 1,
  },
  darkTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: "#ffffff",
    letterSpacing: 2.4,
    marginBottom: 6,
  },
  darkSummary: {
    fontSize: 9.2,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 1.55,
    textAlign: "justify",
    marginBottom: 4,
  },
  swLabelDark: { fontSize: 9, color: "#ffffff", marginBottom: 3, fontFamily: "Helvetica-Bold" },
  swTrackDark: { height: 4, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 2 },
  mainTitleSimple: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: DARK_INK,
    letterSpacing: 2.4,
    marginBottom: 6,
  },
  expDatePillInline: {
    backgroundColor: CORAL,
    alignSelf: "flex-start",
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 9,
    paddingRight: 9,
    marginBottom: 4,
  },
  expHeading: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    marginBottom: 2,
  },

  // ---- side sections ----
  sideTitle: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    letterSpacing: 2.4,
    marginBottom: 4,
    textAlign: "center",
  },
  sideRule: { height: 1, backgroundColor: SIDE_RULE, marginBottom: 9 },
  sideBlock: { marginBottom: 16 },

  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  contactIcon: { width: 14, marginRight: 8, marginTop: 1 },
  contactText: { flex: 1, color: "#ffffff", fontSize: 8.8, lineHeight: 1.4 },

  sideBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  sideBulletDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: "#ffffff", marginRight: 8, marginTop: 4.5,
  },
  sideBulletText: { flex: 1, color: "#ffffff", fontSize: 9, lineHeight: 1.45 },
  sideBulletLevel: { fontSize: 8, color: "rgba(255,255,255,0.85)" },

  // ---- main sections ----
  mainBlock: { marginBottom: 14 },
  mainTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  mainTitleIcon: { width: 16, height: 16, marginRight: 8 },
  mainTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: DARK_INK,
    letterSpacing: 2,
  },
  mainRule: { height: 1, backgroundColor: MAIN_RULE, marginBottom: 8 },

  summary: { fontSize: 9.5, lineHeight: 1.5, color: TEXT_MID, textAlign: "justify" },

  // ---- experiences ----
  expItem: { flexDirection: "row", marginBottom: 10 },
  expDateCol: { width: 70, alignItems: "flex-end", paddingRight: 8, paddingTop: 1 },
  expDatePill: {
    backgroundColor: DARK_INK,
    paddingTop: 3, paddingBottom: 3,
    paddingLeft: 7, paddingRight: 7,
  },
  expDateText: { color: "#ffffff", fontSize: 8.5, fontFamily: "Helvetica-Bold", letterSpacing: 0.6 },
  expBody: { flex: 1, borderLeftWidth: 1, borderLeftColor: MAIN_RULE, paddingLeft: 10, paddingBottom: 2 },
  expTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: DARK_INK, letterSpacing: 0.8, marginBottom: 1 },
  expCompany: { fontSize: 9.5, color: CORAL_DARK, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  expMeta: { fontSize: 8.5, color: TEXT_MUTED, marginBottom: 3 },
  expDesc: { fontSize: 9, color: TEXT_MID, lineHeight: 1.45 },

  descBulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 2 },
  descBulletDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: CORAL, marginRight: 7, marginTop: 5 },
  descBulletText: { flex: 1, fontSize: 9, color: TEXT_MID, lineHeight: 1.45 },

  // ---- software bars ----
  swGrid: { flexDirection: "row", flexWrap: "wrap" },
  swItem: { width: "50%", paddingRight: 10, marginBottom: 7 },
  swLabel: { fontSize: 9, color: DARK_INK, marginBottom: 3, fontFamily: "Helvetica-Bold" },
  swTrack: { height: 4, backgroundColor: TRACK, borderRadius: 2 },
  swFill: { height: 4, backgroundColor: CORAL, borderRadius: 2 },

  // ---- interests row ----
  interestRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", marginTop: 2 },
  interestItem: { alignItems: "center", width: 70, marginBottom: 8 },
  interestIconBox: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  interestLabel: { fontSize: 8, color: TEXT_MID, textAlign: "center", letterSpacing: 0.3 },

  // ---- skill rings ----
  ringGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  // ---- footer ----
  footer: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    backgroundColor: DARK_INK,
    paddingTop: 6, paddingBottom: 6,
    paddingLeft: 22, paddingRight: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 7.5, color: "#ffffff",
    letterSpacing: 1.4, textTransform: "uppercase",
  },
  footerRight: {
    fontSize: 7.8, fontFamily: "Helvetica-Bold", color: CORAL,
    letterSpacing: 1.4, textTransform: "uppercase",
  },
});

// ============================================================
// Small section helpers
// ============================================================
function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={ps.sideBlock}>
      <Text style={ps.sideTitle}>{title.toUpperCase()}</Text>
      <View style={ps.sideRule} />
      {children}
    </View>
  );
}

function MainSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={ps.mainBlock}>
      <View style={ps.mainTitleRow}>
        <View style={ps.mainTitleIcon}>
          <Icon size={16}>{icon}</Icon>
        </View>
        <Text style={ps.mainTitle}>{title.toUpperCase()}</Text>
      </View>
      <View style={ps.mainRule} />
      {children}
    </View>
  );
}

function splitDescBullets(desc: string): string[] | null {
  if (!desc) return null;
  if (desc.includes("\n")) {
    const parts = desc.split(/\n+/).map((s) => s.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }
  return null;
}

// ============================================================
// MergedDoc — leaves header + coral sidebar + dark accents
// ============================================================
function MergedDoc({ data, photo, lang }: { data: CVData; photo: string | null; lang: Lang }) {
  const L = LABELS[lang];
  const F = FOOTER[lang];

  // Split skills: tool-like (1-2 words, no spaces) → Logiciels bars (dark block);
  // longer phrases → Compétences bullets (sidebar). Fallback: split in half.
  const skillsAll = data.skills ?? [];
  const isTool = (s: string) => !/\s/.test(s.trim()) && s.length <= 16;
  let competencesSkills = skillsAll.filter((s) => !isTool(s));
  let softwareSkills = skillsAll.filter((s) => isTool(s));
  if (skillsAll.length >= 2 && (softwareSkills.length === 0 || competencesSkills.length === 0)) {
    const mid = Math.ceil(skillsAll.length / 2);
    competencesSkills = skillsAll.slice(0, mid);
    softwareSkills = skillsAll.slice(mid);
  }
  void SkillRing;
  void pseudoPercent;

  return (
    <Document>
      <Page size="A4" style={ps.page}>
        {/* fixed coral sidebar bg (so it repeats on multi-page) */}
        <View style={ps.sidebarBg} fixed />

        {/* HEADER — real cityscape photo with darkening overlay + coral accents */}
        <View style={ps.headerWrap}>
          <Image src={headerViewUrl} style={ps.headerImg} />
          <View style={ps.headerSvg}>
            <Svg width="100%" height={HEADER_H} viewBox={`0 0 595 ${HEADER_H}`} preserveAspectRatio="none">
              {/* darken the photo so the name reads clean (left-to-right gradient feel via two rects) */}
              <Rect x={0} y={0} width={595} height={HEADER_H} fill={DARK_INK} opacity={0.55} />
              <Rect x={0} y={0} width={300} height={HEADER_H} fill={DARK_INK} opacity={0.25} />
              {/* bottom coral ribbon — anchors the photo to the coral sidebar below */}
              <Rect x={0} y={HEADER_H - 4} width={595} height={4} fill={CORAL} />
              {/* tiny coral brand tick top-left */}
              <Rect x={30} y={22} width={36} height={1.4} fill={CORAL} />
            </Svg>
          </View>
          <View style={ps.headerText}>
            <Text style={ps.headerFirst}>{(data.firstName || "").toUpperCase()}</Text>
            <Text style={ps.headerLast}>{(data.lastName || "").toUpperCase()}</Text>
            {data.jobTitle ? (
              <View style={ps.rolePill}>
                <Text style={ps.roleText}>{data.jobTitle.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* PHOTO bubble */}
        <View style={ps.photoFrame}>
          {photo ? (
            <Image style={ps.photo} src={photo} />
          ) : (
            <View style={ps.photoFallback}>
              <Svg width={140} height={140} viewBox="0 0 24 24">
                <Circle cx={12} cy={9} r={4.2} fill="#ffffff" />
                <Path d="M 2 22 C 2 16 6 13 12 13 C 18 13 22 16 22 22 Z" fill="#ffffff" />
              </Svg>
            </View>
          )}
        </View>

        {/* BODY */}
        <View style={ps.body}>
          {/* SIDEBAR (coral) */}
          <View style={ps.sidebar}>
            {/* Contact */}
            {(data.phone || data.email || data.address || data.city || data.linkedin || data.website) ? (
              <SideSection title={L.contact}>
                {data.phone ? (
                  <View style={ps.contactRow}>
                    <View style={ps.contactIcon}><Icon size={12}><PhoneGlyph color="#ffffff" /></Icon></View>
                    <Text style={ps.contactText}>{data.phone}</Text>
                  </View>
                ) : null}
                {data.email ? (
                  <View style={ps.contactRow}>
                    <View style={ps.contactIcon}><Icon size={12}><MailGlyph color="#ffffff" /></Icon></View>
                    <Text style={ps.contactText}>{data.email}</Text>
                  </View>
                ) : null}
                {(data.address || data.city) ? (
                  <View style={ps.contactRow}>
                    <View style={ps.contactIcon}><Icon size={12}><PinGlyph color="#ffffff" /></Icon></View>
                    <Text style={ps.contactText}>{[data.address, data.city].filter(Boolean).join(", ")}</Text>
                  </View>
                ) : null}
                {data.linkedin ? (
                  <View style={ps.contactRow}>
                    <View style={ps.contactIcon}><Icon size={12}><LinkGlyph color="#ffffff" /></Icon></View>
                    <Text style={ps.contactText}>{data.linkedin}</Text>
                  </View>
                ) : null}
                {data.website ? (
                  <View style={ps.contactRow}>
                    <View style={ps.contactIcon}><Icon size={12}><LinkGlyph color="#ffffff" /></Icon></View>
                    <Text style={ps.contactText}>{data.website}</Text>
                  </View>
                ) : null}
              </SideSection>
            ) : null}

            {/* Formation */}
            {data.education && data.education.length > 0 ? (
              <SideSection title={L.education}>
                {data.education.map((e, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 8.8, color: "#ffffff", fontFamily: "Helvetica-Bold", letterSpacing: 0.4 }}>
                      {dateRange(e.startDate, e.endDate, lang)}
                    </Text>
                    <Text style={{ fontSize: 9.5, color: "#ffffff", fontFamily: "Helvetica-Bold", marginTop: 1 }}>
                      {e.degree}
                    </Text>
                    <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.92)", marginTop: 1 }}>
                      {e.school}
                    </Text>
                    {e.description ? (
                      <Text style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", marginTop: 1 }}>{e.description}</Text>
                    ) : null}
                  </View>
                ))}
              </SideSection>
            ) : null}

            {/* Compétences (sidebar bullets) */}
            {competencesSkills.length > 0 ? (
              <SideSection title={L.skills}>
                {competencesSkills.map((s, i) => (
                  <View key={i} style={ps.sideBullet}>
                    <View style={ps.sideBulletDot} />
                    <Text style={ps.sideBulletText}>{s}</Text>
                  </View>
                ))}
              </SideSection>
            ) : null}

            {/* Languages (optional) */}
            {data.languages && data.languages.length > 0 ? (
              <SideSection title={L.languages}>
                {data.languages.map((l, i) => (
                  <View key={i} style={ps.sideBullet}>
                    <View style={ps.sideBulletDot} />
                    <Text style={ps.sideBulletText}>
                      {l.name}
                      {l.level ? <Text style={ps.sideBulletLevel}>{`  —  ${l.level}`}</Text> : null}
                    </Text>
                  </View>
                ))}
              </SideSection>
            ) : null}
          </View>

          {/* MAIN — top dark card (Profil + Logiciels) + bottom white (Expériences) */}
          <View style={ps.main}>
            {/* TOP DARK CARD */}
            <View style={ps.mainTop}>
              {data.summary ? (
                <View style={{ marginBottom: 14 }}>
                  <Text style={ps.darkTitle}>{L.profile.toUpperCase()}</Text>
                  <Text style={ps.darkSummary}>{data.summary}</Text>
                </View>
              ) : null}

              {softwareSkills.length > 0 ? (
                <View>
                  <Text style={ps.darkTitle}>{L.softwares.toUpperCase()}</Text>
                  <View style={ps.swGrid}>
                    {softwareSkills.map((s, i) => {
                      const pct = pseudoPercent(s, i);
                      return (
                        <View key={i} style={ps.swItem}>
                          <Text style={ps.swLabelDark}>{s}</Text>
                          <View style={ps.swTrackDark}>
                            <View style={[ps.swFill, { width: `${pct}%` }]} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>

            {/* BOTTOM WHITE — Experiences */}
            <View style={ps.mainBottom}>
              {data.experiences && data.experiences.length > 0 ? (
                <View>
                  <Text style={ps.mainTitleSimple}>{L.experience.toUpperCase()}</Text>
                  <View style={ps.mainRule} />
                  {data.experiences.map((e, i) => {
                    const bullets = e.description ? splitDescBullets(e.description) : null;
                    return (
                      <View key={i} style={{ marginBottom: 11 }}>
                        <View style={ps.expDatePillInline}>
                          <Text style={ps.expDateText}>{dateRange(e.startDate, e.endDate, lang)}</Text>
                        </View>
                        <Text style={ps.expHeading}>
                          <Text style={{ color: DARK_INK }}>{e.company.toUpperCase()}</Text>
                          <Text style={{ color: TEXT_MUTED }}>{`   —   `}</Text>
                          <Text style={{ color: CORAL_DARK }}>{e.title.toUpperCase()}</Text>
                        </Text>
                        {bullets ? (
                          <View style={{ marginTop: 2 }}>
                            {bullets.map((b, j) => (
                              <View key={j} style={ps.descBulletRow}>
                                <View style={ps.descBulletDot} />
                                <Text style={ps.descBulletText}>{b}</Text>
                              </View>
                            ))}
                          </View>
                        ) : e.description ? (
                          <Text style={[ps.expDesc, { marginTop: 2 }]}>{e.description}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {/* Interests (optional icon row) */}
              {data.interests && data.interests.length > 0 ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={ps.mainTitleSimple}>{L.interests.toUpperCase()}</Text>
                  <View style={ps.mainRule} />
                  <View style={ps.interestRow}>
                    {data.interests.map((it, i) => {
                      const IconCmp = pickInterestIcon(it);
                      return (
                        <View key={i} style={ps.interestItem}>
                          <View style={ps.interestIconBox}>
                            <Icon size={24}><IconCmp color={CORAL_DARK} /></Icon>
                          </View>
                          <Text style={ps.interestLabel}>{it}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* dark footer (subtle brand bar) */}
        <View style={ps.footer} fixed>
          <Text style={ps.footerLeft}>{F.left}</Text>
          <Text style={ps.footerRight}>{F.right}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================
// Public API
// ============================================================
export type CVTemplateId = "classique";

export async function generateCVPdfDataUrl(
  data: CVData,
  photo: string | null,
  _template: CVTemplateId = "classique",
  lang: Lang = "fr",
): Promise<string> {
  const doc: React.ReactElement = <MergedDoc data={data} photo={photo} lang={lang} />;
  const buffer = await renderToBuffer(doc);
  const base64 = buffer.toString("base64");
  return `data:application/pdf;base64,${base64}`;
}
