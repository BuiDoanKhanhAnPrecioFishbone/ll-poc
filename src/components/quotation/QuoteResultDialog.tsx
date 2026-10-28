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
      actions={<>
        {/* HER TWO HEADER ACTIONS, in her order. Excel is the one that works:
            it goes through the same hook every other export here uses, so it
            inherits the busy state and the frame that gets it painted before
            the workbook blocks the thread. PDF is hers and not built — said
            plainly rather than wired to a silent no-op. */}
        <Button busy={exporting}
                onClick={() => exportRows(shown, columns, `QuotationResult-RFQ${q.no}-${result.lastRunVersion}.xlsx`)}>
          {exporting ? 'Building the file…' : 'Export to Excel'}
        </Button>
        <Button onClick={() => toast.notImplemented('export this quotation as PDF')}>
          Export to PDF
        </Button>
        <Button variant="filled" onClick={onClose}>Done</Button>
      </>}
    >
      {excel}

      <div className="vy-run-step">
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

        <section className="vy-cost-card vy-cost-card--wide">
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

        <ul className="vy-tone-legend">
          <li data-tone="warn">Out of stock quantity</li>
          <li data-tone="bad">No bid — not included in total cost</li>
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
