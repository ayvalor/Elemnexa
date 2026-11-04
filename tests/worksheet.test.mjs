import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorksheet, defaultWorksheetOptions, formatAnswer, formatQuestion, matchingReactions } from '../lib/worksheet.mjs';
import { reactionsData } from '../data/reactions.js';

test('initial sheet is deterministic with ten unique questions', () => {
  const a = createWorksheet(defaultWorksheetOptions);
  const b = createWorksheet(defaultWorksheetOptions);
  assert.deepEqual(a,b);
  assert.equal(a.questions.length,10);
  assert.equal(new Set(a.questions.map(q=>q.id)).size,10);
});

test('question bank shortage is explicit and never introduces duplicates', () => {
  const result=createWorksheet({...defaultWorksheetOptions,quantity:30});
  assert.equal(result.requestedCount,30);
  assert.equal(result.questions.length,result.availableCount);
  assert.ok(result.availableCount<30);
  assert.equal(new Set(result.questions.map(q=>q.id)).size,result.questions.length);
});

test('categories and difficulty are both required; no matches returns an empty sheet', () => {
  assert.equal(createWorksheet({...defaultWorksheetOptions,categories:{}}).questions.length,0);
  assert.equal(createWorksheet({...defaultWorksheetOptions,difficulties:{}}).questions.length,0);
  const options={...defaultWorksheetOptions,categories:{combustion:true},difficulties:{hard:true}};
  const result=createWorksheet(options);
  assert.equal(result.questions.length,2);
  assert.ok(result.questions.every(q=>q.type==='combustion' && q.difficulty==='hard'));
});

test('combined sheets alternate instructions without mutating the source bank', () => {
  const before=JSON.stringify(reactionsData);
  const options={...defaultWorksheetOptions,exerciseType:'combined'};
  const result=createWorksheet(options,{shuffle:true,random:()=>0.25});
  assert.deepEqual(result.questions.map(q=>q.questionType),Array.from({length:10},(_,i)=>i%2?'identify':'balance'));
  assert.equal(JSON.stringify(reactionsData),before);
  assert.equal(new Set(result.questions.map(q=>q.id)).size,10);
  assert.equal(result.availableCount,matchingReactions(options).length);
});

test('equations distinguish stoichiometric coefficients from molecular subscripts', () => {
  const reaction=reactionsData.find(r=>r.id==='hard-c2');
  assert.equal(formatAnswer(reaction),'2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O');
  assert.equal(formatQuestion(reaction,'balance'),'___ C₄H₁₀ + ___ O₂ → ___ CO₂ + ___ H₂O');
  assert.equal(formatQuestion(reaction,'identify'),'C₄H₁₀ + O₂ → CO₂ + H₂O');
});
