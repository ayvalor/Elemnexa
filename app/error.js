"use client";
import Link from "next/link";
export default function Error({ retry }) {
  return <main className="fallback-page"><p className="eyebrow">ELEMNEXA</p><h1>Let’s try that again.</h1><p>Your workspace couldn’t load. Please retry, or reload the page to start fresh.</p><button className="hero-action" onClick={retry}>Try again</button><Link href="/">Back to Elemnexa</Link></main>;
}
