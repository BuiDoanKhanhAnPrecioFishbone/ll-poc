import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Overlays';
import { MiniTable } from '../../ui/MiniTable';
import { fmtDate } from '../../ui/DataGrid';
import { useToast } from '../../ui/Toast';
import type { ColumnSpec } from '../column-model';
import {
  PROGRAM_CHECKLIST, ENGINEERING_CHECKLIST, PEOPLE,
  type Quotation, type ChecklistTask, type TaskStatus,
} from '../../data/quotations';

const STATUSES: TaskStatus[] = ['To do', 'In progress', 'Done'];

/**
 * Checklists & Assignment.
 *
 * THE MODEL, verified against the live system on 22 Aug 2026: the ticked
 * checklist items ARE the rows of the grid. Ticking "Assembly Drive" creates an
 * "Assembly Drive" task, which then carries a document, an assignee and a
 * status. The tick means "this applies to this RFQ", not "this is finished".
 *
 * This tab previously modelled them as two unrelated things — a checklist of
 * done/not-done on the left, an unrelated list of documents on the right — and
 * reported "3 of 5 done", which measured something the system does not track.
 * That was a misreading, corrected here.
 *
 * Layout follows the original: assignees and the checklist groups down the left,
 * the task grid filling the right.
 */
export function ChecklistsTab({ q }: { q: Quotation }) {
  const toast = useToast();
  const [tasks, setTasks] = useState<ChecklistTask[]>(q.tasks);
  const [people, setPeople] = useState({
    programManager: q.programManager, buyer: q.buyer, engineer: q.engineer,
  });

  const selected = new Set(tasks.map(t => t.type));

  function toggle(type: string, on: boolean) {
    if (on) {
      setTasks(t => [...t, {
        type, documentName: '', uploadedBy: '', uploadedDate: null,
        assignee: '', status: 'To do',
      }]);
      return;
    }
    const task = tasks.find(t => t.type === type);
    /* Removing a task discards whatever was attached to it, so say so. */
    if (task?.documentName && !confirm(`Remove "${type}"? Its document and status will be discarded.`)) return;
    setTasks(t => t.filter(x => x.type !== type));
  }

  const setStatus = (type: string, status: TaskStatus) =>
    setTasks(t => t.map(x => (x.type === type ? { ...x, status } : x)));
  const setAssignee = (type: string, assignee: string) =>
    setTasks(t => t.map(x => (x.type === type ? { ...x, assignee } : x)));

  const columns: ColumnSpec<ChecklistTask & { id: string }>[] = [
    { field: 'type', title: 'Task', role: 'text' },
    { field: 'documentName', title: 'Document', role: 'text',
      render: t => t.documentName
        ? <a className="vy-cell-link" href="#" onClick={e => { e.preventDefault(); toast.notImplemented(`download ${t.documentName}`); }}>{t.documentName}</a>
        : <span className="vy-empty">None yet</span> },
    { field: 'uploadedBy', title: 'Uploaded by', role: 'code', width: 140, widthNote: 'Full names.' },
    { field: 'uploadedDate', title: 'Uploaded', role: 'date',
      render: t => t.uploadedDate ? fmtDate(t.uploadedDate) : <span className="vy-empty">—</span> },
    { field: 'assignee', title: 'Assignee', role: 'code', width: 170,
      widthNote: 'Holds a picker, not a code.',
      render: t => <Select label={`Assignee for ${t.type}`} value={t.assignee || 'Unassigned'}
                           options={['Unassigned', ...PEOPLE]}
                           onChange={v => setAssignee(t.type, v === 'Unassigned' ? '' : v)} /> },
    { field: 'status', title: 'Status', role: 'status', width: 160,
      widthNote: 'Holds a picker, not a badge.',
      render: t => <Select label={`Status for ${t.type}`} value={t.status}
                           options={STATUSES} onChange={v => setStatus(t.type, v as TaskStatus)} /> },
  ];

  const done = tasks.filter(t => t.status === 'Done').length;

  return (
    <div className="vy-checklist-layout">
      <aside className="vy-assignees">
        <section>
          <h2 className="vy-field-group-title">Assignees</h2>
          <Assignee role="Program Manager" required value={people.programManager}
                    onChange={v => setPeople(p => ({ ...p, programManager: v }))} />
          <Assignee role="Buyer" required value={people.buyer}
                    onChange={v => setPeople(p => ({ ...p, buyer: v }))} />
          <Assignee role="Engineer" value={people.engineer}
                    onChange={v => setPeople(p => ({ ...p, engineer: v }))} />
        </section>

        <ChecklistGroup title="Program checklist" items={PROGRAM_CHECKLIST}
                        selected={selected} onToggle={toggle} />
        <ChecklistGroup title="Engineering checklist" items={ENGINEERING_CHECKLIST}
                        selected={selected} onToggle={toggle} />
      </aside>

      <section className="vy-tasks">
        <div className="vy-doc-head">
          <h2 className="vy-field-group-title">
            Tasks {tasks.length > 0 && <span className="vy-pill">{done} of {tasks.length} done</span>}
          </h2>
          <Button onClick={() => toast.notImplemented('attach a document to a task')}>Upload</Button>
        </div>

        <MiniTable
          data={tasks.map(t => ({ ...t, id: t.type }))}
          columns={columns}
          empty={
            <div className="vy-empty-inline">
              <strong>No tasks yet.</strong> Tick an item in the checklists on the left and it
              appears here, where you attach its document and set who owns it.
            </div>
          }
        />
      </section>
    </div>
  );
}

/** Selecting an item is choosing that it applies — not marking it finished. */
function ChecklistGroup({ title, items, selected, onToggle }: {
  title: string; items: readonly string[];
  selected: Set<string>; onToggle: (type: string, on: boolean) => void;
}) {
  const n = items.filter(i => selected.has(i)).length;
  return (
    <section className="vy-checklist">
      <div className="vy-checklist-head">
        <h2 className="vy-field-group-title">{title}</h2>
        <span className="vy-checklist-progress">{n} of {items.length}</span>
      </div>
      <ul className="vy-checklist-items">
        {items.map(i => (
          <li key={i} data-selected={selected.has(i) || undefined}>
            <label className="vy-check-row">
              <input type="checkbox" className="vy-check-input"
                     checked={selected.has(i)}
                     onChange={e => onToggle(i, e.target.checked)} />
              <span className="vy-check-name">{i}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
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

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
