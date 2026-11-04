import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { parseFormula, balanceEquation, calculateMolarMass, getSolubility, getElectronShells, cationsList, anionsList } from '../lib/chemistry.mjs';
import { reactionsData } from '../data/reactions.js';

test('parses nested groups, square brackets, Unicode subscripts and hydrates', () => {
  assert.deepEqual(parseFormula('Al2(SO4)3'), { Al: 2, S: 3, O: 12 });
  assert.deepEqual(parseFormula('K4[Fe(CN)6]'), { K: 4, Fe: 1, C: 6, N: 6 });
  assert.deepEqual(parseFormula('CuSO4·5H2O'), { Cu: 1, S: 1, O: 9, H: 10 });
  assert.deepEqual(parseFormula('H₂O'), { H: 2, O: 1 });
});

test('rejects malformed formulas instead of silently discarding characters', () => {
  for (const formula of ['', ' ', '123', '2H2O', 'h2o', 'Xx2', 'H0', 'H01', '(OH', 'OH)', '()', 'H[OH)', 'H2 O', 'Fe3+', 'H2O;', 'H2O<script>', 'CuSO4·', '.H2O', 'H2O..H2O', 'H1000001', 'H' + '9'.repeat(200), '('.repeat(17) + 'H' + ')'.repeat(17)]) {
    assert.throws(() => parseFormula(formula), undefined, formula);
  }
});

test('calculates molar mass and rejects empty/unknown/non-neutral formulas', () => {
  assert.ok(Math.abs(calculateMolarMass('H2O').totalMass - 18.015) < 0.00001);
  const hydrate = calculateMolarMass('CuSO4·5H2O');
  assert.equal(hydrate.success, true);
  assert.ok(Math.abs(hydrate.totalMass - 249.677) < 0.02);
  assert.equal(hydrate.breakdown.find(row => row.symbol === 'H').qty, 10);
  for (const formula of ['', 'H2O)', 'Xx2', 'H0', 'Na+']) assert.equal(calculateMolarMass(formula).success, false);
});

test('balances every worksheet reaction with conserved atoms and known coefficients', () => {
  for (const reaction of reactionsData) {
    const result = balanceEquation(reaction.unbalanced);
    assert.equal(result.success, true, `${reaction.id}: ${result.error}`);
    assert.deepEqual(result.reactantsCoeffs, reaction.coeffs.reactants, reaction.id);
    assert.deepEqual(result.productsCoeffs, reaction.coeffs.products, reaction.id);
  }
});

test('handles large coefficients and six compounds without brute-force searches', () => {
  const started = performance.now();
  const combustion = balanceEquation('C100H202 + O2 = CO2 + H2O');
  assert.equal(combustion.balancedEquation, '2C100H202 + 301O2 = 200CO2 + 202H2O');
  const redox = balanceEquation('KMnO4 + HCl = KCl + MnCl2 + H2O + Cl2');
  assert.equal(redox.balancedEquation, '2KMnO4 + 16HCl = 2KCl + 2MnCl2 + 8H2O + 5Cl2');
  assert.ok(performance.now() - started < 1000, 'Small equations should finish without blocking the browser');
});

test('normalizes arrows, existing coefficients, state suffixes, and Unicode subscripts', () => {
  assert.equal(balanceEquation('2H₂(g) + O₂(g) → 2H₂O(l)').balancedEquation, '2H2 + O2 = 2H2O');
  assert.equal(balanceEquation('H2 + O2 --> H2O').balancedEquation, '2H2 + O2 = 2H2O');
  assert.equal(balanceEquation('CuSO4·5H2O = CuSO4 + H2O').balancedEquation, 'CuSO4·5H2O = CuSO4 + 5H2O');
});

test('rejects impossible, ambiguous, ionic, oversized and incomplete equations', () => {
  for (const equation of ['', 'H2 + O2', 'H2 = NaCl', 'H2 + = H2', 'H2 = H2 = H2', 'Xx + O2 = XxO2', 'H2 + O2 = H2O + H2O2', 'Fe3+ + OH- = Fe(OH)3', 'H2 = H2 + O2', 'H'.repeat(1025)]) {
    assert.equal(balanceEquation(equation).success, false, equation);
  }
});

test('solubility has explicit exceptions rather than misleading generic labels', () => {
  assert.equal(getSolubility('Ag+', 'Cl-').status, 'Insoluble');
  assert.equal(getSolubility('Ba2+', 'SO42-').status, 'Insoluble');
  assert.equal(getSolubility('Ca2+', 'SO42-').status, 'Slightly Soluble');
  assert.equal(getSolubility('Ag+', 'SO42-').status, 'Slightly Soluble');
  assert.equal(getSolubility('Na+', 'CO32-').status, 'Soluble');
  assert.equal(getSolubility('Ca2+', 'S2-').status, 'Reacts in water');
  assert.equal(getSolubility('Cu2+', 'I-').status, 'Reacts in water');
  assert.equal(getSolubility('Ag+', 'OH-').status, 'Reacts in water');
  assert.equal(getSolubility('Xx+', 'Cl-').status, 'Not classified');
  for (const cation of cationsList) for (const anion of anionsList) assert.ok(getSolubility(cation, anion).rule.length > 20);
});

test('atom shell counts conserve electrons and remove outer shells for cations', () => {
  assert.deepEqual(getElectronShells(11, 10), [2, 8]);
  assert.deepEqual(getElectronShells(26, 24), [2, 8, 14]); // Fe2+: remove 4s before 3d.
  assert.deepEqual(getElectronShells(17, 18), [2, 8, 8]);
  assert.deepEqual(getElectronShells(1, 0), []);
  for (let protons = 1; protons <= 118; protons++) {
    assert.equal(getElectronShells(protons, protons).reduce((a, b) => a + b, 0), protons);
  }
  assert.throws(() => getElectronShells(0, 1));
  assert.throws(() => getElectronShells(1, 119));
});
