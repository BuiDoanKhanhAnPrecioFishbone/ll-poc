import { useMemo, useState } from 'react';
import { Dialog } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { MiniTable } from '../../ui/MiniTable';
import { useToast } from '../../ui/Toast';
import { useExcelExport } from '../../ui/useExcelExport';
import { fmtDateTime } from '../../ui/regional';
import type { ColumnSpec } from '../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './run/QuoteContext';
import { rowTone } from './run/StepQuoting';
import { resultSetup, resultLines } from '../../data/quoteRun';
import { masterSuppliers } from '../../data/suppliers';
import { totalQtyOf, money, money3, type BomLine } from '../../data/bom';
import type { Quotation, QuoteResult } from '../../data/quotations';

/**
 * One saved quotation version, read-only — the customer's "Quote result
 * (view mode)".
 *
 * IT IS THE SCREEN THAT WAS MISSING. Her 16 Oct prototype carries a button
 * that leaves the wizard and shows a finished run: the setup it used, the cost
 * matrix, and every priced line. Our Result tab listed the versions and had
 * nowhere to go — clicking one raised "not implemented" — which made the one
 * question a reader of that table actually has, "what is in version 3", the
 * one thing the table could not answer.
 *
 * WHY A DIALOG AND NOT A ROUTE. The versions are a property of the RFQ and are
 * compared against each other; sending the user to another address to read one
 * means coming back to compare. Run Quotation is a dialog over this same
 * record for the same reason.
 *
 * READ-ONLY THROUGHOUT, and that is the difference from step 4 of the wizard.
 * Step 4 still lets a status be changed because the quote is not finished; a
 * saved version is a historical fact. Nothing here edits anything, so nothing
 * here is a control that looks like it might.
 */
