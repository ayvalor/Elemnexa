// Set SITE_URL at build time after choosing the production domain. Do not emit
// canonical URLs for a made-up domain or a localhost build.
export function parseSiteUrl(value) {
  if (!value) return null;
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTP(S) origin, such as https://your-domain.com.');
  }
  return url.origin;
}
export const siteUrl = parseSiteUrl(process.env.SITE_URL);
export const siteDescription = 'Explore elements. Understand chemistry. Discover all 118 elements, balance equations, calculate molar mass, and learn through interactive chemistry tools and worksheets.';
