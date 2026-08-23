import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { Rating } from '../ui/Rating';
import { StatusBadge } from '../ui/Badge';
import { fmtDate } from '../ui/DataGrid';
import { generateQuotations, daysUntil, type Quotation } from '../data/quotations';
import { ChecklistsTab } from '../components/quotation/ChecklistsTab';
import { ResultTab } from '../components/quotation/ResultTab';
import { ConversationsTab } from '../components/quotation/ConversationsTab';
import { ActivityTab } from '../components/quotation/ActivityTab';
import { BomComparisonDialog } from '../components/quotation/BomComparisonDialog';
import { RunQuotationDialog } from '../components/quotation/RunQuotationDialog';
import { useToast } from '../ui/Toast';
import { RecordField } from '../components/quotation/RecordField';
import { COMMERCIAL, TECHNICAL, INVENTORY, NOTES, ALL_FIELDS } from '../components/quotation/requirementFields';

/**
 * Quotation record.
 *
 * Three deliberate departures from the production screen:
 *
 * 1. It is a PAGE, not a modal Kendo Window. The live detail opens in a
 *    `k-window` over the app, so the record has no URL, no back button and no
 *    breadcrumb — you cannot send someone a link to an RFQ.
 * 2. Read mode renders VALUES, not disabled inputs. The live screen puts every
 *    field in a read-only `Input`, so a record you are merely looking at reads
 *    as a broken form. Editing is an explicit mode.
 * 3. The header answers "what is this and what does it need" before any detail:
 *    identity, status, owner and due date, in that order.
 */
export function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('requirements');
  const [bomOpen, setBomOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const toast = useToast();

  /* Edit is a mode, not a permanent state of the page. `saved` holds edits made
     in this session; `draft` holds edits not yet committed. Keeping them apart
     is what makes Cancel able to actually discard. */
  const [saved, setSaved] = useState<Quotation | null>(null);
  const [draft, setDraft] = useState<Quotation | null>(null);
  const editing = draft !== null;
  const base = useMemo(() => generateQuotations(330).find(x => x.id === id), [id]);
  const q = saved ?? base;

  if (!q || !base) {
    return (
      <div className="vy-page">
        <div className="vy-empty-state">
          <strong>No RFQ with that reference</strong>
          <p>It may have been deleted, or the link may be stale.</p>
          <Button variant="filled" onClick={() => navigate('/sales-management/quotation')}>
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  const due = daysUntil(q.dateNeeded);
  const closed = q.status === 'Completed' || q.status === 'Cancelled';

  /* Dirty tracking compares only the fields the form actually owns, so an
     unrelated change elsewhere in the record can never make Save look armed. */
  const changed = draft
    ? ALL_FIELDS.filter(f => draft[f.name] !== q[f.name]).map(f => f.label)
    : [];
  const dirty = changed.length > 0;
  const changeCount = changed.length;

  const setField = (name: string, v: unknown) =>
    setDraft(d => (d ? { ...d, [name]: v } : d));

  function saveEdit() {
    if (!draft) return;
    setSaved(draft);
    setDraft(null);
    toast.success(
      `Saved ${changeCount} ${changeCount === 1 ? 'change' : 'changes'} to RFQ${draft.no}. Held in this browser session only.`
    );
  }

  function cancelEdit() {
    /* Discarding work silently is how people lose it. Only ask when there is
       something to lose. */
    if (dirty && !confirm(`Discard ${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}?`)) return;
    setDraft(null);
  }
  /* Tab labels carry counts so the record's state is legible without opening
     each tab. The live TabStrip gives five bare nouns. */
  const checklistOutstanding =
    [...Object.values(q.programChecklist), ...Object.values(q.engineeringChecklist)]
      .filter(v => v === 'Not started' || v === 'In progress').length;

  return (
    <div className="vy-page vy-page--record">
      <div className="vy-record-bar">
        <div className="vy-record-id">
          <span className="vy-ident vy-record-no">RFQ{q.no}</span>
          <StatusBadge value={q.status} />
          {q.itar && <span className="vy-flag" title="Subject to ITAR export control">ITAR</span>}
        </div>
        <div className="vy-page-actions">
          <Button onClick={() => navigate('/sales-management/quotation')}>Back</Button>
          <Button onClick={() => setBomOpen(true)}>BoM Comparison</Button>
          <Button variant="filled" onClick={() => setRunOpen(true)}>Run Quotation</Button>
        </div>
      </div>

      <h1 className="vy-record-title">{q.projectName}</h1>

      {/* The four facts an estimator needs before anything else. */}
      <div className="vy-record-summary">
        <Fact label="Customer" value={q.customer} />
        <Fact label="Assigned to" value={q.assignedTo} />
        <Fact
          label="Date needed"
          value={<>
            {fmtDate(q.dateNeeded)}
            {!closed && (
              <span className="vy-due-rel" data-tone={due < 0 ? 'overdue' : due <= 3 ? 'soon' : 'none'}>
                {due < 0 ? `${-due} days late` : `in ${due} days`}
              </span>
            )}
          </>}
        />
        <Fact label="Priority" value={<Rating value={q.priority} max={3} />} />
        {/* Present on the live header; it was dropped in an earlier pass. */}
        <Fact label="Created" value={fmtDate(q.createdDate)} />
      </div>

      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'requirements', label: 'Requirements', content:
            <RequirementsTab
              q={draft ?? q}
              editing={editing}
              onChange={setField}
              dirty={dirty}
              changeCount={changeCount}
              onEdit={() => setDraft({ ...q })}
              onSave={saveEdit}
              onCancel={cancelEdit}
            /> },
          { value: 'checklists',   label: 'Checklists',   count: checklistOutstanding, content: <ChecklistsTab q={q} /> },
          { value: 'result',       label: 'Result',       count: q.results.length,     content: <ResultTab q={q} onRun={() => setRunOpen(true)} /> },
          { value: 'conversations',label: 'Conversations',count: q.comments.length,    content: <ConversationsTab q={q} /> },
          { value: 'activity',     label: 'Activity',     content: <ActivityTab q={q} /> },
        ]}
      />

      {bomOpen && <BomComparisonDialog onClose={() => setBomOpen(false)} />}
      {runOpen && <RunQuotationDialog q={q} onClose={() => setRunOpen(false)} />}
    </div>
  );
}

