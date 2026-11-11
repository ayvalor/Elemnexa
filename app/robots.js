import { siteUrl } from "../lib/site-config.mjs";
export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}) };
}
