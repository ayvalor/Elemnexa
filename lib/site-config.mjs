// The confirmed production origin is the default. SITE_URL can override it at
// build time for another deployment; never derive canonicals from request headers.
export function parseSiteUrl(value) {
  if (!value) return null;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTP(S) origin, such as https://your-domain.com.');
  }
  return url.origin;
}
export const siteUrl = parseSiteUrl(process.env.SITE_URL || "https://elemnexa.com");
export const siteDescription = 'Explore elements. Understand chemistry. Discover all 118 elements, balance equations, calculate molar mass, and learn through interactive chemistry tools and worksheets.';
