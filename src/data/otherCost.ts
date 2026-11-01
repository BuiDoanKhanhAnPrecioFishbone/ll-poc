import { numBy } from './idHash';
import type { QuoteResult } from './quotations';

/**
 * Other Quoted Cost — what Pricing Detail opens.
 *
 * REBUILT 1 NOV FROM A PHOTOGRAPH OF THE REAL SCREEN. The first version, on
 * 29 Oct, was built from the customer's spoken description: a quote run prices
 * MATERIAL and nothing else, and before the number goes out a PM compares it
 * with what this assembly has cost before and adds the work around it. That
 * was right about the purpose and wrong about eight details, because she had
 * also sent a screenshot of the live window and I had only opened one of the
 * five images. `docs/_ref/live-other-quoted-cost-29oct.png` is the source now.
 *
 * WHAT THE PHOTOGRAPH CHANGED:
 *
 *   · the screen opens READ-ONLY, behind an Edit button;
 *   · it carries its own Markup (%) and Quantity, which drive the arithmetic,
 *     and a Notes field — none of which I had;
 *   · the reference block sits beside the form, not above it;
 *   · the comparison is a PERCENTAGE with an arrow — `↓ 100.00%` — where I had
 *     invented an absolute delta;
 *   · two of the five rows are a *price*, not a *cost*;
 *   · the lines are numbered, and the first sale type is `Materials`.
 *
 * WHERE THE NUMBERS COME FROM, said plainly because it matters when reading
 * the screen: the reference costs are the customer's PURCHASE HISTORY, which
 * this prototype does not have. They are derived from the run's own cost per
 * board through the id hash, so the figures are stable, plausible and ordered
 * correctly — and they are not real. The screen says so above the block.
 */

/**
 * The sale types.
 *
 * `Materials` is from the live window — it is the first line of the one
 * example we have. Labour and Consulting are the two the customer named. The
 * rest are what a contract manufacturer quotes beside material, and the live
 * list lives in a metadata table we have not been shown, so they are open
 * question 11 rather than a guess dressed as a fact.
 */
export const SALE_TYPES = [
  'Materials',
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
   * Priced by the run rather than typed, so the screen cannot edit its unit
   * price. Exactly one line is locked: the material the quote already costed.
   * Its quantity follows the header's Quantity, as it does on the live window.
   */
  locked?: boolean;
};

/** One row of the reference block: a figure, and how it sits against this run. */
export type ReferenceCost = {
  label: string;
  perUnit: number;
  /** Signed, in percent, against the run's own cost per unit. */
  deltaPct: number;
  hint: string;
};

/**
 * The five reference figures, per unit, and the percentage beside each.
 *
 * THE PERCENTAGE IS READ OFF HER SCREENSHOT, not chosen. Every row there shows
 * `↓ 100.00%` against a reference of `$0.000000` and a quoted unit price of
 * `683.93`, which is `(reference − quoted) / quoted` — one hundred per cent
 * below. So the arrow says which side of this run the reference falls on, and
 * the sign is the reference's, not ours.
 *
 * The figures themselves are anchored on this run's cost per board so the
 * comparison means something: a target below it reads as "we want to get
 * there", a last PO above it as "we have paid more than this". Ordered by
 * construction rather than by chance.
 */
export function referenceCosts(r: QuoteResult): ReferenceCost[] {
  const quoted = r.costPerBoard;
  const target = quoted * (1 - numBy(r.id, 'target', 0.03, 0.09, 0.005));
  const highest = quoted * (1 + numBy(r.id, 'high', 0.08, 0.2, 0.005));
  const lowest = target * (1 - numBy(r.id, 'low', 0.02, 0.07, 0.005));
  const lastPo = lowest + (quoted - lowest) * numBy(r.id, 'po', 0.3, 0.95, 0.05);
  const row = (label: string, perUnit: number, hint: string): ReferenceCost => ({
    label, perUnit, hint,
    deltaPct: quoted === 0 ? 0 : ((perUnit - quoted) / quoted) * 100,
  });
  /* Her labels, including the two that say `price` where the other three say
     `cost`. They are not ours to tidy. */
  return [
    row('Standard price', quoted, 'What this run came to, per board.'),
    row('Target price', target, 'What the program is aiming at.'),
    row('Highest cost', highest, 'The most this assembly has cost.'),
    row('Lowest cost', lowest, 'The least this assembly has cost.'),
    row('Last PO cost', lastPo, 'What the last purchase order paid.'),
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
  return [
    { id: 'material', saleType: 'Materials', locked: true,
      unitPrice: r.costPerBoard, qty: r.buildQty },
    { id: 'labour', saleType: 'Labour',
      unitPrice: numBy(r.id, 'labour', 1.2, 6.4, 0.05), qty: r.buildQty },
    { id: 'consulting', saleType: 'Consulting',
      unitPrice: numBy(r.id, 'consult', 250, 1800, 25), qty: 1 },
  ];
}

export const lineAmount = (l: OtherCostLine) => l.unitPrice * l.qty;

/** Subtotal, markup and total quoted — the row across the foot of the window. */
export function otherCostTotals(lines: OtherCostLine[], markupPct: number) {
  const subtotal = lines.reduce((n, l) => n + lineAmount(l), 0);
  const markup = subtotal * (markupPct / 100);
  return { subtotal, markup, totalQuoted: subtotal + markup };
}

/** A new row, for Add a line. Starts on a type the quote has no line for. */
export function emptyCostLine(existing: OtherCostLine[]): OtherCostLine {
  const free = SALE_TYPES.filter(t => t !== 'Materials' && !existing.some(l => l.saleType === t));
  return {
    id: `line-${Date.now().toString(36)}`,
    saleType: free[0] ?? 'Other',
    unitPrice: 0,
    qty: 1,
  };
}
