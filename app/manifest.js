import { siteDescription } from "../lib/site-config.mjs";
export default function manifest() {
  return {
    name: "Elemnexa", short_name: "Elemnexa", description: siteDescription,
    start_url: "/", scope: "/", display: "standalone", lang: "en",
    background_color: "#f7f9f8", theme_color: "#087f70",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
