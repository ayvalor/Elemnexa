"use client";

import { useEffect, useRef, useState } from "react";
import { X, HelpCircle, AlertTriangle, Lightbulb, Globe, Zap, Layers, ArrowUpRight, BookOpen } from "lucide-react";
import { categoryNames, elementsData } from "../data/elements";
import "./element-drawer.css";

const getCategoryColor = (category) => {
  switch (category) {
    case "alkali": return "from-group-alkali/40 to-group-alkali/15 border-group-alkali/50 text-group-alkali";
    case "alkaline": return "from-group-alkaline/40 to-group-alkaline/15 border-group-alkaline/50 text-group-alkaline";
    case "transition": return "from-group-transition/40 to-group-transition/15 border-group-transition/50 text-group-transition";
    case "post-transition": return "from-group-post-transition/40 to-group-post-transition/15 border-group-post-transition/50 text-group-post-transition";
    case "metalloid": return "from-group-metalloid/40 to-group-metalloid/15 border-group-metalloid/50 text-group-metalloid";
    case "reactive-nonmetal": return "from-group-reactive-nonmetal/40 to-group-reactive-nonmetal/15 border-group-reactive-nonmetal/50 text-group-reactive-nonmetal";
    case "halogen": return "from-group-halogen/40 to-group-halogen/15 border-group-halogen/50 text-group-halogen";
    case "noble": return "from-group-noble/40 to-group-noble/15 border-group-noble/50 text-group-noble";
    case "lanthanide": return "from-group-lanthanide/40 to-group-lanthanide/15 border-group-lanthanide/50 text-group-lanthanide";
    case "actinide": return "from-group-actinide/40 to-group-actinide/15 border-group-actinide/50 text-group-actinide";
    default: return "from-group-unknown/40 to-group-unknown/15 border-group-unknown/50 text-group-unknown";
  }
};

// Safe display helper: show value or fallback
const safeDisplay = (value, fallback = "Not compiled") => {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
};

const sourceLabel = (url) => {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  if (hostname.endsWith("wikipedia.org")) return "Element overview · Wikipedia";
  if (hostname.endsWith("ciaaw.org")) return "Atomic weights · CIAAW";
  if (hostname.endsWith("rsc.org")) return "Periodic table · Royal Society of Chemistry";
  if (hostname.endsWith("pubchem.ncbi.nlm.nih.gov")) return "Element data · PubChem";
  if (hostname.endsWith("iupac.org")) return "Element reference · IUPAC";
  if (hostname === "github.com" || hostname === "raw.githubusercontent.com") return "Reference dataset · GitHub";
  return hostname;
};

const validSourceUrl = (url) => {
  try { return new URL(url).protocol === "https:"; }
  catch { return false; }
};

export default function ElementDrawer({ element, onClose, scrollbarWidth }) {
  const profile = element && elementsData.find(item => item.number === element.number);
  return profile ? <DrawerContent key={profile.number} element={profile} onClose={onClose} scrollbarWidth={scrollbarWidth} /> : null;
}

