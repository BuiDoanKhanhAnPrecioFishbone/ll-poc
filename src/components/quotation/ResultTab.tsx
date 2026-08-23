import { Button } from '../../ui/Button';
import { MiniTable } from '../../ui/MiniTable';
import { fmtDate } from '../../ui/DataGrid';
import { useToast } from '../../ui/Toast';
import type { ColumnSpec } from '../column-model';
import type { Quotation, QuoteResult } from '../../data/quotations';

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'USD' });

const RESULT_COLUMNS: ColumnSpec<QuoteResult>[] = [
  { field: 'partNumber', title: 'Part Number', role: 'ident' },
  { field: 'partRev', title: 'Rev', role: 'code', render: r => <span className="vy-code">{r.partRev}</span> },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'buildQty', title: 'Build Qty', role: 'number', render: r => r.buildQty.toLocaleString() },
  { field: 'costPerBoard', title: 'Cost / Board', role: 'money', render: r => money(r.costPerBoard) },
  { field: 'totalAmount', title: 'Total', role: 'money', render: r => money(r.totalAmount) },
  { field: 'totalWithMarkup', title: 'Total w/ Markup', role: 'money', width: 150,
    widthNote: 'The headline number; the role default clips the heading.',
    render: r => <strong>{money(r.totalWithMarkup)}</strong> },
  { field: 'lastRunVersion', title: 'Version', role: 'code', render: r => <span className="vy-code">{r.lastRunVersion}</span> },
  { field: 'lastRunDate', title: 'Last Run', role: 'date', render: r => fmtDate(r.lastRunDate) },
  { field: 'lastRunBy', title: 'Run By', role: 'code', width: 140, widthNote: 'Full names.' },
  /* Present on the live grid; it was dropped in an earlier pass. It is how you
     tell which BoM version produced a given price. */
  { field: 'bomFile', title: 'BoM File', role: 'text' },
];

/**
 * Quotation Result. Columns are the live ones. Two changes: the live grid has
 * no totals row, so the number a salesperson needs has to be added up by eye;
 * and on an RFQ that was never costed it shows an empty grid without saying
 * that running a quotation is what fills it.
 */
export function ResultTab({ q, onRun }: { q: Quotation; onRun: () => void }) {
  const toast = useToast();

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
          <div className="vy-fact-value">{fmtDate(latest.lastRunDate)} · {latest.lastRunBy}</div>
        </div>
        <div className="vy-page-actions">
          <Button onClick={() => toast.notImplemented('export the costed lines as the customer-facing quote')}>
            Export
          </Button>
          <Button variant="filled" onClick={onRun}>Re-run quotation</Button>
        </div>
      </div>

      <MiniTable data={q.results} columns={RESULT_COLUMNS} />
    </>
  );
}
