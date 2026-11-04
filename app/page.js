"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import { Table, Beaker, FileSpreadsheet, Atom, Sun, Moon, ArrowUpRight } from "lucide-react";
import PeriodicTable from "../components/PeriodicTable";
import ElementDrawer from "../components/ElementDrawer";

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
        <div className="intro no-print">
          <p className="eyebrow"><span /> YOUR DIGITAL CHEMISTRY LAB</p>
          <h1>Small atoms.<br className="sm:hidden" /> <span>Big discoveries.</span></h1>
          <p className="intro-description">Explore, experiment, and understand — one element at a time.</p>
          <div className="intro-facts"><span>118 elements</span><span>Interactive tools</span><span>Print-ready practice</span></div>
        </div>
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
          <p>Rasayan Lab <span>·</span> Made for curious minds by ayvalor.</p>
          <a href="https://github.com/ayvalor/Rasayan-Lab" target="_blank" rel="noopener noreferrer">View source <ArrowUpRight size={14} aria-hidden="true" /></a>
          <p className="footer-note">Educational models and reference data. Check element notes for isotope values and unmeasured properties.</p>
        </footer>
        <ElementDrawer element={selectedElement} onClose={closeDrawer} />
      </div>
    </MotionConfig>
  );
}
