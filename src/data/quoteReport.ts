import { totalQtyOf, type BomLine } from './bom';
import type { QuoteResult } from './quotations';
import type { ResultSetup } from './quoteRun';

/**
 * The quoting report — three sheets, as guideline 2.1 §5 specifies it.
 *
 * NOT ONE SHEET OF THE GRID. Every other export in this app maps one screen to
 * one sheet, which is right for a list and wrong for this: the report is what
 * the quoting team sends on, and the live system's own guideline describes it
 * in detail.
 *
 *   Sheet 1 · Summary     the cost, then the four groups that need attention.
 *   Sheet 2 · Detail      every quoted line with its supplier and price.
 *   Sheet 3 · Supporting  every offer the marketplace returned, so a reader
 *                         can check WHY a supplier was picked.
 *
 * TWO OF THE FOUR GROUPS ARE NOT IN THE TOTAL, and the guideline says so twice:
 * "Lines in No Bid and EOL / NRND / Obsolete are not included in the total
 * cost. Check them before you send the quote to the customer." A report whose
 * total silently omits lines is a report that has to say which ones.
 */

/* Kendo's workbook shape. Typed here rather than imported because the export
   component takes it structurally and we only use the handful of keys below. */
type Cell = {
  value?: string | number | Date | boolean | null;
  bold?: boolean; italic?: boolean; colSpan?: number;
  background?: string; color?: string; format?: string;
  textAlign?: 'left' | 'center' | 'right';
};
type Sheet = { name: string; columns?: { width: number }[]; rows: { cells: Cell[] }[] };

const MONEY = '"$"#,##0.000000';
const MONEY2 = '"$"#,##0.00';
const INT = '#,##0';

/* The report's own palette: a heading band, and a tint for the group that is
   excluded from the total. Hex without the alpha, which is all Kendo takes. */
const HEAD_BG = '#eef2f9';
const WARN_BG = '#fdf3e0';
const OUT_BG = '#fdecea';

const head = (text: string, span = 1): { cells: Cell[] } => ({
  cells: [{ value: text, bold: true, background: HEAD_BG, colSpan: span }],
});
const blank = (): { cells: Cell[] } => ({ cells: [{ value: null }] });

/** A line nobody bid on: no supplier was selected for it. */
const isNoBid = (l: BomLine) => l.supplier === '';
/** A supplier was selected but cannot cover the quantity. */
const isShort = (l: BomLine) => !isNoBid(l) && l.outStock > 0;
/** Bought more than the build needs, because of MOQ or package size. */
const isExcess = (l: BomLine) => l.excessAmt > 0;

