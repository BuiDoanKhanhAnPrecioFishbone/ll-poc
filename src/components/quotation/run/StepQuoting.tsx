import { useMemo, useState } from 'react';
import { MiniTable } from '../../../ui/MiniTable';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Overlays';
import { TextField } from '../../../ui/Field';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import {
  PRIMARY_PROVIDERS, totalQtyOf, money, money3,
  type BomLine, type PrimaryProvider,
} from '../../../data/bom';
import type { RunConfig } from './state';

const SUPPLIERS = ['', 'Digi-Key', 'Mouser', 'Arrow', 'Avnet', 'Farnell', 'TTI'];

/**
 * Step 3 — Quoting.
 *
 * The only step that costs money to run, so nothing here happens implicitly:
 * Run Quote is a button, Apply is a button, and changing Build Qty without
 * pressing Apply changes nothing. The guideline is unusually explicit about
 * that last point — "If the user changes these values but does not click Apply,
 * the changes are not saved or carried to the next steps" — so the pending
 * values are held apart from the applied ones and the difference is shown.
 */
export function StepQuoting({ cfg, set, lines, setLines, hasRun, onRun, onApply, onAddAttrition, onApplyPriceRange }: {
  cfg: RunConfig; set: (patch: Partial<RunConfig>) => void;
  lines: BomLine[]; setLines: (fn: (l: BomLine[]) => BomLine[]) => void;
  hasRun: boolean;
  onRun: () => void;
  onApply: () => void;
  onAddAttrition: () => void;
  onApplyPriceRange: () => void;
}) {
  const [search, setSearch] = useState('');
  const [noSupplier, setNoSupplier] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [missingAttr, setMissingAttr] = useState(false);

  const quoted = lines.filter(l => !l.excluded);

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return lines.filter(l => {
      if (k && ![l.part, l.description, l.mpn, l.mfg, l.supplier]
        .some(v => v.toLowerCase().includes(k))) return false;
      /* All three filters describe what the RUN produced, so before it they
         have nothing to select and are disabled rather than returning nothing. */
      if (noSupplier && (l.excluded || l.supplier !== '')) return false;
      if (notEnough && l.status !== 'NO') return false;
      if (missingAttr && (l.excluded || l.attrition > 0)) return false;
      return true;
    });
  }, [lines, search, noSupplier, notEnough, missingAttr]);

  const edit = (id: number, patch: Partial<BomLine>) =>
    setLines(ls => ls.map(l => (l.id === id ? { ...l, ...patch } : l)));

  const columns = quotingColumns(cfg, hasRun, edit);

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
        onBuildQty={n => set({ buildQty: n })}
        onAttritionSet={n => set({ attritionSet: n })}
      />

      <div className="vy-quote-run-bar">
        <label className="vy-inline-field">
          <span>Primary Provider</span>
          <Select label="Primary Provider" value={cfg.provider}
                  options={[...PRIMARY_PROVIDERS]}
                  onChange={v => set({ provider: v as PrimaryProvider })} />
        </label>

        {/* "The action buttons are displayed in the following order from left to
            right: Run Quote, Apply, Add Attrition, Apply Price Range. Run Quote
            is displayed as the primary button. Apply, Add Attrition, and Apply
            Price Range are displayed as secondary buttons." */}
        <div className="vy-run-actions">
          <Button variant="filled" onClick={onRun}
                  title={`Price every line through ${cfg.provider}, falling back to the other provider`}>
            {hasRun ? 'Re-run Quote' : 'Run Quote'}
          </Button>
          <Button onClick={onApply} title="Recalculate Total Qty from Build Qty and Attrition Set">
            Apply
          </Button>
          <Button onClick={onAddAttrition} title="Set attrition on the lines that have none">
            Add Attrition
          </Button>
          <Button onClick={onApplyPriceRange} title="Apply the configured Attrition Info price ranges">
            Apply Price Range
          </Button>
        </div>
      </div>

      <div className="vy-run-banner" data-tone={hasRun ? 'ok' : 'info'}>
        {!hasRun
          ? <><strong>Please run quotation for continue process!</strong>{' '}
              Pricing, availability and suppliers stay blank until the quote runs — the columns
              in red below are the ones waiting on it.</>
          : <><strong>{quoted.filter(l => l.status === 'COVER').length} of {quoted.length} lines
              covered.</strong>{' '}
              {quoted.filter(l => l.status === 'N/A').length} without a supplier,{' '}
              {quoted.filter(l => l.status === 'NO').length} short on quantity. Anything left
              unselected becomes NO BID when you continue.</>}
      </div>

      <QuoteToolbar
        search={search} onSearch={setSearch}
        placeholder="Search by Part / Description / MPN / MFG / Supplier"
        filters={[
          { key: 'sup', label: 'Unselected Supplier', on: noSupplier, onToggle: setNoSupplier,
            count: hasRun ? quoted.filter(l => !l.supplier).length : undefined },
          { key: 'qty', label: 'Not enough qty', on: notEnough, onToggle: setNotEnough,
            count: hasRun ? quoted.filter(l => l.status === 'NO').length : undefined },
          { key: 'att', label: 'Missing Attrition', on: missingAttr, onToggle: setMissingAttr,
            count: quoted.filter(l => l.attrition === 0).length },
        ]}
      />

      <MiniTable
        data={shown}
        columns={columns}
        freeze={4}
        rowTone={l => rowTone(l, hasRun)}
        empty={<NoRecords />}
      />
    </div>
  );
}

