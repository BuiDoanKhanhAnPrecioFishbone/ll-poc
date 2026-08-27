import type { Quotation } from './quotations';

/**
 * RFQs created during this browser session.
 *
 * The rest of the data set is generated deterministically from a seed, which
 * is right for a mockup — the same 330 records every time, so a screenshot
 * taken today matches one taken next week. A record the user just created has
 * no seed to come from, and it has to survive the navigation from the create
 * modal to the record screen, so it is held here and prepended by
 * `generateQuotations`.
 *
 * Deliberately NOT persisted to localStorage. Saved views are persisted
 * because losing a view the user built is a real loss; a mock RFQ surviving a
 * page reload would instead make the prototype look like it has a backend,
 * which invites the reviewer to test things it cannot do. The Save toast says
 * as much.
 */
const created: Quotation[] = [];

export function addCreatedQuotation(q: Quotation) {
  created.unshift(q);
}

export function createdQuotations(): readonly Quotation[] {
  return created;
}

/**
 * The number the next created RFQ gets.
 *
 * The guideline: "The system automatically generates and displays the No. as
 * the H1 header for a newly created Project Requirement, using the next
 * sequential RFQ number." The generator numbers its records downward from 358,
 * so the next one up is the next one free.
 */
export function nextRfqNo(existing: readonly Quotation[]): string {
  const highest = existing.reduce((n, q) => Math.max(n, Number(q.no) || 0), 0);
  return String(highest + 1).padStart(10, '0');
}
