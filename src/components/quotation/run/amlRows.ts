import type { BomLine } from '../../../data/bom';

/**
 * A BoM line, split into one row per manufacturer.
 *
 * ASKED FOR by the VIQ UI Standard of 14 Oct — "Child lists as rows: one AML
 * pair per row, parent cells merged; never MFG 1 / MFG 2 columns" — and shown
 * working in the customer's Quoting BoM mockup of 16 Oct, which renders exactly
 * this on both the Review BoM and the Quoting grids.
 *
 * WHAT IT REPLACES, AND WHY THE REVERSAL IS RIGHT THIS TIME. On 15 Oct we built
 * generated `MFG1 · MFGPN1 … MFG6 · MFGPN6` columns, on the customer's own
 * instruction and with their live screen as evidence. The argument for columns
 * was scanning: reading DOWN `MFG2` answers "which lines have a second source
 * at all", which rows cannot. That argument still holds and it is not what
 * decided this.
 *
 * What decided it is that one of the two shapes loses data. SAP Fiori documents
 * that a cell holding several values exports EMPTY to a spreadsheet, and this
 * screen's output is an Excel file; separate columns avoid that but cost 670px
 * of horizontal scroll on a BoM whose third slot is empty on every line. Rows
 * carry one manufacturer each, so every one of them exports, and the grid is
 * two columns wide instead of twelve.
 *
 * THE SECOND SOURCE IS STILL SCANNABLE, just differently: a line with an
 * alternate is two rows deep, so the rules in the left margin show it at a
 * glance — and the Columns chooser can still put MFG beside MPN.
 */
export type AmlRow = {
  /** `${line.id}#${index}` — the grid keys rows on this. */
  id: string;
  /** The record this row is part of. Every parent cell reads from it. */
  line: BomLine;
  index: number;
  count: number;
  /** The row carrying the line's own cells; the rest leave them blank. */
  first: boolean;
  /** The row the group's rule is drawn under. */
  last: boolean;
  mfg: string;
  mpn: string;
};

/**
 * Every AML on a line: the primary manufacturer first, then its alternates.
 *
 * A line with no manufacturer at all returns nothing rather than a blank pair —
 * the row then says so once, instead of rendering an empty chip that looks like
 * a value that failed to load.
 */
export function amlPairs(l: BomLine): { mfg: string; mpn: string }[] {
  return [{ mfg: l.mfg, mpn: l.mpn }, ...l.alternates].filter(p => p.mfg.trim() || p.mpn.trim());
}

/**
 * Lines to rows.
 *
 * A line with no manufacturer still gets ONE row — it is a part that has to be
 * quoted, and dropping it because its AML is blank would hide it from the step
 * whose job is to find exactly that kind of gap.
 */
export function amlRows(lines: BomLine[]): AmlRow[] {
  return lines.flatMap(line => {
    const pairs = amlPairs(line);
    const list = pairs.length ? pairs : [{ mfg: '', mpn: '' }];
    return list.map((p, i) => ({
      id: `${line.id}#${i}`,
      line, index: i, count: list.length,
      first: i === 0, last: i === list.length - 1,
      mfg: p.mfg, mpn: p.mpn,
    }));
  });
}

/** The cell a continuation row leaves empty. Written once so it reads the same
 *  everywhere: nothing at all, not an em-dash, because the value above it is
 *  the value — this is a merged cell drawn with a blank. */
export const PARENT_ONLY = null;
