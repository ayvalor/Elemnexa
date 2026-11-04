"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { elementsData } from "../data/elements";
import { Play, Pause, Plus, Minus, Calculator, RefreshCw, Table2, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { balanceEquation, calculateMolarMass, getSolubility, getElectronShells, cationsList, anionsList, ionLabels } from "../lib/chemistry.mjs";

// Custom 360° Interactive 3D Atom Showcase Canvas Component
function InteractiveAtom3D({ protons, neutrons, electrons, isPlaying, speed }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef({ x: 0.5, y: 0.5 });
  const mouseRef = useRef({ isDragging: false, startX: 0, startY: 0 });
  const timeRef = useRef(0);
  const redrawRef = useRef(() => {});

  // Memoize stable 3D nucleus coordinates so they don't jump around
  const nucleusParticles = useMemo(() => {
    const particles = [];
    const count = protons + neutrons;
    if (count <= 0) return particles;
    for (let i = 0; i < count; i++) {
      const isProton = i < protons;
      // Spherical distribution using spiral/golden coordinates
      const theta = i * 2.39996; // Golden angle
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const r = Math.min(16, Math.sqrt(i) * 2.8 + 4);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      particles.push({ x, y, z, isProton });
    }
    return particles;
  }, [protons, neutrons]);

  const shells = useMemo(() => getElectronShells(protons, electrons), [protons, electrons]);

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    mouseRef.current = { isDragging: true, startX: event.clientX, startY: event.clientY };
  };
  const handlePointerMove = (event) => {
    if (!mouseRef.current.isDragging) return;
    rotationRef.current.y += (event.clientX - mouseRef.current.startX) * 0.008;
    rotationRef.current.x += (event.clientY - mouseRef.current.startY) * 0.008;
    mouseRef.current.startX = event.clientX;
    mouseRef.current.startY = event.clientY;
    redrawRef.current();
  };
  const handlePointerUp = () => { mouseRef.current.isDragging = false; };
  const handleKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') rotationRef.current = { x: 0.5, y: 0.5 };
    if (event.key === 'ArrowLeft') rotationRef.current.y -= 0.1;
    if (event.key === 'ArrowRight') rotationRef.current.y += 0.1;
    if (event.key === 'ArrowUp') rotationRef.current.x -= 0.1;
    if (event.key === 'ArrowDown') rotationRef.current.x += 0.1;
    redrawRef.current();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localFrameId = null;
    let previousTime = null;
    let isVisible = true;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 360 * ratio;
    canvas.height = 360 * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const render = (timestamp) => {
      localFrameId = null;
      // Clear canvas
      ctx.clearRect(0, 0, 360, 360);
      const cx = 180;
      const cy = 180;

      // Dynamic auto-scaling based on shells to fit 75%-85% viewport (radius ~38% of width)
      const totalShells = shells.length || 1;
      const spacePerShell = 20;
      const maxOrbitRadius = 45 + (totalShells - 1) * spacePerShell;
      const maxBoundary = maxOrbitRadius + 6; // Radius + outermost electron particle boundary
      
      // Calculate scale factor relative to target padded radius (38% of canvas.width)
      const baseScale = (360 * 0.32) / maxBoundary;
      const d = 300; // perspective distance

      if (isPlaying && previousTime !== null) {
        timeRef.current += Math.min((timestamp - previousTime) / 1000, 0.05) * speed;
      }
      previousTime = timestamp;

      // Current camera rotation matrix angles
      const rotY = rotationRef.current.y; // yaw
      const rotX = rotationRef.current.x; // pitch

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      // 3D rotation helper with dynamic scaling
      const projectPoint = (x, y, z) => {
        // Rotate Y (horizontal drag)
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        // Rotate X (vertical drag)
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        
        // Perspective projection applying our adaptive scaling factor
        const scale = d / (d + z2 * baseScale);
        return {
          x: cx + x1 * baseScale * scale,
          y: cy + y2 * baseScale * scale,
          z: z2 * baseScale, // depth for Painter's algorithm
          scale: baseScale * scale
        };
      };

      const drawList = [];

      // 1. Generate 3D Nucleus Particles
      nucleusParticles.forEach(part => {
        const proj = projectPoint(part.x, part.y, part.z);
        drawList.push({
          type: "nucleus",
          z: proj.z,
          x: proj.x,
          y: proj.y,
          r: 6 * proj.scale,
          isProton: part.isProton
        });
      });

      // 2. Generate 3D Orbit segments & Electrons
      const shellColors = ["#00d2d3", "#54a0ff", "#a855f7", "#ff7675", "#feca57", "#1dd1a1", "#9b59b6"];
      
      shells.forEach((count, i) => {
        const radius = 45 + i * 20;
        const color = shellColors[i % shellColors.length];
        
        // Custom orbit tilts (inclination and azimuth) to look organic and volumetric
        const incl = (35 + i * 22) * (Math.PI / 180);
        const azim = (i * 45) * (Math.PI / 180);
        const cosI = Math.cos(incl), sinI = Math.sin(incl);
        const cosA = Math.cos(azim), sinA = Math.sin(azim);

        // Helper to rotate the circular path to its tilted orientation
        const getTiltedPoint = (angle) => {
          // Circular point in flat plane
          const ox = radius * Math.cos(angle);
          const oy = radius * Math.sin(angle);
          const oz = 0;

          // Rotate X (inclination)
          const y1 = oy * cosI;
          const z1 = -oy * sinI;

          // Rotate Y (azimuth)
          const x2 = ox * cosA + z1 * sinA;
          const z2 = -ox * sinA + z1 * cosA;

          return { x: x2, y: y1, z: z2 };
        };

        // Draw 3D Orbit rings using segments
        const numSegments = 64;
        for (let j = 0; j < numSegments; j++) {
          const a1 = (j * 2 * Math.PI) / numSegments;
          const a2 = ((j + 1) * 2 * Math.PI) / numSegments;
          
          const p1 = getTiltedPoint(a1);
          const p2 = getTiltedPoint(a2);

          const proj1 = projectPoint(p1.x, p1.y, p1.z);
          const proj2 = projectPoint(p2.x, p2.y, p2.z);

          drawList.push({
            type: "orbit",
            z: (proj1.z + proj2.z) / 2,
            x1: proj1.x,
            y1: proj1.y,
            x2: proj2.x,
            y2: proj2.y,
            color
          });
        }

        // Draw Electrons along this shell
        const baseSpeed = 1.2;
        const orbitSpeed = (baseSpeed - (i * 0.1)) * timeRef.current;
        for (let k = 0; k < count; k++) {
          const eAngle = orbitSpeed + (k * 2 * Math.PI) / count;
          const pos = getTiltedPoint(eAngle);
          const proj = projectPoint(pos.x, pos.y, pos.z);
          
          drawList.push({
            type: "electron",
            z: proj.z,
            x: proj.x,
            y: proj.y,
            r: 4.5 * proj.scale,
            color
          });
        }
      });

      // 3. Painter's Algorithm: Sort by depth (Z) descending (back to front)
      drawList.sort((a, b) => b.z - a.z);

      // 4. Draw all objects sequentially
      drawList.forEach(item => {
        if (item.type === "orbit") {
          ctx.beginPath();
          ctx.moveTo(item.x1, item.y1);
          ctx.lineTo(item.x2, item.y2);
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.28;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } else if (item.type === "nucleus") {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
          
          // Radial 3D shading gradient
          const grad = ctx.createRadialGradient(
            item.x - item.r * 0.3,
            item.y - item.r * 0.3,
            item.r * 0.1,
            item.x,
            item.y,
            item.r
          );
          if (item.isProton) {
            grad.addColorStop(0, "#ff7675");
            grad.addColorStop(1, "#d63031");
          } else {
            grad.addColorStop(0, "#74b9ff");
            grad.addColorStop(1, "#0984e3");
          }
          ctx.fillStyle = grad;
          ctx.fill();
        } else if (item.type === "electron") {
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
          
          // Glowing electron sphere
          const grad = ctx.createRadialGradient(
            item.x - item.r * 0.2,
            item.y - item.r * 0.2,
            item.r * 0.1,
            item.x,
            item.y,
            item.r
          );
          grad.addColorStop(0, "#ffffff");
          grad.addColorStop(0.3, item.color);
          grad.addColorStop(1, "rgba(0,0,0,0.85)");
          
          ctx.fillStyle = grad;
          ctx.fill();
        }
      });

      if (isPlaying && !document.hidden && isVisible) localFrameId = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (localFrameId === null && !document.hidden && isVisible) localFrameId = requestAnimationFrame(render);
    };
    const visibilityChanged = () => {
      previousTime = null;
      if (document.hidden) {
        cancelAnimationFrame(localFrameId);
        localFrameId = null;
      } else schedule();
    };
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      previousTime = null;
      if (!isVisible) {
        cancelAnimationFrame(localFrameId);
        localFrameId = null;
      } else schedule();
    });
    observer.observe(canvas);
    redrawRef.current = schedule;
    document.addEventListener('visibilitychange', visibilityChanged);
    schedule();
    return () => {
      cancelAnimationFrame(localFrameId);
      document.removeEventListener('visibilitychange', visibilityChanged);
      observer.disconnect();
      redrawRef.current = () => {};
    };
  }, [nucleusParticles, shells, isPlaying, speed]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={360}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label={`Schematic atom with ${protons} protons, ${neutrons} neutrons and ${electrons} electrons. Drag or use arrow keys to rotate; Home resets the view.`}
      style={{ width: 360, height: 'auto', touchAction: 'none' }}
      className="cursor-grab active:cursor-grabbing max-w-full select-none rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
    />
  );
}

