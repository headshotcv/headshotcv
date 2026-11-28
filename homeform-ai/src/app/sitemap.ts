import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { LEGAL } from "./legal/content";
import { POSTS } from "@/lib/blog/posts";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/analyser", "/analyse-video", "/programmes", "/coach-ia", "/comment-filmer", "/forces-et-limites", "/nouveautes", "/blog", ...POSTS.map((p) => `/blog/${p.slug}`), "/inscription", "/connexion", ...Object.keys(LEGAL).map((s) => `/legal/${s}`)].map((p) => ({ url: `${SITE.url}${p}` }));
}
