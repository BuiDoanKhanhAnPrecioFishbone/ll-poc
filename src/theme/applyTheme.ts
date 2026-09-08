/**
 * Theme application, and the one browser quirk that makes it more than
 * `setAttribute`.
 *
 * THREE STATES, per the platform's own contract: an explicit choice stamps
 * `data-theme` on the root; "system" stamps nothing and lets
 * `prefers-color-scheme` decide. `tokens.css` is written for exactly that —
 * `:root[data-theme="dark"]` and a media query guarded with
 * `:root:not([data-theme="light"])`, so a stated preference wins in both
 * directions.
 */
export type Theme = 'light' | 'dark' | 'system';
export const THEME_KEY = 'vy.theme';

/**
 * A THEME CHANGE RELOADS THE PAGE, and that is the finding rather than a
 * shortcut.
 *
 * Chrome updates a custom property on `:root` when `data-theme` changes but
 * does not always invalidate the element consuming it. Measured, after a
 * runtime switch to dark: `--kendo-color-base-on-surface` read `#e9edf3` on the
 * root while the outline button reading `color: var(--kendo-color-base-on-surface)`
 * stayed at `rgb(35, 42, 52)` — the light value — and so sat at 1.18:1 on a
 * dark toolbar.
 *
 * Two workarounds were tried and both were worse than a reload. Disabling and
 * re-enabling Kendo's stylesheet forced the recalculation and silently broke
 * `.k-button-solid-primary`, costing the primary button its fill in LIGHT mode.
 * Pinning the variable to one of ours made the VARIABLE re-resolve correctly
 * and the consuming element still did not update.
 *
 * A reload is correct, costs nothing on a preference changed once, and needs no
 * repair anywhere: `index.html` applies the stored theme before Kendo's
 * stylesheet is first evaluated, so every derived colour is right from the
 * start. This function therefore only sets the attribute — used for the initial
 * application; the change path reloads.
 */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
}

/** What `index.html` already applied, so the first render agrees with the paint. */
export function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* private mode, blocked storage */ }
  return 'system';
}
