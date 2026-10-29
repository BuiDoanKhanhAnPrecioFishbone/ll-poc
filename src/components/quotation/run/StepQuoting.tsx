import { useMemo, useState } from 'react';
import { useColumnChoice } from '../../../ui/useColumnChoice';
import { ColumnChooser } from '../../../ui/ColumnChooser';
import { MiniTable } from '../../../ui/MiniTable';
import { BusyOverlay } from '../../../ui/Loader';
import { Button } from '../../../ui/Button';
import { Select } from '../../../ui/Overlays';
import { MoreMenu } from '../../../ui/MoreMenu';
import { TextField } from '../../../ui/Field';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import {
  consignedQty, pickSupplier, totalQtyOf, money, money3,
  type BomLine,
} from '../../../data/bom';
import { fmtDateTime } from '../../../ui/regional';
import { setupOf, type QuoteSetup, type RunConfig } from './state';
import { amlPairs, amlRows, type AmlRow } from './amlRows';
import { SupplierDialog } from './SupplierDialog';
import { MpnPicker } from './MpnPicker';
import { SUPPLIERS as SUPPLIER_NAMES } from '../../../data/suppliers';

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
  cfg, lines, setLines, hasRun, pricedAt, pending, setPending, dirty, pricing,
  onGetPrices, onRefreshPrices, onUpdateResults, onAddAttrition, onApplyPriceRange, rfq,
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
  /**
   * A price request is in flight.
   *
   * THE ONE WAIT IN THIS PRODUCT THAT IS REALLY A WAIT. On the live system
   * this is a marketplace request across every line of the BoM — hundreds of
   * them — and it was the only long operation in the flow with nothing on
   * screen while it ran.
   */
  pricing: boolean;
  onGetPrices: () => void;
  onRefreshPrices: () => void;
  onUpdateResults: () => void;
  onAddAttrition: () => void;
  onApplyPriceRange: () => void;
  /** The RFQ's own values for the fields this quote carried from it. */
  rfq?: Partial<Record<'quoteFocus' | 'materialPackageType' | 'markup', string | number>>;
}) {
  const [suppliersOpen, setSuppliersOpen] = useState(false);
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
      /* EVERY manufacturer on the line, not just the first. The grid shows all
         of them on rows of their own now, so a search that only looked at the
         primary pair would hide a line whose SECOND source is the one the user
         typed. */
      if (k && ![l.part, l.description, l.supplier, ...amlPairs(l).flatMap(a => [a.mfg, a.mpn])]
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

  /* An MPN belongs to ONE manufacturer, so editing it has to know which row it
     was typed on: index 0 is the line's own pair, the rest are its alternates. */
  const editAml = (line: BomLine, index: number, mpn: string) =>
    setLines(ls => ls.map(l => {
      if (l.id !== line.id) return l;
      if (index === 0) return { ...l, mpn };
      return {
        ...l,
        alternates: l.alternates.map((a, i) => (i === index - 1 ? { ...a, mpn } : a)),
      };
    }));

  /* Choosing by hand re-prices the line from that offer — the quantity, the
     lead time and the excess all follow the supplier, so changing the name
     alone would leave five columns describing somebody else's terms. */
  const pickSupplierFor = (line: BomLine, name: string) => {
    const id = Object.keys(SUPPLIER_NAMES).find(k => SUPPLIER_NAMES[k] === name);
    if (!id) return;
    setLines(ls => ls.map(l =>
      (l.id === line.id ? pickSupplier(l, id, cfg.buildQty, cfg.attritionSet) : l)));
  };

  /* The pick is an edit of the LINE, not of the row: it is remembered per AML
     and travels with the quote, which is what "saved as an alias for this
     customer" means once this is a real system. */
  const pickMpn = (line: BomLine, aml: number, candidate: number) =>
    setLines(ls => ls.map(l => (l.id !== line.id ? l : {
      ...l,
      nexar: l.nexar.map((n, i) => (i === aml && n ? { ...n, picked: candidate } : n)),
    })));

  const columns = quotingColumns(cfg, hasRun, edit, editAml, pickSupplierFor, pickMpn);
  const rows = useMemo(() => amlRows(shown), [shown]);

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
        onSuppliers={() => setSuppliersOpen(true)}
        rfq={rfq}
      />

      {suppliersOpen && (
        <SupplierDialog
          value={pending.suppliers}
          onSave={next => { setPending({ suppliers: next }); setSuppliersOpen(false); }}
          onClose={() => setSuppliersOpen(false)}
        />
      )}

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
                  busy={pricing}
                  onClick={hasRun ? onRefreshPrices : onGetPrices}
                  title={dirty
                    ? 'Apply the setup changes first — Update Results'
                    : hasRun
                      ? `Ask ${pending.provider} for new prices. Uses marketplace quota.`
                      : manual
                        ? `Get prices through ${pending.provider}. Quote Focus is ${pending.quoteFocus}, so no supplier is selected for you.`
                        : `Price every line through ${pending.provider}, falling back to the other provider`}>
            {pricing ? 'Pricing…' : hasRun ? 'Refresh Prices' : 'Get Prices'}
          </Button>
          <Button variant={dirty ? 'filled' : undefined} size="sm" disabled={!dirty || pricing}
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
        /* The counts come from the same three tests the filter runs, a few
           lines up — not a second copy of the rule. */
        filters={[
          { key: 'sup', label: 'Unselected Supplier', on: noSupplier, onToggle: setNoSupplier,
            count: quoted.filter(l => !l.excluded && l.supplier === '').length },
          { key: 'qty', label: 'Not Enough Qty', on: notEnough, onToggle: setNotEnough,
            count: quoted.filter(l => l.status === 'NO').length },
          { key: 'att', label: 'Missing Attrition', on: missingAttr, onToggle: setMissingAttr,
            count: quoted.filter(l => !l.excluded && !(l.attrition > 0)).length },
        ]}
      />

      {/* THE COLOURS, SAID IN WORDS, as on step 2. Before the run this grid
          paints 240 cells, and until 15 Oct it painted them in the same red as
          a missing part — the fault we had written up against the live screen
          while shipping it ourselves. Grey says "waiting for the run"; red is
          kept for something that is actually wrong. */}
      {/* THE ROWS STAY while they are being re-priced. A refresh replaces
          numbers the user is looking at, and a skeleton here would take away
          the previous answer — which is the thing they are comparing against.
          `blocking` because a cell edit landing mid-request would be applied
          to a row the response is about to overwrite.

          Counted rather than vague: "Pricing 58 lines…" is the difference
          between a wait the user can estimate and one they cannot. */}
      <BusyOverlay busy={pricing} blocking
                   label={`Asking ${pending.provider} for prices · ${quoted.length} lines`}>
      <MiniTable
        data={rows}
        /* One BoM line is one record however many manufacturers it carries. */
        rowGroup={{ key: r => String(r.line.id), end: r => r.last }}
        /* NO PER-COLUMN FILTER ROW. The step already carries a search box and
           the filters that matter for it, so the grid's own row filtered the
           same rows a second way and cost 48px of a grid the customer told us
           was too short. The guideline asks for filter cells on the Part
           record's BoM Components tab; it does not ask for them here. */
        filterable={false}
        columns={shownColumns}
        freeze={4}
        rowTone={r => rowTone(r.line, hasRun)}
        empty={shown.length === 0 && quoted.length > 0
          ? <NoRecords title="No lines match these filters."
                       hint="Clear a filter above to see the rest of the BoM." />
          : <NoRecords title="No quote results yet."
                       hint="Click Get Prices to price the BoM and pick a supplier for each part." />}
      />
      </BusyOverlay>

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
          No supplier can cover this line, or no official MPN matched</li>
        <li><span className="vy-mpn-star" aria-hidden>*</span>
          The provider returned a list — click the MPN to pick the official
          part. The BoM keeps its own value</li>
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
                        edit: (id: number, patch: Partial<BomLine>) => void,
                        editAml: (line: BomLine, index: number, mpn: string) => void,
                        onPickSupplier: (line: BomLine, supplier: string) => void,
                        onPickMpn: (line: BomLine, aml: number, candidate: number) => void,
                        ): ColumnSpec<AmlRow>[] {
  /** The catalogue entry in force for a row: the user's pick, else the
   *  system's match, else nothing. */
  const picked = (r: AmlRow) => {
    const i = r.lookup ? (r.lookup.picked ?? r.lookup.matched) : null;
    return i == null || !r.lookup ? undefined : r.lookup.candidates[i];
  };
  /* One option per offer: the supplier's priority group, its stock and its
     price, in that order — the group says whether the system would have chosen
     it, the other two say what choosing it does to the line. */
  const supplierOptions = (l: BomLine) => {
    const rank = (id: string) => cfg.suppliers[id]?.group ?? 9;
    return [...l.offers]
      .sort((a, b) => rank(a.supplier) - rank(b.supplier)
        || SUPPLIER_NAMES[a.supplier].localeCompare(SUPPLIER_NAMES[b.supplier]))
      .map(o => ({
        value: SUPPLIER_NAMES[o.supplier],
        label: `${cfg.suppliers[o.supplier] ? `G${cfg.suppliers[o.supplier].group} ` : ''}`
          + `${SUPPLIER_NAMES[o.supplier]} · ${o.stock.toLocaleString()} in stock · ${money3(o.unitPrice)}`,
      }));
  };
  /* An excluded line "displays only the following information: Part, Revision,
     Source, Description, MFG, MPN, Qty, Total Qty" — everything else is blank
     on those rows rather than showing a zero that could be read as a price. */
  const hideIfExcluded = (l: BomLine, node: React.ReactNode) =>
    l.excluded ? <span className="vy-empty">—</span> : node;

  /** Red until the run fills it in. */
  const pending = (r: AmlRow) => (!hasRun && !r.line.excluded && r.first ? 'pending' : undefined);

  /* The line's own cells belong to the FIRST of its manufacturer rows; the
     rest leave them blank, which is the merged cell the standard asks for.
     Supplier, price and quantity are line facts too — a BoM line is bought
     once, from one supplier, whichever of its manufacturers was chosen. */
  const p = <V,>(r: AmlRow, value: () => V) => (r.first ? value() : null);

  return [
    { field: 'id', id: 'part', title: 'Part', role: 'ident', width: 180,
      widthNote: 'Frozen, so it pays for itself; part numbers must not truncate.',
      render: r => p(r, () => r.line.part) },
    { field: 'id', id: 'revision', title: 'Revision', role: 'code', width: 80,
      widthNote: 'A revision is one or two characters; the live column is 80.',
      render: r => p(r, () => r.line.revision) },
    { field: 'id', id: 'partSource', title: 'Source', role: 'code', width: 100,
      widthNote: 'Longest value is "MAKE/PHANT".',
      render: r => p(r, () => r.line.partSource) },
    { field: 'id', id: 'description', title: 'Description', role: 'text', width: 200,
      widthNote: 'Descriptions outrun any width; the live column is 200 and '
        + 'this grid is the widest in the product.',
      render: r => p(r, () => r.line.description) },
    /* ONE ROW PER MANUFACTURER, and these two are the reason the rows exist.
       Everything above and below is a fact about the LINE; MFG and MPN are
       facts about one source of it. */
    { field: 'mfg', id: 'mfg', title: 'MFG', role: 'text', width: 140,
      widthNote: 'Manufacturer names run long.',
      /* THE MANUFACTURER FOLLOWS THE PICK. The catalogue spells it in full —
         "NXP USA Inc." where the file said "NXP" — and the quote goes out with
         the catalogue's name, so that is what this shows once a part has been
         resolved. What the file said is on the cell, because a reader comparing
         the quote to the customer's own BoM needs to find it. */
      render: r => {
        const c = picked(r);
        if (!c) return r.mfg || <span className="vy-empty">—</span>;
        return <span title={c.mfg === r.mfg ? undefined : `In the BoM file: ${r.mfg}`}>{c.mfg}</span>;
      } },
    {
      field: 'mpn', id: 'mpn', title: 'MPN', role: 'ident', width: 180,
      widthNote: 'Editable, and manufacturer part numbers are long.',
      /* Red before the run because nothing has been looked up yet, and red
         after it when the lookup came back with no match — a part nobody has
         resolved is the one thing on this grid that stops a quotation. */
      tone: r => (r.line.excluded ? undefined
        : !hasRun ? 'pending'
          : r.lookup && (r.lookup.picked ?? r.lookup.matched) == null ? 'missing'
            : undefined),
      /* TWO CELLS IN ONE, and which one appears is not a style choice.
         Before the run, and for a part the catalogue had nothing to say about,
         this is the free-text field the guideline asks for — one of the five
         it lets the user edit — now editing the manufacturer part number ON
         THIS ROW rather than always the primary one.
         Once the provider has returned a list for this MPN, typing is the
         wrong control: the answer is one of theirs, and inventing a sixth is
         how an unorderable part number reaches a customer. It becomes a
         picker. */
      render: r => hideIfExcluded(r.line,
        hasRun && r.lookup
          ? <MpnPicker bomValue={r.mpn} lookup={r.lookup}
                       label={`Official MPN for ${r.line.part}, manufacturer ${r.index + 1}`}
                       onPick={i => onPickMpn(r.line, r.index, i)} />
          : <TextField className="vy-cell-input" aria-label={`MPN ${r.index + 1} for ${r.line.part}`}
                       value={r.mpn}
                       onChange={e => editAml(r.line, r.index, e.target.value)} />),
    },
    { field: 'id', id: 'qty', title: 'Qty', role: 'number', width: 90,
      render: r => p(r, () => r.line.qty.toLocaleString()) },
    {
      field: 'id', id: 'attrition', title: 'Attrition', role: 'number', width: 96,
      widthNote: 'Editable, so it holds a control rather than a number.',
      /* "When the Attrition value is changed, the system automatically
          recalculates the Total Qty accordingly" — which happens for free,
          since Total Qty is computed from it rather than stored.
          "If the user enters an Attrition value less than 0, the system
          automatically resets the value to 0." */
      render: r => p(r, () => hideIfExcluded(r.line,
        <TextField className="vy-cell-input" type="number" min={0} value={String(r.line.attrition)}
                   aria-label={`Attrition for ${r.line.part}`}
                   onChange={e => edit(r.line.id, { attrition: Number(e.target.value) })}
                   onBlur={e => { if (Number(e.target.value) < 0) edit(r.line.id, { attrition: 0 }); }} />)) },
    { field: 'id', id: 'total', title: 'Total Qty', role: 'number', width: 100,
      widthNote: 'A computed total, larger than the per-board quantity.',
      render: r => p(r, () => totalQtyOf(r.line, cfg.buildQty, cfg.attritionSet).toLocaleString()) },
    /* WHAT THE QUOTE DOES NOT HAVE TO BUY. Blank on the lines that have none,
       which is most of them — a column of zeroes would say "considered and
       found to be none" on twenty lines where the answer is "not applicable".
       Not frozen: it matters on three lines of a BoM and the Columns chooser
       can put it away. */
    { field: 'id', id: 'consigned', title: 'Consigned', role: 'number', width: 110,
      widthNote: 'A quantity, and only on the lines that carry consigned stock.',
      render: r => p(r, () => {
        const qty = consignedQty(r.line, totalQtyOf(r.line, cfg.buildQty, cfg.attritionSet),
                                 cfg.netConsigned, cfg.rocketConsigned);
        return qty
          ? <span title="Covered by consigned stock, so it is not bought">{qty.toLocaleString()}</span>
          : '';
      }) },
    {
      field: 'id', id: 'supplier', title: 'Supplier', role: 'text', width: 230,
      widthNote: 'Holds a supplier name, its group and its stock — "G1 Arrow · '
        + '24,000 in stock". Wider than a name needs because what is being '
        + 'chosen is the offer, not the company.',
      /* THE OFFERS THIS LINE ACTUALLY HAS, not a list of every supplier in the
         company. Each option carries what the choice costs — "G1 Arrow ·
         9,000 in stock · $0.920000" — because picking a supplier IS picking a
         price, a lead time and a quantity, and a bare name asks the quoter to
         remember all three.

         Preferred first, then the rest: a supplier with no priority group is
         approved but never auto-picked, which is exactly the distinction the
         two halves of this list draw. */
      render: r => p(r, () => hideIfExcluded(r.line,
        r.line.supplier === 'Consigned'
          ? <span className="vy-empty" title="Covered by consigned stock — nothing to buy">Consigned</span>
          : r.line.offers.length
            ? <Select label={`Supplier for ${r.line.part}`} value={r.line.supplier}
                      options={supplierOptions(r.line)}
                      onChange={v => onPickSupplier(r.line, v)} />
            : <span className="vy-empty">No bid</span>)),
    },
    {
      field: 'id', id: 'orderQty', title: 'Order Qty', role: 'number', width: 116,
      tone: pending,
      /* "If the user enters an Order Qty value less than 0, the system
         automatically resets the value to 0." */
      render: r => p(r, () => hideIfExcluded(r.line,
        <TextField className="vy-cell-input" type="number" min={0} value={String(r.line.orderQty)}
                   aria-label={`Order quantity for ${r.line.part}`}
                   onChange={e => edit(r.line.id, { orderQty: Number(e.target.value) })}
                   onBlur={e => { if (Number(e.target.value) < 0) edit(r.line.id, { orderQty: 0 }); }} />)) },
    { field: 'id', id: 'stock', title: 'Stock', role: 'number', width: 100, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line,
        r.line.stock ? r.line.stock.toLocaleString() : <span className="vy-empty">—</span>)) },
    { field: 'id', id: 'lt', title: 'LT', role: 'number', width: 80, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line,
        r.line.lt ? String(r.line.lt) : <span className="vy-empty">—</span>)) },
    { field: 'id', id: 'pkg', title: 'Pkg.', role: 'code', width: 100, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line, r.line.pkg || <span className="vy-empty">—</span>)) },
    { field: 'id', id: 'moq', title: 'MOQ', role: 'number', width: 100, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line, r.line.moq.toLocaleString())) },
    { field: 'id', id: 'excessQty', title: 'Excess', role: 'number', width: 106, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line, r.line.excessQty.toLocaleString())) },
    { field: 'id', id: 'unitPrice', title: 'Unit Price', role: 'money', width: 116, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line,
        r.line.unitPrice ? money3(r.line.unitPrice) : <span className="vy-empty">—</span>)) },
    { field: 'id', id: 'amount', title: 'AMT', role: 'money', width: 120, tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line,
        r.line.amount ? money(r.line.amount) : <span className="vy-empty">—</span>)) },
    { field: 'id', id: 'excessAmt', title: 'Excess AMT', role: 'money', width: 116, tone: pending,
      /* $0.000 is the guideline's stated default, three decimals and all. */
      render: r => p(r, () => hideIfExcluded(r.line, money3(r.line.excessAmt))) },
    { field: 'id', id: 'status', title: 'Status', role: 'status', width: 110, tone: pending,
      render: r => p(r, () => (
        <span className="vy-line-status" data-status={r.line.status}>{r.line.status}</span>)) },
    {
      field: 'id', id: 'notes', title: 'Notes', role: 'text', width: 140,
      widthNote: 'Editable free text — a cramped note field goes unused.',
      tone: pending,
      render: r => p(r, () => hideIfExcluded(r.line,
        <TextField className="vy-cell-input" aria-label={`Notes for ${r.line.part}`}
                   value={r.line.notes}
                   onChange={e => edit(r.line.id, { notes: e.target.value })} />)) },
  ];
}
