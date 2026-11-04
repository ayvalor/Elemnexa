// Missing-field supplement only. Do not overwrite an existing element fact.
// Oxidation-state values were checked against the Mendeleev database at the
// pinned revision below (oxidationstates and ionicradii tables). The selection
// describes useful chemical states, not every reported exotic state. In
// particular, predictions for Z >= 109 are not presented as measured chemistry.
// Ion descriptions are educational examples: an oxidation number is not the
// charge of a free monatomic ion. Hydration, ligands and pH control speciation.

const databaseSource = {
  label: "Mendeleev: oxidation states and ionic reference data",
  url: "https://github.com/lmmentel/mendeleev/blob/bd4716bff94c7acf22210d6ffb75dbd1fcc4f9bc/mendeleev/elements.db",
};

// Atomic number: [selected oxidation states, representative ionic chemistry].
const reviewedIons = {
  37: ["+1", "Rb⁺ (rubidium ion)"],
  38: ["+2", "Sr²⁺ (strontium ion)"],
  39: ["+3", "Y³⁺ (yttrium(III); hydrated or complexed in solution)"],
  40: ["+4", "Zr(IV) hydroxo and ligand complexes; a simple aqueous Zr⁴⁺ ion hydrolyses strongly."],
  41: ["+5", "Nb(V) oxo and fluoride complexes; no common simple aqueous Nb⁵⁺ ion."],
  42: ["+4, +6", "MoO₄²⁻ (molybdate); acidification can form polymolybdate ions."],
  43: ["+4, +7", "TcO₄⁻ (pertechnetate); technetium is radioactive."],
  44: ["+3, +4", "Ru(III) and Ru(IV) coordination ions; the ligands determine the total ion charge."],
  45: ["+1, +3", "Rh³⁺ (rhodium(III), usually hydrated or coordinated to other ligands)"],
  46: ["+2, +4", "Pd²⁺ and [PdCl₄]²⁻ (tetrachloropalladate(II)); speciation depends on the ligands."],
  47: ["+1", "Ag⁺ (silver(I) ion)"],
  48: ["+2", "Cd²⁺ (cadmium(II) ion)"],
  49: ["+1, +3", "In³⁺ (indium(III)); In⁺ occurs in less common indium(I) compounds."],
  50: ["-4, +2, +4", "Sn²⁺ and Sn(IV) complexes; Sn(IV) hydrolyses strongly in water."],
  51: ["-3, +3, +5", "Sb(III) and Sb(V) oxo/hydroxo ions; their composition depends strongly on pH."],
  52: ["-2, +2, +4, +6", "Te²⁻ (telluride in compounds), TeO₃²⁻ (tellurite); tellurate species depend on pH."],
  54: ["+2, +4, +6", "No common monatomic ion. Xenate and perxenate are specialized oxygen-containing ions."],
  57: ["+3", "La³⁺ (lanthanum(III) ion)"],
  58: ["+3, +4", "Ce³⁺ and Ce⁴⁺; cerium(IV) requires suitable acidic or complexing conditions."],
  59: ["+3, +4", "Pr³⁺ (praseodymium(III)); +4 is mainly encountered in solid compounds."],
  60: ["+3", "Nd³⁺ (neodymium(III) ion)"],
  61: ["+3", "Pm³⁺ (promethium(III) ion); all promethium isotopes are radioactive."],
  62: ["+2, +3", "Sm³⁺; Sm²⁺ also occurs under reducing conditions."],
  63: ["+2, +3", "Eu²⁺ and Eu³⁺ (europium(II) and europium(III))"],
  64: ["+3", "Gd³⁺ (gadolinium(III) ion)"],
  65: ["+3, +4", "Tb³⁺ (terbium(III)); +4 is mainly encountered in solid compounds."],
  66: ["+3", "Dy³⁺ (dysprosium(III) ion)"],
  67: ["+3", "Ho³⁺ (holmium(III) ion)"],
  68: ["+3", "Er³⁺ (erbium(III) ion)"],
  69: ["+3", "Tm³⁺ (thulium(III)); Tm²⁺ is less common and requires reducing conditions."],
  70: ["+2, +3", "Yb²⁺ and Yb³⁺ (ytterbium(II) and ytterbium(III))"],
  71: ["+3", "Lu³⁺ (lutetium(III) ion)"],
  72: ["+4", "Hf(IV) hydroxo and ligand complexes; a simple aqueous Hf⁴⁺ ion hydrolyses strongly."],
  73: ["+5", "Ta(V) oxo and fluoride complexes; no common simple aqueous Ta⁵⁺ ion."],
  74: ["+4, +6", "WO₄²⁻ (tungstate); acidification can form polytungstate ions."],
  75: ["+4, +7", "ReO₄⁻ (perrhenate); rhenium(IV) also forms coordination ions."],
  76: ["+4, +8", "Os(IV) coordination ions, such as [OsCl₆]²⁻. OsO₄ is a neutral molecule, not an ion."],
  77: ["+3, +4", "Ir(III) and Ir(IV) coordination ions, such as [IrCl₆]³⁻ and [IrCl₆]²⁻."],
  78: ["+2, +4", "Pt(II)/Pt(IV) complexes, including [PtCl₄]²⁻ and [PtCl₆]²⁻."],
  80: ["+1, +2", "Hg₂²⁺ (mercury(I), a two-atom ion) and Hg²⁺ (mercury(II)); not isolated Hg⁺ in ordinary salts."],
  81: ["+1, +3", "Tl⁺ (thallium(I)); thallium(III) occurs as Tl³⁺ or ligand complexes."],
  83: ["+3, +5", "Bi³⁺ (bismuth(III)) in acidic solution; hydrolysis produces oxo/hydroxo species."],
  84: ["-2, +2, +4", "Po(II) and Po(IV) species in acidic solutions; polonide (Po²⁻) occurs in compounds."],
  85: ["-1, +1", "At⁻ (astatide); other astatine ions depend on oxidation and solution conditions."],
  87: ["+1", "Fr⁺ (francium ion); investigated only in trace radioactive quantities."],
  88: ["+2", "Ra²⁺ (radium ion)"],
  89: ["+3", "Ac³⁺ (actinium(III) ion)"],
  90: ["+4", "Th⁴⁺ (thorium(IV)) in acidic solution; hydrolyses or forms complexes as conditions change."],
  91: ["+4, +5", "Pa(IV)/Pa(V) oxo, hydroxo and ligand complexes; no simple universal aqueous ion formula."],
  93: ["+3, +4, +5, +6", "Np³⁺, Np⁴⁺, NpO₂⁺ (neptunyl(V)) and NpO₂²⁺ (neptunyl(VI)); redox-dependent."],
  94: ["+3, +4, +5, +6", "Pu³⁺, Pu⁴⁺, PuO₂⁺ (plutonyl(V)) and PuO₂²⁺ (plutonyl(VI)); redox-dependent."],
  95: ["+3", "Am³⁺ (americium(III)) is the usual aqueous ion; other states need special conditions."],
  96: ["+3", "Cm³⁺ (curium(III) ion)"],
  97: ["+3, +4", "Bk³⁺ and Bk⁴⁺ (berkelium(III) and berkelium(IV)); conditions control their stability."],
  98: ["+3", "Cf³⁺ (californium(III) ion)"],
  99: ["+3", "Es³⁺ (einsteinium(III)); studied in very small radioactive samples."],
  100: ["+3", "Fm³⁺ (fermium(III)); Fm²⁺ can be produced under reducing conditions in tracer studies."],
  101: ["+2, +3", "Md²⁺ and Md³⁺ (mendelevium(II) and mendelevium(III)); tracer-scale chemistry."],
  102: ["+2, +3", "No²⁺ is the more stable aqueous state; No³⁺ requires oxidizing conditions."],
  103: ["+3", "Lr³⁺ (lawrencium(III)); established in tracer-scale chemical experiments."],
  104: ["+4 (observed in chemical studies)", "Rf(IV) complexes have been studied atom by atom; there is no commonplace bulk-material ion."],
  105: ["+5 (observed in chemical studies)", "Db(V) complexes have been studied atom by atom; there is no commonplace bulk-material ion."],
  106: ["+6 (observed in chemical studies)", "Sg(VI) species have been studied atom by atom; there is no commonplace bulk-material ion."],
  107: ["+7 (observed in chemical studies)", "No common ion. Atom-at-a-time studies include neutral bohrium oxychloride, BhO₃Cl."],
  108: ["+8 (observed in chemical studies)", "No common ion. Atom-at-a-time studies include neutral hassium tetroxide, HsO₄."],
};

// An adsorption experiment on an atom is not evidence for a particular ion or
// compound oxidation state. Do not turn theoretical state lists into facts.
for (let number = 109; number <= 118; number += 1) {
  reviewedIons[number] = [
    "Common compound oxidation states are not experimentally established; published values are predictions.",
    "No established common chemical ions; only very small numbers of short-lived atoms have been produced.",
  ];
}

export const elementIonReference = Object.fromEntries(
  Object.entries(reviewedIons).map(([number, [oxidationStates, commonIons]]) => [number, {
    fields: { oxidationStates, commonIons },
    sources: [databaseSource],
    notes: {
      commonIonsNote: "Examples of ionic chemistry, not an exhaustive list. Metal-ion notation generally implies hydration or coordination; oxidation states alone do not identify a free ion.",
      oxidationStatesNote: "Selected chemically useful states. The elemental form has oxidation state 0; predictions and observed compound chemistry are distinguished.",
    },
  }]),
);
