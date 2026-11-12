"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import "./atom-showcase.css";
import "./chemistry-workspace.css";
import { elementsData } from "../data/elements";
import { Play, Calculator, RefreshCw, Table2, ShieldAlert, X } from "lucide-react";

import { balanceEquation, calculateMolarMass, getSolubility, cationsList, anionsList, ionLabels } from "../lib/chemistry.mjs";

const AtomShowcase = dynamic(() => import("./AtomShowcase"), {
  loading: () => <p role="status">Loading atom model…</p>,
});

// --- MAIN WORKSPACE COMPONENT ---

export default function ChemistryWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState("balancer");
  const [atomVisited, setAtomVisited] = useState(false);

  // Balancer State
  const [equationInput, setEquationInput] = useState("C3H8 + O2 = CO2 + H2O");
  const [balanceResult, setBalanceResult] = useState(() => balanceEquation("C3H8 + O2 = CO2 + H2O"));

  // Molar Mass State
  const [formulaInput, setFormulaInput] = useState("H2SO4");
  const [massResult, setMassResult] = useState(null);

  // Solubility State
  const [selectedSolubility, setSelectedSolubility] = useState(null);
  const selectedSolubilityRef = useRef(null);

  const handleBalance = (event) => {
    event.preventDefault();
    setBalanceResult(balanceEquation(equationInput));
  };
  const handleCalculateMass = (event) => {
    event.preventDefault();
    setMassResult(calculateMolarMass(formulaInput));
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      
      {/* Sub-Navigation tabs */}
      <div className="suite-tool-tabs no-print" aria-label="Chemistry tools">
        {[
          { id: "balancer", label: "Equation Balancer", icon: RefreshCw },
          { id: "molar", label: "Molar Mass Calculator", icon: Calculator },
          { id: "solubility", label: "Solubility Table", icon: Table2 },
          { id: "atom", label: "Virtual 3D Atom Showcase", icon: Play },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              aria-pressed={activeSubTab === tab.id}
              onClick={() => { setActiveSubTab(tab.id); if (tab.id === "atom") setAtomVisited(true); }}
              type="button"
              className="suite-tool-tab"
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className={`glass-panel w-full min-w-0 p-4 sm:p-6 rounded-3xl text-left ${activeSubTab === "molar" ? "molar-workspace" : "min-h-[480px]"}`}>
        
        {/* TAB 1: EQUATION BALANCER */}
        {activeSubTab === "balancer" && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Advanced Chemical Equation Balancer</h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Use neutral formulas, separated by + and = or →. Parentheses, square brackets, and hydrates are supported; ionic charges are not. Atom balance alone does not prove that a reaction occurs.
              </p>
            </div>

            <form onSubmit={handleBalance} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={equationInput}
                aria-label="Chemical equation"
                maxLength={1024}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => { setEquationInput(e.target.value); setBalanceResult(null); }}
                placeholder="e.g., C3H8 + O2 = CO2 + H2O"
                className="glass-input min-w-0 flex-1 px-4 py-3 rounded-xl text-base font-semibold"
              />
              <button
                type="submit"
                className="glass-btn px-6 py-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow bg-indigo-600/20 hover:bg-indigo-600/30 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/40 border border-indigo-600/30 dark:border-indigo-500/40"
              >
                Balance Equation
              </button>
            </form>

            <div className="flex gap-2 justify-center flex-wrap md:justify-start">
              <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-bold uppercase self-center mr-1">Examples:</span>
              {[
                "Fe + O2 = Fe2O3",
                "C3H8 + O2 = CO2 + H2O",
                "NaOH + H2SO4 = Na2SO4 + H2O",
                "Pb(NO3)2 = PbO + NO2 + O2"
              ].map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setEquationInput(ex);
                    setBalanceResult(balanceEquation(ex));
                  }}
                  className="text-[10px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 px-2 py-1 rounded text-slate-800 dark:text-zinc-300 font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>

            {balanceResult && (
              <div aria-live="polite" className="mt-4 flex flex-col gap-4 border-t border-black/10 dark:border-white/10 pt-6">
                {balanceResult.success ? (
                  <>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col gap-1.5 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Balanced Equation</span>
                      <span className="text-lg sm:text-xl break-words font-extrabold text-slate-950 dark:text-white tracking-wide font-mono">
                        {balanceResult.balancedEquation}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-zinc-400 tracking-wider">Reactant vs. Product Atom Counts</span>
                      <div className="overflow-hidden border border-black/10 dark:border-white/10 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-black/5 dark:bg-white/5 text-slate-700 dark:text-zinc-400 border-b border-black/10 dark:border-white/10 font-bold text-xs">
                              <th className="p-3 text-left">Element</th>
                              <th className="p-3 text-center">Balanced Atom Count</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {balanceResult.table.map(row => (
                              <tr key={row.element} className="hover:bg-black/5 dark:bg-white/5 text-slate-800 dark:text-zinc-200">
                                <td className="p-3 font-bold">{row.element} ({elementsData.find(e => e.symbol === row.element)?.name || ""})</td>
                                <td className="p-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-300">{row.atoms}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Error Balancing</span>
                      <p className="text-xs text-red-900 dark:text-red-200/90 mt-0.5 leading-relaxed">{balanceResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MOLAR MASS CALCULATOR */}
        {activeSubTab === "molar" && (
          <div className="molar-calculator">
            <div className="molar-heading">
              <span className="molar-heading-icon"><Calculator size={25} aria-hidden="true" /></span>
              <div><p className="molar-kicker">A LITTLE FORMULA. A CLEARER PICTURE.</p>
              <h2>Molar Mass Calculator</h2>
              <p className="molar-description">
                Turn a chemical formula into a clear breakdown of its mass and elemental composition.
              </p>
              </div>
            </div>

            <div className="molar-input-grid"><div className="molar-entry">
            <form onSubmit={handleCalculateMass} className="molar-form">
              <label htmlFor="molar-formula">Molecular formula</label>
              <div className="molar-form-controls">
              <input
                id="molar-formula"
                type="text"
                value={formulaInput}
                aria-label="Molecular formula"
                maxLength={256}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => { setFormulaInput(e.target.value); setMassResult(null); }}
                placeholder="e.g., Al2(SO4)3"
                aria-describedby="molar-formula-help"
                className="glass-input"
              />
              <button
                type="submit"
                className="molar-submit"
              >
                Calculate Mass
              </button>
              </div>
            </form>

            <div className="molar-examples" role="group" aria-label="Example formulas">
              <span>Try a formula</span>
              {[
                "H2O",
                "C6H12O6",
                "Ca(OH)2",
                "Mg(NO3)2",
                "(NH4)2SO4"
              ].map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setFormulaInput(ex);
                    setMassResult(calculateMolarMass(ex));
                  }}
                  className="molar-example"
                >
                  {ex}
                </button>
              ))}
            </div>
            <p id="molar-formula-help" className="molar-help">Supports brackets and hydrates, including CuSO4·5H2O. Uses reference atomic weights, or representative isotope mass numbers where a standard atomic weight is unavailable.</p>
            </div>
            <aside className="molar-guide" aria-labelledby="molar-guide-title">
              <h3 id="molar-guide-title">How it adds up</h3>
              <ol><li><span aria-hidden="true">01</span><div><strong>Count the atoms</strong><p>Read each element and its quantity.</p></div></li><li><span aria-hidden="true">02</span><div><strong>Apply atomic weights</strong><p>Multiply each weight by its atom count.</p></div></li><li><span aria-hidden="true">03</span><div><strong>See the whole picture</strong><p>Total mass and each element’s share.</p></div></li></ol>
            </aside></div>

            {massResult && (
              <div aria-live="polite" className="molar-results flex flex-col gap-6">
                {massResult.success ? (
                  <>
                    <div className="molar-total p-6 rounded-2xl flex flex-col gap-1.5 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{massResult.isApproximate ? 'Approximate Molar Mass' : 'Total Molar Mass'}</span>
                      <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-700 dark:from-indigo-300 dark:to-violet-400 font-sans tracking-tight">
                        {massResult.isApproximate && '≈ '}{massResult.totalMass.toFixed(4)} <span className="text-base font-bold text-slate-700 dark:text-zinc-400 font-sans">g/mol</span>
                      </span>
                    </div>
                    {massResult.isApproximate && <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">This estimate uses representative isotope mass numbers for {massResult.breakdown.filter(row => row.massType === 'representative isotope mass number').map(row => row.symbol).join(', ')}. These are not standard atomic weights or precise isotopic masses.</p>}

                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-zinc-400 tracking-wider">Elemental Contributions Breakdown</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {massResult.breakdown.map(row => {
                          const percent = ((row.contribution / massResult.totalMass) * 100);
                          const colors = [
                            { bar: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/20 bg-teal-500/5" },
                            { bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/20 bg-blue-500/5" },
                            { bar: "bg-purple-500", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/20 bg-purple-500/5" },
                            { bar: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", border: "border-rose-500/20 bg-rose-500/5" },
                            { bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/20 bg-amber-500/5" }
                          ];
                          const hash = row.symbol.charCodeAt(0) % colors.length;
                          const color = colors[hash];

                          return (
                            <div key={row.symbol} className={`glass-panel-light p-4 rounded-2xl border ${color.border} flex flex-col gap-3 transition-premium`}>
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                  <span className="text-lg font-black text-slate-950 dark:text-white">{row.symbol}</span>
                                  <span className="text-xs text-slate-600 dark:text-zinc-400">{row.name}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-base font-black text-slate-950 dark:text-white">{percent.toFixed(2)}%</span>
                                  <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-bold uppercase">Weight Contribution</span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-200 dark:bg-zinc-950/65 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${percent}%` }} />
                              </div>

                              <div className="flex justify-between text-[10px] text-slate-700 dark:text-zinc-400 font-mono mt-1 pt-2 border-t border-black/5 dark:border-white/5">
                                <span>Quantity: <strong className="text-slate-950 dark:text-white">{row.qty}</strong></span>
                                <span>{row.massType === 'representative isotope mass number' ? 'Isotope mass number: ' : 'At. Mass: '}<strong className="text-slate-950 dark:text-white">{row.massType === 'representative isotope mass number' ? `[${row.massNumber}]` : row.atomicMass.toFixed(3)}</strong></span>
                                <span>Total: <strong className={color.text}>{row.contribution.toFixed(3)} g/mol</strong></span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Error Parsing Formula</span>
                      <p className="text-xs text-red-900 dark:text-red-200/90 mt-0.5 leading-relaxed">{massResult.error}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SOLUBILITY TABLE */}
        {activeSubTab === "solubility" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Interactive Solubility Matrix</h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Qualitative rules for water near room temperature. S = soluble, SS = slightly soluble, I = insoluble, R = reacts in water. Select a cell for details; actual solubility depends on temperature, pH and concentration.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40 block" />
                  <span className="text-emerald-700 dark:text-emerald-300">Soluble</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/40 block" />
                  <span className="text-amber-700 dark:text-amber-300">Slightly Soluble</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/40 block" />
                  <span className="text-rose-800 dark:text-rose-300">Insoluble</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-2xl w-full">
              <table className="w-full text-xs min-w-[760px] border-collapse">
                <caption className="sr-only">Qualitative aqueous solubility of cation and anion pairs near room temperature</caption>
                <thead>
                  <tr className="bg-slate-100 dark:bg-zinc-950 border-b border-slate-200 dark:border-white/15 text-slate-700 dark:text-zinc-400 font-bold">
                    <th className="p-3 border-r border-black/10 dark:border-white/10 text-left">Cations \ Anions</th>
                    {anionsList.map(an => (
                      <th key={an} scope="col" className="p-3 text-center border-r border-black/10 dark:border-white/10 font-bold">{ionLabels[an]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {cationsList.map(cat => (
                    <tr key={cat} className="hover:bg-black/5 dark:bg-white/5">
                      <th scope="row" className="p-3 bg-slate-100 dark:bg-zinc-950/60 border-r border-slate-200 dark:border-white/10 font-black text-slate-900 dark:text-white">{ionLabels[cat]}</th>
                      {anionsList.map(an => {
                        const sol = getSolubility(cat, an);
                        const isSelected = selectedSolubility && selectedSolubility.cation === cat && selectedSolubility.anion === an;
                        
                        let cellBg = "";
                        if (sol.status === "Soluble") {
                          cellBg = "bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)] hover:bg-emerald-500/20";
                        } else if (sol.status === "Insoluble") {
                          cellBg = "bg-rose-500/10 border border-rose-500/25 text-rose-800 dark:text-rose-300 shadow-[inset_0_0_12px_rgba(244,63,94,0.05)] hover:bg-rose-500/20";
                        } else {
                          cellBg = "bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 shadow-[inset_0_0_12px_rgba(245,158,11,0.05)] hover:bg-amber-500/20";
                        }

                        return (
                          <td
                            key={an}
                            className={`p-1 text-center border-r border-black/10 dark:border-white/10 font-bold cursor-pointer transition-premium ${cellBg} ${
                              isSelected ? "ring-2 ring-indigo-500 ring-inset" : ""
                            }`}
                          >
                            <button ref={isSelected ? selectedSolubilityRef : null} type="button" className="w-full min-h-10 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" aria-label={`${ionLabels[cat]} and ${ionLabels[an]}: ${sol.status}`} aria-pressed={Boolean(isSelected)} onClick={() => setSelectedSolubility({ cation: cat, anion: an, ...sol })}>
                              {sol.status === "Slightly Soluble" ? "SS" : sol.status[0]}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Solubility Rule Tooltip Popover */}
            <>
              {selectedSolubility && (
                <div
                  className="reveal-panel glass-panel p-6 rounded-3xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/60 shadow-2xl relative mt-4 text-slate-800 dark:text-white max-w-xl mx-auto flex flex-col gap-2 transition-premium"
                >
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
                      Solubility Analysis: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{ionLabels[selectedSolubility.cation]}</span> + <span className="text-indigo-600 dark:text-indigo-400 font-mono">{ionLabels[selectedSolubility.anion]}</span>
                    </span>
                    <button
                      aria-label="Close solubility details"
                      onClick={() => { setSelectedSolubility(null); selectedSolubilityRef.current?.focus(); }}
                      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-premium"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className={`text-xs px-3.5 py-1.5 rounded-full border leading-none font-black tracking-wide ${
                      selectedSolubility.status === "Soluble" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" :
                      selectedSolubility.status === "Insoluble" ? "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30" :
                      "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}>
                      {selectedSolubility.status}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Standard High School Rules Matrix</span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-800 dark:text-zinc-200 mt-3 leading-relaxed italic bg-black/5 dark:bg-black/25 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    {selectedSolubility.rule}
                  </p>
                </div>
              )}
            </>
          </div>
        )}

        {/* TAB 4: VIRTUAL 3D ATOM SHOWCASE */}
        <div hidden={activeSubTab !== "atom"}>{atomVisited && <AtomShowcase />}</div>

      </div>
    </div>
  );
}
