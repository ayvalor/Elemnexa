"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { elementsData, categoryNames } from "../data/element-index";
import ElementCard from "./ElementCard";
import { Search, RotateCcw, ArrowRight, ArrowUpRight, SlidersHorizontal, LayoutGrid, Table2, X } from "lucide-react";
import "../app/element-cards.css";

const subscribeMobile = callback => {
  const media = matchMedia("(max-width: 767px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getMobile = () => matchMedia("(max-width: 767px)").matches;
const serverMobile = () => false;
const categories = Object.entries(categoryNames);
const phases = ["Solid", "Liquid", "Gas", "Unknown"];
const filterClass = "min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors";
const selectedClass = "border-indigo-500/50 bg-indigo-500/15 text-indigo-700 dark:text-indigo-200";
const idleClass = "border-slate-200 bg-white/40 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10";

export default function PeriodicTable({ onElementClick }) {
  const [view, setView] = useState("auto");
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, serverMobile);
  const effectiveView = view === "auto" ? mobile ? "cards" : "table" : view;
  const searchRef = useRef(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [block, setBlock] = useState("");
  const [phase, setPhase] = useState("");
  const [syntheticOnly, setSyntheticOnly] = useState(false);
  useEffect(() => {
    const handleSearchKey = event => {
      const target = event.target;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [role=dialog]"))) return;
      if (!searchRef.current?.getClientRects().length || searchRef.current.closest("[inert]")) return;
      event.preventDefault();
      searchRef.current.focus();
    };
    document.addEventListener("keydown", handleSearchKey);
    return () => document.removeEventListener("keydown", handleSearchKey);
  }, []);
  const hasFilters = Boolean(search || category || block || phase || syntheticOnly);
  const filteredElements = useMemo(() => {
    const query = search.trim().toLowerCase();
    return elementsData.filter(element => (
      (!query || element.name.toLowerCase().includes(query) || element.symbol.toLowerCase().includes(query) || String(element.number) === query) &&
      (!category || element.category === category) &&
      (!block || element.block === block) &&
      (!phase || element.phase === phase) &&
      (!syntheticOnly || element.synthetic)
    ));
  }, [search, category, block, phase, syntheticOnly]);
  const matches = useMemo(() => new Set(filteredElements.map(element => element.number)), [filteredElements]);
  const reset = () => { setSearch(""); setCategory(""); setBlock(""); setPhase(""); setSyntheticOnly(false); };

  return (
    <div className="periodic-explorer flex w-full min-w-0 flex-col gap-5" data-view={view}>
      <div className="glass-panel flex w-full flex-col gap-4 rounded-2xl p-4 sm:p-5 no-print">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full min-w-0 sm:max-w-lg sm:flex-1">
            <label htmlFor="element-search" className="sr-only">Search elements by name, symbol, or atomic number</label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input ref={searchRef} id="element-search" type="search" autoComplete="off" placeholder="Search name, symbol, or atomic number…" value={search} onChange={event => setSearch(event.target.value)} className="glass-input min-h-11 w-full rounded-xl py-2.5 pl-10 pr-12 text-sm" />
            {search ? <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { setSearch(""); searchRef.current?.focus(); }}><X size={16} aria-hidden="true" /></button> : <kbd className="search-shortcut" aria-hidden="true">/</kbd>}
          </div>
          <div className="explorer-actions">
          <p role="status" aria-live="polite" aria-atomic="true" className="shrink-0 text-sm text-slate-600 dark:text-slate-400">
            <strong className="text-slate-900 dark:text-white">{filteredElements.length}</strong> of {elementsData.length} elements
          </p>
          <div className="view-switch" role="group" aria-label="Element view">
            <button type="button" aria-label="Periodic table view" aria-pressed={effectiveView === "table"} onClick={() => setView("table")}><Table2 size={16} aria-hidden="true" /></button>
            <button type="button" aria-label="Element cards view" aria-pressed={effectiveView === "cards"} onClick={() => setView("cards")}><LayoutGrid size={16} aria-hidden="true" /></button>
          </div>
          </div>
        </div>

        <details className="group" open>
          <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Refine your view
            <span className="ml-auto text-[10px] font-medium normal-case tracking-normal group-open:hidden">Show filters</span>
          </summary>
          <div className="mt-3 flex flex-col gap-4">
            <fieldset>
              <legend className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Element family</legend>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(([id, label]) => (
                  <button type="button" key={id} data-category={id} aria-pressed={category === id} onClick={() => setCategory(category === id ? "" : id)} className={`element-family-filter ${filterClass} ${category === id ? selectedClass : idleClass}`}><span className="family-color-dot" aria-hidden="true" />{label}</button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap items-end gap-4 sm:gap-6">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Electron block</legend>
                <div className="flex gap-1.5">{["s", "p", "d", "f"].map(value => (
                  <button type="button" key={value} aria-label={`${value} block`} aria-pressed={block === value} onClick={() => setBlock(block === value ? "" : value)} className={`${filterClass} min-w-10 font-mono ${block === value ? selectedClass : idleClass}`}>{value}</button>
                ))}</div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Phase near room temperature</legend>
                <div className="flex flex-wrap gap-1.5">{phases.map(value => (
                  <button type="button" key={value} aria-pressed={phase === value} onClick={() => setPhase(phase === value ? "" : value)} className={`${filterClass} ${phase === value ? selectedClass : idleClass}`}>{value}</button>
                ))}</div>
              </fieldset>
              <label className="flex min-h-10 cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={syntheticOnly} onChange={event => setSyntheticOnly(event.target.checked)} className="h-4 w-4 accent-indigo-600" /> Synthetic elements only
              </label>
              {hasFilters && <button type="button" onClick={reset} className="glass-btn flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300"><RotateCcw aria-hidden="true" className="h-4 w-4" />Reset filters</button>}
            </div>
          </div>
        </details>
      </div>

      {filteredElements.length === 0 && (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <h3 className="font-bold text-slate-900 dark:text-white">No matching elements</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Try another name or symbol, or clear a filter.</p>
          <button type="button" onClick={reset} className="glass-btn mt-4 min-h-11 rounded-xl px-5 py-2 text-sm">Clear all filters</button>
        </div>
      )}

      <div className="table-view min-w-0">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />Scroll horizontally on smaller screens. Select an element to explore its properties.</p>
        <div className="periodic-table-scroll-wrapper rounded-2xl" tabIndex={0} role="region" aria-label="Periodic table; scroll horizontally to see all groups">
          <div className="periodic-table-grid periodic-layout">
            {Array.from({ length: 18 }, (_, index) => <span key={`group-${index + 1}`} className="periodic-group-number" style={{ gridRowStart: 1, gridColumnStart: index + 1 }} title={`Group ${index + 1}`}>{index + 1}</span>)}
            <div className="table-insight" style={{ gridColumn: "3 / 13", gridRow: "2 / 4" }}>
              <span className="insight-symbol" aria-hidden="true">118</span><div><strong>A world of possibility.</strong><p>Every tile tells a story. Select an element to explore its properties, electrons, and origins.</p><span>ATOMIC NUMBER · SYMBOL · ATOMIC WEIGHT</span></div>
            </div>
            {elementsData.map(element => <ElementCard key={element.number} element={element} onClick={onElementClick} matched={matches.has(element.number)} />)}
            <div aria-hidden="true" style={{ gridRowStart: 9, gridColumn: "1 / 19" }} className="h-3" />
            <span className="fblock-label" style={{ gridRowStart: 10, gridColumn: "1 / 4" }}>Lanthanides</span>
            <span className="fblock-label" style={{ gridRowStart: 11, gridColumn: "1 / 4" }}>Actinides</span>
          </div>
        </div>
      </div>

      <div className="element-preview-grid" aria-label="Element cards">
        {filteredElements.map(element => (
          <button type="button" key={element.number} data-category={element.category} data-element-number={element.number} onClick={() => onElementClick(element)} aria-haspopup="dialog" className="element-preview">
            <span className="element-preview-top"><span className="element-preview-number" title="Atomic number"><span className="sr-only">Atomic number </span>{element.number} </span><span className="element-preview-phase">{element.phase} </span></span>
            <span className="element-preview-identity"><span className="element-preview-symbol">{element.symbol} </span><ArrowUpRight size={18} aria-hidden="true" /></span>
            <span className="element-preview-name">{element.name} </span>
            <span className="element-preview-family">{categoryNames[element.category]} </span>
            <span className="element-preview-bottom"><span>{element.massType === "representative isotope mass number" ? `[${element.massNumber}]` : `${element.mass.toFixed(3)} u`} </span><span>{element.block}-block</span></span>
          </button>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Bracketed masses identify a representative isotope for elements without a standard atomic weight. Unknown phase means it has not been established; synthetic origin is not a physical phase.</p>
    </div>
  );
}
