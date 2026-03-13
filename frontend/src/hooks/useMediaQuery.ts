/**
 * hooks/useMediaQuery.ts
 *
 * WHAT: Reactive CSS media query — returns true/false that updates on resize.
 * WHERE USED: Sidebar (auto-collapse on mobile), responsive grid columns.
 *
 * Example:
 *   const isMobile  = useMediaQuery('(max-width: 640px)');
 *   const isDark    = useMediaQuery('(prefers-color-scheme: dark)');
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql     = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ── Pre-built breakpoint helpers ──────────────────────────────────────────────
export const useIsMobile  = () => useMediaQuery('(max-width: 640px)');
export const useIsTablet  = () => useMediaQuery('(max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
