"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import { Table, Beaker, FileSpreadsheet, Atom, Sun, Moon, ArrowUpRight, ArrowRight, FlaskConical, MessageCircle } from "lucide-react";
import PeriodicTable from "../components/PeriodicTable";
import ElementDrawer from "../components/ElementDrawer";
import { elementsData } from "../data/elements";

const loading = () => <p role="status" className="glass-panel rounded-2xl p-8">Loading your workspace…</p>;
const ChemistryWorkspace = dynamic(() => import("../components/ChemistryWorkspace"), { loading });
const WorksheetGenerator = dynamic(() => import("../components/WorksheetGenerator"), { loading });
const tabs = [
  { id: "table", label: "Periodic Table", icon: Table, title: "Interactive Periodic Table", description: "Explore the building blocks of matter. Search an element or select a tile to discover its properties." },
  { id: "suite", label: "Chemistry Suite", icon: Beaker, title: "Chemistry Tools Workspace", description: "Balance reactions, calculate molar mass, explore solubility, and build an atomic model." },
  { id: "worksheet", label: "Worksheet Generator", icon: FileSpreadsheet, title: "Practice Worksheet Generator", description: "Turn chemistry concepts into practice. Create a worksheet, check your answers, or print a clean copy." },
];
let memoryTheme;
function readTheme() {
  let saved = memoryTheme;
  try { if (saved === undefined) saved = localStorage.getItem("theme"); } catch { /* Storage may be disabled. */ }
  return saved === "dark" || saved === "light" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribeTheme(callback) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const syncStorage = () => { memoryTheme = undefined; callback(); };
  window.addEventListener("storage", syncStorage);
  window.addEventListener("rasayan-theme", callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", syncStorage);
    window.removeEventListener("rasayan-theme", callback);
    media.removeEventListener("change", callback);
  };
}
const serverTheme = () => "light";

function InstagramIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("table");
  const [visited, setVisited] = useState(["table"]);
  const [selectedElement, setSelectedElement] = useState(null);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const closeDrawer = useCallback(() => setSelectedElement(null), []);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  const selectTab = (id) => {
    setActiveTab(id);
    setVisited(previous => previous.includes(id) ? previous : [...previous, id]);
  };
  const handleTabKeys = (event, index) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next].id);
    document.getElementById(`tab-${tabs[next].id}`)?.focus();
  };
  const exploreElements = () => {
    selectTab("table");
    requestAnimationFrame(() => {
      document.querySelector("#panel-table input")?.focus({ preventScroll: true });
      document.getElementById("main-content")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  };
  const toggleTheme = () => {
    memoryTheme = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", memoryTheme); } catch { /* Keep the in-memory preference. */ }
    window.dispatchEvent(new Event("rasayan-theme"));
  };
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="mesh-gradient-bg" aria-hidden="true" />
        <header className="site-header no-print">
          <a href="#main-content" className="brand" aria-label="Rasayan Lab, main content">
            <span className="brand-mark"><Atom aria-hidden="true" size={24} /></span>
            <span><span className="brand-title">Rasayan Lab</span><span className="brand-caption">A little curiosity. A world of chemistry.</span></span>
          </a>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title="Toggle Dark/Light Mode">
            {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </header>
        <section className="intro no-print" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><FlaskConical size={14} aria-hidden="true" /> A SPACE FOR YOUR CURIOSITY</p>
            <h1 id="hero-title">Small atoms.<br /><span>Big discoveries.</span></h1>
            <p className="intro-description">Meet the elements. Make sense of reactions. Bring chemistry into focus with a lab that lets you explore.</p>
            <button type="button" className="hero-action" onClick={exploreElements}>Explore the elements <ArrowRight size={17} aria-hidden="true" /></button>
            <div className="intro-facts"><span><strong>118</strong> elements</span><span><strong>4</strong> chemistry tools</span><span>Made to explore</span></div>
          </div>
          <div className="hero-discovery" aria-label="Featured elements">
            <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
            <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
            <span className="discovery-kicker">THE BUILDING BLOCKS OF EVERYTHING</span>
            <div className="discovery-elements">
              {[1, 6, 8].map(number => {
                const element = elementsData[number - 1];
                return <button type="button" key={number} className={`discovery-element discovery-element-${element.symbol}`} onClick={() => setSelectedElement(element)} aria-label={`Explore ${element.name}`} aria-haspopup="dialog">
                  <span className="discovery-number">{String(number).padStart(2, '0')}<ArrowUpRight size={14} aria-hidden="true" /></span>
                  <strong>{element.symbol}</strong><span className="discovery-name">{element.name}</span><span className="discovery-mass">{element.mass.toFixed(3)} u</span>
                </button>;
              })}
            </div>
            <span className="discovery-caption"><span aria-hidden="true" /> A whole universe, one element at a time.</span>
          </div>
        </section>
        <nav aria-label="Lab sections" className="lab-navigation no-print">
          <div role="tablist" aria-label="Chemistry workspaces" className="lab-tabs">
            {tabs.map(({ id, label, icon: Icon }, index) => (
              <button key={id} id={`tab-${id}`} type="button" role="tab" aria-selected={activeTab === id} aria-controls={`panel-${id}`} tabIndex={activeTab === id ? 0 : -1} onClick={() => selectTab(id)} onKeyDown={event => handleTabKeys(event, index)}>
                <Icon size={18} aria-hidden="true" /><span>{label}</span>
              </button>
            ))}
          </div>
        </nav>
        <main id="main-content" tabIndex={-1} className="lab-main">
          {tabs.map(tab => (
            <section key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0}>
              <div className="section-heading no-print"><h2>{tab.title}</h2><p>{tab.description}</p></div>
              {visited.includes(tab.id) && (tab.id === "table" ? <PeriodicTable onElementClick={setSelectedElement} /> : tab.id === "suite" ? <ChemistryWorkspace /> : <WorksheetGenerator />)}
            </section>
          ))}
        </main>
        <footer className="site-footer no-print">
          <div className="footer-top">
            <div className="footer-identity"><span className="footer-mark"><Atom size={22} aria-hidden="true" /></span><div><strong>Rasayan Lab</strong><p>Stay curious. Keep discovering.</p></div></div>
            <nav className="footer-links" aria-label="Explore and connect">
              <button type="button" onClick={exploreElements}>Explore elements</button>
              <a href="https://github.com/ayvalor/Rasayan-Lab" target="_blank" rel="noopener noreferrer">View source <ArrowUpRight size={14} aria-hidden="true" /></a>
            </nav>
          </div>
          <div className="footer-connect">
            <div><strong>A thought, a question, a little feedback?</strong><p>Send it to @ayvalor on Instagram.</p></div>
            <div className="footer-social-links">
              <a className="instagram-link" href="https://www.instagram.com/ayvalor/" target="_blank" rel="noopener noreferrer" aria-label="@ayvalor on Instagram (opens in a new tab)"><InstagramIcon /><span>@ayvalor</span><ArrowUpRight size={14} aria-hidden="true" /></a>
              <a className="feedback-link" href="https://ig.me/m/ayvalor" target="_blank" rel="noopener noreferrer" aria-label="Send feedback via Instagram DM (opens in a new tab)"><MessageCircle size={17} aria-hidden="true" /><span>Send feedback</span><ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
            <p className="footer-dm-note">Opens Instagram messages. You may need to sign in.</p>
          </div>
          <div className="footer-bottom"><p>Designed &amp; built by <strong>ayvalor</strong></p><p>Made for learning. Open to everyone.</p></div>
          <p className="footer-note">Educational models and reference data. Element notes identify isotope values, predictions, and properties that have not been measured.</p>
        </footer>
        <ElementDrawer element={selectedElement} onClose={closeDrawer} />
      </div>
    </MotionConfig>
  );
}
