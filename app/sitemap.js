import { siteUrl } from "../lib/site-config.mjs";
export default function sitemap() {
  return siteUrl ? [{ url: siteUrl, changeFrequency: "monthly", priority: 1 }] : [];
}
