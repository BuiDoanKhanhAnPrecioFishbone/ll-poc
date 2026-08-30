import type { RunConfig } from '../components/quotation/run/state';
import type { BomLine } from './bom';

/**
 * Draft quotations saved during this browser session.
 *
 * Follows `createdQuotations.ts` exactly, including the part that looks like a
 * limitation: this is NOT persisted to localStorage. A draft surviving a page
 * reload would make the prototype look like it has a backend, which invites a
 * reviewer to test things it cannot do. In-memory is also enough for what
 * Resume Draft Quote actually has to demonstrate — save a draft, close the
 * wizard, reopen it, and continue — because all of that happens inside one
 * session. The Save toast says as much.
 *
 * Before this existed, Save draft showed the guideline's success message and
 * did nothing else, which made the one flow named after resuming a draft
 * impossible to reach: there was never a draft to resume.
 */
export type DraftQuote = {
  id: string;
  /** Which RFQ the draft belongs to. */
  rfqId: string;
  /** Scoped per the guideline's precondition: "available for the selected customer". */
  customer: string;
  /** The seven read-only columns the drafts table shows. */
  assemblyName: string;
  revision: string;
  description: string;
  buildQty: number;
  attritionSet: number;
  createdDate: Date;
  /** Everything needed to put the user back where they left off. */
  cfg: RunConfig;
  lines: BomLine[];
  hasRun: boolean;
  runVersion: number;
  runDate: string;
};

const drafts: DraftQuote[] = [];

/**
 * Saving the same assembly twice REPLACES the earlier draft rather than adding
 * a second row. Save draft is reachable from both step 3 and step 4, so pressing
 * it twice in one sitting is ordinary rather than exceptional, and a table that
 * grew a near-identical row each time would bury the real one — the user is
 * looking for "the assembly I was working on", not "the fourth save of it".
 */
export function saveDraftQuote(d: DraftQuote) {
  const i = drafts.findIndex(
    x => x.rfqId === d.rfqId && x.assemblyName === d.assemblyName && x.revision === d.revision,
  );
  if (i >= 0) drafts[i] = d; else drafts.unshift(d);
  return i >= 0;   /* true when it replaced, so the caller can say which happened */
}

/** Newest first — a resumed draft is nearly always the one just left. */
export function draftQuotesFor(customer: string): readonly DraftQuote[] {
  return drafts.filter(d => d.customer === customer);
}

export function draftQuoteCount(customer: string): number {
  return draftQuotesFor(customer).length;
}
