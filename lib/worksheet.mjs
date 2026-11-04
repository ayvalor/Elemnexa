import { reactionsData } from '../data/reactions.js';

export const defaultWorksheetOptions = {
  exerciseType: 'balance',
  quantity: 10,
  categories: { synthesis: true, decomposition: true, single_replacement: true, double_replacement: true, combustion: true },
  difficulties: { easy: true, medium: true, hard: false },
};

export const reactionLabels = {
  synthesis: 'Synthesis (A + B → AB)',
  decomposition: 'Decomposition (AB → A + B)',
  single_replacement: 'Single replacement (A + BC → AC + B)',
  double_replacement: 'Double replacement (AB + CD → AD + CB)',
  combustion: 'Combustion (reaction with oxygen)',
};

export function matchingReactions(options) {
  return reactionsData.filter(reaction => options.categories[reaction.type] && options.difficulties[reaction.difficulty]);
}

export function createWorksheet(options, { shuffle = false, random = Math.random } = {}) {
  const pool = matchingReactions(options);
  const requestedCount = Math.max(0, Math.min(30, Math.floor(Number(options.quantity) || 0)));
  const selected = [...pool];
  if (shuffle) {
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }
  }
  return {
    requestedCount,
    availableCount: pool.length,
    settings: JSON.stringify(options),
    questions: selected.slice(0, requestedCount).map((reaction, index) => ({
      ...reaction,
      questionType: options.exerciseType === 'combined' ? (index % 2 ? 'identify' : 'balance') : options.exerciseType,
    })),
  };
}

export function formatFormula(formula) {
  return formula.replace(/\d/g, digit => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
}

export function formatQuestion(reaction, type) {
  const side = compounds => compounds.map(formula => `${type === 'balance' ? '___ ' : ''}${formatFormula(formula)}`).join(' + ');
  return `${side(reaction.reactants)} → ${side(reaction.products)}`;
}

export function formatAnswer(reaction) {
  const side = (compounds, coefficients) => compounds.map((formula, index) => `${coefficients[index] === 1 ? '' : coefficients[index]}${formatFormula(formula)}`).join(' + ');
  return `${side(reaction.reactants, reaction.coeffs.reactants)} → ${side(reaction.products, reaction.coeffs.products)}`;
}
