import test from 'node:test';
import assert from 'node:assert/strict';
import {elementsData,categoryNames} from '../data/elements.js';
import {reactionsData} from '../data/reactions.js';
import {parseFormula} from '../lib/chemistry.mjs';

test('all 118 elements have unique, sequential identities and valid neutral shells',()=>{
  assert.equal(elementsData.length,118);
  assert.equal(new Set(elementsData.map(e=>e.symbol)).size,118);
  for(const [index,e] of elementsData.entries()) {
    assert.equal(e.number,index+1);
    assert.equal(e.protons,e.number);
    assert.equal(e.electrons,e.number);
    assert.ok(Number.isFinite(e.mass) && e.mass>0);
    assert.ok(categoryNames[e.category]);
    assert.ok(['Solid','Liquid','Gas','Unknown'].includes(e.phase));
    const shells=e.shellConfig.split(',').map(Number);
    assert.equal(shells.reduce((a,b)=>a+b,0),e.number,e.symbol);
    assert.ok(shells.every((electrons,n)=>Number.isInteger(electrons) && electrons>0 && electrons<=2*(n+1)**2),e.symbol);
    assert.ok(e.sourceUrls.every(url=>url.startsWith('https://')));
  }
});

test('representative isotopes are explicitly separate from average atomic weights',()=>{
  for(const e of elementsData)assert.equal(e.massNumber,e.number+e.neutrons,e.symbol);
  const get=s=>elementsData.find(e=>e.symbol===s);
  assert.equal(get('Cu').massNumber,63);
  assert.equal(get('Cu').neutrons,34);
  assert.equal(get('Ni').massNumber,58);
  assert.equal(get('Pb').massNumber,208);
  assert.equal(get('Tc').massType,'representative isotope mass number');
  assert.equal(get('U').massType,'standard atomic weight');
});

test('exceptional configurations and predicted physical properties are not fabricated',()=>{
  const get=s=>elementsData.find(e=>e.symbol===s);
  assert.equal(get('Cr').shellConfig,'2, 8, 13, 1');
  assert.equal(get('Cu').shellConfig,'2, 8, 18, 1');
  assert.equal(get('Pd').shellConfig,'2, 8, 18, 18');
  assert.equal(get('Lr').shellConfig,'2, 8, 18, 32, 32, 8, 3');
  assert.equal(get('Og').phase,'Unknown');
  assert.equal(get('Og').configurationPredicted,true);
  assert.equal(get('Cu').valenceElectrons,'Variable');
  assert.equal(get('He').electronAffinity,'No stable isolated anion');
});

test('every reaction has unique identity, consistent formulas and balanced atoms',()=>{
  assert.equal(new Set(reactionsData.map(r=>r.id)).size,reactionsData.length);
  const totals=(formulas,coefficients)=>{
    const result={};
    for(const [i,formula] of formulas.entries()) {
      assert.ok(Number.isInteger(coefficients[i]) && coefficients[i]>0);
      for(const [symbol,count] of Object.entries(parseFormula(formula)))result[symbol]=(result[symbol]||0)+coefficients[i]*count;
    }
    return result;
  };
  const side=(formulas,coefficients)=>formulas.map((f,i)=>`${coefficients[i]===1?'':coefficients[i]}${f}`).join(' + ');
  for(const r of reactionsData) {
    assert.equal(r.reactants.length,r.coeffs.reactants.length,r.id);
    assert.equal(r.products.length,r.coeffs.products.length,r.id);
    assert.equal(r.unbalanced,`${r.reactants.join(' + ')} = ${r.products.join(' + ')}`,r.id);
    assert.equal(r.balanced,`${side(r.reactants,r.coeffs.reactants)} = ${side(r.products,r.coeffs.products)}`,r.id);
    assert.deepEqual(totals(r.reactants,r.coeffs.reactants),totals(r.products,r.coeffs.products),r.id);
  }
});

