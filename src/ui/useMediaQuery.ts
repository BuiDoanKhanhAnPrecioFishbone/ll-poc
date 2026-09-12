import { useCallback, useSyncExternalStore } from 'react';

/**
 * A CSS media query, as a boolean that re-renders when it changes.
 *
 * WHY THIS EXISTS AT ALL, when the whole touch-target floor is CSS. Almost
 * every responsive decision in this app belongs in a stylesheet and is there —
 * see the `pointer: coarse` block at the end of responsive.css. This is for the
 * one kind that cannot be: a measurement React hands to a third-party component
 * as a NUMBER. Kendo's Grid takes its column widths as props and writes them
 * into a colgroup, so a media query cannot reach them; CSS can only make a cell
 * overflow a column it is not allowed to resize.
 *
 * `useSyncExternalStore` rather than an effect and a piece of state: it reads
 * the query during render, so the first paint is already right. An effect would
 * paint the desktop width once and correct it, which on a grid means every
 * column visibly shifting.
 *
 * The server snapshot is `false` — the desktop value. This app does not render
 * on a server, but the argument is required and guessing "touch" as a default
 * would be the wrong guess for an ERP.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((notify: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', notify);
    return () => mql.removeEventListener('change', notify);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** The one query this app asks: is there a finger rather than a cursor? */
export const POINTER_COARSE = '(pointer: coarse)';
