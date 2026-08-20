/* =============================================================================
   TOKEN LAYER — TYPESCRIPT SIDE
   -----------------------------------------------------------------------------
   Some design values have to reach a component as a number, not a CSS variable:
   KendoReact's `GridColumn width` and `Dialog width` take numeric props and do
   arithmetic on them for scroll and resize calculations, so a `var(--x)` string
   cannot be used there.

   Rather than let those values sit as literals inside components, they live here.
   This file and `tokens.css` together are "the token layer" that the working
   agreement refers to: a raw px value is allowed in these two files and nowhere
   else.
   ========================================================================== */

/** Column widths, keyed by the semantic role of the column. See table-patterns.md. */
export const COLUMN_WIDTH = {
  ident: 240,
  text: 280,
  code: 96,
  number: 104,
  money: 124,
  date: 150,
  status: 128,
  rating: 132,
} as const;

export type ColumnRole = keyof typeof COLUMN_WIDTH;

/** Dialog and window widths. */
export const DIALOG_WIDTH = {
  record: 640,
  wide: 960,
} as const;
