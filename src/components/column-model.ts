/* =============================================================================
   COLUMN MODEL
   -----------------------------------------------------------------------------
   Shared by every list screen. Width is never chosen per screen: it follows from
   the column's role, defined once in the token layer (src/theme/tokens.ts).
   See docs/table-patterns.md for the rules each role encodes.
   ========================================================================== */

import type { ReactNode } from 'react';
import { COLUMN_WIDTH, type ColumnRole } from '../theme/tokens';

export type { ColumnRole };
export const ROLE_WIDTH = COLUMN_WIDTH;

export type ColumnSpec<T> = {
  field: Extract<keyof T, string>;
  title: string;
  role: ColumnRole;

  /**
   * Overrides the role's default width, in either direction. Legitimate when
   * the column's real content differs materially from what the role assumes:
   * a `code` column holding "Sub-assy Box Build" cannot live in 96px, and an
   * `ident` column holding a fixed 10-digit number does not need 240px.
   * `widthNote` is required with it, so the deviation is justified in the
   * source rather than being a silent magic number.
   */
  width?: number;
  widthNote?: string;

  /** Hidden by default; still offered in the column chooser, with `note` shown. */
  hiddenByDefault?: boolean;
  note?: string;

  /** Bespoke cell content (a Rating, a link). Roles still drive width. */
  render?: (row: T) => ReactNode;

  /** Included in the toolbar search. */
  searchable?: boolean;

  /**
   * How hard this column fights for space when there is not enough of it.
   *
   *   1  always shown — the record's identity and the fields the screen exists
   *      to answer. If these alone do not fit, the grid scrolls.
   *   2  shown when there is room
   *   3  shown only on a wide window
   *
   * Measured at 1024x768 before this existed: 816px of the Quotations grid sat
   * off-screen and only 3 of 10 columns were visible, so Status and Date Needed
   * — the two an estimator works from — were both hidden. Horizontal scroll is
   * a reasonable answer for a wide grid on a wide screen; it is not an answer
   * for a laptop.
   *
   * Nothing is lost: dropped columns return via "Show more columns", and the
   * button's tooltip says which and why.
   */
  priority?: 1 | 2 | 3;
};

/**
 * Fits columns to the width actually available, in priority order.
 *
 * Greedy rather than breakpointed. A first attempt used fixed window
 * breakpoints and dropped every priority-2 column at 1024px, leaving three
 * columns in 726px of grid — 300px of empty space beside a truncation problem.
 * Width is the real constraint, so it is what the decision is made against.
 *
 * Priority-1 columns are always included even if they overflow; that case is a
 * genuinely too-narrow window, and scrolling beats hiding the identifier.
 */
export function columnsForWidth<T>(cols: ColumnSpec<T>[], gridWidth: number): ColumnSpec<T>[] {
  if (gridWidth <= 0) return cols;
  const keep = new Set<string>();
  let used = 0;

  /* hiddenByDefault columns are not on screen, so they must not spend width.
     Leaving them in this pass charged the budget 300px for two columns nobody
     could see, which pushed Customer out of a 1144px grid that had room for it. */
  for (const c of cols) {
    if (c.hiddenByDefault) continue;
    if ((c.priority ?? 1) === 1) { keep.add(c.field); used += widthOf(c); }
  }
  for (const level of [2, 3] as const) {
    for (const c of cols) {
      if ((c.priority ?? 1) !== level || c.hiddenByDefault) continue;
      const w = widthOf(c);
      if (used + w <= gridWidth) { keep.add(c.field); used += w; }
    }
  }
  return cols.filter(c => keep.has(c.field));
}

export function widthOf<T>(c: ColumnSpec<T>): number {
  return c.width ?? ROLE_WIDTH[c.role];
}
