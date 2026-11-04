import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@fontsource-variable/geist-mono";
import "./globals.css";

export const metadata = {
  title: "Rasayan Lab | Interactive Periodic Table & Chemistry Tools",
  description: "Explore all 118 elements, balance chemical equations, calculate molar mass, and create chemistry practice worksheets in an accessible, interactive lab.",
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
  { media: "(prefers-color-scheme: dark)", color: "#090f1e" },
] };
// A constant trusted script applies the saved theme before paint; no user input is inserted.
const themeScript = `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)})()`;
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
