import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { fmtDate } from '../StandardGrid';
import { COLUMN_WIDTH } from '../../theme/tokens';
import type { Quotation } from '../../data/quotations';

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'USD' });

/**
 * Quotation Result.
 *
 * Columns are verbatim from the live grid: Part Number, Part Rev, Description,
 * Build Qty, Cost/Board, Total Amt, Total w-Markup, Last Run By, Last Run Date,
 * Last Run Version, BoM File.
 *
 * Two changes. The live screen shows this grid with "No records available" and
 * nothing else on an RFQ that has never been costed — it does not say that
 * running a quotation is what fills it. And the money columns carry no totals,
 * so the number a salesperson actually needs (what this quote comes to) has to
 * be added up by eye.
 */
export function ResultTab({ q, onRun }: { q: Quotation; onRun: () => void }) {
  if (q.results.length === 0) {
    return (
      <div className="vy-empty-state vy-empty-state--tab">
        <strong>This RFQ has not been costed yet</strong>
        <p>
          Running a quotation uploads a BoM, matches each line to a manufacturer and
          returns a cost per board. Results appear here, one row per assembly and version.
        </p>
        <Button themeColor="primary" onClick={onRun}>Run quotation</Button>
      </div>
    );
  }

  const total = q.results.reduce((a, r) => a + r.totalWithMarkup, 0);
  const latest = q.results.reduce((a, r) => r.lastRunDate > a.lastRunDate ? r : a, q.results[0]);

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
          <Button themeColor="base">Export</Button>
          <Button themeColor="primary" onClick={onRun}>Re-run quotation</Button>
        </div>
      </div>

      <Grid data={q.results} className="vy-grid">
        <GridColumn field="partNumber" title="Part Number" width={COLUMN_WIDTH.ident}
          cells={{ data: p => <td className="vy-ident">{p.dataItem.partNumber}</td> }} />
        <GridColumn field="partRev" title="Rev" width={COLUMN_WIDTH.code}
          cells={{ data: p => <td><span className="vy-code">{p.dataItem.partRev}</span></td> }} />
        <GridColumn field="description" title="Description" width={COLUMN_WIDTH.text}
          cells={{ data: p => <td className="vy-truncate" title={p.dataItem.description}>{p.dataItem.description}</td> }} />
        <GridColumn field="buildQty" title="Build Qty" width={COLUMN_WIDTH.number}
          cells={{ data: p => <td className="vy-num">{p.dataItem.buildQty.toLocaleString()}</td> }} />
        <GridColumn field="costPerBoard" title="Cost / Board" width={COLUMN_WIDTH.money}
          cells={{ data: p => <td className="vy-num">{money(p.dataItem.costPerBoard)}</td> }} />
        <GridColumn field="totalAmount" title="Total" width={COLUMN_WIDTH.money}
          cells={{ data: p => <td className="vy-num">{money(p.dataItem.totalAmount)}</td> }} />
        <GridColumn field="totalWithMarkup" title="Total w/ Markup" width={COLUMN_WIDTH.money + 20}
          cells={{ data: p => <td className="vy-num vy-emphasis">{money(p.dataItem.totalWithMarkup)}</td> }} />
        <GridColumn field="lastRunVersion" title="Version" width={COLUMN_WIDTH.code}
          cells={{ data: p => <td><span className="vy-code">{p.dataItem.lastRunVersion}</span></td> }} />
        <GridColumn field="lastRunDate" title="Last Run" width={COLUMN_WIDTH.date}
          cells={{ data: p => <td className="vy-num">{fmtDate(p.dataItem.lastRunDate)}</td> }} />
        <GridColumn field="lastRunBy" title="Run By" width={COLUMN_WIDTH.code + 44} />
        <GridColumn field="bomFile" title="BoM File" width={COLUMN_WIDTH.text}
          cells={{ data: p => <td className="vy-truncate" title={p.dataItem.bomFile}>{p.dataItem.bomFile}</td> }} />
      </Grid>
    </>
  );
}
