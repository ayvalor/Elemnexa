"use client";

import { memo } from "react";

/** The periodic position remains fixed while matching tiles stay keyboard reachable. */
function ElementCard({ element, onClick, matched = true }) {
  const gridStyle = {
    gridRowStart: element.period + 1,
    gridColumnStart: element.group || 3,
  };
  if (element.number >= 58 && element.number <= 71) {
    gridStyle.gridRowStart = 10;
    gridStyle.gridColumnStart = element.number - 58 + 4;
  } else if (element.number >= 90 && element.number <= 103) {
    gridStyle.gridRowStart = 11;
    gridStyle.gridColumnStart = element.number - 90 + 4;
  }
  const mass = element.massType === "representative isotope mass number" ? `[${element.massNumber}]` : element.mass.toFixed(2);

  return (
    <button
      type="button"
      data-category={element.category}
      data-element-number={element.number}
      style={gridStyle}
      onClick={() => onClick(element)}
      disabled={!matched}
      aria-haspopup="dialog"
      title={`${element.name} · ${element.symbol} · Atomic number ${element.number}`}
      className="element-card element-tile"
    >
      <span className="element-tile-meta">
        <span className="element-number"><span className="sr-only">Atomic number </span>{element.number} </span>
        <span className="element-mass">{mass} </span>
      </span>
      <span className="element-symbol">{element.symbol} </span>
      <span className="element-name">{element.name}</span>
    </button>
  );
}

export default memo(ElementCard);
