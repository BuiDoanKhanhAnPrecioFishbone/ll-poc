import { numBy } from './idHash';
import type { QuoteResult } from './quotations';

/**
 * Other Quoted Cost — what Pricing Detail opens.
 *
 * THE CUSTOMER'S ANSWER OF 29 OCT, in her words: a quote run prices MATERIAL
 * and nothing else, and before the number goes out a PM compares it with what
 * this assembly has cost before and adds the work around it — labour,
 * consulting, tooling. Her screen has three parts:
 *
 *   REFERENCE COST, per unit   standard · target · highest · lowest · last PO
 *   THE LINES                  Sale type · Unit price · Qty · Amount ·
 *                              Amount with markup
 *   THE FOOT                   Subtotal · Markup · Total Quoted
 *
 * WHERE THE NUMBERS COME FROM, said plainly because it matters when reading the
 * screen: the reference costs are the customer's PURCHASE HISTORY, which this
 * prototype does not have. They are derived from the run's own cost per board
 * through the id hash, so the figures are stable, plausible and ordered
 * correctly (lowest ≤ last PO ≤ standard ≤ highest) — and they are not real.
 * The screen says so above the table rather than presenting derived numbers as
 * history, the same choice the Excel report makes about lifecycle status.
 *
 * THE MATERIAL LINE IS NOT DERIVED. It is the run's own output — cost per board
 * × build quantity — and it is read-only here, because this screen is where
 * costs are added to a quote, not where the quote is re-priced.
 */

/**
 * The sale types.
 *
 * TWO ARE HERS — she named labour and consulting — and the rest are the ones a
 * contract manufacturer quotes beside material. The live list lives in a
 * metadata table we have not been shown, so it is open question 11 rather than
 * a guess dressed as a fact.
 */
export const SALE_TYPES = [
  'Material',
  'Labour',
  'Consulting',
  'Tooling / Fixture',
  'Test & Programming',
  'Packaging',
  'Freight',
  'Other',
] as const;

export type SaleType = typeof SALE_TYPES[number];

export type OtherCostLine = {
  id: string;
  saleType: SaleType;
  unitPrice: number;
  qty: number;
  /**
   * Priced by the run rather than typed, so the screen cannot edit it. Exactly
   * one line is locked: the material the quote already costed.
   */
  locked?: boolean;
};

export type ReferenceCost = { label: string; perUnit: number; hint: string };

/**
 * The five reference costs, per unit.
 *
 * Anchored on this run's own cost per board so the comparison means something:
 * a target below it reads as "we want to get there", a last PO above it reads
 * as "we have paid more than this". Ordered by construction, not by chance.
 */
export function referenceCosts(r: QuoteResult): ReferenceCost[] {
  const std = r.costPerBoard;
  const target = std * (1 - numBy(r.id, 'target', 0.03, 0.09, 0.005));
  const highest = std * (1 + numBy(r.id, 'high', 0.08, 0.2, 0.005));
  const lowest = target * (1 - numBy(r.id, 'low', 0.02, 0.07, 0.005));
  const lastPo = lowest + (std - lowest) * numBy(r.id, 'po', 0.3, 0.95, 0.05);
  return [
    { label: 'Standard cost', perUnit: std,
      hint: 'What this run came to, per board.' },
    { label: 'Target cost', perUnit: target,
      hint: 'What the program is aiming at.' },
    { label: 'Highest cost', perUnit: highest,
      hint: 'The most this assembly has cost.' },
    { label: 'Lowest cost', perUnit: lowest,
      hint: 'The least this assembly has cost.' },
    { label: 'Last PO price', perUnit: lastPo,
      hint: 'What the last purchase order paid.' },
  ];
}

/**
 * The lines the screen opens with: the material this run priced, and the two
 * costs the customer named, at quantities a PM would recognise.
 *
 * Labour is per board. Consulting is a one-off — quantity 1 — which is why the
 * table has a Qty column at all rather than multiplying everything by the
 * build.
 */
export function otherCostLines(r: QuoteResult): OtherCostLine[] {
  const labour = numBy(r.id, 'labour', 1.2, 6.4, 0.05);
  const consult = numBy(r.id, 'consult', 250, 1800, 25);
  return [
    { id: 'material', saleType: 'Material', locked: true,
      unitPrice: r.costPerBoard, qty: r.buildQty },
    { id: 'labour', saleType: 'Labour', unitPrice: labour, qty: r.buildQty },
    { id: 'consulting', saleType: 'Consulting', unitPrice: consult, qty: 1 },
  ];
}

export const lineAmount = (l: OtherCostLine) => l.unitPrice * l.qty;

/** Subtotal, markup and total quoted — the table's foot. */
export function otherCostTotals(lines: OtherCostLine[], markupPct: number) {
  const subtotal = lines.reduce((n, l) => n + lineAmount(l), 0);
  const markup = subtotal * (markupPct / 100);
  return { subtotal, markup, totalQuoted: subtotal + markup };
}

/** A new row, for the Add line button. Starts on a type the quote has no line for. */
export function emptyCostLine(existing: OtherCostLine[]): OtherCostLine {
  const free = SALE_TYPES.filter(t => t !== 'Material' && !existing.some(l => l.saleType === t));
  return {
    id: `line-${Date.now().toString(36)}`,
    saleType: free[0] ?? 'Other',
    unitPrice: 0,
    qty: 1,
  };
}