export function QuoteResultDialog({ q, result, onClose }: {
  q: Quotation;
  result: QuoteResult;
  onClose: () => void;
}) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [noBid, setNoBid] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [excess, setExcess] = useState(false);

  const setup = useMemo(() => resultSetup(result), [result]);
  const lines = useMemo(() => resultLines(result), [result]);
  const { exportRows, excel, busy: exporting } = useExcelExport<BomLine>();

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return lines.filter(l => {
      if (k && ![l.part, l.description, l.mpn, l.mfg, l.supplier]
        .some(v => v.toLowerCase().includes(k))) return false;
      if (noBid && l.supplier !== '') return false;
      if (notEnough && l.status !== 'NO') return false;
      if (excess && !(l.excessAmt > 0)) return false;
      return true;
    });
  }, [lines, search, noBid, notEnough, excess]);

  const columns = resultColumns(setup.buildQty, setup.attritionSet);

  return (
    <Dialog
      open size="xl"
      title="Quotation Result"
      subtitle={`${result.partNumber} · Rev ${result.partRev} · ${result.description}`}
      onClose={onClose}
    >
      {excel}

      <div className="vy-run-step">
        {/* TOP LEFT, NOT A FOOTER — the same row the wizard uses, and for the
            same reason the standard gives: "Top-left toolbar = page navigation
            only". This screen is a RECORD, not a step: nothing here commits
            anything, so there is no sequence for the eye to finish at the
            bottom of, and the actions apply to the whole version at any
            moment. In a footer they also sat below a 23-row grid, which is a
            long way from the thing they act on. Her own prototype puts Export
            to Excel and Export to PDF at the top left.

            DONE FIRST, because the way out goes on the left wherever the bar
            sits (modal-patterns, rule 3) — and none of the three is `filled`:
            a primary button promises a commit, and a saved version cannot be
            changed from here. */}
        <div className="vy-run-nav">
          <div className="vy-run-nav-actions">
            <Button onClick={onClose}>Done</Button>
            <Button busy={exporting}
                    onClick={() => exportRows(shown, columns, `QuotationResult-RFQ${q.no}-${result.lastRunVersion}.xlsx`)}>
              {exporting ? 'Building the file…' : 'Export to Excel'}
            </Button>
            {/* Hers, and not built — said plainly rather than wired to a
                silent no-op. */}
            <Button onClick={() => toast.notImplemented('export this quotation as PDF')}>
              Export to PDF
            </Button>
          </div>
        </div>

        {/* THE COST BESIDE THE SETUP, as her mockup has it. Stacked, the cost
            card took a full-width band to show a 340px table — the right two
            thirds were empty, and the band cost the grid a row and a half of
            the only thing anyone opens this screen to read. Side by side it
            costs nothing: the setup strip has width to spare and simply wraps
            onto one more line. */}
        <div className="vy-result-head">
        <QuoteContextBar
          heading={`Quote Run · Version ${result.lastRunVersion.replace(/^v/, '')}`}
          assembly={`${result.partNumber} - ${result.partRev}`}
          description={result.description}
          applied={{
            buildQty: setup.buildQty,
            attritionSet: setup.attritionSet,
            quoteFocus: setup.quoteFocus,
            markup: setup.markup,
            materialPackageType: setup.packageType,
            excessMoq: setup.excessMoq,
            netConsigned: setup.netConsigned,
            rocketConsigned: setup.rocketConsigned,
            provider: setup.provider,
            /* `QuoteSetup` carries the supplier list because the wizard's
               strip reports how many are switched on. A saved version has the
               master list by construction — see resultLines. */
            suppliers: masterSuppliers(),
          }}
          extra={[
            { label: 'Prices From', value: fmtDateTime(result.lastRunDate) },
            { label: 'Run by', value: result.lastRunBy },
            { label: 'Run Date', value: fmtDateTime(result.lastRunDate) },
          ]}
        />

        <section className="vy-cost-card vy-cost-card--side">
          <h3 className="vy-cost-title">Cost estimation</h3>
          {/* THE STORED TOTALS, NOT RECOMPUTED ONES. The lines below are priced
              by the same engine the run used, but a saved version's totals are
              what was quoted to the customer — if the two ever disagree, the
              number that went out is the true one and the table should say so
              rather than quietly correct it. */}
          <table className="vy-cost-table">
            <thead>
              <tr>
                <th scope="col"><span className="vy-sr-only">Measure</span></th>
                <th scope="col">Without Markup</th>
                <th scope="col">With Markup ({result.markupPct}%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Per Board</th>
                <td>{money3(result.costPerBoard)}</td>
                <td>{money3(result.costPerBoard * (1 + result.markupPct / 100))}</td>
              </tr>
              <tr>
                <th scope="row">Total</th>
                <td>{money(result.totalAmount)}</td>
                <td data-emphasis>{money(result.totalWithMarkup)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Excess Amount</th>
                <td />
                <td>{money(lines.reduce((n, l) => n + l.excessAmt, 0))}</td>
              </tr>
            </tfoot>
          </table>
          {/* NO `Add Package` HERE, though her prototype puts one beside
              Pricing Detail. Adding a packaging part changes what a quote
              costs, and this is a version that was already sent — the button
              would be the one control on a read-only screen that edits
              history. It belongs on step 4, where the quote is still open, and
              that is where ours is. Flagged for her rather than assumed: if
              she means "add a package and re-run as a new version", that is a
              different button with a different name. */}
          <div className="vy-cost-actions">
            {/* HERS, AND UNBUILT ON BOTH SIDES. Pressing Pricing Detail in her
                own prototype does nothing, so what it opens is a question for
                her rather than something to invent — question 4 on the
                customer page. */}
            <Button onClick={() => toast.notImplemented('open the pricing detail')}>
              Pricing Detail
            </Button>
          </div>
        </section>
        </div>

        <QuoteToolbar
          search={search} onSearch={setSearch}
          placeholder="Search by Part / Description / MPN / MFG / Supplier"
          filters={[
            { key: 'nobid', label: 'No Bid', on: noBid, onToggle: setNoBid },
            { key: 'qty', label: 'Not Enough Qty', on: notEnough, onToggle: setNotEnough },
            { key: 'excess', label: 'Excess Qty', on: excess, onToggle: setExcess },
          ]}
          actions={
            /* Her toolbar carries Import beside Export. Import belongs to the
               migration flow — "Import Completed Quote" on step 1, also not
               built — so it says so rather than pretending. */
            <Button size="sm" onClick={() => toast.notImplemented('import a completed quote')}>
              Import
            </Button>
          }
        />

        <MiniTable data={shown} columns={columns} freeze={2} rowTone={rowTone}
                   filterable={false} empty={<NoRecords />} />

        {/* THREE TONES, BECAUSE THE GRID PAINTS THREE. This legend shipped
            with two entries, and neither of them worked: `data-tone` on the
            `li` itself drew no swatch — the colour belongs to `.vy-tone-key`,
            as step 3's legend has it — and "warn"/"bad" are not tone names
            this app uses, so even a correct element would have been
            transparent. Measured in the dialog: rows carry `covered`, `short`
            and `no-supplier`; the legend carried nothing at all and was silent
            about the green that covers most of the grid. */}
        <ul className="vy-tone-legend">
          <li><span className="vy-tone-key" data-tone="known" aria-hidden />
            Fully covered by the selected supplier</li>
          <li><span className="vy-tone-key" data-tone="short" aria-hidden />
            Out of stock quantity — the supplier cannot cover the full amount</li>
          <li><span className="vy-tone-key" data-tone="missing" aria-hidden />
            No bid — no supplier covered this line, so it is not in the total</li>
        </ul>
      </div>
    </Dialog>
  );
}

/**
 * Her columns, in her order and under her names.
 *
 * Fourteen, against step 4's twenty-one. The wizard's extra columns are the
 * ones you need while DECIDING — Revision, per-board Qty, Attrition, LT,
 * Status, Notes — and a saved version has no decisions left in it. `EXT.
 * PRICE` is her name for what the wizard calls Amount; this is her screen, so
 * it is her name.
 */
function resultColumns(buildQty: number, attritionSet: number): ColumnSpec<BomLine>[] {
  const dash = <span className="vy-empty">—</span>;
  return [
    { field: 'part', title: 'Part', role: 'ident', width: 180,
      widthNote: 'Frozen; part numbers must not truncate.' },
    { field: 'description', title: 'Description', role: 'text' },
    { field: 'number', title: 'Total Qty', role: 'number', width: 110,
      render: l => totalQtyOf(l, buildQty, attritionSet).toLocaleString() },
    { field: 'mfg', title: 'MFG', role: 'text', width: 150 },
    { field: 'mpn', title: 'MPN', role: 'ident', width: 190,
      render: l => l.mpn ? <span className="vy-code">{l.mpn}</span> : dash },
    { field: 'supplier', title: 'Supplier', role: 'text', width: 150,
      render: l => l.supplier || <span className="vy-pill">No Bid</span> },
    { field: 'orderQty', title: 'Order Qty', role: 'number', width: 110,
      render: l => l.supplier ? l.orderQty.toLocaleString() : dash },
    { field: 'stock', title: 'Stock', role: 'number', width: 110,
      render: l => l.stock ? l.stock.toLocaleString() : dash },
    { field: 'outStock', title: 'Out Stock', role: 'number', width: 110,
      render: l => l.outStock ? l.outStock.toLocaleString() : dash },
    { field: 'pkg', title: 'Pkg.', role: 'code', width: 110, render: l => l.pkg || dash },
    { field: 'moq', title: 'MOQ', role: 'number', width: 100,
      render: l => l.supplier ? l.moq.toLocaleString() : dash },
    { field: 'unitPrice', title: 'Unit Price', role: 'money', width: 116,
      render: l => l.unitPrice ? money3(l.unitPrice) : dash },
    { field: 'amount', title: 'Ext. Price', role: 'money', width: 120,
      widthNote: "The customer's name for the line total.",
      render: l => l.amount ? money(l.amount) : dash },
    { field: 'excessAmt', title: 'Excess AMT', role: 'money', width: 130,
      render: l => l.excessAmt ? money3(l.excessAmt) : dash },
  ];
}
