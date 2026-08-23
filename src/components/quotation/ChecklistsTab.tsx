import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { ProgressBar } from '@progress/kendo-react-progressbars';
import { useToast } from '../Toast';
import { StatusBadge } from '../StatusBadge';
import { fmtDate } from '../StandardGrid';
import { COLUMN_WIDTH } from '../../theme/tokens';
import {
  PROGRAM_CHECKLIST, ENGINEERING_CHECKLIST,
  type Quotation, type ChecklistState,
} from '../../data/quotations';

/**
 * Checklists & Assignment.
 *
 * The live tab stacks three assignee dropdowns, two collapsible checklist
 * groups and a documents grid with no visual hierarchy between them, and gives
 * no completion count — you have to read all ten rows to know where you are.
 * Here each group states its own progress, and the two groups sit side by side
 * because they are worked by different people (program vs engineering).
 */
export function ChecklistsTab({ q }: { q: Quotation }) {
  const toast = useToast();
  return (
    <>
      <section className="vy-assignees">
        <h2 className="vy-field-group-title">Assignees</h2>
        <div className="vy-assignee-row">
          <Assignee role="Program Manager" name={q.programManager} required />
          <Assignee role="Buyer" name={q.buyer} required />
          <Assignee role="Engineer" name={q.engineer} />
        </div>
      </section>

      <div className="vy-checklist-cols">
        <Checklist title="Program checklist" items={PROGRAM_CHECKLIST} state={q.programChecklist} />
        <Checklist title="Engineering checklist" items={ENGINEERING_CHECKLIST} state={q.engineeringChecklist} />
      </div>

      <section className="vy-doc-section">
        <div className="vy-doc-head">
          <h2 className="vy-field-group-title">
            Documents <span className="vy-count">{q.documents.length}</span>
          </h2>
          <Button themeColor="base"
                  onClick={() => toast.notImplemented('attach a drawing, BoM or test spec to this RFQ')}>
            Upload
          </Button>
        </div>
        {q.documents.length === 0 ? (
          <div className="vy-empty-inline">
            No documents attached yet. Drawings, BoMs and test specs uploaded here are
            visible to everyone assigned to this RFQ.
          </div>
        ) : (
          <Grid data={q.documents} className="vy-grid">
            <GridColumn field="name" title="Document" width={COLUMN_WIDTH.text}
              cells={{ data: p => <td className="vy-truncate" title={p.dataItem.name}>{p.dataItem.name}</td> }} />
            <GridColumn field="type" title="Type" width={COLUMN_WIDTH.code + 60}
              cells={{ data: p => <td><span className="vy-code">{p.dataItem.type}</span></td> }} />
            <GridColumn field="assignee" title="Assignee" width={COLUMN_WIDTH.code + 44} />
            <GridColumn field="uploadedBy" title="Uploaded by" width={COLUMN_WIDTH.code + 44} />
            <GridColumn field="uploadedDate" title="Uploaded" width={COLUMN_WIDTH.date}
              cells={{ data: p => <td className="vy-num">{fmtDate(p.dataItem.uploadedDate)}</td> }} />
            <GridColumn field="status" title="Status" width={COLUMN_WIDTH.status}
              cells={{ data: p => <td><StatusBadge value={p.dataItem.status} /></td> }} />
          </Grid>
        )}
      </section>
    </>
  );
}

function Assignee({ role, name, required }: { role: string; name: string; required?: boolean }) {
  return (
    <div className="vy-assignee">
      <div className="vy-fact-label">
        {role}{required && <span className="vy-req" title="Required">required</span>}
      </div>
      {name
        ? <div className="vy-assignee-name"><span className="vy-avatar vy-avatar--sm">{initials(name)}</span>{name}</div>
        : <div className="vy-assignee-name is-empty">Unassigned</div>}
    </div>
  );
}

function Checklist({ title, items, state }: {
  title: string; items: readonly string[]; state: Record<string, ChecklistState>;
}) {
  const done = items.filter(i => state[i] === 'Done' || state[i] === 'N/A').length;
  const pct = Math.round((done / items.length) * 100);
  return (
    <section className="vy-checklist">
      <div className="vy-checklist-head">
        <h2 className="vy-field-group-title">{title}</h2>
        {/* Progress stated once, up front. The live screen makes you read all
            ten rows to work out how far along the RFQ is. */}
        <span className="vy-checklist-progress" data-complete={pct === 100}>
          {done} of {items.length}
        </span>
      </div>
      {/* Stock Kendo ProgressBar rather than a hand-rolled bar: a runtime
          percentage is neither a token nor a class, so rolling our own would
          have meant an inline width the working agreement forbids. */}
      <ProgressBar value={pct} labelVisible={false} className="vy-progress"
                   aria-label={`${pct}% complete`} />
      <ul className="vy-checklist-items">
        {items.map(i => (
          <li key={i} data-state={state[i]}>
            <span className="vy-check-mark" aria-hidden>{mark(state[i])}</span>
            <span className="vy-check-label">{i}</span>
            <span className="vy-check-state">{state[i]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const mark = (s: ChecklistState) => s === 'Done' ? '✓' : s === 'N/A' ? '–' : s === 'In progress' ? '◐' : '○';
const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