function DrawerContent({ element, onClose, scrollbarWidth }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMnemonic, setShowMnemonic] = useState(false);

  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    // Mark background siblings inert while keeping the whole drawer interactive.
    const siblings = [];
    let current = overlayRef.current;
    while (current && current !== document.body) {
      for (const sibling of current.parentElement?.children || []) {
        if (sibling !== current && sibling instanceof HTMLElement && !["SCRIPT", "STYLE"].includes(sibling.tagName)) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      current = current.parentElement;
    }
    closeRef.current?.focus({ preventScroll: true });
    const focusable = () => [...panelRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex="0"]')]
      .filter(node => node.getClientRects().length > 0);
    const handleKey = event => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const nodes = focusable();
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (!nodes.length) { event.preventDefault(); panelRef.current.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    const containFocus = event => {
      if (!panelRef.current.contains(event.target)) closeRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("focusin", containFocus);
      for (const [sibling, wasInert] of siblings) sibling.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [onClose, scrollbarWidth]);

  const bgGradient = getCategoryColor(element.category);
  const references = [...new Map([
    ...(element.sourceUrls || []).filter(validSourceUrl).map(url => [url, { url, label: sourceLabel(url) }]),
    ...(element.sourceReferences || []).filter(source => source && validSourceUrl(source.url))
      .map(source => [source.url, { url: source.url, label: source.label || sourceLabel(source.url) }]),
  ]).values()];

  // Split shell configuration for shell visualizer
  const shells = element.shellConfig && element.shellConfig !== "N/A"
    ? element.shellConfig.split(",").map(s => Number(s.trim())).filter(Number.isFinite)
    : [];

  return (
      <div ref={overlayRef} className="drawer-overlay fixed inset-0 z-50 flex justify-end no-print">
        
        {/* Backdrop overlay */}
        <div
          onClick={onClose}
          aria-hidden="true"
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Drawer panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`element-title-${element.number}`}
          tabIndex={-1}
          className="drawer-panel relative z-10 flex h-dvh w-full max-w-lg flex-col border-l border-slate-200 bg-slate-50 shadow-2xl dark:border-white/10 dark:bg-slate-950 md:max-w-xl"
        >
          {/* Header Banner - Category gradient */}
          <div className={`p-4 sm:p-6 bg-gradient-to-r ${bgGradient} shrink-0 border-b relative flex items-center justify-between gap-2`}>
            <div className="min-w-0 pr-8">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-black/40 px-2.5 py-1 rounded-full text-white/90">
                Atomic Number {element.number} • {element.block.toUpperCase()}-Block
              </span>
              <h2 id={`element-title-${element.number}`} className="text-2xl sm:text-3xl break-words font-extrabold text-slate-950 dark:text-white mt-2 leading-tight">{element.name}</h2>
              <p className="text-xs text-slate-700 dark:text-white/80 mt-1.5 font-medium">{categoryNames[element.category]}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Massive floating symbol */}
              <span className="hidden sm:block text-5xl font-black opacity-30 select-none pointer-events-none pr-8">
                {element.symbol}
              </span>
              <button
                ref={closeRef}
                type="button"
                aria-label={`Close ${element.name} details`}
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 dark:bg-black/20 dark:hover:bg-black/40 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Tabs Navigation */}
          <div role="tablist" aria-label="Element details" onKeyDown={event => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
            const index = tabs.indexOf(document.activeElement);
            const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
            tabs[next].focus(); tabs[next].click();
          }} className="element-detail-tabs">
            {[
              { id: "overview", label: "Overview" },
              { id: "structure", label: "Structure" },
              { id: "physical", label: "Physical & Energy" },
              { id: "society", label: "Context & Mnemonic" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                role="tab"
                id={`element-${element.number}-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`element-${element.number}-panel`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => {
                  setActiveTab(tab.id);
                  contentRef.current?.scrollTo({ top: 0 });
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div ref={contentRef} role="tabpanel" id={`element-${element.number}-panel`} aria-labelledby={`element-${element.number}-tab-${activeTab}`} tabIndex={0} className="element-detail-content min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 flex flex-col gap-6 break-words">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                
                {/* Core parameters Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Symbol</span>
                    <span className="text-xl font-black text-zinc-800 dark:text-white">{element.symbol}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">{element.massType === "representative isotope mass number" ? "Isotope mass number" : "Standard atomic weight"}</span>
                    <span className="text-xl font-bold text-zinc-800 dark:text-white">{element.massType === "representative isotope mass number" ? `[${element.massNumber}]` : `${element.mass} u`}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Phase near room temperature</span>
                    <span className={`text-lg font-bold ${
                      element.phase === "Gas" ? "text-cyan-700 dark:text-cyan-300" :
                      element.phase === "Liquid" ? "text-amber-700 dark:text-amber-300" :
                      element.phase === "Solid" ? "text-emerald-700 dark:text-emerald-300" :
                      "text-purple-700 dark:text-purple-300"
                    }`}>{element.phase}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Valence Electrons</span>
                    <span className="text-lg font-bold text-zinc-800 dark:text-white">{safeDisplay(element.valenceElectrons)}</span>
                  </div>
                </div>

                {element.phaseNote && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{element.phaseNote}</p>}
                {element.valenceNote && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{element.valenceNote}</p>}
                {element.configurationPredicted && <p className="rounded-lg bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">Electron configuration and shell populations are theoretical predictions for this element.</p>}
                {/* Shell breakdown card */}
                {shells.length > 0 && (
                  <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Electron Shell Configuration
                      </span>
                      <span className="text-xs text-zinc-800 dark:text-white font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                        {element.shellConfig}
                      </span>
                    </div>
                    {/* Concentric visual shell rings mock */}
                    <div className="flex flex-wrap gap-2 items-center justify-center p-2 bg-slate-100/70 dark:bg-black/10 rounded-lg">
                      {shells.map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center p-2 border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 rounded-lg w-12">
                          <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold">Shell {idx+1}</span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-300 mt-1">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chemical Group & Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Group</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-white">{element.group || "N/A"}</span>
                  </div>
                  <div className="glass-panel-light p-3 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Period</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-white">{element.period}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STRUCTURE TAB */}
            {activeTab === "structure" && (
              <div className="flex flex-col gap-6">
                
                {/* Subatomic Particle breakdown */}
                <div className="glass-panel-light p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Subatomic counts</span>
                  <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2 mt-3">
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-center">
                      <div className="text-xs text-rose-700 dark:text-rose-300 font-bold">Protons (p+)</div>
                      <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{safeDisplay(element.protons)}</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-center">
                      <div className="text-xs text-blue-700 dark:text-blue-300 font-bold">Neutrons (n0)</div>
                      <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{safeDisplay(element.neutrons)}</div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl text-center">
                      <div className="text-xs text-indigo-600 dark:text-indigo-300 font-bold">Electrons (e-)</div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{safeDisplay(element.electrons)}</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Electron counts describe a neutral atom. {element.isotopeNote || `Neutron counts apply to the representative isotope ${element.symbol}-${element.massNumber ?? element.protons + element.neutrons}; other isotopes have different neutron counts.`} Standard atomic weights are isotope-weighted averages, not mass numbers.</p>
                {element.configurationPredicted && <p className="text-xs text-amber-800 dark:text-amber-200">This electron configuration is a theoretical prediction.</p>}
                {/* Configurations parameters */}
                <div className="flex flex-col gap-4">
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Quantum Electron Configuration</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">{safeDisplay(element.quantumConfig)}</span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Atomic Radius</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-white mt-1">
                      {typeof element.radius === "number" ? `${element.radius} pm` : safeDisplay(element.radius)}
                    </span>
                    {element.radiusNote && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{element.radiusNote}</p>}
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col gap-1">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Common Ions Formed</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.commonIons)}</span>
                    {element.commonIonsNote && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{element.commonIonsNote}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* PHYSICAL & ENERGY TAB */}
            {activeTab === "physical" && (
              <div className="flex flex-col gap-6">
                
                {/* Melting / Boiling points */}
                <div className="element-physical-grid grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Melting Point</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.meltingPoint)}</span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Boiling Point</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.boilingPoint)}</span>
                  </div>
                </div>

                {/* Physical metrics */}
                <div className="element-physical-grid grid grid-cols-2 gap-4">
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Density</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.density)}</span>
                  </div>
                  <div className="glass-panel-light p-3.5 rounded-xl flex flex-col">
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Specific Heat Capacity</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-1">{safeDisplay(element.specificHeat)}</span>
                  </div>
                </div>

                {/* Energy attributes */}
                <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-4">
                  <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Electrodynamic & Energy Properties
                  </span>
                  
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3">
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold block">Electronegativity</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white block mt-1">{safeDisplay(element.electronegativity)}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold block">1st Ionization</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white block mt-1">{safeDisplay(element.ionizationEnergy)}</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold block">Electron Affinity</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white block mt-1">{safeDisplay(element.electronAffinity)}</span>
                    </div>
                  </div>
                  {element.electronAffinityNote && <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{element.electronAffinityNote}</p>}
                  <div className="flex flex-col text-left border-t border-black/5 dark:border-white/5 pt-3">
                    <span className="text-[9px] text-zinc-600 dark:text-zinc-400 font-bold block">Common Oxidation States</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white mt-0.5">{safeDisplay(element.oxidationStates)}</span>
                    {element.oxidationStatesNote && <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{element.oxidationStatesNote}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* CONTEXT & SOCIETY TAB */}
            {activeTab === "society" && (
              <div className="flex flex-col gap-5">
                
                {/* Discovery History */}
                <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Discovery & History
                  </div>
                  <div className="element-history-grid grid grid-cols-2 gap-3 text-xs text-left mt-1">
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400 block">Discovery Year:</span>
                      <span className="font-semibold text-zinc-800 dark:text-white">{safeDisplay(element.discoveryYear)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400 block">Discovered By:</span>
                      <span className="font-semibold text-zinc-800 dark:text-white">{safeDisplay(element.discoveredBy)}</span>
                    </div>
                  </div>
                  {element.namedBy && element.namedBy !== element.discoveredBy && (
                    <div className="text-xs text-left mt-1">
                      <span className="text-zinc-600 dark:text-zinc-400">Naming / name origin:</span>{" "}
                      <span className="font-semibold text-zinc-800 dark:text-white">{element.namedBy}</span>
                    </div>
                  )}
                </div>

                {/* Practical Uses */}
                {element.commonUses && (
                  <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Everyday Practical Uses
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-200 mt-1 leading-relaxed">{element.commonUses}</p>
                  </div>
                )}

                {/* STSE Context */}
                {element.stseContext && (
                  <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Science, Technology, Society & Environment (STSE)
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed italic">{element.stseContext}</p>
                  </div>
                )}

                {/* Hazard Risk Profiles */}
                {element.hazardWarning && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> Hazard & Risk Warnings
                    </div>
                    <p className="text-xs text-red-700 dark:text-red-200/80 leading-relaxed font-semibold">{element.hazardWarning}</p>
                  </div>
                )}

                {/* MEMORY MNEMONIC TOGGLE */}
                <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Student Memory Mnemonic</span>
                      <span className="text-[10px] text-zinc-600 dark:text-zinc-400">Helpful rhyme to memorize chemistry groups</span>
                    </div>
                    <button
                      type="button"
                      aria-expanded={showMnemonic}
                      aria-controls={`mnemonic-${element.number}`}
                      onClick={() => setShowMnemonic(!showMnemonic)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                        showMnemonic 
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-800 dark:text-amber-300"
                          : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {showMnemonic ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showMnemonic && (
                    <div
                      id={`mnemonic-${element.number}`}

                      className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-center"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-bold block">
                        Periodic Mnemonic Association
                      </span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-white mt-1 block">
                        {element.mnemonic || "N/A Mnemonic"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <section className="element-references" aria-labelledby={`element-${element.number}-sources`}>
              <h3 id={`element-${element.number}-sources`}><BookOpen size={16} aria-hidden="true" /> Sources & notes</h3>
              <p>{element.dataCompleteness || "Educational reference · Values depend on isotope and conditions."}</p>
              {references.length > 0 && (
                <nav aria-label="Element reference sources">
                  {references.map(({ url, label }) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      <span>{label}<span className="sr-only"> (opens in a new tab)</span></span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  ))}
                </nav>
              )}
            </section>
          </div>
        </div>
      </div>
  );
}
