"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Plus, Minus, RotateCcw, Move, ZoomIn, ZoomOut, Atom, Info } from 'lucide-react';
import { elementsData } from '../data/elements';
import { getElectronShells } from '../lib/chemistry.mjs';
import { nucleusPoints, shellPalette } from '../lib/atom-model.mjs';
import './atom-showcase.css';

function AtomCanvas({ protons, neutrons, electrons, playing, speed, zoom, view, resetVersion }) {
  const canvasRef = useRef(null);
  const rotation = useRef({ x: .35, y: -.3 });
  const drag = useRef(null);
  const clock = useRef(0);
  const redraw = useRef(() => {});
  const nucleus = useMemo(() => nucleusPoints(protons, neutrons), [protons, neutrons]);
  const shells = useMemo(() => getElectronShells(protons, electrons), [protons, electrons]);
  useEffect(() => { rotation.current = { x: .35, y: -.3 }; redraw.current(); }, [resetVersion]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = null, lastTime = null, visible = true;
    const size = 480;
    const draw = timestamp => {
      frame = null;
      if (playing && lastTime !== null) clock.current += Math.min((timestamp - lastTime) / 1000, .05) * speed;
      lastTime = timestamp;
      context.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2;
      const xAngle = view === 'flat' ? 0 : rotation.current.x;
      const yAngle = view === 'flat' ? 0 : rotation.current.y;
      const rotate = (x, y, z) => {
        const x1 = x * Math.cos(yAngle) - z * Math.sin(yAngle);
        const z1 = x * Math.sin(yAngle) + z * Math.cos(yAngle);
        const y1 = y * Math.cos(xAngle) - z1 * Math.sin(xAngle);
        const depth = y * Math.sin(xAngle) + z1 * Math.cos(xAngle);
        const scale = (view === 'flat' ? 1 : 800 / (800 + depth)) * zoom;
        return { x: cx + x1 * scale, y: cy + y1 * scale, z: depth, scale };
      };
      const objects = [];
      const radiusFor = index => shells.length <= 1 ? 128 : 76 + index * (106 / (shells.length - 1));
      const nucleusRadius = Math.max(3, Math.min(9, 26 / Math.cbrt(nucleus.length)));
      for (const particle of nucleus) {
        const point = rotate(particle.x, particle.y, particle.z);
        objects.push({ ...point, kind: 'particle', radius: nucleusRadius * point.scale, color: particle.isProton ? '#fb7185' : '#60a5fa' });
      }
      shells.forEach((count, shell) => {
        const radius = radiusFor(shell);
        // Tilted rings visualize principal shells, not real electron paths or atomic orbitals.
        const inclination = view === 'flat' ? 0 : (.28 + shell * .47);
        const azimuth = view === 'flat' ? 0 : shell * .68;
        const pointAt = angle => {
          const x = radius * Math.cos(angle), y = radius * Math.sin(angle);
          return rotate(x * Math.cos(azimuth) + y * Math.sin(inclination) * Math.sin(azimuth), y * Math.cos(inclination), -x * Math.sin(azimuth) + y * Math.sin(inclination) * Math.cos(azimuth));
        };
        for (let segment = 0; segment < 100; segment++) {
          const p1 = pointAt(segment * Math.PI * 2 / 100), p2 = pointAt((segment + 1) * Math.PI * 2 / 100);
          objects.push({ kind: 'ring', a: p1, b: p2, z: (p1.z + p2.z) / 2, color: shellPalette[shell] });
        }
        for (let index = 0; index < count; index++) {
          const point = pointAt(index * 2 * Math.PI / count + clock.current * (.38 - shell * .025) + shell * .32);
          objects.push({ ...point, kind: 'electron', radius: Math.max(2.5, 4.1 - count / 40) * point.scale, color: '#67e8f9' });
        }
      });
      objects.sort((a, b) => b.z - a.z);
      for (const item of objects) {
        if (item.kind === 'ring') {
          context.beginPath(); context.moveTo(item.a.x, item.a.y); context.lineTo(item.b.x, item.b.y);
          context.strokeStyle = item.color; context.globalAlpha = item.z > 0 ? .22 : .65;
          context.lineWidth = item.z > 0 ? .8 : 1.2; context.stroke(); context.globalAlpha = 1;
        } else {
          const gradient = context.createRadialGradient(item.x - item.radius * .3, item.y - item.radius * .35, 0, item.x, item.y, item.radius);
          gradient.addColorStop(0, '#fff'); gradient.addColorStop(.23, item.color); gradient.addColorStop(1, item.kind === 'electron' ? '#0e7490' : '#203153');
          context.beginPath(); context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
          context.fillStyle = gradient; context.fill();
          if (item.kind === 'electron') { context.strokeStyle = '#a5f3fc88'; context.lineWidth = .6; context.stroke(); }
        }
      }
      if (playing && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (frame === null && visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const resize = () => {
      const ratio = Math.min(devicePixelRatio || 1, 3);
      const pixels = Math.max(1, Math.round(canvas.getBoundingClientRect().width * ratio));
      canvas.width = pixels; canvas.height = pixels;
      context.setTransform(pixels / size, 0, 0, pixels / size, 0, 0); schedule();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; lastTime = null;
      if (!visible) { cancelAnimationFrame(frame); frame = null; } else schedule();
    });
    const visibility = () => { lastTime = null; if (document.hidden) { cancelAnimationFrame(frame); frame = null; } else schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); intersection.observe(canvas);
    document.addEventListener('visibilitychange', visibility);
    redraw.current = schedule; resize();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange', visibility); redraw.current = () => {}; };
  }, [nucleus, shells, playing, speed, zoom, view]);
  const keyDown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') rotation.current = { x: .35, y: -.3 };
    if (event.key === 'ArrowLeft') rotation.current.y -= .12;
    if (event.key === 'ArrowRight') rotation.current.y += .12;
    if (event.key === 'ArrowUp') rotation.current.x -= .12;
    if (event.key === 'ArrowDown') rotation.current.x += .12;
    redraw.current();
  };
  return <canvas ref={canvasRef} className="atom-canvas" width={480} height={480} tabIndex={0} role="img"
    aria-label={`Schematic atom with ${protons} protons, ${neutrons} neutrons and ${electrons} electrons. ${view === 'flat' ? 'Flat shell diagram.' : 'Drag or use arrow keys to rotate; Home resets the view.'}`}
    onKeyDown={keyDown}
    onPointerDown={event => { if (view === 'flat') return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY }; }}
    onPointerMove={event => { if (!drag.current) return; rotation.current.y += (event.clientX - drag.current.x) * .008; rotation.current.x += (event.clientY - drag.current.y) * .008; drag.current = { x: event.clientX, y: event.clientY }; redraw.current(); }}
    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
    style={{ touchAction: view === 'flat' ? 'auto' : 'none' }} />;
}

