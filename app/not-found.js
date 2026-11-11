import Link from "next/link";
export const metadata = { title: "Page not found" };
export default function NotFound() {
  return <main className="fallback-page"><p className="eyebrow">ELEMNEXA · 404</p><h1>An undiscovered corner.</h1><p>This page doesn’t exist. There are still 118 elements waiting to be explored.</p><Link className="hero-action" href="/">Explore the elements</Link></main>;
}
