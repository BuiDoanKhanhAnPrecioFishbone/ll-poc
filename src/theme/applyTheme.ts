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
 * KENDO'S DERIVED COLOURS DO NOT ALL RE-RESOLVE ON THEIR OWN, and this is the
 * reason this file exists rather than a one-line `setAttribute` at the call
 * site.
 *
 * Kendo declares its variants as relative colours — `oklch(from
 * var(--kendo-color-base) clamp(…) 0 h)` — on `:root`. When `data-theme`
 * changes after first paint, Chrome re-resolves most of them but not all:
 * measured on the Quotations list, the grid background and cell text flipped
 * correctly while `--kendo-color-base-on-surface`, which colours every outline
 * button, stayed on its previous branch. "Columns" read 0.36 lightness — dark
 * text — on a dark toolbar.
 *
 * Disabling and re-enabling the stylesheet that DECLARES those properties
 * forces the whole set to be re-evaluated. Measured: the same button went from
 * 0.36 to 0.945 immediately after. The forced reflow between the two writes is
 * load-bearing — without it the browser coalesces them and nothing happens.
 *
 * This is a workaround for engine behaviour, not for anything in our stylesheets,
 * so it is deliberately narrow: only sheets that actually declare a `--kendo-`
 * property are touched, and only when the theme changes. A first paint needs
 * none of it, which is why `index.html` sets the attribute before this module
 * ever loads.
 */
function refreshDerivedColours() {
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | undefined;
    try { rules = sheet.cssRules; } catch { continue; }   // cross-origin
    let declaresKendo = false;
    for (const rule of Array.from(rules ?? [])) {
      const style = (rule as CSSStyleRule).style;
      if (!style) continue;
      for (let i = 0; i < style.length; i++) {
        if (style[i].startsWith('--kendo-')) { declaresKendo = true; break; }
      }
      if (declaresKendo) break;
    }
    const node = sheet.ownerNode as (HTMLStyleElement | HTMLLinkElement | null);
    if (!declaresKendo || !node) continue;
    node.disabled = true;
    void document.body.offsetHeight;   // force the invalidation to land
    node.disabled = false;
  }
}

export function applyTheme(theme: Theme, { refresh = true } = {}) {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  if (refresh) refreshDerivedColours();
}

/** What `index.html` already applied, so the first render agrees with the paint. */
export function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* private mode, blocked storage */ }
  return 'system';
}
