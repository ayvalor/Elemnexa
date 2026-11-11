"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import dynamic from "next/dynamic";
import BrandMark from "../components/BrandMark";
import { Table, Beaker, FileSpreadsheet, Atom, Sun, Moon, ArrowUpRight, ArrowRight, FlaskConical, MessageCircle, Sparkles, Shuffle, BookOpen } from "lucide-react";
import PeriodicTable from "../components/PeriodicTable";
const ElementDrawer = dynamic(() => import("../components/ElementDrawer"));
import { elementsData } from "../data/element-index";

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
  window.addEventListener("elemnexa-theme", callback);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", syncStorage);
    window.removeEventListener("elemnexa-theme", callback);
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
  const openWorkspace = (id) => {
    selectTab(id);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${id}`)?.focus({ preventScroll: true });
      document.getElementById("main-content")?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  };
  const exploreElements = () => {
    openWorkspace("table");
    requestAnimationFrame(() => document.querySelector("#element-search")?.focus({ preventScroll: true }));
  };
  const toggleTheme = () => {
    memoryTheme = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", memoryTheme); } catch { /* Keep the in-memory preference. */ }
    window.dispatchEvent(new Event("elemnexa-theme"));
  };
  return (
    <>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="mesh-gradient-bg" aria-hidden="true" />
        <header className="site-header no-print">
          <a href="#main-content" className="brand" >
            <BrandMark className="brand-mark" />
            <span><span className="brand-title">Elemnexa</span><span className="brand-caption">Explore elements. Understand chemistry.</span></span>
          </a>
          <nav className="header-links" aria-label="Quick navigation">
            <button onClick={exploreElements}>Explore</button>
            <button onClick={() => openWorkspace("suite")}>Chemistry tools</button>
            <button onClick={() => openWorkspace("worksheet")}>Practice <ArrowUpRight size={14} aria-hidden="true" /></button>
          </nav>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title="Toggle Dark/Light Mode">
            {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </header>
        <section className="intro no-print" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> YOUR CURIOSITY. MEET CHEMISTRY.</p>
            <h1 id="hero-title">A little curiosity.<br />An <span>elemental</span><br />discovery.</h1>
            <p className="intro-description">From the air you breathe to the stars above. Explore the elements that make up your world, and see chemistry come to life.</p>
            <div className="hero-actions">
              <button type="button" className="hero-action" onClick={exploreElements}>Explore the elements <ArrowRight size={17} aria-hidden="true" /></button>
              <button type="button" className="hero-secondary" onClick={() => openWorkspace("suite")}><FlaskConical size={17} aria-hidden="true" /> Open the lab</button>
            </div>
            <div className="intro-facts"><span><strong>118</strong> elements to discover</span><span><strong>∞</strong> reasons to be curious</span></div>
          </div>
          <div className="hero-discovery" aria-label="Featured elements">
            <div className="discovery-grid" aria-hidden="true" />
            <svg className="discovery-orbits" viewBox="0 0 520 400" fill="none" aria-hidden="true">
              <ellipse cx="260" cy="200" rx="225" ry="110" transform="rotate(-28 260 200)" />
              <ellipse cx="260" cy="200" rx="225" ry="110" transform="rotate(35 260 200)" />
              <circle cx="260" cy="200" r="153" strokeDasharray="3 8" />
              <circle cx="91" cy="140" r="8" className="orbit-dot" />
              <circle cx="428" cy="266" r="6" className="orbit-dot violet" />
            </svg>
            <span className="discovery-kicker"><Sparkles size={14} aria-hidden="true" /> SMALL ELEMENTS. ENDLESS POSSIBILITIES.</span>
            <div className="discovery-elements">
              {[1, 6, 8].map(number => {
                const element = elementsData[number - 1];
                return <button type="button" key={number} className={`discovery-element discovery-element-${element.symbol}`} onClick={() => setSelectedElement(element)} aria-haspopup="dialog">
                  <span className="sr-only">Explore </span><span className="discovery-number">{String(number).padStart(2, '0')}<ArrowUpRight size={14} aria-hidden="true" /></span>
                  <strong>{element.symbol}</strong><span className="discovery-name">{element.name}</span><span className="discovery-mass">{element.mass.toFixed(3)} u</span>
                </button>;
              })}
            </div>
            <div className="discovery-note"><span className="note-icon"><Atom size={21} aria-hidden="true" /></span><div><strong>Everything starts with an element.</strong><span>Pick one. See where it takes you.</span></div></div>
            <span className="discovery-caption">CLICK AN ELEMENT TO MAKE A DISCOVERY <ArrowUpRight size={13} aria-hidden="true" /></span>
          </div>
        </section>
        <div className="learning-strip no-print">
          <span><span className="strip-icon mint"><Atom size={18} aria-hidden="true" /></span> Big ideas, down to the atom.</span>
          <span><BookOpen size={16} aria-hidden="true" /> Learn by exploring</span>
          <span><FlaskConical size={16} aria-hidden="true" /> Experiment with ideas</span>
          <span><Sparkles size={16} aria-hidden="true" /> Make the connection</span>
        </div>
        <nav aria-label="Lab sections" className="lab-navigation no-print">
          <div role="tablist" aria-label="Chemistry workspaces" className="lab-tabs">
            {tabs.map(({ id, label, icon: Icon }, index) => (
              <button key={id} id={`tab-${id}`} type="button" role="tab" aria-selected={activeTab === id} aria-controls={`panel-${id}`} tabIndex={activeTab === id ? 0 : -1} onClick={() => selectTab(id)} onKeyDown={event => handleTabKeys(event, index)}>
                <span className={`tab-icon tab-icon-${id}`}><Icon size={19} aria-hidden="true" /></span><span>{label}</span><ArrowUpRight className="tab-arrow" size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </nav>
        <main id="main-content" tabIndex={-1} className="lab-main">
          {tabs.map(tab => (
            <section key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0}>
              <div className="section-heading no-print"><div><p className="section-kicker">{tab.id === "table" ? "THE BUILDING BLOCKS OF EVERYTHING" : tab.id === "suite" ? "YOUR IDEAS, IN ACTION" : "A LITTLE PRACTICE GOES A LONG WAY"}</p><h2>{tab.title}</h2><p>{tab.description}</p></div>{tab.id === "table" && <button className="surprise-button" type="button" onClick={() => setSelectedElement(elementsData[Math.floor(Math.random() * elementsData.length)])}><Shuffle size={16} aria-hidden="true" /> Surprise me</button>}</div>
              {visited.includes(tab.id) && (tab.id === "table" ? <PeriodicTable onElementClick={setSelectedElement} /> : tab.id === "suite" ? <ChemistryWorkspace /> : <WorksheetGenerator />)}
            </section>
          ))}
        </main>
        <footer className="site-footer no-print">
          <div className="footer-top">
            <div className="footer-identity"><BrandMark className="footer-mark" /><div><strong>Elemnexa</strong><p>Explore elements. Understand chemistry.</p></div></div>
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
        {selectedElement && <ElementDrawer element={selectedElement} onClose={closeDrawer} />}
      </div>
    </>
  );
}
