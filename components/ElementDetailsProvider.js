"use client";

import { createContext, useCallback, useContext, useState } from "react";
import dynamic from "next/dynamic";

const ElementDrawer = dynamic(() => import("./ElementDrawer"));
const OpenElementContext = createContext(null);

export function useOpenElement() {
  return useContext(OpenElementContext);
}

export default function ElementDetailsProvider({ children }) {
  const [selection, setSelection] = useState(null);
  const openElement = useCallback(element => {
    // Read geometry before mounting the drawer. Reading it in the drawer effect
    // forces layout once for the new panel and again after scroll lock/focus.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    setSelection({ element, scrollbarWidth });
  }, []);
  const closeElement = useCallback(() => setSelection(null), []);

  return (
    <OpenElementContext.Provider value={openElement}>
      {children}
      {selection && <ElementDrawer element={selection.element} scrollbarWidth={selection.scrollbarWidth} onClose={closeElement} />}
    </OpenElementContext.Provider>
  );
}
