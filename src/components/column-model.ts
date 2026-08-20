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
};

export function widthOf<T>(c: ColumnSpec<T>): number {
  return c.width ?? ROLE_WIDTH[c.role];
}
