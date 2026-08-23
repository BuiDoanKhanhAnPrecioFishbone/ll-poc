import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Overlays';
import { MiniTable } from '../../ui/MiniTable';
import { StatusBadge } from '../../ui/Badge';
import { fmtDate } from '../../ui/DataGrid';
import { useToast } from '../../ui/Toast';
import type { ColumnSpec } from '../column-model';
import {
  PROGRAM_CHECKLIST, ENGINEERING_CHECKLIST,
  type Quotation, type ChecklistState, type RfqDocument,
} from '../../data/quotations';

const DOC_COLUMNS: ColumnSpec<RfqDocument>[] = [
  { field: 'name', title: 'Document', role: 'text' },
  { field: 'type', title: 'Type', role: 'code', width: 160,
    widthNote: 'Holds phrases like "Assembly Drawing", not a short enum.',
    render: d => <span className="vy-code">{d.type}</span> },
  { field: 'assignee', title: 'Assignee', role: 'code', width: 140, widthNote: 'Full names.' },
  { field: 'uploadedBy', title: 'Uploaded by', role: 'code', width: 140, widthNote: 'Full names.' },
  { field: 'uploadedDate', title: 'Uploaded', role: 'date', render: d => fmtDate(d.uploadedDate) },
  { field: 'status', title: 'Status', role: 'status', render: d => <StatusBadge value={d.status} /> },
];

/**
 * Checklists & Assignment.
 *
 * The live tab stacks three assignee pickers, two collapsible checklist groups
 * and a documents grid with no hierarchy between them, and gives no completion
 * count — you read all ten rows to learn where the RFQ is. Each group states
 * its own progress here, and the two sit side by side because different people
 * work them: program versus engineering.
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
            Documents {q.documents.length > 0 && <span className="vy-pill">{q.documents.length}</span>}
          </h2>
          <Button onClick={() => toast.notImplemented('attach a drawing, BoM or test spec to this RFQ')}>
            Upload
          </Button>
        </div>
        <MiniTable
          data={q.documents}
          columns={DOC_COLUMNS}
          empty={
            <div className="vy-empty-inline">
              No documents attached yet. Drawings, BoMs and test specs uploaded here are visible
              to everyone assigned to this RFQ.
            </div>
          }
        />
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
        {/* Progress stated once, up front, rather than inferred from ten rows. */}
        <span className="vy-checklist-progress" data-complete={pct === 100 || undefined}>
          {done} of {items.length}
        </span>
      </div>
      <Progress value={pct} label={`${title} ${pct}% complete`} />
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