/**
 * Row colour, and what each one means.
 *
 *   grey    excluded on step 2 — NO BID, carries no pricing
 *   red     no supplier found — N/A
 *   yellow  a supplier exists but cannot cover the quantity — NO
 *   green   priced and covered — COVER
 *
 * Straight from the guideline (r176-r185). Deliberately NOT a "severity" scale:
 * yellow is not "half of red", it is a different problem with a different fix.
 */
export function rowTone(l: BomLine, hasRun = true): string | undefined {
  /* Grey applies immediately — a line excluded on step 2 is excluded now. */
  if (l.excluded) return 'excluded';
  /* The other three describe what the RUN found, and the guideline lists them
     under "6.3. After Run Quote". Before it, every line sits at the default
     Status = N/A, so colouring by status painted the entire grid red and made
     "no supplier found" indistinguishable from "not asked yet". */
  if (!hasRun) return undefined;
  if (l.status === 'N/A') return 'no-supplier';
  if (l.status === 'NO') return 'short';
  if (l.status === 'COVER') return 'covered';
  return undefined;
}

/**
 * The 21 columns, in the guideline's order (r169).
 *
 * Before the run, twelve of them carry a red background — "The following
 * columns have a red background color by default: MPN, Order Qty, Stock, LT,
 * Pkg., MOQ, Excess, Unit Price, AMT, Excess AMT, Status, Notes". That is the
 * screen telling you what the run is for, which is why it is worth honouring
 * rather than leaving them plainly blank.
 */
