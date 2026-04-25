import { useState } from "react";

export type LayoutMode = "tabs" | "page";

export function useLayoutMode() {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() =>
    (localStorage.getItem("studyflow_layout_mode") as LayoutMode) || "tabs"
  );

  const setLayoutMode = (mode: LayoutMode) => {
    localStorage.setItem("studyflow_layout_mode", mode);
    setLayoutModeState(mode);
  };

  return { layoutMode, setLayoutMode };
}
