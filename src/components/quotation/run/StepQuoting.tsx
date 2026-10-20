import { useMemo, useState } from 'react';
import { useColumnChoice } from '../../../ui/useColumnChoice';
import { ColumnChooser } from '../../../ui/ColumnChooser';
import { MiniTable } from '../../../ui/MiniTable';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Overlays';
import { MoreMenu } from '../../../ui/MoreMenu';
import { TextField } from '../../../ui/Field';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import {
  totalQtyOf, money, money3,
  type BomLine,
} from '../../../data/bom';
import { fmtDateTime } from '../../../ui/regional';
import { setupOf, type QuoteSetup, type RunConfig } from './state';

const SUPPLIERS = ['', 'Digi-Key', 'Mouser', 'Arrow', 'Avnet', 'Farnell', 'TTI'];

/**
 * Step 3 — Quoting.
 *
 * The only step that costs money to run, so nothing here happens implicitly,
 * and since 20 Oct that is true rather than merely claimed. The setup strip
 * writes to a PENDING copy; the grid reads the applied one. Editing Build Qty
 * moves nothing until the user presses something.
 *
 * THREE ACTIONS, WITH THREE DIFFERENT COSTS, named as the customer's Quoting
 * BoM mockup names them:
 *
 *   Get Prices       first call to the marketplace. Costs quota.
 *   Refresh Prices   another call, once prices exist. Costs quota, so it asks.
 *   Update Results   recompute from the prices already loaded. Costs nothing.
 *
 * Which one is primary is decided by the state, not by rank: with unapplied
 * edits, Update Results is the way forward and the price buttons are disabled —
 * fetching prices for a setup the user has already moved past would spend quota
 * on an answer to the wrong question.
 */