function quotingColumns(cfg: RunConfig, hasRun: boolean,
                        edit: (id: number, patch: Partial<BomLine>) => void): ColumnSpec<BomLine>[] {
  /* An excluded line "displays only the following information: Part, Revision,
     Source, Description, MFG, MPN, Qty, Total Qty" — everything else is blank
     on those rows rather than showing a zero that could be read as a price. */
  const hideIfExcluded = (l: BomLine, node: React.ReactNode) =>
    l.excluded ? <span className="vy-empty">—</span> : node;

  /** Red until the run fills it in. */
  const pending = (l: BomLine) => (!hasRun && !l.excluded ? 'pending' : undefined);

  return [
    { field: 'part', title: 'Part', role: 'ident', width: 180,
      widthNote: 'Frozen, so it pays for itself; part numbers must not truncate.' },
    { field: 'revision', title: 'Revision', role: 'code', width: 96 },
    { field: 'partSource', title: 'Source', role: 'code', width: 120,
      widthNote: 'Longest value is "MAKE/PHANT".' },
    { field: 'description', title: 'Description', role: 'text' },
    { field: 'mfg', title: 'MFG', role: 'text', width: 170,
      widthNote: 'Manufacturer names run long.' },
    {
      field: 'mpn', title: 'MPN', role: 'ident', width: 210,
      widthNote: 'Editable, and manufacturer part numbers are long.',
      tone: pending,
      /* One of the five fields the guideline lets the user edit here. */
      render: l => hideIfExcluded(l,
        <TextField className="vy-cell-input" aria-label={`MPN for ${l.part}`} value={l.mpn}
                   onChange={e => edit(l.id, { mpn: e.target.value })} />),
    },
    { field: 'qty', title: 'Qty', role: 'number', width: 90,
      render: l => l.qty.toLocaleString() },
    {
      field: 'attrition', title: 'Attrition', role: 'number', width: 110,
      widthNote: 'Editable, so it holds a control rather than a number.',
      /* "When the Attrition value is changed, the system automatically
          recalculates the Total Qty accordingly" — which happens for free,
          since Total Qty is computed from it rather than stored.
          "If the user enters an Attrition value less than 0, the system
          automatically resets the value to 0." */
      render: l => hideIfExcluded(l,
        <TextField className="vy-cell-input" type="number" min={0} value={String(l.attrition)}
                   aria-label={`Attrition for ${l.part}`}
                   onChange={e => edit(l.id, { attrition: Number(e.target.value) })}
                   onBlur={e => { if (Number(e.target.value) < 0) edit(l.id, { attrition: 0 }); }} />),
    },
    { field: 'outStock', title: 'Total Qty', role: 'number', width: 110,
      widthNote: 'A computed total, larger than the per-board quantity.',
      render: l => totalQtyOf(l, cfg.buildQty, cfg.attritionSet).toLocaleString() },
    {
      field: 'supplier', title: 'Supplier', role: 'text', width: 150,
      render: l => hideIfExcluded(l,
        <Select label={`Supplier for ${l.part}`} value={l.supplier}
                options={SUPPLIERS}
                onChange={v => edit(l.id, { supplier: v })} />),
    },
    {
      field: 'orderQty', title: 'Order Qty', role: 'number', width: 116,
      tone: pending,
      /* "If the user enters an Order Qty value less than 0, the system
         automatically resets the value to 0." */
      render: l => hideIfExcluded(l,
        <TextField className="vy-cell-input" type="number" min={0} value={String(l.orderQty)}
                   aria-label={`Order quantity for ${l.part}`}
                   onChange={e => edit(l.id, { orderQty: Number(e.target.value) })}
                   onBlur={e => { if (Number(e.target.value) < 0) edit(l.id, { orderQty: 0 }); }} />),
    },
    { field: 'stock', title: 'Stock', role: 'number', width: 110, tone: pending,
      render: l => hideIfExcluded(l, l.stock ? l.stock.toLocaleString() : <span className="vy-empty">—</span>) },
    { field: 'lt', title: 'LT', role: 'number', width: 80, tone: pending,
      render: l => hideIfExcluded(l, l.lt ? String(l.lt) : <span className="vy-empty">—</span>) },
    { field: 'pkg', title: 'Pkg.', role: 'code', width: 110, tone: pending,
      render: l => hideIfExcluded(l, l.pkg || <span className="vy-empty">—</span>) },
    { field: 'moq', title: 'MOQ', role: 'number', width: 100, tone: pending,
      render: l => hideIfExcluded(l, l.moq.toLocaleString()) },
    { field: 'excessQty', title: 'Excess', role: 'number', width: 106, tone: pending,
      render: l => hideIfExcluded(l, l.excessQty.toLocaleString()) },
    { field: 'unitPrice', title: 'Unit Price', role: 'money', width: 116, tone: pending,
      render: l => hideIfExcluded(l, l.unitPrice ? money3(l.unitPrice) : <span className="vy-empty">—</span>) },
    { field: 'amount', title: 'AMT', role: 'money', width: 120, tone: pending,
      render: l => hideIfExcluded(l, l.amount ? money(l.amount) : <span className="vy-empty">—</span>) },
    { field: 'excessAmt', title: 'Excess AMT', role: 'money', width: 130, tone: pending,
      /* $0.000 is the guideline's stated default, three decimals and all. */
      render: l => hideIfExcluded(l, money3(l.excessAmt)) },
    { field: 'status', title: 'Status', role: 'status', width: 110, tone: pending,
      render: l => <span className="vy-line-status" data-status={l.status}>{l.status}</span> },
    {
      field: 'notes', title: 'Notes', role: 'text', width: 200,
      widthNote: 'Editable free text — a cramped note field goes unused.',
      tone: pending,
      render: l => hideIfExcluded(l,
        <TextField className="vy-cell-input" aria-label={`Notes for ${l.part}`} value={l.notes}
                   onChange={e => edit(l.id, { notes: e.target.value })} />),
    },
  ];
}
