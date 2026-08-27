import { useMemo, useState } from 'react';
import { MiniTable } from '../../../ui/MiniTable';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Overlays';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import { rowTone } from './StepQuoting';
import {
  costSummary, totalQtyOf, money, money3,
  type BomLine, type LineStatus,
} from '../../../data/bom';
import type { RunConfig } from './state';

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
  run: { by: string; date: string; version: number };
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

  return (
    <div className="vy-run-step">
      <QuoteContextBar
        assembly={`${cfg.assemblyPartNumber} - ${cfg.partRev}`}
        description={cfg.partDesc}
        quoteFocus={cfg.quoteFocus}
        materialPackageType={cfg.materialPackageType}
        markup={cfg.markup}
        buildQty={cfg.buildQty}
        attritionSet={cfg.attritionSet}
        editable={false}
        extra={[
          { label: 'Run by', value: run.by },
          { label: 'Run Date', value: run.date },
          { label: 'Run Version', value: String(run.version) },
        ]}
      />

      <section className="vy-cost-card vy-cost-card--wide">
        <h3 className="vy-cost-title">Cost summary</h3>
        <dl className="vy-cost-grid">
          {/* Black for the cost figures, red for Excess Amount — the guideline
              asks for exactly that split, and it is a real distinction: excess
              is the money spent on material the build does not consume. */}
          <Cost label="Cost/Board" value={money3(cost.costBoard)} />
          <Cost label="Cost/Board with Markup" value={money3(cost.costBoardMarkup)} />
          <Cost label="Total Cost" value={money(cost.totalCost)} />
          <Cost label="Total Cost with Markup" value={money(cost.totalCostMarkup)} emphasis />
          <Cost label="Excess Amount" value={money(cost.excessAmount)} tone="excess" />
        </dl>
        {/* "The Add Package button is displayed below the cost summary section." */}
        <Button onClick={onAddPackage} title="Add a packaging part to this quotation">
          Add Package
        </Button>
      </section>

      <QuoteToolbar
        search={search} onSearch={setSearch}
        placeholder="Search by Part / Description / MPN / MFG / Supplier"
        filters={[
          { key: 'nobid', label: 'No bid', on: noBid, onToggle: setNoBid,
            count: lines.filter(l => !l.supplier).length },
          { key: 'qty', label: 'Not enough qty', on: notEnough, onToggle: setNotEnough,
            count: lines.filter(l => l.status === 'NO').length },
          { key: 'excess', label: 'Excess qty', on: excess, onToggle: setExcess,
            count: lines.filter(l => l.excessAmt > 0).length },
        ]}
      />

      <MiniTable data={shown} columns={columns} freeze={3} rowTone={rowTone} empty={<NoRecords />} />
    </div>
  );
}

function Cost({ label, value, emphasis, tone }: {
  label: string; value: string; emphasis?: boolean; tone?: string;
}) {
  return (
    <div className="vy-cost-row" data-emphasis={emphasis || undefined} data-tone={tone}>
      <dt>{label}</dt><dd>{value}</dd>
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
        <span className="vy-ident">
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
