import type { CSSProperties } from "react";

/** Dissolvenza solo ai bordi (maschera alfa); fascia centrale ampia — card centrale + fetta dx/sx. */
export const NEWS_RAIL_EDGE_MASK = [
  "linear-gradient(90deg,",
  "rgba(0,0,0,0) 0%,",
  "rgba(0,0,0,0.06) 2.5%,",
  "rgba(0,0,0,0.28) 5.5%,",
  "rgba(0,0,0,0.72) 8%,",
  "#000 10%,",
  "#000 90%,",
  "rgba(0,0,0,0.72) 92%,",
  "rgba(0,0,0,0.28) 94.5%,",
  "rgba(0,0,0,0.06) 97.5%,",
  "rgba(0,0,0,0) 100%",
  ")",
].join(" ");

export const newsRailEdgeMaskStyle: CSSProperties = {
  WebkitMaskImage: NEWS_RAIL_EDGE_MASK,
  maskImage: NEWS_RAIL_EDGE_MASK,
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
};