export function StepQuoting({
  cfg, lines, setLines, hasRun, pricedAt, pending, setPending, dirty,
  onGetPrices, onRefreshPrices, onUpdateResults, onAddAttrition, onApplyPriceRange,
}: {
  /** The APPLIED setup — what every number in the grid was computed from. */
  cfg: RunConfig;
  lines: BomLine[]; setLines: (fn: (l: BomLine[]) => BomLine[]) => void;
  hasRun: boolean;
  /** When the prices in the grid were fetched, for the age beside the actions. */
  pricedAt: Date | null;
  /** The setup being edited here, which reaches the grid only when applied. */
  pending: QuoteSetup;
  setPending: (patch: Partial<QuoteSetup>) => void;
  dirty: boolean;
  onGetPrices: () => void;
  onRefreshPrices: () => void;
  onUpdateResults: () => void;
  onAddAttrition: () => void;
  onApplyPriceRange: () => void;
}) {
  const [search, setSearch] = useState('');
  const [noSupplier, setNoSupplier] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [missingAttr, setMissingAttr] = useState(false);
  /* Quote Focus = Other: the run computes but does not choose. See runQuote. */
  const manual = cfg.quoteFocus === 'OTHER';

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

  /* The Columns chooser, and the frozen block as its locked set — see
     useColumnChoice. */
  const { shown: shownColumns, chooser } = useColumnChoice(columns, { locked: 4, storageKey: 'vy.cols.quoting' });

  /* A price older than a day is not wrong, but it is worth saying out loud on a
     screen whose numbers go into a customer quotation. The mockup draws the
     same line at 24 hours. */
  const stale = Boolean(pricedAt && Date.now() - pricedAt.getTime() > 24 * 3600 * 1000);

  return (
    <div className="vy-run-step">
      <QuoteContextBar
        assembly={`${cfg.assemblyPartNumber} - ${cfg.partRev}`}
        description={cfg.partDesc}
        applied={setupOf(cfg)}
        pending={pending}
        onPending={setPending}
      />

      {/* NO BANNER BEFORE THE RUN, since 20 Oct. It said "Please run quotation
          for continue process!" above a toolbar that now says "No prices yet"
          beside a primary Get Prices, and an empty grid that says the same
          thing a third time. Three statements of one fact, and the banner was
          the one costing a row of the BoM.

          The two states that remain are the ones carrying information the
          screen does not otherwise have: what Quote Focus = Other did, and how
          much of the BoM a finished run covered. */}
      {hasRun && (
        <div className="vy-run-banner" data-tone={manual ? 'info' : 'ok'}>
          {manual
            ? <><strong>Quote Focus is {cfg.quoteFocus} — suppliers are yours to choose.</strong>{' '}
                Quantities are computed; the system selected none.{' '}
                {quoted.filter(l => !l.supplier).length} of {quoted.length} lines still need one,
                and the Unselected Supplier filter below lists them. Choose a supplier, then
                Update Results to price the line. Anything left unselected becomes NO BID when
                you continue.</>
            : <><strong>{quoted.filter(l => l.status === 'COVER').length} of {quoted.length} lines
                covered.</strong>{' '}
                {quoted.filter(l => l.status === 'N/A').length} without a supplier,{' '}
                {quoted.filter(l => l.status === 'NO').length} short on quantity. Anything left
                unselected becomes NO BID when you continue.</>}
        </div>
      )}

      {/* ONE BAND. The Primary Provider and the four run buttons had a row of
          their own above the search; both rows act on the grid below, and step
          3 could not afford two — its grid was nine lines of a fifty-eight-line
          BoM. */}
      <QuoteToolbar
        trailing={<ColumnChooser {...chooser} />}
        /* THE PROVIDER IS NOT HERE ANY MORE. It sat at the head of this row,
           beside the button that spends it, which read as though choosing it
           did something; it is setup, so it lives on the setup strip with the
           rest of what a price request is made of. */
        actions={(
        <div className="vy-run-actions">
          {/* PRIMARY FOLLOWS THE STATE. With unapplied edits the way forward is
              Update Results, and both price buttons are disabled — spending
              quota on the setup the user has already typed past answers a
              question nobody asked. */}
          <Button variant={!dirty && !hasRun ? 'filled' : undefined} size="sm"
                  disabled={dirty}
                  onClick={hasRun ? onRefreshPrices : onGetPrices}
                  title={dirty
                    ? 'Apply the setup changes first — Update Results'
                    : hasRun
                      ? `Ask ${pending.provider} for new prices. Uses marketplace quota.`
                      : manual
                        ? `Get prices through ${pending.provider}. Quote Focus is ${pending.quoteFocus}, so no supplier is selected for you.`
                        : `Price every line through ${pending.provider}, falling back to the other provider`}>
            {hasRun ? 'Refresh Prices' : 'Get Prices'}
          </Button>
          <Button variant={dirty ? 'filled' : undefined} size="sm" disabled={!dirty}
                  onClick={onUpdateResults}
                  title={dirty
                    ? 'Recalculate with the prices already loaded — no marketplace request'
                    : 'Nothing to apply: the grid already uses this setup'}>
            Update Results
          </Button>
          {/* THE TWO RARE ONES GO BEHIND `More`, where the customer's mockup
              puts them and where the 8 Oct review asked for "less use actions"
              to live. Both act on attrition, both are pressed once a quote. */}
          <MoreMenu items={[
            { label: 'Add Attrition', onSelect: onAddAttrition,
              note: 'Set attrition on the lines that have none' },
            { label: 'Apply Price Range', onSelect: onApplyPriceRange,
              note: 'Apply the configured Attrition Info price ranges' },
          ]} />
          {/* HOW OLD THE PRICES ARE, beside the button that renews them. A
              marketplace price is a fact with a shelf life, and the only thing
              that made ours look current was that nothing said otherwise. */}
          <span className="vy-price-age" data-stale={stale || undefined}>
            {pricedAt ? `Prices updated ${fmtDateTime(pricedAt)}` : 'No prices yet'}
          </span>
        </div>
        )}
        search={search} onSearch={setSearch}
        placeholder="Search by Part / Description / MPN / MFG / Supplier"
        filters={[
          { key: 'sup', label: 'Unselected Supplier', on: noSupplier, onToggle: setNoSupplier },
          { key: 'qty', label: 'Not Enough Qty', on: notEnough, onToggle: setNotEnough },
          { key: 'att', label: 'Missing Attrition', on: missingAttr, onToggle: setMissingAttr },
        ]}
      />

      {/* THE COLOURS, SAID IN WORDS, as on step 2. Before the run this grid
          paints 240 cells, and until 15 Oct it painted them in the same red as
          a missing part — the fault we had written up against the live screen
          while shipping it ourselves. Grey says "waiting for the run"; red is
          kept for something that is actually wrong. */}
      <MiniTable
        data={shown}
        /* NO PER-COLUMN FILTER ROW. The step already carries a search box and
           the filters that matter for it, so the grid's own row filtered the
           same rows a second way and cost 48px of a grid the customer told us
           was too short. The guideline asks for filter cells on the Part
           record's BoM Components tab; it does not ask for them here. */
        filterable={false}
        columns={shownColumns}
        freeze={4}
        rowTone={l => rowTone(l, hasRun)}
        empty={shown.length === 0 && quoted.length > 0
          ? <NoRecords title="No lines match these filters."
                       hint="Clear a filter above to see the rest of the BoM." />
          : <NoRecords title="No quote results yet."
                       hint="Click Get Prices to price the BoM and pick a supplier for each part." />}
      />

      {/* THE COLOURS, SAID IN WORDS, under the grid they describe — where the
          standard puts a legend and where step 2 now carries its own. It used
          to live inside the pre-run banner, which meant it disappeared at the
          moment the grid started using three of the four colours. */}
      <ul className="vy-tone-legend">
        {!hasRun && (
          <li><span className="vy-tone-key" data-tone="pending" aria-hidden />
            Waiting for prices</li>
        )}
        <li><span className="vy-tone-key" data-tone="missing" aria-hidden />
          No supplier can cover this line</li>
        <li><span className="vy-tone-key" data-tone="short" aria-hidden />
          A supplier is selected but cannot cover the quantity</li>
      </ul>
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
  /* Grey applies immediately — a line excluded on step 2 is excluded now.
     It also covers a line that became NO BID on leaving step 3 for want of a
     supplier: same status, so the same colour. They arrive at it by different
     routes, but "this line is not being quoted" is one fact and showing it two
     ways would make the reader look for a difference that is not there. */
  if (l.excluded || l.status === 'NO BID') return 'excluded';
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
    { field: 'revision', title: 'Revision', role: 'code', width: 80,
      widthNote: 'A revision is one or two characters; the live column is 80.' },
    { field: 'partSource', title: 'Source', role: 'code', width: 100,
      widthNote: 'Longest value is "MAKE/PHANT".' },
    { field: 'description', title: 'Description', role: 'text', width: 200,
      widthNote: 'Descriptions outrun any width; the live column is 200 and '
        + 'this grid is the widest in the product.' },
    { field: 'mfg', title: 'MFG', role: 'text', width: 140,
      widthNote: 'Manufacturer names run long.' },
    {
      field: 'mpn', title: 'MPN', role: 'ident', width: 180,
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
      field: 'attrition', title: 'Attrition', role: 'number', width: 96,
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
    { field: 'outStock', title: 'Total Qty', role: 'number', width: 100,
      widthNote: 'A computed total, larger than the per-board quantity.',
      render: l => totalQtyOf(l, cfg.buildQty, cfg.attritionSet).toLocaleString() },
    {
      field: 'supplier', title: 'Supplier', role: 'text', width: 130,
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
    { field: 'stock', title: 'Stock', role: 'number', width: 100, tone: pending,
      render: l => hideIfExcluded(l, l.stock ? l.stock.toLocaleString() : <span className="vy-empty">—</span>) },
    { field: 'lt', title: 'LT', role: 'number', width: 80, tone: pending,
      render: l => hideIfExcluded(l, l.lt ? String(l.lt) : <span className="vy-empty">—</span>) },
    { field: 'pkg', title: 'Pkg.', role: 'code', width: 100, tone: pending,
      render: l => hideIfExcluded(l, l.pkg || <span className="vy-empty">—</span>) },
    { field: 'moq', title: 'MOQ', role: 'number', width: 100, tone: pending,
      render: l => hideIfExcluded(l, l.moq.toLocaleString()) },
    { field: 'excessQty', title: 'Excess', role: 'number', width: 106, tone: pending,
      render: l => hideIfExcluded(l, l.excessQty.toLocaleString()) },
    { field: 'unitPrice', title: 'Unit Price', role: 'money', width: 116, tone: pending,
      render: l => hideIfExcluded(l, l.unitPrice ? money3(l.unitPrice) : <span className="vy-empty">—</span>) },
    { field: 'amount', title: 'AMT', role: 'money', width: 120, tone: pending,
      render: l => hideIfExcluded(l, l.amount ? money(l.amount) : <span className="vy-empty">—</span>) },
    { field: 'excessAmt', title: 'Excess AMT', role: 'money', width: 116, tone: pending,
      /* $0.000 is the guideline's stated default, three decimals and all. */
      render: l => hideIfExcluded(l, money3(l.excessAmt)) },
    { field: 'status', title: 'Status', role: 'status', width: 110, tone: pending,
      render: l => <span className="vy-line-status" data-status={l.status}>{l.status}</span> },
    {
      field: 'notes', title: 'Notes', role: 'text', width: 140,
      widthNote: 'Editable free text — a cramped note field goes unused.',
      tone: pending,
      render: l => hideIfExcluded(l,
        <TextField className="vy-cell-input" aria-label={`Notes for ${l.part}`} value={l.notes}
                   onChange={e => edit(l.id, { notes: e.target.value })} />),
    },
  ];
}