export default function AtomShowcase() {
  const [preset, setPreset] = useState(6);
  const [protons, setProtons] = useState(6), [neutrons, setNeutrons] = useState(6), [electrons, setElectrons] = useState(6);
  const [playing, setPlaying] = useState(false), [speed, setSpeed] = useState(1);
  const [zoom, setZoom] = useState(1), [view, setView] = useState('spatial'), [resetVersion, setResetVersion] = useState(0);
  const element = elementsData[protons - 1];
  const shells = getElectronShells(protons, electrons);
  const charge = protons - electrons;
  const selectAtom = value => {
    const selected = elementsData[Number(value) - 1];
    if (!selected) return;
    setPreset(selected.number); setProtons(selected.number); setNeutrons(selected.massNumber - selected.number); setElectrons(selected.number);
  };
  const resetView = () => { setZoom(1); setResetVersion(version => version + 1); };
  return <div className="atom-explorer">
    <header className="atom-intro">
      <p className="atom-eyebrow"><Atom size={15} aria-hidden="true" /> EXPLORE THE ATOMIC WORLD</p>
      <h2>Interactive Atom Simulator</h2>
      <p>Meet the particles that make an element. Rotate the model, explore its shells, and see how ions and isotopes change.</p>
    </header>
    <div className="atom-explorer-grid">
      <section className="atom-view" aria-label="Interactive atom visualization">
        <div className="atom-stage">
          <div className="atom-stage-heading">
            <div><span className="atom-stage-kicker">{element.name} · Z = {protons}</span><strong>{element.symbol}<sup>{charge ? `${Math.abs(charge) === 1 ? '' : Math.abs(charge)}${charge > 0 ? '+' : '−'}` : ''}</sup><small>{protons + neutrons}</small></strong></div>
            <span className="atom-stage-badge">SCHEMATIC · NOT TO SCALE</span>
          </div>
          <div className="atom-viewport"><AtomCanvas protons={protons} neutrons={neutrons} electrons={electrons} playing={playing} speed={speed} zoom={zoom} view={view} resetVersion={resetVersion} /></div>
          <div className="atom-view-switch" aria-label="Atom visualization mode">
            <button type="button" aria-pressed={view === 'spatial'} onClick={() => setView('spatial')}>3D shells</button>
            <button type="button" aria-pressed={view === 'flat'} onClick={() => setView('flat')}>Shell diagram</button>
          </div>
          <div className="atom-legend"><span><i className="particle-proton" />Proton <b>+</b></span><span><i className="particle-neutron" />Neutron <b>0</b></span><span><i className="particle-electron" />Electron <b>−</b></span></div>
        </div>
        <div className="atom-toolbar">
          <button type="button" className="atom-play" aria-label={playing ? 'Pause atom animation' : 'Play atom animation'} aria-pressed={playing} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}{playing ? 'Pause' : 'Animate'}</button>
          <div className="atom-zoom-controls"><button type="button" aria-label="Zoom out atom" disabled={zoom <= .7} onClick={() => setZoom(value => Math.max(.7, Number((value - .1).toFixed(1))))}><ZoomOut size={16} aria-hidden="true" /></button><output aria-label="Atom zoom">{Math.round(zoom * 100)}%</output><button type="button" aria-label="Zoom in atom" disabled={zoom >= 1.1} onClick={() => setZoom(value => Math.min(1.1, Number((value + .1).toFixed(1))))}><ZoomIn size={16} aria-hidden="true" /></button><button type="button" aria-label="Reset atom view" onClick={resetView}><RotateCcw size={16} aria-hidden="true" /></button></div>
          <label className="atom-speed"><span>Speed</span><input type="range" aria-label="Atom animation speed" min=".5" max="2" step=".5" value={speed} onChange={event => setSpeed(Number(event.target.value))} /><output>{speed}×</output></label>
        </div>
        <p className="atom-interaction-hint"><Move size={14} aria-hidden="true" />{view === 'spatial' ? 'Drag to rotate · Arrow keys to explore · Home to reset' : 'A flat view makes each electron shell easier to count.'}</p>
        <div className="atom-shells" aria-label="Electron shell populations">{shells.length ? shells.map((count, index) => <span key={index} style={{ '--shell-color': shellPalette[index] }}><i />n = {index + 1}<strong>{count} e⁻</strong></span>) : <span>No electrons · bare nucleus</span>}</div>
      </section>
      <aside className="atom-controls" aria-label="Atom parameters">
        <div className="atom-preset"><label htmlFor="atom-preset">Choose an element</label><select id="atom-preset" aria-label="Select predefined atom" value={preset} onChange={event => selectAtom(event.target.value)}>{elementsData.map(item => <option key={item.number} value={item.number}>{item.number}. {item.name} ({item.symbol})</option>)}</select><button type="button" onClick={() => selectAtom(preset)}><RotateCcw size={14} aria-hidden="true" />Reset atom to selected preset</button></div>
        <div className="atom-particle-controls">{[
          { name: 'protons', label: 'Protons', sign: 'p⁺', description: 'Change the element', value: protons, update: setProtons, min: 1, max: 118, color: 'rose' },
          { name: 'neutrons', label: 'Neutrons', sign: 'n⁰', description: 'Change the isotope', value: neutrons, update: setNeutrons, min: 0, max: 176, color: 'blue' },
          { name: 'electrons', label: 'Electrons', sign: 'e⁻', description: 'Change the charge', value: electrons, update: setElectrons, min: 0, max: 118, color: 'teal' },
        ].map(particle => <div key={particle.name} className={`atom-particle-row particle-${particle.color}`}><div><strong><span>{particle.sign}</span>{particle.label}</strong><small>{particle.description}</small></div><div className="atom-stepper"><button type="button" aria-label={`Decrease ${particle.name}`} disabled={particle.value === particle.min} onClick={() => particle.update(particle.value - 1)}><Minus size={14} aria-hidden="true" /></button><output>{particle.value}</output><button type="button" aria-label={`Increase ${particle.name}`} disabled={particle.value === particle.max} onClick={() => particle.update(particle.value + 1)}><Plus size={14} aria-hidden="true" /></button></div></div>)}</div>
        <section className="atom-analysis" aria-label="Atom analysis"><h3>At a glance</h3><dl><div><dt>Modelled isotope</dt><dd>{element.name}-{protons + neutrons}</dd></div><div><dt>Net ionic charge</dt><dd>{charge > 0 ? `+${charge} (Cation)` : charge < 0 ? `${charge} (Anion)` : '0 (Neutral)'}</dd></div><div><dt>Electrons by shell</dt><dd>{shells.length ? shells.join(', ') : 'None'}</dd></div></dl><p><Info size={15} aria-hidden="true" />{charge === 0 ? 'Neutral shell counts follow the element’s reference configuration.' : 'Ion shell arrangements are approximate; real ions depend on electronic structure.'}</p></section>
      </aside>
    </div>
    <details className="atom-science-note"><summary><Info size={16} aria-hidden="true" />What does this model show?</summary><p>Rings represent principal electron shells, not actual paths or quantum orbitals. Electrons occupy probability distributions, not fixed circular tracks. Particle sizes, distances, and animation speeds are illustrative. Nuclear stability is not inferred from particle counts; some combinations shown may not exist as bound atoms or isotopes.</p></details>
  </div>;
}
