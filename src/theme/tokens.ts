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
  /* The eye that opens a line, and a user name. Both come from the BA's UI
     principles of 16 Nov 2026; neither role existed here before. */
  view: 40,
  person: 160,
  ident: 240,
  text: 280,
  code: 96,
  number: 104,
  money: 124,
  /* 150px until 16 Nov 2026, and the reason it shrank is worth keeping.
     That figure was measured against the LIVE system, which renders LAST
     CHANGE as `09/09/2026 16:35:29` and needed room for a long day name.
     This app does not render that: `regional.ts` formats with 2-digit day and
     month, giving `11/14/2026` — exactly the format the BA's principles of
     16 Nov specify, at exactly her width. The old number was sized for a
     format we no longer produce. */
  date: 110,
  /* A moment, not a day. `11/14/2026 09:14 AM` in the BA's principles and
     `10/13/2026 10:56:15` out of `fmtDateTime` are both 19 characters, so
     170px holds either — but they are not the same format. Hers is 12-hour
     without seconds; ours is 24-hour with them. The width is settled; the
     format is not. */
  datetime: 170,
  status: 128,
  /* Was `rating` at 132px, sized for three stars. Priority is now a dot and a
     word, and the widest word is "Medium" — a dot, a gap and six characters. */
  priority: 104,
} as const;

export type ColumnRole = keyof typeof COLUMN_WIDTH;

/** Dialog and window widths. */
export const DIALOG_WIDTH = {
  record: 640,
  wide: 960,
} as const;
