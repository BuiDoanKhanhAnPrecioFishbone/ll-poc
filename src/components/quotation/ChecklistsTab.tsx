import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Overlays';
import { RequiredMark } from './RecordField';
import { MiniTable } from '../../ui/MiniTable';
import { FileDrop } from '../../ui/FileDrop';
import { Dialog } from '../../ui/Overlays';
import { fmtDate } from '../../ui/DataGrid';
import { useToast } from '../../ui/Toast';
import type { ColumnSpec } from '../column-model';
import {
  PROGRAM_CHECKLIST, ENGINEERING_CHECKLIST, PEOPLE,
  type Quotation, type ChecklistTask, taskStatus,
} from '../../data/quotations';


/**
 * Which project types bring an engineering stage with them.
 *
 * Verbatim from the Testing Guideline (Create PR, r89). "Production" and
 * "Box Build" are listed separately there, and this metadata has them as
 * separate values too, so the list is taken at its word rather than read as
 * one "Production Box Build" entry.
 */
export const ENGINEERING_PROJECT_TYPES = [
  'NPI - Validation Production', 'Production', 'Box Build', 'Test Development - High Vol',
];

export const showsEngineeringChecklist = (projectType: string) =>
  ENGINEERING_PROJECT_TYPES.includes(projectType);

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
export function ChecklistsTab({ q, people: controlled, onPeopleChange, touched, onBlur }: {
  q: Quotation;
  /**
   * Assignees, lifted out when the caller needs to validate them.
   *
   * The record screen leaves this tab to own its own state: Program Manager and
   * Buyer are already set there, and nothing gates on them. The create modal
   * cannot — the guideline makes both required for Save, and a Save button that
   * ignores two required fields on a tab the user has not opened is exactly the
   * failure the required markers exist to prevent. So the modal passes them in.
   */
  people?: { programManager: string; buyer: string; engineer: string };
  onPeopleChange?: (p: { programManager: string; buyer: string; engineer: string }) => void;
  /** Which assignees the user has left, so create-mode errors stay quiet until then. */
  touched?: Set<string>;
  onBlur?: (name: string) => void;
}) {
  const toast = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [tasks, setTasks] = useState<ChecklistTask[]>(q.tasks);
  const [ownPeople, setOwnPeople] = useState({
    programManager: q.programManager, buyer: q.buyer, engineer: q.engineer,
  });
  const people = controlled ?? ownPeople;
  const setPeople = (fn: (p: typeof people) => typeof people) => {
    const next = fn(people);
    if (onPeopleChange) onPeopleChange(next); else setOwnPeople(next);
  };

  const selected = new Set(tasks.map(t => t.type));

  /**
   * Every change here commits at once — there is no Edit mode on this tab and
   * no Save button, unlike the Requirements tab.
   *
   * That is deliberate rather than inconsistent. Ticking an item or moving it to
   * Done is one discrete act with nothing to half-finish, it happens many times
   * a day, and several people work the same RFQ; an edit gate would make a
   * shared working screen feel locked. A twenty-field specification is the
   * opposite case and keeps its explicit Save.
   *
   * The price of removing Save is that a mis-click commits silently. Undo is
   * what pays it, so every one of these goes through `undoable`.
   */
  function toggle(type: string, on: boolean) {
    const before = tasks;
    if (on) {
      /* "If the checklist item belongs to Program Checklists, the default
         assignee is the selected Program Manager ... If ... Engineering
         Checklists, the default assignee is the selected Engineer." The group
         the item came from decides which. It was left blank, so every new row
         arrived unassigned and someone had to set what the system already
         knew. */
      const fromEngineering = (ENGINEERING_CHECKLIST as readonly string[]).includes(type);
      setTasks(t => [...t, {
        type, documentName: '', uploadedBy: '', uploadedDate: null,
        assignee: (fromEngineering ? people.engineer : people.programManager) || '',
        approved: false,
      }]);
      toast.undoable(`"${type}" now applies to this RFQ.`, () => setTasks(before));
      return;
    }
    const task = tasks.find(t => t.type === type);
    setTasks(t => t.filter(x => x.type !== type));
    /* Unticking discards a document and a status, so the message names what
       went rather than saying "removed". Undo restores the whole row, which is
       why it captures the previous array instead of re-adding a blank task. */
    toast.undoable(
      task?.documentName
        ? `"${type}" removed, along with ${task.documentName}.`
        : `"${type}" no longer applies to this RFQ.`,
      () => setTasks(before),
    );
  }


  /* Assignment is the one change here that is quietly damaging when wrong: work
     lands in someone else's queue and neither person is told. It says WHO, and
     names the person it moved away from when there was one. */
  const setAssignee = (type: string, assignee: string) => {
    const before = tasks;
    const was = tasks.find(x => x.type === type)?.assignee;
    if (was === assignee) return;
    setTasks(t => t.map(x => (x.type === type ? { ...x, assignee } : x)));
    toast.undoable(
      assignee
        ? `${type} assigned to ${assignee}${was ? `, was ${was}` : ''}.`
        : `${type} unassigned${was ? `, was ${was}` : ''}.`,
      () => setTasks(before),
    );
  };

  const approve = (type: string) => {
    const before = tasks;
    setTasks(t => t.map(x => (x.type === type ? { ...x, approved: true } : x)));
    toast.undoable(`${type} approved.`, () => setTasks(before));
  };

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
    /* A READOUT, not a picker. The guideline derives all three from the
       document — To do with none attached, In Progress once one is, Completed
       once it is approved — so offering the user a dropdown let them assert a
       state the document contradicted. */
    { field: 'approved', title: 'Status', role: 'status', width: 130,
      render: t => {
        const st = taskStatus(t);
        return <span className="vy-task-status" data-status={st}>{st}</span>;
      } },
    /* "The Actions column provides available actions for document handling,
       including action buttons in the following order: Upload and Approve." */
    { field: 'uploadedBy', title: 'Actions', role: 'code', width: 170, sortable: false,
      widthNote: 'Holds two buttons.',
      render: t => (
        <span className="vy-task-actions">
          <Button size="sm" disabled={t.approved}
                  title={t.approved ? 'Approved documents cannot be replaced' : undefined}
                  onClick={() => toast.notImplemented(`attach a document to ${t.type}`)}>
            Upload
          </Button>
          {/* Disabled with nothing to approve, and again once approved — the
              sheet's three states, in order. */}
          <Button size="sm" disabled={!t.documentName || t.approved}
                  title={!t.documentName ? 'Attach a document first'
                        : t.approved ? 'Already approved' : undefined}
                  onClick={() => approve(t.type)}>
            Approve
          </Button>
        </span>
      ) },
  ];

  const done = tasks.filter(t => taskStatus(t) === 'Completed').length;

  return (
    <div className="vy-checklist-layout">
      <aside className="vy-assignees">
        <section>
          <h2 className="vy-field-group-title">Assignees</h2>
          <Assignee role="Program Manager" required value={people.programManager}
                    invalid={Boolean(touched?.has('programManager') && !people.programManager)}
                    onChange={v => { setPeople(p => ({ ...p, programManager: v })); onBlur?.('programManager'); }} />
          <Assignee role="Buyer" required value={people.buyer}
                    invalid={Boolean(touched?.has('buyer') && !people.buyer)}
                    onChange={v => { setPeople(p => ({ ...p, buyer: v })); onBlur?.('buyer'); }} />
          <Assignee role="Engineer" value={people.engineer}
                    onChange={v => setPeople(p => ({ ...p, engineer: v }))} />
        </section>

        <ChecklistGroup title="Program checklist" items={PROGRAM_CHECKLIST}
                        selected={selected} onToggle={toggle} />
        {/* "This panel is displayed only when the selected Project Type is one
            of the following: NPI - Validation Production, Production, Box Build,
            or Test Development - High Vol" — Testing Guideline, Create PR r89.
            It used to show for every project type, which put engineering items
            on RFQs that have no engineering stage. */}
        {showsEngineeringChecklist(q.projectType) && (
          <ChecklistGroup title="Engineering checklist" items={ENGINEERING_CHECKLIST}
                          selected={selected} onToggle={toggle} />
        )}
      </aside>

      <section className="vy-tasks">
        <div className="vy-doc-head">
          <h2 className="vy-field-group-title">
            Tasks {tasks.length > 0 && <span className="vy-pill">{done} of {tasks.length} done</span>}
          </h2>
          <Button onClick={() => setUploadOpen(true)}>Upload</Button>
        </div>

        {uploadOpen && (
          <Dialog open onClose={() => setUploadOpen(false)} title="Upload a document"
                  subtitle="Attach a document to this Project Requirement's checklist"
                  actions={<Button variant="filled" onClick={() => setUploadOpen(false)}>Done</Button>}>
            <FileDrop multiple accept=".xlsx,.pdf,.png,.jpg,.doc,.docx"
                      hint="Drawings, reports and signed checklists."
                      onPick={names => { if (names.length) toast.success(`${names.join(', ')} chosen.`); }} />
          </Dialog>
        )}

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
              {/* `--done` keeps the green tick: here it means the item is
                  complete, which is the one place that colour carries meaning. */}
              <input type="checkbox" className="vy-check-input vy-check-input--done"
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

function Assignee({ role, value, required, invalid, onChange }: {
  role: string; value: string; required?: boolean; invalid?: boolean;
  onChange: (v: string) => void;
}) {
  const unset = !value;
  return (
    <div className="vy-assignee">
      <label className="vy-fact-label" htmlFor={`as-${role}`}>
        {role}
        {/* `(*)`, matching every other required field on this record. It read
            "required" here and nothing at all everywhere else — one record
            cannot carry two conventions for the same fact. */}
        {required && <RequiredMark />}
      </label>
      <div className="vy-assignee-picker">
        {!unset && <span className="vy-avatar vy-avatar--sm" aria-hidden>{initials(value)}</span>}
        <Select id={`as-${role}`} label={role} value={value || 'Unassigned'}
                required={required} invalid={invalid}
                options={['Unassigned', ...PEOPLE]}
                onChange={v => onChange(v === 'Unassigned' ? '' : v)} />
      </div>
      {/* While creating, an empty required assignee is an ERROR in the same
          words the rest of the form uses. On an existing record it is a
          standing note, because the RFQ is real either way and the assignee
          only blocks the quote run. */}
      {invalid
        ? <span className="vy-field-error" role="alert">This field is required.</span>
        : required && unset && <span className="vy-assignee-warn">Needs an owner before the quote can run.</span>}
    </div>
  );
}

const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);
