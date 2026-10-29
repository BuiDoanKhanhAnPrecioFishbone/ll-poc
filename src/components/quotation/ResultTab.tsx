import { useState } from 'react';
import { Icon } from '../../ui/icons';
import { Button } from '../../ui/Button';
import { fmtMoney } from '../../ui/regional';
import { MiniTable } from '../../ui/MiniTable';
import { fmtDateTime } from '../../ui/renderCell';
import { useExcelExport } from '../../ui/useExcelExport';
import { QuoteResultDialog } from './QuoteResultDialog';
import type { ColumnSpec } from '../column-model';
import type { Quotation, QuoteResult } from '../../data/quotations';
import { pageActionsProps } from '../../ui/pageActions';

const money = (n: number) => fmtMoney(n);

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
  /* THE EYE OPENS IT, in a column of its own — guideline 2.1 §4: "Click the
     eye icon on the assembly to open quote result", and her Quotation Result
     screenshot of 29 Oct shows exactly that, an eye button ahead of PART
     NUMBER. It used to be a link on the part number itself, which was our
     reading of "each quotation result line allows the user to open and view
     the corresponding quotation detail" — a reasonable reading, and not the
     one the live system shipped. A link also costs the cell its text
     selection, and these are part numbers people copy into email. */
  { field: 'id', id: 'open', title: '', role: 'code', width: 56, sortable: false,
    widthNote: 'One icon button, 26px, with the cell padding around it.',
    render: r => (
      <button type="button" className="vy-icon-btn"
              title={`Open quotation ${r.lastRunVersion} for ${r.partNumber}`}
              aria-label={`Open quotation ${r.lastRunVersion} for ${r.partNumber}`}
              onClick={() => onOpen(r)}>
        <Icon name="eye" size={15} />
      </button>
    ) },
  { field: 'partNumber', title: 'Part Number', role: 'ident',
    render: r => r.partNumber },
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
  const { exportRows, excel, busy: exporting } = useExcelExport<QuoteResult>();
  const [open, setOpen] = useState<QuoteResult | null>(null);

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
        <div {...pageActionsProps}>
          {/* The costed lines, in the columns the tab shows. Kendo writes real
              numbers with a currency format, so the totals are summable rather
              than a column of text. */}
          <Button busy={exporting} onClick={() => exportRows(
            q.results,
            resultColumns(() => {}),
            `QuotationResult-RFQ${q.no}.xlsx`,
          )}>
            {exporting ? 'Building the file…' : 'Export'}
          </Button>
          <Button variant="filled" onClick={onRun}>Re-run quotation</Button>
        </div>
      </div>

      {excel}

      <MiniTable
        data={q.results}
        /* "Each quotation result line allows the user to open and view the
           corresponding quotation detail." It raised a not-implemented toast
           for weeks — the table listed versions and could not answer the one
           question a reader of it has. */
        columns={resultColumns(setOpen)}
      />

      {open && <QuoteResultDialog q={q} result={open} onClose={() => setOpen(null)} />}
    </>
  );
}
