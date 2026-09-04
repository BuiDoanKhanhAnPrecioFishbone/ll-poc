/**
 * Kendo's cell props, made safe to spread onto a real DOM element.
 *
 * WHY THIS EXISTS. A custom `cells.data` / `cells.headerCell` / `cells.filterCell`
 * component replaces Kendo's own wrapper, so it has to render the `<td>` or
 * `<th>` itself and spread the `tdProps` / `thProps` Kendo hands it. Those
 * objects are written for Kendo's internal element factory, not for React DOM:
 * they carry camelCase ARIA (`ariaSort`, `ariaColumnIndex`, `ariaSelected`) and
 * bookkeeping that is not an attribute at all (`columnId`, `navigatable`).
 * Spread raw, React logs an "Invalid ARIA attribute" or "does not recognize the
 * prop" warning for each one, on every render, for every cell.
 *
 * This cost the phase 5 accessibility pass a real fix: the filter inputs are
 * still named by their FIELD rather than their column title — "partSource
 * Filter" read aloud — because the wrapper needed to correct that produced a
 * console full of these warnings and was reverted. Translating once, here,
 * is what that fix was missing.
 *
 * The ARIA props are TRANSLATED rather than dropped: they carry real semantics
 * — the sort state of a column, its index, whether a row is selected — and
 * throwing them away to silence a warning would quietly cost the accessibility
 * they provide.
 */

/** camelCase ARIA whose kebab form is not a mechanical conversion. */
const ARIA_ALIASES: Record<string, string> = {
  ariaColumnIndex: 'aria-colindex',
  ariaRowIndex: 'aria-rowindex',
  ariaColumnCount: 'aria-colcount',
  ariaRowCount: 'aria-rowcount',
  ariaHasPopup: 'aria-haspopup',
};

/** Kendo bookkeeping that is not a DOM attribute in any spelling. */
const DROP = new Set(['columnId', 'navigatable', 'columnIndex', 'rowType', 'dataIndex']);

export function kendoDomProps(props: object | null | undefined) {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || DROP.has(key)) continue;
    if (ARIA_ALIASES[key]) { out[ARIA_ALIASES[key]] = value; continue; }
    if (/^aria[A-Z]/.test(key)) {
      /* ariaSort -> aria-sort. Everything else Kendo spells this way converts
         mechanically; the exceptions are in ARIA_ALIASES above. */
      out[`aria-${key.slice(4).toLowerCase()}`] = value;
      continue;
    }
    out[key] = value;
  }
  return out;
}
