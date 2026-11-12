import { elementsData } from '../data/elements.js';

const elements = new Map(elementsData.map(element => [element.symbol, element]));
const subscriptDigits = '₀₁₂₃₄₅₆₇₈₉';
const normalize = value => value.replace(/[₀-₉]/g, digit => String(subscriptDigits.indexOf(digit))).trim();
const MAX_ATOMS = 1_000_000;

/** Parse neutral formulas, nested ()/[] groups and dot-separated hydrates. */
export function parseFormula(input) {
  if (typeof input !== 'string' || input.length > 256) throw new Error('Use a formula of at most 256 characters.');
  const formula = normalize(input);
  if (!formula) throw new Error('Enter a chemical formula.');
  if (/\s/.test(formula)) throw new Error('Do not put spaces inside a formula.');
  const total = {};
  const add = (target, symbol, count) => {
    const next = (target[symbol] || 0) + count;
    if (!Number.isSafeInteger(next) || next > MAX_ATOMS) throw new Error('Atom counts must be positive integers no greater than 1,000,000.');
    target[symbol] = next;
  };
  for (const [partIndex, part] of formula.split(/[·.]/).entries()) {
    let position = 0;
    const number = () => {
      const start = position;
      while (/\d/.test(part[position] || '')) position++;
      if (start === position) return 1;
      const token = part.slice(start, position);
      const value = Number(token);
      if (token[0] === '0' || !Number.isSafeInteger(value) || value > MAX_ATOMS) throw new Error('Use positive whole-number subscripts without leading zeros.');
      return value;
    };
    const multiplier = partIndex > 0 ? number() : 1;
    const group = (closing = '', depth = 0) => {
      if (depth > 16) throw new Error('Formula groups are nested too deeply.');
      const counts = {};
      while (position < part.length && part[position] !== closing) {
        const character = part[position];
        if (character === '(' || character === '[') {
          position++;
          const nested = group(character === '(' ? ')' : ']', depth + 1);
          const factor = number();
          for (const [symbol, count] of Object.entries(nested)) add(counts, symbol, count * factor);
        } else if (/[A-Z]/.test(character)) {
          let symbol = part[position++];
          if (/[a-z]/.test(part[position] || '')) symbol += part[position++];
          if (!elements.has(symbol)) throw new Error(`Unknown element symbol: ${symbol}. Symbols are case-sensitive.`);
          add(counts, symbol, number());
        } else {
          throw new Error(`Unexpected character '${character}'. Use neutral formulas; ionic charges and isotope notation are not supported.`);
        }
      }
      if (Object.keys(counts).length === 0) throw new Error('Empty formulas and groups are not valid.');
      if (closing) {
        if (part[position] !== closing) throw new Error('Check matching parentheses and square brackets.');
        position++;
      }
      return counts;
    };
    for (const [symbol, count] of Object.entries(group())) add(total, symbol, count * multiplier);
  }
  return total;
}

