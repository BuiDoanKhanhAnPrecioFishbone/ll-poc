import { Button } from '../../ui/Button';
import { MiniTable } from '../../ui/MiniTable';
import { fmtDateTime } from '../../ui/renderCell';
import { useToast } from '../../ui/Toast';
import { useExcelExport } from '../../ui/useExcelExport';
import type { ColumnSpec } from '../column-model';
import type { Quotation, QuoteResult } from '../../data/quotations';

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'USD' });

/**
 * The eleven columns, in the order the customer's Testing Guideline lists them:
 *
 *   "Part Number, Part Rev, Description, Build Qty, Cost/Board, Total Amt,
 *    Total w/ Markup, Last Run By, Last Run Date, Last Run Version, BoM File"
 *
 * Eight of these had been reworded here — "Rev", "Total", "Version", "Last Run",
 * "Run By" — and the last four were in the wrong order. Names and order are the
 * customer's; only the rendering is ours.
 */
function resultColumns(onOpen: (r: QuoteResult) => void): ColumnSpec<QuoteResult>[] { return [
  /* "Each quotation result line allows the user to open and view the
     corresponding quotation detail." The IDENTIFIER carries that, not the whole
     row — a row-wide click target breaks text selection, and these cells hold
     part numbers people copy out into email. */
  { field: 'partNumber', title: 'Part Number', role: 'ident',
    render: r => (
      <button type="button" className="vy-cell-link" onClick={() => onOpen(r)}>
        {r.partNumber}
      </button>
    ) },
  { field: 'partRev', title: 'Part Rev', role: 'code', render: r => <span className="vy-code">{r.partRev}</span> },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'buildQty', title: 'Build Qty', role: 'number', render: r => r.buildQty.toLocaleString() },
  { field: 'costPerBoard', title: 'Cost/Board', role: 'money', render: r => money(r.costPerBoard) },
  { field: 'totalAmount', title: 'Total Amt', role: 'money', render: r => money(r.totalAmount) },
  { field: 'totalWithMarkup', title: 'Total w/ Markup', role: 'money', width: 150,
    widthNote: 'The headline number; the role default clips the heading.',
    render: r => <strong>{money(r.totalWithMarkup)}</strong> },
  { field: 'lastRunBy', title: 'Last Run By', role: 'code', width: 140, widthNote: 'Full names.' },
  { field: 'lastRunDate', title: 'Last Run Date', role: 'date', render: r => fmtDateTime(r.lastRunDate) },
  /* "Last Run Version displays the corresponding assembly run number", and
     re-running against the same BoM increments it — so it is a counter, not a
     label, and reads better right-aligned with the other numbers. */
  { field: 'lastRunVersion', title: 'Last Run Version', role: 'code',
    render: r => <span className="vy-code">{r.lastRunVersion}</span> },
  /* "The BOM File field is blank when the quotation is run from an existing
     BOM." An empty cell here is a fact about how the quote was run, not missing
     data, so it says so rather than showing a dash. */
  { field: 'bomFile', title: 'BoM File', role: 'text',
    render: r => r.bomFile
      ? <span className="vy-cell-file">{r.bomFile}</span>
      : <span className="vy-empty" title="Run from an existing BoM, so no file was uploaded">From existing BoM</span> },
]; }

/**
 * Quotation Result.
 *
 * Columns, names and order are the customer's — see RESULT_COLUMNS. Two things
 * here are ours:
 *
 * 1. A total. The live grid has no totals row, so the one number a salesperson
 *    actually needs — what this quote comes to — has to be added up by eye.
 * 2. A real empty state. The live tab shows "No records available" on an RFQ
 *    that has never been costed, which says what the grid contains rather than
 *    what to do about it.
 */
export function ResultTab({ q, onRun }: { q: Quotation; onRun: () => void }) {
  const toast = useToast();
  const { exportRows, excel } = useExcelExport<QuoteResult>();

  if (q.results.length === 0) {
    return (
      <div className="vy-empty-state vy-empty-state--tab">
        <strong>This RFQ has not been costed yet</strong>
        <p>
          Running a quotation uploads a BoM, matches each line to a manufacturer and returns a
          cost per board. Results appear here, one row per assembly and version.
        </p>
        <Button variant="filled" onClick={onRun}>Run quotation</Button>
      </div>
    );
  }

  const total = q.results.reduce((a, r) => a + r.totalWithMarkup, 0);
  const latest = q.results.reduce((a, r) => (r.lastRunDate > a.lastRunDate ? r : a), q.results[0]);

  return (
    <>
      {/* The answer first: what the quote comes to, and how current it is. */}
      <div className="vy-result-summary">
        <div className="vy-fact">
          <div className="vy-fact-label">Quoted total with markup</div>
          <div className="vy-result-total">{money(total)}</div>
        </div>
        <div className="vy-fact">
          <div className="vy-fact-label">Assemblies</div>
          <div className="vy-fact-value">{q.results.length}</div>
        </div>
        <div className="vy-fact">
          <div className="vy-fact-label">Last run</div>
          <div className="vy-fact-value">{fmtDateTime(latest.lastRunDate)} · {latest.lastRunBy}</div>
        </div>
        <div className="vy-page-actions">
          {/* The costed lines, in the columns the tab shows. Kendo writes real
              numbers with a currency format, so the totals are summable rather
              than a column of text. */}
          <Button onClick={() => exportRows(
            q.results,
            resultColumns(() => {}),
            `QuotationResult-RFQ${q.no}.xlsx`,
          )}>
            Export
          </Button>
          <Button variant="filled" onClick={onRun}>Re-run quotation</Button>
        </div>
      </div>

      {excel}

      <MiniTable
        data={q.results}
        columns={resultColumns(r =>
          toast.notImplemented(`open the quotation detail for ${r.partNumber} run ${r.lastRunVersion}`))}
      />
    </>
  );
}
