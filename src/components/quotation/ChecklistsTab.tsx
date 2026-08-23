import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Overlays';
import { MiniTable } from '../../ui/MiniTable';
import { StatusBadge } from '../../ui/Badge';
import { fmtDate } from '../../ui/DataGrid';
import { useToast } from '../../ui/Toast';
import type { ColumnSpec } from '../column-model';
import {
  PROGRAM_CHECKLIST, ENGINEERING_CHECKLIST, PEOPLE,
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
  /* Ticking an item updates it here. Session-only, like the rest of the
     prototype's edits — but a checklist you cannot check is not a checklist. */
  const [program, setProgram] = useState(q.programChecklist);
  const [engineering, setEngineering] = useState(q.engineeringChecklist);
  /* Assignees were read-only, though the live system marks Program Manager and
     Buyer as required. Like the checkboxes, they save as you go: picking a name
     is one discrete act. */
  const [people, setPeople] = useState({
    programManager: q.programManager, buyer: q.buyer, engineer: q.engineer,
  });
  return (
    <>
      <section className="vy-assignees">
        <h2 className="vy-field-group-title">Assignees</h2>
        <div className="vy-assignee-row">
          <Assignee role="Program Manager" required value={people.programManager}
                    onChange={v => setPeople(p => ({ ...p, programManager: v }))} />
          <Assignee role="Buyer" required value={people.buyer}
                    onChange={v => setPeople(p => ({ ...p, buyer: v }))} />
          <Assignee role="Engineer" value={people.engineer}
                    onChange={v => setPeople(p => ({ ...p, engineer: v }))} />
        </div>
      </section>

      <div className="vy-checklist-cols">
        <Checklist title="Program" items={PROGRAM_CHECKLIST} state={program} onToggle={setProgram} />
        <Checklist title="Engineering" items={ENGINEERING_CHECKLIST} state={engineering} onToggle={setEngineering} />
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

function Assignee({ role, value, required, onChange }: {
  role: string; value: string; required?: boolean; onChange: (v: string) => void;
}) {
  const unset = !value;
  return (
    <div className="vy-assignee">
      <label className="vy-fact-label" htmlFor={`as-${role}`}>
        {role}
        {/* A space before the tag, so a screen reader says "Program Manager,
            required" rather than "Program Managerrequired". */}
        {required && <> <span className="vy-req">required</span></>}
      </label>
      <div className="vy-assignee-picker">
        {!unset && <span className="vy-avatar vy-avatar--sm" aria-hidden>{initials(value)}</span>}
        <Select id={`as-${role}`} label={role} value={value || 'Unassigned'}
                options={['Unassigned', ...PEOPLE]}
                onChange={v => onChange(v === 'Unassigned' ? '' : v)} />
      </div>
      {required && unset && <span className="vy-assignee-warn">Needs an owner before the quote can run.</span>}
    </div>
  );
}

/**
 * A checklist you can actually check.
 *
 * What this replaced, and why:
 *   - items were read-only. The one thing a checklist exists for was missing.
 *   - status was drawn twice: a glyph on the left and a word on the far right.
 *     The glyph set was ✓ ○ ◐ –, which needs a legend nobody has.
 *   - the word sat at the opposite edge of the row, so connecting "FAB Drive"
 *     to "Not started" meant tracking across empty space.
 *   - "N/A" rows were greyed almost to invisibility and read as broken.
 *
 * Now: one checkbox per row, label beside it, and a state word ONLY when it is
 * something other than plain done-or-not — "In progress" or "Not applicable".
 * A ticked box needs no caption.
 */
function Checklist({ title, items, state, onToggle }: {
  title: string;
  items: readonly string[];
  state: Record<string, ChecklistState>;
  onToggle: (next: Record<string, ChecklistState>) => void;
}) {
  const isDone = (s: ChecklistState) => s === 'Done';
  const done = items.filter(i => isDone(state[i])).length;
  const applicable = items.filter(i => state[i] !== 'N/A');
  const remaining = applicable.filter(i => !isDone(state[i]));

  return (
    <section className="vy-checklist">
      <div className="vy-checklist-head">
        <h2 className="vy-field-group-title">{title}</h2>
        <span className="vy-checklist-progress" data-complete={remaining.length === 0 || undefined}>
          {done} of {applicable.length} done
        </span>
      </div>

      <ul className="vy-checklist-items">
        {items.map(i => {
          const s = state[i];
          const na = s === 'N/A';
          return (
            <li key={i} data-state={s}>
              <label className="vy-check-row">
                <input
                  type="checkbox"
                  className="vy-check-input"
                  checked={isDone(s)}
                  disabled={na}
                  onChange={e => onToggle({ ...state, [i]: e.target.checked ? 'Done' : 'Not started' })}
                />
                <span className="vy-check-name">{i}</span>
                {/* Only states a tick cannot express get a word. */}
                {s === 'In progress' && <span className="vy-tag-soft">In progress</span>}
                {na && <span className="vy-tag-soft">Not applicable</span>}
              </label>
            </li>
          );
        })}
      </ul>

      {/* Says what is left rather than making you count it. */}
      <p className="vy-checklist-foot">
        {remaining.length === 0
          ? 'Nothing outstanding.'
          : `Next: ${remaining[0]}${remaining.length > 1 ? ` · ${remaining.length - 1} more` : ''}`}
      </p>
    </section>
  );
}

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