test('abbreviated orbital configurations agree with shell populations, including predictions',()=>{
  const cores={He:[2],Ne:[2,8],Ar:[2,8,8],Kr:[2,8,18,8],Xe:[2,8,18,18,8],Rn:[2,8,18,32,18,8]};
  for(const e of elementsData) {
    const core=e.quantumConfig.match(/^\[([A-Za-z]+)\]/)?.[1];
    const shells=Array(7).fill(0);
    if(core)cores[core].forEach((count,n)=>shells[n]=count);
    for(const [,n,,count] of e.quantumConfig.matchAll(/(\d)([spdf])\^(\d+)/g))shells[Number(n)-1]+=Number(count);
    while(!shells.at(-1))shells.pop();
    assert.deepEqual(shells,e.shellConfig.split(',').map(Number),e.symbol);
  }
});

test('physical enrichment preserves units and avoids presenting predicted superheavy data as measured',()=>{
  const get=s=>elementsData.find(e=>e.symbol===s);
  assert.match(get('Hg').density,/13\.534 g\/cm³/);
  assert.match(get('Xe').density,/g\/L \(0 °C, 1 atm\)/);
  assert.match(get('Rb').specificHeat,/J\/g·K/);
  assert.match(get('Cd').hazardWarning,/carcinogen/);
  assert.equal(get('Og').meltingPoint,'Bulk melting point has not been measured');
  assert.equal(get('Og').phase,'Unknown');
});

test('missing element-detail placeholders are resolved and added sources are inspectable', () => {
  const fields = ['discoveryYear', 'discoveredBy', 'namedBy', 'oxidationStates', 'commonIons', 'radius', 'meltingPoint', 'boilingPoint', 'density', 'specificHeat', 'ionizationEnergy', 'electronAffinity', 'electronegativity'];
  for (const element of elementsData) {
    for (const field of fields) {
      const value = String(element[field] ?? '').trim();
      assert.ok(value.length, `${element.symbol}.${field} must be informative`);
      assert.doesNotMatch(value, /Not compiled|undefined/, `${element.symbol}.${field}`);
    }
    if (element.sourceReferences) {
      assert.ok(element.sourceReferences.length);
      for (const source of element.sourceReferences) {
        assert.equal(new URL(source.url).protocol, 'https:');
        assert.ok(source.label.length > 5);
      }
    }
  }
});

test('history distinguishes antiquity, discovery and naming without scraped isotope titles', () => {
  const get = symbol => elementsData.find(e => e.symbol === symbol);
  assert.equal(get('Nd').discoveryYear, 1885);
  assert.match(String(get('No').discoveryYear), /1966/);
  assert.match(String(get('Bh').discoveryYear), /1981/);
  assert.equal(get('Nh').discoveryYear, 2004);
  assert.match(get('Ag').discoveryYear, /antiquity/);
  assert.match(get('Hs').namedBy, /Hesse/);
  assert.doesNotMatch(get('Hs').namedBy, /Henri/);
  assert.match(get('Cd').namedBy, /kadmeia/);
  assert.match(get('Pm').namedBy, /Prometheus/);
});

test('new heavy-element properties keep units, attachment sign and prediction qualifiers', () => {
  const get = symbol => elementsData.find(e => e.symbol === symbol);
  assert.match(get('At').electronAffinity, /[−-]233 kJ\/mol/);
  assert.match(get('Fr').density, /theoretical estimate/);
  assert.match(get('Og').boilingPoint, /estimate/);
  assert.match(get('Og').ionizationEnergy, /No evaluated/);
  assert.match(get('Hg').commonIons, /Hg₂²⁺/);
  assert.match(get('Mo').commonIons, /MoO₄²⁻/);
  assert.match(get('Tc').commonIons, /TcO₄⁻/);
  for (const element of elementsData.filter(e => e.number >= 109)) {
    assert.match(element.oxidationStates, /not experimentally established/);
    assert.match(element.commonIons, /No established/);
    assert.match(element.electronegativity, /No established Pauling/);
    for (const field of ['meltingPoint', 'boilingPoint']) {
      const value = element[field];
      assert.match(value, /estimate|not been measured/);
      const temperature = value.match(/^([\d.-]+) °C \/ ([\d.]+) K/);
      if (temperature) assert.ok(Math.abs(Number(temperature[1]) + 273.15 - Number(temperature[2])) < .011);
    }
  }
});
