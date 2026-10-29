import { useMemo, useState } from 'react';
import { MiniTable } from '../../../ui/MiniTable';
import { useColumnChoice } from '../../../ui/useColumnChoice';
import { ColumnChooser } from '../../../ui/ColumnChooser';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Overlays';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import { rowTone } from './StepQuoting';
import {
  costSummary, totalQtyOf, money, money3,
  type BomLine, type LineStatus,
} from '../../../data/bom';
import { setupOf, type RunConfig } from './state';
import { SmartIcon } from '../SmartButtons';

const STATUSES: LineStatus[] = ['COVER', 'NO', 'N/A', 'NO BID'];

/**
 * Step 4 — Summary.
 *
 * Everything is read-only except Status, which the guideline singles out: "The
 * user can update another valid option in the Status" while "All other BOM line
 * information is displayed as read-only". That asymmetry is the point of the
 * step — the numbers are settled, and what remains is deciding which lines you
 * are actually bidding.
 */
export function StepSummary({ cfg, lines, run, onAddPackage, setLines }: {
  cfg: RunConfig; lines: BomLine[];
  run: { by: string; date: string; version: number; pricedAt?: string };
  onAddPackage: () => void;
  setLines: (fn: (l: BomLine[]) => BomLine[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [noBid, setNoBid] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [excess, setExcess] = useState(false);

  const cost = costSummary(lines, cfg.markup);

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return lines.filter(l => {
      if (k && ![l.part, l.description, l.mpn, l.mfg, l.supplier]
        .some(v => v.toLowerCase().includes(k))) return false;
      /* "the system displays only BOM lines that do not have a selected
         Supplier" — by supplier, not by status, which is what the guideline
         says even though NO BID lines are the obvious reading. */
      if (noBid && l.supplier !== '') return false;
      if (notEnough && l.status !== 'NO') return false;
      if (excess && !(l.excessAmt > 0)) return false;
      return true;
    });
  }, [lines, search, noBid, notEnough, excess]);

  const columns = summaryColumns(cfg, (id, status) =>
    setLines(ls => ls.map(l => (l.id === id ? { ...l, status } : l))));
  /* Locked = the frozen block, so the two cannot disagree — see useColumnChoice. */
  const { shown: shownColumns, chooser } =
    useColumnChoice(columns, { locked: 3, storageKey: 'vy.cols.summary' });

  return (
    <div className="vy-run-step">
      {/* THE RUN, NOT THE SETUP. On steps 2 and 3 this strip is what the quote
          will be computed from; here it is what it WAS computed from, and the
          version is the thing a reader needs first — a quotation is sent,
          revised and sent again, and "which one am I looking at" has to be
          answerable from the top of the screen. */}
      <QuoteContextBar
        heading={`Quote Run · Version ${run.version || 1}`}
        assembly={`${cfg.assemblyPartNumber} - ${cfg.partRev}`}
        description={cfg.partDesc}
        applied={setupOf(cfg)}
        extra={[
          /* Prices and the run are not the same event: Update Results re-runs
             the arithmetic without asking the marketplace again, so a quote can
             be newer than the prices in it. */
          { label: 'Prices From', value: run.pricedAt || 'No prices · zero quote' },
          { label: 'Run by', value: run.by },
          { label: 'Run Date', value: run.date },
        ]}
      />

      {/* A MATRIX, NOT A LIST — 21 Oct, following the customer's mockup. The
          five figures were five rows of a definition list: Cost/Board,
          Cost/Board with Markup, Total Cost, Total Cost with Markup, Excess
          Amount. Four of those are ONE measure under two conditions, and a
          list makes the reader pair them up by reading the labels. A table
          says it in its shape: two rows, two columns, and the markup is a
          column heading rather than a suffix repeated twice.

          Excess Amount keeps its own row under the rule, because it is not a
          third way of measuring the same material — it is money spent on
          material the build does not consume. */}
      <section className="vy-cost-card vy-cost-card--wide">
        <h3 className="vy-field-group-title">
            <SmartIcon name="finance" />Cost Estimation
          </h3>
        <table className="vy-cost-table">
          <thead>
            <tr>
              <th scope="col"><span className="vy-sr-only">Measure</span></th>
              <th scope="col">Without Markup</th>
              <th scope="col">With Markup ({cfg.markup}%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Per Board</th>
              <td>{money3(cost.costBoard)}</td>
              <td>{money3(cost.costBoardMarkup)}</td>
            </tr>
            <tr>
              <th scope="row">Total</th>
              <td>{money(cost.totalCost)}</td>
              <td data-emphasis>{money(cost.totalCostMarkup)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Excess Amount</th>
              <td />
              {/* Red only when there IS excess: $0.00 in red reads as a problem
                  that has been found, and finding none is the good outcome. */}
              <td data-tone={cost.excessAmount > 0 ? 'excess' : undefined}>
                {money(cost.excessAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
        {/* "The Add Package button is displayed below the cost summary section." */}
        <Button onClick={onAddPackage} title="Add a packaging part to this quotation">
          Add Package
        </Button>
      </section>

      {/* COLUMNS, LIKE THE OTHER THREE GRIDS — 28 Oct. The standard asks for
          the chooser on "every list or grid with 3+ columns"; steps 2 and 3
          had it, this one and the saved-result view did not, with no note
          saying why. An asked whether this grid needs it; it has twenty-one
          columns and a frozen block of three, which is precisely the case the
          rule was written for. Locked = frozen, as everywhere else. */}
      <QuoteToolbar
        search={search} onSearch={setSearch}
        placeholder="Search by Part / Description / MPN / MFG / Supplier"
        filters={[
          { key: 'nobid', label: 'No Bid', on: noBid, onToggle: setNoBid,
            count: lines.filter(l => l.supplier === '').length },
          { key: 'qty', label: 'Not Enough Qty', on: notEnough, onToggle: setNotEnough,
            count: lines.filter(l => l.status === 'NO').length },
          { key: 'excess', label: 'Excess Qty', on: excess, onToggle: setExcess,
            count: lines.filter(l => l.excessAmt > 0).length },
        ]}
        trailing={<ColumnChooser {...chooser} />}
      />

      {/* NO PER-COLUMN FILTER ROW. The step already carries a search box and
          the filters that matter for it, so the grid's own row filtered the
          same rows a second way and cost 48px of a grid the customer told us
          was too short. The guideline asks for filter cells on the Part
          record's BoM Components tab; it does not ask for them here.

          THIS SAID SO AND DID NOT DO IT, until 21 Oct. The element above was
          self-closed and the comment and `filterable` were left outside it, so
          two things happened on every visit to step 4: the filter row the note
          forbids was rendered, and the note itself was printed on screen as a
          paragraph of source code. Found by opening step 4 on a draft — it is
          three clicks deep, and no check we run walks that far. */}
      <MiniTable data={shown} columns={shownColumns} freeze={3} rowTone={rowTone}
                 filterable={false} empty={<NoRecords />} />
    </div>
  );
}

/**
 * Step 4's columns (r250).
 *
 * Nearly step 3's list, with two differences the guideline states: "out stock"
 * appears between Stock and LT, and Excess splits into Excess Qty and Excess
 * AMT. Written out rather than derived from step 3's array, because the two
 * lists genuinely differ and a shared list with conditionals would hide that.
 */
function summaryColumns(cfg: RunConfig,
                        setStatus: (id: number, s: LineStatus) => void): ColumnSpec<BomLine>[] {
  const dash = <span className="vy-empty">—</span>;
  const hide = (l: BomLine, node: React.ReactNode) => (l.excluded ? dash : node);
  return [
    { field: 'part', title: 'Part', role: 'ident', width: 180,
      widthNote: 'Frozen; part numbers must not truncate.',
      render: l => (
        <span className="vy-ident vy-tagged">
          {l.part}{l.isPackage && <span className="vy-pill vy-pill--sm">Package</span>}
        </span>
      ) },
    { field: 'revision', title: 'Revision', role: 'code', width: 96 },
    { field: 'description', title: 'Description', role: 'text' },
    { field: 'mfg', title: 'MFG', role: 'text', width: 170,
      widthNote: 'Manufacturer names run long.' },
    { field: 'mpn', title: 'MPN', role: 'ident', width: 200,
      widthNote: 'Manufacturer part numbers are long.',
      render: l => l.mpn ? <span className="vy-code">{l.mpn}</span> : dash },
    { field: 'qty', title: 'Qty', role: 'number', width: 90, render: l => l.qty.toLocaleString() },
    { field: 'attrition', title: 'Attrition', role: 'number', width: 100 },
    { field: 'number', title: 'Total Qty', role: 'number', width: 110,
      widthNote: 'A computed total, larger than the per-board quantity.',
      render: l => totalQtyOf(l, cfg.buildQty, cfg.attritionSet).toLocaleString() },
    { field: 'supplier', title: 'Supplier', role: 'text', width: 150,
      render: l => hide(l, l.supplier || dash) },
    { field: 'orderQty', title: 'Order Qty', role: 'number', width: 110,
      render: l => hide(l, l.orderQty.toLocaleString()) },
    { field: 'stock', title: 'Stock', role: 'number', width: 110,
      render: l => hide(l, l.stock ? l.stock.toLocaleString() : dash) },
    { field: 'outStock', title: 'Out Stock', role: 'number', width: 110,
      widthNote: 'The shortfall, and the reason a line is NO.',
      render: l => hide(l, l.outStock ? l.outStock.toLocaleString() : dash) },
    { field: 'lt', title: 'LT', role: 'number', width: 80,
      render: l => hide(l, l.lt ? String(l.lt) : dash) },
    { field: 'pkg', title: 'Pkg.', role: 'code', width: 110, render: l => hide(l, l.pkg || dash) },
    { field: 'moq', title: 'MOQ', role: 'number', width: 100,
      render: l => hide(l, l.moq.toLocaleString()) },
    { field: 'unitPrice', title: 'Unit Price', role: 'money', width: 116,
      render: l => hide(l, l.unitPrice ? money3(l.unitPrice) : dash) },
    { field: 'amount', title: 'Amount', role: 'money', width: 120,
      render: l => hide(l, l.amount ? money(l.amount) : dash) },
    { field: 'excessQty', title: 'Excess Qty', role: 'number', width: 116,
      render: l => hide(l, l.excessQty.toLocaleString()) },
    { field: 'excessAmt', title: 'Excess AMT', role: 'money', width: 130,
      render: l => hide(l, money3(l.excessAmt)) },
    {
      field: 'status', title: 'Status', role: 'status', width: 140,
      widthNote: 'Holds a picker, not a badge — the one editable field here.',
      render: l => (
        <Select label={`Status for ${l.part}`} value={l.status}
                options={STATUSES}
                onChange={v => setStatus(l.id, v as LineStatus)} />
      ),
    },
    { field: 'notes', title: 'Notes', role: 'text', width: 200,
      widthNote: 'Free text carried from the quoting step.',
      render: l => hide(l, l.notes || dash) },
  ];
}
