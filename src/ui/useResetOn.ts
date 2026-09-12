import { useState, type Dispatch, type SetStateAction } from 'react';

/**
 * State that resets itself whenever something else changes.
 *
 * Four screens hold the same thing — the columns you are editing, reset when
 * you switch saved view — and all four wrote it the same way:
 *
 *     const [cols, setCols] = useState(view.columns);
 *     useEffect(() => { setCols(view.columns); }, [view]);
 *
 * That works and it renders twice. The effect runs AFTER the commit, so React
 * paints one frame with the previous view's columns and then immediately
 * replaces it. On a grid that is a visible flicker of the wrong column set, and
 * it is why `react(set-state-in-effect)` flags it.
 *
 * Adjusting during render is React's own answer: keep the last value of the
 * thing you are keyed on, compare, and set both when it changes. React throws
 * the in-progress render away and re-runs the component immediately, before the
 * browser paints anything, so the intermediate state is never seen.
 *
 * `derive` is a function rather than a value so it is only called when the reset
 * actually happens, and so this reads the same as the `useState` it replaces.
 *
 * Identity comparison, not deep: `on` is expected to be the object or string
 * that identifies the thing — a saved view, a pathname, a filtered array.
 */
export function useResetOn<T>(
  on: unknown,
  derive: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(derive);
  const [seen, setSeen] = useState(on);

  if (seen !== on) {
    setSeen(on);
    setValue(derive());
  }

  return [value, setValue];
}