// --- MAIN WORKSPACE COMPONENT ---

export default function ChemistryWorkspace() {
  const [activeSubTab, setActiveSubTab] = useState("balancer");

  // Balancer State
  const [equationInput, setEquationInput] = useState("C3H8 + O2 = CO2 + H2O");
  const [balanceResult, setBalanceResult] = useState(() => balanceEquation("C3H8 + O2 = CO2 + H2O"));

  // Molar Mass State
  const [formulaInput, setFormulaInput] = useState("H2SO4");
  const [massResult, setMassResult] = useState(null);

  // Solubility State
  const [selectedSolubility, setSelectedSolubility] = useState(null);

  // 3D Atom Showcase State
  const [atomNumber, setAtomNumber] = useState(6); // Default Carbon
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [customProtons, setCustomProtons] = useState(6);
  const [customNeutrons, setCustomNeutrons] = useState(6);
  const [customElectrons, setCustomElectrons] = useState(6);

  const handleBalance = (event) => {
    event.preventDefault();
    setBalanceResult(balanceEquation(equationInput));
  };
  const handleCalculateMass = (event) => {
    event.preventDefault();
    setMassResult(calculateMolarMass(formulaInput));
  };
  const selectAtom = (number) => {
    const element = elementsData.find(element => element.number === Number(number));
    if (!element) return;
    setAtomNumber(element.number);
    setCustomProtons(element.number);
    setCustomNeutrons(element.massNumber ? element.massNumber - element.number : element.neutrons);
    setCustomElectrons(element.number);
  };
  const shells = getElectronShells(customProtons, customElectrons);
  const currentElement = elementsData.find(element => element.number === customProtons);

  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      
      {/* Sub-Navigation tabs */}
      <div className="glass-panel p-2 rounded-2xl flex gap-1.5 overflow-x-auto no-print">
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
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white shadow-inner border border-black/10 dark:border-white/15"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="glass-panel w-full min-w-0 p-4 sm:p-6 rounded-3xl min-h-[480px] text-left">
        
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Balanced Equation</span>
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
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Molar Mass Breakdown Calculator</h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Enter a neutral formula to calculate molar mass and mass percentages using reference atomic weights. Radioactive elements use representative isotope masses. Example hydrate: CuSO4·5H2O.
              </p>
            </div>

            <form onSubmit={handleCalculateMass} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={formulaInput}
                aria-label="Molecular formula"
                maxLength={256}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => { setFormulaInput(e.target.value); setMassResult(null); }}
                placeholder="e.g., Al2(SO4)3"
                className="glass-input min-w-0 flex-1 px-4 py-3 rounded-xl text-base font-semibold"
              />
              <button
                type="submit"
                className="glass-btn px-6 py-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white shadow bg-indigo-600/20 hover:bg-indigo-600/30 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/40 border border-indigo-600/30 dark:border-indigo-500/40"
              >
                Calculate Mass
              </button>
            </form>

            <div className="flex gap-2 justify-center flex-wrap md:justify-start">
              <span className="text-[10px] text-slate-600 dark:text-zinc-400 font-bold uppercase self-center mr-1">Examples:</span>
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
                  className="text-[10px] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 px-2 py-1 rounded text-slate-800 dark:text-zinc-300 font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>

            {massResult && (
              <div aria-live="polite" className="mt-4 flex flex-col gap-6 border-t border-black/10 dark:border-white/10 pt-6">
                {massResult.success ? (
                  <>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col gap-1.5 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Molar Mass</span>
                      <span className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-700 dark:from-indigo-300 dark:to-violet-400 font-sans tracking-tight">
                        {massResult.totalMass.toFixed(4)} <span className="text-base font-bold text-slate-700 dark:text-zinc-400 font-sans">g/mol</span>
                      </span>
                    </div>

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
                                <span>At. Mass: <strong className="text-slate-950 dark:text-white">{row.atomicMass.toFixed(3)}</strong></span>
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
                  <span className="text-rose-700 dark:text-rose-300">Insoluble</span>
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
                          cellBg = "bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 shadow-[inset_0_0_12px_rgba(244,63,94,0.05)] hover:bg-rose-500/20";
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
                            <button type="button" className="w-full min-h-10 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" aria-label={`${ionLabels[cat]} and ${ionLabels[an]}: ${sol.status}`} aria-pressed={Boolean(isSelected)} onClick={() => setSelectedSolubility({ cation: cat, anion: an, ...sol })}>
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
            <AnimatePresence>
              {selectedSolubility && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                  className="glass-panel p-6 rounded-3xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-slate-900/60 shadow-2xl relative mt-4 text-slate-800 dark:text-white max-w-xl mx-auto flex flex-col gap-2 transition-premium"
                >
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
                      Solubility Analysis: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{ionLabels[selectedSolubility.cation]}</span> + <span className="text-indigo-600 dark:text-indigo-400 font-mono">{ionLabels[selectedSolubility.anion]}</span>
                    </span>
                    <button
                      aria-label="Close solubility details"
                      onClick={() => setSelectedSolubility(null)}
                      className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-premium"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className={`text-xs px-3.5 py-1.5 rounded-full border leading-none font-black tracking-wide ${
                      selectedSolubility.status === "Soluble" ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" :
                      selectedSolubility.status === "Insoluble" ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30" :
                      "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                    }`}>
                      {selectedSolubility.status}
                    </div>
                    <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Standard High School Rules Matrix</span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-800 dark:text-zinc-200 mt-3 leading-relaxed italic bg-black/5 dark:bg-black/25 p-4 rounded-xl border border-black/5 dark:border-white/5">
                    {selectedSolubility.rule}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 4: VIRTUAL 3D ATOM SHOWCASE */}
        {activeSubTab === "atom" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Visual Representation (Left Column: 7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* 360° Interactive 3D Atom Showcase Canvas */}
              <div className="relative w-full flex items-center justify-center select-none">
                <InteractiveAtom3D
                  protons={customProtons}
                  neutrons={customNeutrons}
                  electrons={customElectrons}
                  isPlaying={isPlaying}
                  speed={speed}
                />
              </div>

              <p className="max-w-sm text-center text-xs text-slate-600 dark:text-zinc-400 mt-3">Drag to rotate, or focus the model and use arrow keys. Animation starts paused.</p>
              {/* Sub-Showcase Animation Controls */}
              <div className="flex gap-4 mt-6 items-center">
                <button
                  aria-label={isPlaying ? "Pause atom animation" : "Play atom animation"}
                  aria-pressed={isPlaying}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="glass-btn w-10 h-10 rounded-full flex items-center justify-center text-slate-900 dark:text-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </button>

                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Speed</span>
                  <input
                    type="range"
                    aria-label="Atom animation speed"
                    min="0.5"
                    max="2.5"
                    step="0.5"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-20 accent-indigo-500 cursor-pointer h-1 rounded"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 w-8">{speed}x</span>
                </div>
              </div>
            </div>

            {/* Parameter adjustments (Right Column: 5/12 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="text-left">
                <span className="text-[10px] uppercase font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">Virtual Lab Showcase</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Interactive Atom Simulator</h2>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                  Explore particle counts and charge. This is a schematic shell model, not electron trajectories. Ion configurations are approximate; nuclear stability requires isotope data.
                </p>
              </div>

              {/* Element Selector Dropdown */}
              <div className="glass-panel-light p-3 rounded-xl flex flex-col gap-1 text-left">
                <span className="text-[10px] text-slate-700 dark:text-zinc-400 font-bold uppercase tracking-wider">Select Predefined Atom</span>
                <select
                  value={atomNumber}
                  aria-label="Select predefined atom"
                  onChange={(e) => selectAtom(e.target.value)}
                  className="glass-input bg-white/85 dark:bg-zinc-950/80 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white rounded-lg p-2 mt-1 text-sm font-semibold cursor-pointer w-full focus:outline-none"
                >
                  {elementsData.map(e => (
                    <option key={e.number} value={e.number} className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">
                      Z = {e.number}: {e.name} ({e.symbol})
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => selectAtom(atomNumber)} className="glass-btn min-h-10 rounded-lg px-3 text-sm mt-2">Reset atom to selected preset</button>
              </div>

              {/* Manual Increment/Decrement Controls */}
              <div className="flex flex-col gap-3">
                {/* Protons */}
                <div className="glass-panel-light p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Protons (p+)</span>
                    <span className="text-[10px] text-slate-600 dark:text-zinc-400">Defines element identity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Decrease protons"
                      onClick={() => setCustomProtons(Math.max(1, customProtons - 1))}
                      className="glass-btn w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-900 dark:text-white font-mono">{customProtons}</span>
                    <button
                      aria-label="Increase protons"
                      onClick={() => setCustomProtons(Math.min(118, customProtons + 1))}
                      className="glass-btn w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Neutrons */}
                <div className="glass-panel-light p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Neutrons (n0)</span>
                    <span className="text-[10px] text-slate-600 dark:text-zinc-400">Alters isotopic mass</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Decrease neutrons"
                      onClick={() => setCustomNeutrons(Math.max(0, customNeutrons - 1))}
                      className="glass-btn w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-900 dark:text-white font-mono">{customNeutrons}</span>
                    <button
                      aria-label="Increase neutrons"
                      onClick={() => setCustomNeutrons(Math.min(176, customNeutrons + 1))}
                      className="glass-btn w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Electrons */}
                <div className="glass-panel-light p-3 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Electrons (e-)</span>
                    <span className="text-[10px] text-slate-600 dark:text-zinc-400">Determines net charge/ionization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Decrease electrons"
                      onClick={() => setCustomElectrons(Math.max(0, customElectrons - 1))}
                      className="glass-btn w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-lg font-black text-slate-900 dark:text-white font-mono">{customElectrons}</span>
                    <button
                      aria-label="Increase electrons"
                      onClick={() => setCustomElectrons(Math.min(118, customElectrons + 1))}
                      className="glass-btn w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 dark:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Charge & Stability Analysis */}
              <div className="glass-panel-light p-4 rounded-xl flex flex-col gap-2 text-xs text-left">
                <span className="text-[10px] text-slate-700 dark:text-zinc-400 font-bold uppercase tracking-wider block">Real-time Analysis</span>
                <div className="flex justify-between border-b border-black/5 dark:border-white/5 py-1">
                  <span className="text-slate-600 dark:text-zinc-400">Net Ionic Charge:</span>
                  <span className={`font-mono font-bold ${
                    customProtons - customElectrons > 0 ? "text-amber-600 dark:text-amber-400" :
                    customProtons - customElectrons < 0 ? "text-cyan-600 dark:text-cyan-400" :
                    "text-slate-900 dark:text-white"
                  }`}>
                    {customProtons - customElectrons > 0 ? `+${customProtons - customElectrons} (Cation)` :
                     customProtons - customElectrons < 0 ? `${customProtons - customElectrons} (Anion)` :
                     "0 (Neutral)"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <span className="text-slate-600 dark:text-zinc-400">Modelled isotope:</span>
                  <span className="font-bold">{currentElement.name}-{customProtons + customNeutrons}</span>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <span className="text-slate-600 dark:text-zinc-400">Electrons by shell:</span>
                  <span className="font-mono font-bold">{shells.length ? shells.join(", ") : "None"}</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400">Stability is not inferred from particle counts. Some combinations shown may not exist as bound atoms or isotopes.</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
