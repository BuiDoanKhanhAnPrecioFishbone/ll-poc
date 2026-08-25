import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { fmtDate } from '../ui/DataGrid';
import { generateQuotations, daysUntil, findCustomer, contactsFor, type Quotation } from '../data/quotations';
import { ChecklistsTab } from '../components/quotation/ChecklistsTab';
import { ResultTab } from '../components/quotation/ResultTab';
import { ConversationsTab } from '../components/quotation/ConversationsTab';
import { ActivityTab } from '../components/quotation/ActivityTab';
import { BomComparisonDialog } from '../components/quotation/BomComparisonDialog';
import { RunQuotationDialog } from '../components/quotation/RunQuotationDialog';
import { useToast } from '../ui/Toast';
import { RecordField } from '../components/quotation/RecordField';
import { smartButtonsFor, SmartIcon } from '../components/quotation/SmartButtons';
import { HEADER_GROUPS, COMMERCIAL, TECHNICAL, INVENTORY, NOTES, ALL_FIELDS,
         setHistoricalRfqOptions } from '../components/quotation/requirementFields';

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
 *    identity, status, owner and due date, in that order — followed by the
 *    classification fields the live header carries (Project Type, Order Type,
 *    Customer Type, Customer Contact). An earlier pass moved those four into a
 *    tab to slim the header down; decision D1 put them back, because an
 *    estimator reads them to decide whether the RFQ is theirs to work at all.
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
  const all = useMemo(() => generateQuotations(330), []);
  /* Historical RFQ is a reference to another RFQ, so its options are the other
     RFQs — seeded here rather than invented inside the field definition. */
  useMemo(() => setHistoricalRfqOptions(['', ...all.map(x => `RFQ${x.no}`)]), [all]);
  const base = useMemo(() => all.find(x => x.id === id), [all, id]);
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

  /**
   * Changing the customer cascades, because on the live form the customer record
   * owns four other values.
   *
   * Leaving the old contact in place would be the worse failure: the form would
   * read as valid while naming someone who does not work for the new customer,
   * and nothing on screen would say so. Resetting to that customer's first
   * contact is what the live code does.
   */
  const setField = (name: string, v: unknown) =>
    setDraft(d => {
      if (!d) return d;
      if (name !== 'customer') return { ...d, [name]: v };
      const cust = findCustomer(String(v));
      if (!cust) return { ...d, customer: String(v) };
      return {
        ...d,
        customer: cust.label,
        customerContact: contactsFor(cust.label)[0] ?? '',
        customerType: cust.custType,
        itar: cust.isItar,
        /* Only suggested, never overwritten: the live code writes the customer's
           markup solely when the field is still unset. */
        markup: d.markup || cust.priceMarkup,
        /* The old project belonged to the old customer. */
        projectName: '',
      };
    });

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
  const checklistOutstanding = q.tasks.filter(t => t.status !== 'Done').length;

  return (
    <div className="vy-page vy-page--record">
      {/* ---- Record header: ONE block ------------------------------------
          It used to be three — an action bar, a card of four facts, and a
          second card of header fields — which cost about 900px before the tabs
          and printed the project name twice. Same fields, same names, same
          order; one container, half the height. */}
      <header className="vy-rfq-head">
        {/* Back is a way OUT, not something you do to the record. As a pill
            beside "Run Quotation" it competed with the actions; above them and
            unstyled, it reads as the escape hatch it is. */}
        <button type="button" className="vy-back"
                onClick={() => navigate('/sales-management/quotation')}>
          <span aria-hidden>←</span> Quotations
        </button>

        {/* ---- Smart buttons -----------------------------------------------
            Flagged in the 25 Aug review as outright missing: "In leading ERP
            systems, every record must have related navigation."

            They are deliberately NOT styled like the action buttons beside
            them. An action button does something TO this record; a smart button
            goes somewhere else. Same shape for both is how a user learns to
            hesitate before every click. These carry a count, so they also
            answer "is there anything there" without being pressed — a zero is
            information, and stays visible rather than being hidden. */}
        <nav className="vy-smart-buttons" aria-label="Related records">
          {smartButtonsFor(q).map(b => (
            <button key={b.label} type="button" className="vy-smart-btn"
                    data-empty={b.count === 0 || undefined}
                    onClick={() => b.count
                      ? toast.notImplemented(`open the ${b.count === 1 ? b.label.toLowerCase() : b.plural.toLowerCase()} linked to RFQ${q.no}`)
                      : toast.notImplemented(`create a ${b.label.toLowerCase()} for RFQ${q.no}`)}>
              <SmartIcon name={b.icon} />
              {b.count !== null && <span className="vy-smart-n">{b.count}</span>}
              <span>{b.count === 1 ? b.label : b.plural}</span>
            </button>
          ))}
        </nav>

        <div className="vy-record-bar">
          <div className="vy-record-id">
            <span className="vy-ident vy-record-no">RFQ{q.no}</span>
            <StatusBadge value={q.status} />
            {/* Reads the DRAFT, not the saved record. ITAR follows the customer,
                so changing the customer mid-edit changes it — and a badge that
                still showed the old value would be telling you this RFQ is not
                export-controlled while the form beneath it says otherwise. */}
            {(draft ?? q).itar && (
              <span className="vy-flag" title="Subject to ITAR export control">ITAR</span>
            )}
            {!closed && (
              /* Lateness belongs beside the status, not buried in a date field.
                 It is the one fact that changes what you do next. */
              <span className="vy-due-chip" data-tone={due < 0 ? 'overdue' : due <= 3 ? 'soon' : 'none'}>
                {due < 0 ? `${-due} days late` : due === 0 ? 'Due today' : `Due in ${due} days`}
              </span>
            )}
          </div>

          {/* Edit governs the header fields AND the Requirements tab, so it sits
              where both are visible. When it sat on the tab alone it under-
              claimed; when it sat here while unlocking only the tab, it over-
              claimed. */}
          <div className="vy-page-actions">
            {editing ? (
              <>
                <Button onClick={cancelEdit}>Cancel</Button>
                <Button variant="filled" disabled={!dirty} onClick={saveEdit}>
                  {dirty ? `Save ${changeCount} ${changeCount === 1 ? 'change' : 'changes'}` : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setDraft({ ...q })}>Edit</Button>
                <Button onClick={() => setBomOpen(true)}>BoM Comparison</Button>
                <Button variant="filled" onClick={() => setRunOpen(true)}>Run Quotation</Button>
              </>
            )}
          </div>
        </div>

        {/* The project name is the heading when you are reading. While editing
            it becomes a field in the grid below — printing it in both places is
            what made the old header look duplicated. */}
        {!editing && <h1 className="vy-record-title">{q.projectName}</h1>}

        {editing && (
          <p className="vy-edit-banner" role="status">
            Editing RFQ{q.no}. Nothing is saved until you choose Save.
          </p>
        )}

        {/* ---- Three regions, not one grid ---------------------------------
            Grouped by what the fields are ABOUT: who it is for, what it is, and
            whether it is on track. Nine fields in a flat row give the eye
            nothing to navigate by, so finding "who is the contact" means reading
            every label; three named regions give three places to look.

            Field order INSIDE each region is unchanged, so nothing a user has
            learned moves relative to anything else in its own section.

            Pattern follows the reviewed Customer Invoice mockup, which divides
            its header into Customer & references, Invoice info, and Documents &
            shipping. */}
        <div className="vy-header-groups" data-editing={editing || undefined}>
          {HEADER_GROUPS.map(g => (
            <section className="vy-header-group" key={g.id}>
              <h2 className="vy-header-group-title">
                <SmartIcon name={g.icon} />{g.title}
              </h2>
              <dl className="vy-record-fields" data-editing={editing || undefined}>
                {g.fields
                  /* The project name is the heading while reading, so printing
                     it here too would repeat it on one screen. Editing needs it
                     as a control, and the heading steps aside for it. */
                  .filter(def => editing || def.name !== 'projectName')
                  .map(def => (
                    <RecordField key={def.name} def={def} value={(draft ?? q)[def.name]}
                                 editing={editing} onChange={setField} row={draft ?? q} />
                  ))}
                {/* Two system-stamped dates and a rating, which have no FieldDef
                    because nothing about them is typed. They belong with the
                    owner: a due date means little without knowing whose it is. */}
                {/* Two system-stamped dates, which have no FieldDef because
                    nothing about them is typed. Priority is a real field and
                    lives in the group's own list, editable. */}
                {g.id === 'schedule' && <>
                  <Fact label="Due Date" value={fmtDate(q.dateNeeded)} />
                  <Fact label="Created Date" value={fmtDate(q.createdDate)} />
                </>}
              </dl>
            </section>
          ))}
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: 'requirements', label: 'Requirements', content:
            <RequirementsTab
              q={draft ?? q}
              editing={editing}
              onChange={setField}
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
 * The specification: what was agreed, as distinct from what is being done
 * about it.
 *
 * These fields get an explicit edit mode with an explicit Save, because they
 * are a twenty-field form where committing half-finished changes is a real
 * risk and Cancel needs to mean something. Checklists take the opposite model
 * and save as you go: ticking an item or moving it to Done is one discrete act
 * with nothing to half-finish, and it happens many times a day by several
 * people on the same record. Gating that behind Edit/Save would make a shared
 * working screen feel locked.
 *
 * Same data, two rhythms. The rule is that the commitment ceremony should match
 * what a mistake costs.
 */
function RequirementsTab({ q, editing, onChange }: {
  q: Quotation; editing: boolean; onChange: (name: string, v: unknown) => void;
}) {
  const group = (defs: typeof COMMERCIAL) =>
    defs.map(def => (
      <RecordField key={def.name} def={def} value={q[def.name]}
                   editing={editing} onChange={onChange} row={q} />
    ));

  return (
    <>
      <div className="vy-field-groups">
        <FieldGroup title="Commercial">{group(COMMERCIAL)}</FieldGroup>
        <FieldGroup title="Technical">{group(TECHNICAL)}</FieldGroup>
        <FieldGroup title="Inventory & options">{group(INVENTORY)}</FieldGroup>
      </div>

      <div className="vy-notes-edit">{group(NOTES)}</div>
    </>
  );
}

/**
 * A read-only header value that has no FieldDef, because the system owns it —
 * the two dates and the priority.
 *
 * It renders as `.vy-field` rather than a shape of its own, so it sits in the
 * same grid as the editable fields and aligns with them. Two visual vocabularies
 * for "label above value" in one header was half the reason it read as two
 * separate cards.
 */
function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="vy-field">
      <dt>{label}</dt>
      <dd>{value}</dd>
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



