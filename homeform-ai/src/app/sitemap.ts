import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { LEGAL } from "./legal/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/analyser", "/inscription", "/connexion", ...Object.keys(LEGAL).map((s) => `/legal/${s}`)].map((p) => ({ url: `${SITE.url}${p}` }));
}