export function calculateMolarMass(formula) {
  try {
    const parsed = parseFormula(formula);
    const breakdown = Object.entries(parsed).map(([symbol, qty]) => {
      const element = elements.get(symbol);
      return {
        symbol, name: element.name, qty, atomicMass: element.mass, contribution: element.mass * qty,
        massType: element.massType,
        ...(element.massType === 'representative isotope mass number' ? { massNumber: element.massNumber } : {}),
      };
    });
    return {
      success: true, formula: normalize(formula), totalMass: breakdown.reduce((sum, row) => sum + row.contribution, 0), breakdown,
      isApproximate: breakdown.some(row => row.massType === 'representative isotope mass number'),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const fraction = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const divisor = gcd(n, d); return [n / divisor, d / divisor]; };
const subtract = (a, b) => fraction(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
const multiply = (a, b) => fraction(a[0] * b[0], a[1] * b[1]);
const divide = (a, b) => fraction(a[0] * b[1], a[1] * b[0]);

/** Exact rational null-space solver: no brute-force coefficient ceiling. */
export function balanceEquation(input) {
  try {
    if (typeof input !== 'string' || input.length > 1024) throw new Error('Use an equation of at most 1,024 characters.');
    const sides = normalize(input).split(/-->|->|→|=/);
    if (sides.length !== 2) throw new Error('Use exactly one =, → or -> between reactants and products.');
    const parseSide = side => side.split('+').map(value => {
      // Existing coefficients are discarded so an already balanced equation can be rebalanced.
      const formula = value.trim().replace(/^[1-9]\d*\s*/, '').replace(/\((?:aq|s|l|g)\)$/, '').trim();
      return { formula, parsed: parseFormula(formula) };
    });
    const reactants = parseSide(sides[0]), products = parseSide(sides[1]);
    const compounds = [...reactants, ...products];
    if (compounds.length > 12) throw new Error('Use no more than 12 compounds.');
    const symbols = [...new Set(compounds.flatMap(compound => Object.keys(compound.parsed)))];
    const matrix = symbols.map(symbol => compounds.map((compound, index) => fraction(BigInt(compound.parsed[symbol] || 0) * (index < reactants.length ? 1n : -1n))));
    const pivots = [];
    let row = 0;
    for (let column = 0; column < compounds.length && row < matrix.length; column++) {
      const pivot = matrix.findIndex((values, index) => index >= row && values[column][0] !== 0n);
      if (pivot === -1) continue;
      [matrix[row], matrix[pivot]] = [matrix[pivot], matrix[row]];
      const divisor = matrix[row][column];
      matrix[row] = matrix[row].map(value => divide(value, divisor));
      for (let other = 0; other < matrix.length; other++) {
        if (other === row || matrix[other][column][0] === 0n) continue;
        const factor = matrix[other][column];
        matrix[other] = matrix[other].map((value, i) => subtract(value, multiply(factor, matrix[row][i])));
      }
      pivots.push(column);
      row++;
    }
    const free = compounds.map((_, i) => i).filter(i => !pivots.includes(i));
    if (free.length === 0) throw new Error('These compounds cannot be balanced. Check that the same elements appear on both sides.');
    if (free.length !== 1) throw new Error('This equation has more than one independent balance. Remove duplicate species or supply a single reaction.');
    const solution = compounds.map(() => fraction(0n));
    solution[free[0]] = fraction(1n);
    pivots.forEach((column, index) => { solution[column] = fraction(-matrix[index][free[0]][0], matrix[index][free[0]][1]); });
    const common = solution.reduce((multiple, value) => multiple / gcd(multiple, value[1]) * value[1], 1n);
    let integers = solution.map(value => value[0] * (common / value[1]));
    if (integers.every(value => value < 0n)) integers = integers.map(value => -value);
    if (integers.some(value => value <= 0n)) throw new Error('No balance uses all these compounds on the indicated sides. Check the reaction.');
    const divisor = integers.reduce(gcd);
    integers = integers.map(value => value / divisor);
    if (integers.some(value => value > 1_000_000_000n)) throw new Error('This equation requires coefficients too large for this teaching tool.');
    const coefficients = integers.map(Number);
    const format = (list, offset) => list.map((compound, i) => `${coefficients[offset + i] === 1 ? '' : coefficients[offset + i]}${compound.formula}`).join(' + ');
    return {
      success: true,
      balancedEquation: `${format(reactants, 0)} = ${format(products, reactants.length)}`,
      reactantsCoeffs: coefficients.slice(0, reactants.length), productsCoeffs: coefficients.slice(reactants.length),
      table: symbols.map(symbol => ({ element: symbol, atoms: reactants.reduce((sum, compound, i) => sum + (compound.parsed[symbol] || 0) * coefficients[i], 0) })),
    };
  } catch (error) { return { success: false, error: error.message }; }
}

export const cationsList = ['Na+', 'K+', 'NH4+', 'Ca2+', 'Ba2+', 'Mg2+', 'Cu2+', 'Fe3+', 'Ag+', 'Pb2+'];
export const anionsList = ['Cl-', 'Br-', 'I-', 'NO3-', 'SO42-', 'CO32-', 'PO43-', 'S2-', 'OH-'];
export const ionLabels = { 'Na+': 'Na⁺', 'K+': 'K⁺', 'NH4+': 'NH₄⁺', 'Ca2+': 'Ca²⁺', 'Ba2+': 'Ba²⁺', 'Mg2+': 'Mg²⁺', 'Cu2+': 'Cu²⁺', 'Fe3+': 'Fe³⁺', 'Ag+': 'Ag⁺', 'Pb2+': 'Pb²⁺', 'Cl-': 'Cl⁻', 'Br-': 'Br⁻', 'I-': 'I⁻', 'NO3-': 'NO₃⁻', 'SO42-': 'SO₄²⁻', 'CO32-': 'CO₃²⁻', 'PO43-': 'PO₄³⁻', 'S2-': 'S²⁻', 'OH-': 'OH⁻' };

export function getSolubility(cation, anion) {
  const result = (status, rule) => ({ status, rule });
  if (!cationsList.includes(cation) || !anionsList.includes(anion)) return result('Not classified', 'This ion pair is outside the reference table.');
  if ((cation === 'Fe3+' && ['I-', 'S2-', 'CO32-'].includes(anion)) || (cation === 'Cu2+' && anion === 'I-') || (cation === 'Mg2+' && anion === 'S2-') || (cation === 'Ag+' && anion === 'OH-')) {
    return result('Reacts in water', 'A simple salt-solubility label is misleading for this ion pair: redox, hydrolysis or decomposition changes the species present. Consult a reaction-specific reference.');
  }
  if (cation === 'NH4+' && anion === 'OH-') return result('Reacts in water', 'Ammonium and hydroxide undergo an acid–base reaction to form ammonia and water; aqueous ammonia is a weak base, not a fully dissociated ammonium hydroxide salt.');
  if (['Na+', 'K+', 'NH4+'].includes(cation)) return result('Soluble', 'Common Group 1 and ammonium salts are soluble in water.');
  if (anion === 'NO3-') return result('Soluble', 'Common nitrate salts are soluble in water.');
  if (['Cl-', 'Br-', 'I-'].includes(anion)) return ['Ag+', 'Pb2+'].includes(cation) ? result('Insoluble', 'Silver and lead(II) halides are sparingly soluble; lead chloride becomes more soluble as temperature increases.') : result('Soluble', 'Most chlorides, bromides and iodides are soluble, with silver and lead(II) exceptions.');
  if (anion === 'SO42-') {
    if (['Ba2+', 'Pb2+'].includes(cation)) return result('Insoluble', 'Barium and lead(II) sulfates are very sparingly soluble.');
    if (['Ca2+', 'Ag+'].includes(cation)) return result('Slightly Soluble', 'Calcium and silver sulfates have limited solubility in water.');
    return result('Soluble', 'Most sulfate salts are soluble.');
  }
  if (anion === 'OH-') {
    if (cation === 'Ba2+') return result('Soluble', 'Barium hydroxide is a soluble hydroxide exception.');
    if (cation === 'Ca2+') return result('Slightly Soluble', 'Calcium hydroxide is sparingly soluble.');
    return result('Insoluble', 'Most metal hydroxides are sparingly soluble in water.');
  }
  if (anion === 'S2-' && ['Ca2+', 'Ba2+'].includes(cation)) return result('Reacts in water', 'Calcium and barium sulfides dissolve with hydrolysis, producing alkaline solutions; they are exceptions to the usual insoluble-sulfide rule.');
  return result('Insoluble', 'Most carbonates, phosphates and remaining metal sulfides are sparingly soluble; Group 1 and ammonium salts are exceptions.');
}

const subshells = [[1, 2], [2, 2], [2, 6], [3, 2], [3, 6], [4, 2], [3, 10], [4, 6], [5, 2], [4, 10], [5, 6], [6, 2], [4, 14], [5, 10], [6, 6], [7, 2], [5, 14], [6, 10], [7, 6]];
function aufbauShells(count) {
  const shells = Array(7).fill(0);
  for (const [shell, capacity] of subshells) { const fill = Math.min(count, capacity); shells[shell - 1] += fill; count -= fill; if (count === 0) break; }
  while (shells.length && shells.at(-1) === 0) shells.pop();
  return shells;
}
/** Schematic shell counts: neutral reference configuration; outer-shell removal for cations. */
export function getElectronShells(protons, electrons) {
  if (!Number.isInteger(protons) || protons < 1 || protons > 118 || !Number.isInteger(electrons) || electrons < 0 || electrons > 118) throw new Error('Invalid particle counts.');
  if (electrons === 0) return [];
  const element = elementsData.find(element => element.number === protons);
  const reference = String(element.shellConfig || '').split(',').map(Number);
  const shells = reference.every(n => Number.isInteger(n) && n > 0) && reference.reduce((a, b) => a + b, 0) === protons ? reference : aufbauShells(protons);
  if (electrons > protons) return aufbauShells(electrons); // Explicitly labelled approximation in the UI.
  let remove = protons - electrons;
  for (let i = shells.length - 1; i >= 0 && remove; i--) { const amount = Math.min(remove, shells[i]); shells[i] -= amount; remove -= amount; }
  while (shells.length && shells.at(-1) === 0) shells.pop();
  return shells;
}
