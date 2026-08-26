import type { Quotation } from './quotations';

/**
 * ITAR visibility.
 *
 * The customer's Testing Guideline states the rule plainly:
 *
 *   "If the RFQ is marked as ITAR = true, only users whose account has
 *    ITAR = true can access and view it."
 *   "Users whose account has ITAR = true can view all RFQs, including those
 *    with ITAR = true and ITAR = false."
 *   "Users whose account has ITAR = false can view only RFQs with ITAR = false."
 *
 * This is an export-control obligation, not a preference — ITAR governs defence
 * technical data, and showing a restricted record to an uncleared account is a
 * compliance failure rather than a UI bug. It is therefore expressed here as a
 * single filter that every list must pass through, rather than left to each
 * screen to remember.
 *
 * WHAT IS NOT MODELLED. The signed-in user's clearance comes from their account
 * record, and this prototype has no account model — that is part of the
 * permissions work the customer has parked. It is a constant below, defaulting
 * to CLEARED so that nothing silently disappears from a demo. Flip it to false
 * to see the restricted view.
 */

/** Stand-in for the signed-in user's account flag. */
export const ME_HAS_ITAR_CLEARANCE = true;

/** The one place the rule lives. */
export const canSee = (q: Quotation, cleared = ME_HAS_ITAR_CLEARANCE) =>
  cleared || !q.itar;

/**
 * Applies the rule to a list.
 *
 * Returns the visible rows AND how many were withheld. A filter that silently
 * shrinks a list is indistinguishable from missing data, and "why can't I find
 * that RFQ" is exactly the question this rule provokes — so the screen can say
 * that something is hidden without saying what.
 */
export function applyItarVisibility(rows: Quotation[], cleared = ME_HAS_ITAR_CLEARANCE) {
  if (cleared) return { rows, withheld: 0 };
  const visible = rows.filter(q => !q.itar);
  return { rows: visible, withheld: rows.length - visible.length };
}
