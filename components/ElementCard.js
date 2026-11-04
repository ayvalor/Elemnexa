"use client";

import { memo } from "react";

/** A semantic button keeps every element reachable by keyboard and touch. */
function ElementCard({ element, onClick, matched = true }) {
  const gridStyle = {
    gridRowStart: element.period,
    gridColumnStart: element.group || 3,
  };
  if (element.number >= 58 && element.number <= 71) {
    gridStyle.gridRowStart = 9;
    gridStyle.gridColumnStart = element.number - 58 + 4;
  } else if (element.number >= 90 && element.number <= 103) {
    gridStyle.gridRowStart = 10;
    gridStyle.gridColumnStart = element.number - 90 + 4;
  }

  return (
    <button
      type="button"
      data-category={element.category}
      data-element-number={element.number}
      style={gridStyle}
      onClick={() => onClick(element)}
      disabled={!matched}
      aria-label={`${element.name}, ${element.symbol}, atomic number ${element.number}`}
      aria-haspopup="dialog"
      title={`${element.name} · ${element.symbol} · Atomic number ${element.number}`}
      className={`element-card relative flex h-[80px] min-w-0 flex-col justify-between overflow-hidden rounded-lg p-2 text-left transition-transform motion-safe:enabled:hover:-translate-y-1 enabled:hover:z-10 focus-visible:z-10 ${
        matched ? "cursor-pointer opacity-100" : "opacity-20"
      }`}
    >
      <span className="flex w-full justify-between gap-1 text-[9px]">
        <span className="element-number">{element.number}</span>
        <span className="element-mass truncate">
          {element.massType === "representative isotope mass number" ? `[${element.massNumber}]` : element.mass.toFixed(2)}
        </span>
      </span>
      <span className="element-symbol text-center text-2xl leading-none tracking-tight">{element.symbol}</span>
      <span className="element-name w-full truncate text-center text-[9px] leading-tight">{element.name}</span>
    </button>
  );
}

export default memo(ElementCard);