/** The requirements tab. Three groups, because the fields divide by who cares
 *  about them: commercial terms, technical build, and inventory options. The
 *  live screen uses the same three headings but renders every value as a
 *  read-only input, so a record you are only reading looks like a broken form. */
/**
 * Editing is scoped to this tab, and its controls live here.
 *
 * They used to sit in the record header, which reads as "edit this record" —
 * but the button only ever unlocked these fields. Checklists already edit
 * inline, so the header control was claiming a scope it did not have.
 *
 * The two models are deliberate rather than inconsistent: a twenty-field form
 * with required values gets an explicit mode and an explicit Save, because
 * committing half-finished changes to it is a real risk. Ticking a checklist
 * item is a single discrete act with nothing to half-finish, so it saves as you
 * go. The rule is that the control lives where it acts.
 */
function RequirementsTab({ q, editing, onChange, dirty, changeCount, onEdit, onSave, onCancel }: {
  q: Quotation; editing: boolean; onChange: (name: string, v: unknown) => void;
  dirty: boolean; changeCount: number;
  onEdit: () => void; onSave: () => void; onCancel: () => void;
}) {
  const group = (defs: typeof COMMERCIAL) =>
    defs.map(def => (
      <RecordField key={def.name} def={def} value={q[def.name]} editing={editing} onChange={onChange} />
    ));

  return (
    <>
      <div className="vy-tab-actions">
        {editing
          ? <p className="vy-edit-banner">Editing these requirements. Nothing is saved until you choose Save.</p>
          : <span />}
        <div className="vy-page-actions">
          {editing ? (
            <>
              <Button onClick={onCancel}>Cancel</Button>
              <Button variant="filled" disabled={!dirty} onClick={onSave}>
                {dirty ? `Save ${changeCount} ${changeCount === 1 ? 'change' : 'changes'}` : 'Save'}
              </Button>
            </>
          ) : (
            <Button onClick={onEdit}>Edit requirements</Button>
          )}
        </div>
      </div>

      <div className="vy-field-groups">
        <FieldGroup title="Commercial">{group(COMMERCIAL)}</FieldGroup>
        <FieldGroup title="Technical">{group(TECHNICAL)}</FieldGroup>
        <FieldGroup title="Inventory & options">{group(INVENTORY)}</FieldGroup>
      </div>

      <div className="vy-notes-edit">{group(NOTES)}</div>
    </>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="vy-fact">
      <div className="vy-fact-label">{label}</div>
      <div className="vy-fact-value">{value}</div>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="vy-field-group">
      <h2 className="vy-field-group-title">{title}</h2>
      <dl className="vy-field-list">{children}</dl>
    </section>
  );
}

/** Renders a value. An empty field says so once, quietly, rather than showing
 *  an empty disabled input that reads as broken. */



