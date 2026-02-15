/**
 * Tab principali della piattaforma (HOME, EVENTI, MISSIONI, CLASSIFICA, PROFILO).
 * Usato per navigazione swipe e bottom nav.
 */
export const MAIN_TAB_PATHS = ["/", "/discover", "/missions", "/leaderboard", "/profile"] as const;

export type MainTabPath = (typeof MAIN_TAB_PATHS)[number];

export function getMainTabIndex(pathname: string): number {
  const i = MAIN_TAB_PATHS.findIndex(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p))
  );
  return i >= 0 ? i : 0;
}

export function getMainTabPath(index: number): MainTabPath | null {
  if (index < 0 || index >= MAIN_TAB_PATHS.length) return null;
  return MAIN_TAB_PATHS[index];
}