export function quoteReportWorkbook(
  { rfqNo, assembly, result, setup, lines }: {
    rfqNo: string; assembly: string;
    result: QuoteResult; setup: ResultSetup; lines: BomLine[];
  },
): { sheets: Sheet[] } {
  const markup = 1 + result.markupPct / 100;
  const excess = lines.filter(isExcess);
  const short = lines.filter(isShort);
  const noBid = lines.filter(isNoBid);
  const qtyOf = (l: BomLine) => totalQtyOf(l, setup.buildQty, setup.attritionSet);

  /* ---- Sheet 1 · Summary ------------------------------------------------ */
  const summary: Sheet = {
    name: 'Summary',
    columns: [{ width: 220 }, { width: 150 }, { width: 110 }, { width: 110 },
              { width: 110 }, { width: 110 }, { width: 110 }],
    rows: [
      { cells: [{ value: `Quoting report · RFQ${rfqNo}`, bold: true, colSpan: 4 }] },
      { cells: [{ value: assembly }, { value: `${result.lastRunVersion} · ${result.lastRunBy}` }] },
      { cells: [{ value: 'Quote Focus' }, { value: setup.quoteFocus },
                { value: 'Build Qty' }, { value: setup.buildQty, format: INT }] },
      { cells: [{ value: 'Package Type' }, { value: setup.packageType },
                { value: 'Attrition Set' }, { value: setup.attritionSet, format: INT }] },
      { cells: [{ value: 'Excess and MOQ' }, { value: setup.excessMoq },
                { value: 'Primary Provider' }, { value: setup.provider }] },
      blank(),

      head('Cost', 4),
      { cells: [{ value: '' }, { value: 'Without markup', bold: true, textAlign: 'right' },
                { value: `With markup (${result.markupPct}%)`, bold: true, textAlign: 'right' }] },
      { cells: [{ value: 'Per board' },
                { value: result.costPerBoard, format: MONEY },
                { value: result.costPerBoard * markup, format: MONEY }] },
      { cells: [{ value: 'Total' },
                { value: result.totalAmount, format: MONEY2 },
                { value: result.totalWithMarkup, format: MONEY2, bold: true }] },
      { cells: [{ value: 'Excess amount' }, { value: null },
                { value: lines.reduce((n, l) => n + l.excessAmt, 0), format: MONEY2 }] },
      blank(),

      /* ---- Excess -------------------------------------------------------- */
      head(`Excess — ${excess.length} ${excess.length === 1 ? 'line' : 'lines'} (cost included)`, 7),
      { cells: ['Part', 'MPN', 'Supplier', 'Order Qty', 'Total Qty', 'Excess qty', 'Excess amount']
          .map(v => ({ value: v, bold: true })) },
      ...(excess.length ? excess.map(l => ({
        cells: [
          { value: l.part }, { value: l.mpn }, { value: l.supplier },
          { value: l.orderQty, format: INT },
          { value: qtyOf(l), format: INT },
          { value: Math.max(0, l.orderQty - qtyOf(l)), format: INT },
          { value: l.excessAmt, format: MONEY2, background: WARN_BG },
        ] as Cell[],
      })) : [{ cells: [{ value: 'None.', italic: true }] }]),
      blank(),

      /* ---- No Stock ------------------------------------------------------ */
      head(`No Stock — ${short.length} ${short.length === 1 ? 'line' : 'lines'} (cost included)`, 7),
      { cells: ['Part', 'MPN', 'Supplier', 'In Stock', 'Out Stock', 'MOQ', 'Lead Days']
          .map(v => ({ value: v, bold: true })) },
      ...(short.length ? short.map(l => ({
        cells: [
          { value: l.part }, { value: l.mpn }, { value: l.supplier },
          { value: l.stock, format: INT },
          { value: l.outStock, format: INT, background: WARN_BG },
          { value: l.moq, format: INT }, { value: l.lt, format: INT },
        ] as Cell[],
      })) : [{ cells: [{ value: 'None.', italic: true }] }]),
      blank(),

      /* ---- No Bid -------------------------------------------------------- */
      head(`No Bid — ${noBid.length} ${noBid.length === 1 ? 'line' : 'lines'} (cost NOT included)`, 7),
      { cells: ['Part', 'Description', 'MFG', 'MPN', 'Total Qty']
          .map(v => ({ value: v, bold: true })) },
      ...(noBid.length ? noBid.map(l => ({
        cells: [
          { value: l.part, background: OUT_BG }, { value: l.description },
          { value: l.mfg }, { value: l.mpn }, { value: qtyOf(l), format: INT },
        ] as Cell[],
      })) : [{ cells: [{ value: 'None.', italic: true }] }]),
      blank(),

      /* ---- EOL / NRND / Obsolete ----------------------------------------- */
      head('EOL / NRND / Obsolete (cost NOT included)', 7),
      /* SAID, NOT FAKED. The guideline lists this group and the prototype has
         no lifecycle status to fill it from — the marketplace returns one and
         our seeded data does not carry it. An empty section would read as "no
         obsolete parts", which is a claim nobody has checked. */
      { cells: [{ value: 'Lifecycle status is not modelled in this prototype — '
                       + 'the live report fills this from the marketplace.', italic: true, colSpan: 7 }] },
      blank(),
      { cells: [{ value: 'No Bid and EOL / NRND / Obsolete lines are not included in the '
                       + 'total cost. Check them before sending the quote.', italic: true, colSpan: 7 }] },
    ],
  };

  /* ---- Sheet 2 · Detail -------------------------------------------------- */
  const detail: Sheet = {
    name: 'Detail',
    columns: [{ width: 130 }, { width: 220 }, { width: 90 }, { width: 130 }, { width: 170 },
              { width: 120 }, { width: 90 }, { width: 90 }, { width: 90 }, { width: 80 },
              { width: 80 }, { width: 110 }, { width: 110 }, { width: 110 }],
    rows: [
      { cells: ['Part', 'Description', 'Total Qty', 'MFG', 'MPN', 'Supplier', 'Order Qty',
                'Stock', 'Out Stock', 'Pkg.', 'MOQ', 'Unit Price', 'Ext. Price', 'Excess AMT']
          .map(v => ({ value: v, bold: true, background: HEAD_BG })) },
      ...lines.map(l => {
        /* Red for a No Bid row, which is the guideline's own instruction for
           this sheet: "Lines in red are No Bid." */
        const bg = isNoBid(l) ? OUT_BG : undefined;
        return {
          cells: [
            { value: l.part, background: bg }, { value: l.description, background: bg },
            { value: qtyOf(l), format: INT, background: bg },
            { value: l.mfg, background: bg }, { value: l.mpn, background: bg },
            { value: l.supplier || 'No Bid', background: bg },
            { value: l.supplier ? l.orderQty : null, format: INT, background: bg },
            { value: l.supplier ? l.stock : null, format: INT, background: bg },
            { value: l.supplier ? l.outStock : null, format: INT, background: bg },
            { value: l.pkg || null, background: bg },
            { value: l.supplier ? l.moq : null, format: INT, background: bg },
            { value: l.supplier ? l.unitPrice : null, format: MONEY, background: bg },
            { value: l.supplier ? l.amount : null, format: MONEY2, background: bg },
            { value: l.excessAmt || null, format: MONEY2, background: bg },
          ] as Cell[],
        };
      }),
    ],
  };

  /* ---- Sheet 3 · Supporting ---------------------------------------------- */
  const supporting: Sheet = {
    name: 'Supporting',
    columns: [{ width: 130 }, { width: 130 }, { width: 170 }, { width: 120 }, { width: 110 },
              { width: 90 }, { width: 80 }, { width: 80 }, { width: 90 }, { width: 90 }],
    rows: [
      { cells: [{ value: 'Every offer the marketplace returned for the quoted lines. '
                       + 'Use it to check why a supplier was picked.', italic: true, colSpan: 10 }] },
      { cells: ['Part', 'MFG', 'MPN', 'Supplier', 'Unit Price', 'Stock', 'MOQ', 'Pkg.',
                'Lead Days', 'Picked']
          .map(v => ({ value: v, bold: true, background: HEAD_BG })) },
      ...lines.flatMap(l => (l.offers ?? []).map(o => ({
        cells: [
          { value: l.part }, { value: l.mfg }, { value: l.mpn },
          { value: o.supplier },
          { value: o.unitPrice, format: MONEY },
          { value: o.stock, format: INT }, { value: o.moq, format: INT },
          { value: o.pkg }, { value: o.lt, format: INT },
          /* The one that won, so the sheet answers its own question. */
          { value: o.supplier === l.supplier ? 'Yes' : '',
            bold: o.supplier === l.supplier },
        ] as Cell[],
      }))),
    ],
  };

  return { sheets: [summary, detail, supporting] };
}
