import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@fontsource-variable/geist-mono";
import { siteUrl, siteDescription } from "../lib/site-config.mjs";
import "./globals.css";

export const metadata = {
  title: { default: "Elemnexa — Explore elements. Understand chemistry.", template: "%s | Elemnexa" },
  description: siteDescription,
  applicationName: "Elemnexa",
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } } : {}),
  keywords: ["periodic table", "chemistry", "elements", "equation balancer", "molar mass calculator", "chemistry worksheets", "Elemnexa"],
  authors: [{ name: "ayvalor", url: "https://github.com/ayvalor" }],
  openGraph: { title: "Elemnexa — A little curiosity. An elemental discovery.", description: siteDescription, siteName: "Elemnexa", type: "website", locale: "en_US", ...(siteUrl ? { url: siteUrl, images: [{ url: "/elemnexa-social.png", width: 1200, height: 630, alt: "Elemnexa's teal–violet E logo. Explore elements. Understand chemistry." }] } : {}) },
  twitter: { card: "summary_large_image", title: "Elemnexa", description: siteDescription, ...(siteUrl ? { images: [`${siteUrl}/elemnexa-social.png`] } : {}) },
  robots: { index: true, follow: true },
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#f7f9f8" },
  { media: "(prefers-color-scheme: dark)", color: "#0b1418" },
] };
// Constant, trusted content only. Preserve existing users' saved theme.
const themeScript = `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)})()`;
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
