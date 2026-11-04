"use client";

import { useState } from "react";
import { Printer, Eye, EyeOff, FileText, Settings, ShieldAlert, RefreshCw } from "lucide-react";
import { createWorksheet, defaultWorksheetOptions, formatAnswer, formatQuestion, matchingReactions, reactionLabels } from "../lib/worksheet.mjs";

const categories = [
  ['synthesis', 'Synthesis'], ['decomposition', 'Decomposition'],
  ['single_replacement', 'Single replacement'], ['double_replacement', 'Double replacement'], ['combustion', 'Combustion'],
];
const difficulties = [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']];
const exerciseTypes = [['balance', 'Balance equations'], ['identify', 'Identify reaction types'], ['combined', 'Combined practice']];

export default function WorksheetGenerator() {
  const [options, setOptions] = useState(defaultWorksheetOptions);
  // Deterministic initial state avoids random server/client hydration mismatches.
  const [worksheet, setWorksheet] = useState(() => createWorksheet(defaultWorksheetOptions));
  const [showAnswers, setShowAnswers] = useState(false);
  const availableCount = matchingReactions(options).length;
  const settingsChanged = worksheet.settings !== JSON.stringify(options);
  const { questions } = worksheet;

  const update = (name, value) => setOptions(previous => ({ ...previous, [name]: value }));
  const toggle = (group, name) => setOptions(previous => ({ ...previous, [group]: { ...previous[group], [name]: !previous[group][name] } }));
  const generateWorksheet = () => {
    setWorksheet(createWorksheet(options, { shuffle: true }));
    setShowAnswers(false);
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6">
      <section aria-labelledby="worksheet-settings" className="glass-panel w-full p-4 sm:p-6 rounded-3xl flex flex-col gap-6 no-print text-left">
        <div className="flex items-center gap-2">
          <Settings aria-hidden="true" className="w-5 h-5 text-indigo-500" />
          <h3 id="worksheet-settings" className="text-xl font-bold text-slate-900 dark:text-slate-100">Build your practice sheet</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <fieldset className="min-w-0">
            <legend className="mb-3 text-xs font-bold text-slate-600 dark:text-slate-400">Exercise type</legend>
            <div className="flex flex-col gap-2">
              {exerciseTypes.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={options.exerciseType === id} onClick={() => update('exerciseType', id)}
                  className={`min-h-11 text-sm px-3 py-2 rounded-xl text-left border transition-colors ${options.exerciseType === id ? 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/40 font-semibold' : 'border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="mb-3 text-xs font-bold text-slate-600 dark:text-slate-400">Maximum questions</legend>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 30].map(quantity => (
                <button key={quantity} type="button" aria-pressed={options.quantity === quantity} onClick={() => update('quantity', quantity)}
                  className={`w-11 h-11 rounded-xl text-sm font-bold border transition-colors ${options.quantity === quantity ? 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/40' : 'border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-indigo-500/10'}`}>
                  {quantity}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400" aria-live="polite">
              {availableCount} unique reactions match. This sheet will contain {Math.min(options.quantity, availableCount)} questions, without repeats.
            </p>
          </fieldset>
          {[
            ['categories', 'Reaction categories', categories],
            ['difficulties', 'Difficulty', difficulties],
          ].map(([group, label, choices]) => (
            <fieldset key={group} className="min-w-0">
              <legend className="mb-1 text-xs font-bold text-slate-600 dark:text-slate-400">{label}</legend>
              {choices.map(([id, name]) => (
                <label key={id} className="min-h-11 flex items-center gap-3 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={options[group][id]} onChange={() => toggle(group, id)} className="w-4 h-4 accent-indigo-600 shrink-0" />
                  {name}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 dark:border-white/10 pt-4">
          <button type="button" onClick={generateWorksheet} className="min-h-11 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            <RefreshCw aria-hidden="true" className="w-4 h-4" /> Generate Worksheet
          </button>
          <button type="button" disabled={!questions.length} aria-pressed={showAnswers} onClick={() => setShowAnswers(value => !value)} className="min-h-11 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:bg-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed">
            {showAnswers ? <EyeOff aria-hidden="true" className="w-4 h-4" /> : <Eye aria-hidden="true" className="w-4 h-4" />}
            {showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}
          </button>
          <button type="button" disabled={!questions.length} onClick={() => window.print()} className="min-h-11 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 hover:bg-indigo-500/10 disabled:opacity-40 disabled:cursor-not-allowed">
            <Printer aria-hidden="true" className="w-4 h-4" /> {showAnswers ? 'Print answer key / PDF' : 'Print student sheet / PDF'}
          </button>
        </div>
        <p role="status" className="text-sm text-slate-600 dark:text-slate-400">
          {settingsChanged ? 'Settings changed. Select Generate Worksheet to apply them.' : `${questions.length} questions ready.${showAnswers ? ' Answers are visible and will be included when printing.' : ' The student sheet prints without answers.'}`}
        </p>
      </section>

      {questions.length > 0 ? (
        <section aria-labelledby="worksheet-title" className="worksheet-paper glass-panel min-w-0 w-full p-4 sm:p-8 md:p-10 rounded-3xl text-left">
          <header className="flex flex-col sm:flex-row justify-between gap-5 border-b-2 border-slate-300 dark:border-slate-600 pb-6">
            <div>
              <h3 id="worksheet-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText aria-hidden="true" className="w-6 h-6 shrink-0 text-indigo-500 no-print" /> Chemistry Practice Sheet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{showAnswers ? 'TEACHER ANSWER KEY' : 'STUDENT WORKSHEET'} · {questions.length} questions</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">Reaction classifications can overlap; answers use the selected curriculum category.</p>
            </div>
            {!showAnswers && <div className="text-xs text-slate-700 dark:text-slate-300 leading-7 shrink-0">Name: ______________________<br />Date: __________ Class: ______</div>}
          </header>
          {worksheet.availableCount < worksheet.requestedCount && <p className="no-print mt-4 text-sm text-slate-600 dark:text-slate-400">Showing all {questions.length} matching reactions from the question bank. Add categories or difficulty levels to broaden the selection.</p>}
          <ol className="mt-6 flex flex-col gap-6 list-decimal pl-6 text-slate-700 dark:text-slate-300">
            {questions.map(reaction => (
              <li key={reaction.id} className="worksheet-question pl-2 pb-6 border-b border-slate-200 dark:border-white/10 last:border-0 break-inside-avoid">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{reaction.questionType === 'balance' ? 'Balance the chemical reaction' : 'Identify the reaction type'}</p>
                <p className="font-mono text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mt-3 leading-8 break-words">{reaction.questionType === 'balance' && showAnswers ? formatAnswer(reaction) : formatQuestion(reaction, reaction.questionType)}</p>
                {reaction.questionType === 'identify' && <p className="mt-3 text-sm">Reaction type: {showAnswers ? reactionLabels[reaction.type] : '________________________________'}</p>}
                {showAnswers && <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 text-sm text-slate-800 dark:text-slate-200 leading-relaxed"><strong className="block mb-1">Explanation</strong>{reaction.explanation}</div>}
              </li>
            ))}
          </ol>
          <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-300 dark:border-slate-600 mt-6 pt-4 text-xs text-slate-600 dark:text-slate-400">
            <span>Rasayan Lab · Equations for study, not experiment instructions.</span>
            <span>Score: ______ / {questions.length}</span>
          </footer>
        </section>
      ) : (
        <div className="glass-panel w-full p-6 sm:p-12 rounded-3xl text-center flex flex-col items-center gap-3" role="status">
          <ShieldAlert aria-hidden="true" className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No matching reactions</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">Select at least one reaction category and one difficulty level, then generate a new sheet.</p>
        </div>
      )}
    </div>
  );
}
