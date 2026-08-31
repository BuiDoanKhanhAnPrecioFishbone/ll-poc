import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog, Tabs } from '../ui/Overlays';
import { ValidationPanel } from '../components/quotation/ValidationPanel';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { generateQuotations, daysUntil, findCustomer, contactsFor, taskStatus, type Quotation } from '../data/quotations';
import { ChecklistsTab } from '../components/quotation/ChecklistsTab';
import { ResultTab } from '../components/quotation/ResultTab';
import { ConversationsTab } from '../components/quotation/ConversationsTab';
import { ActivityTab } from '../components/quotation/ActivityTab';
import { BomComparisonDialog } from '../components/quotation/BomComparisonDialog';
import { RunQuotationDialog } from '../components/quotation/RunQuotationDialog';
import { AddContactDialog, type NewContact } from '../components/quotation/AddContactDialog';
import { useToast } from '../ui/Toast';
import { RecordField, isMissing } from '../components/quotation/RecordField';
import { smartButtonsFor, SmartIcon } from '../components/quotation/SmartButtons';
import { HISTORICAL_RFQ_FIELD, showsHistoricalRfq, HEADER_GROUPS, COMMERCIAL, TECHNICAL, INVENTORY, NOTES, ALL_FIELDS,
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
  const [contactOpen, setContactOpen] = useState(false);
  const [newContacts, setNewContacts] = useState<NewContact[]>([]);
  const toast = useToast();

  /* Edit is a mode, not a permanent state of the page. `saved` holds edits made
     in this session; `draft` holds edits not yet committed. Keeping them apart
     is what makes Cancel able to actually discard. */
  const [saved, setSaved] = useState<Quotation | null>(null);
  const [draft, setDraft] = useState<Quotation | null>(null);

  /* Which fields the user has left. The guideline validates when the user
     "clicks outside", not on every keystroke, so a field nobody has reached
     yet stays quiet. Attempting Save marks everything touched at once, which
     is what makes the errors appear where the eye is not. */
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const markTouched = (name: string) => setTouched(t => new Set(t).add(name));
  const editing = draft !== null;
  const all = useMemo(() => generateQuotations(330), []);
  /* Historical RFQ is a reference to another RFQ, so its options are the other
     RFQs — seeded here rather than invented inside the field definition. */
  useMemo(() => setHistoricalRfqOptions(all.map(x => ({ customer: x.customer, no: x.no }))), [all]);
  const base = useMemo(() => all.find(x => x.id === id), [all, id]);
  const q = saved ?? base;

  /* Declared with the other hooks, ABOVE the not-found return. It began life
     beside cancelEdit, which reads better and is wrong: a bad :id returns
     early, so on that render the hook was never reached, and navigating from a
     missing RFQ to a real one changed the hook order between renders. */
  const [confirmDiscard, setConfirmDiscard] = useState(false);

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
  /* Every required field that is still empty. Save stays disabled while this
     is non-empty — "the Save button becomes enabled after the user enters or
     selects values for all required fields". */
  const missingRequired = ALL_FIELDS.filter(f => isMissing(f, (draft ?? q)[f.name]));

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
        /* The three Assignee roles default from the customer's own
           configuration, per the guideline: "If a [role] has been configured
           for the corresponding customer ... that user is displayed as the
           default selected value."

           `||` not `??`, so an unconfigured role leaves whoever is already
           there rather than blanking a choice the user made. And a customer
           with no configuration at all changes none of the three — the
           guideline's "if" is per ROLE, which is why one of the mock customers
           configures only a Buyer. */
        programManager: cust.roles?.programManager || d.programManager,
        buyer: cust.roles?.buyer || d.buyer,
        engineer: cust.roles?.engineer || d.engineer,
        /* The old project belonged to the old customer. */
        projectName: '',
      };
    });

  function saveEdit() {
    if (!draft) return;
    /* Belt and braces: the button is already disabled, but a keyboard submit or
       a future caller should not be able to slip past the same rule. */
    if (missingRequired.length) {
      setTouched(new Set(ALL_FIELDS.map(f => f.name)));
      return;
    }
    setSaved(draft);
    setDraft(null);
    toast.success(
      `Saved ${changeCount} ${changeCount === 1 ? 'change' : 'changes'} to RFQ${draft.no}. Held in this browser session only.`
    );
  }

  /* Discarding work silently is how people lose it, so this asks — but it asks
     in the app's own dialog rather than the browser's `confirm()`.

     A native confirm was the wrong control at the worst moment. It is the one
     modal in the app that does not look like the app: unstyled, OS-dependent,
     blocking, unfocusable by our own rules, and impossible to say anything
     useful in. It also could not name what was about to be lost — "Discard 3
     unsaved changes?" tells you the count and leaves you to remember WHICH
     three, which is exactly what someone reaching for Cancel is unsure about.

     This lists the changed fields, so the choice is made against the facts. */
  function cancelEdit() {
    /* Only ask when there is something to lose. */
    if (dirty) { setConfirmDiscard(true); return; }
    setDraft(null);
  }

  /* The dialog is the guard; this is the second net under it. Undo is normally
     BETTER than a confirmation — it lets the common case, where the user meant
     it, happen without interruption. It is not enough on its own here, because
     the undo lives in a toast: Cancel leaves edit mode, the user may leave the
     page, and the closure holding the draft goes with it. So both, each doing
     the job the other cannot — the dialog stops the accident, the undo forgives
     the confirmation clicked too fast. */
  function discardEdit() {
    const discarded = draft;
    setConfirmDiscard(false);
    setDraft(null);
    toast.undoable(
      `Discarded ${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}.`,
      () => setDraft(discarded),
    );
  }
  /* Tab labels carry counts so the record's state is legible without opening
     each tab. The live TabStrip gives five bare nouns. */
  const checklistOutstanding = q.tasks.filter(t => taskStatus(t) !== 'Completed').length;

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
        {/* "Cancel" on the live record, not "Back". Kept as a quiet link
            rather than a pill so it does not compete with Run Quotation — the
            layout is ours to change, the word is not. */}
        <button type="button" className="vy-back"
                onClick={() => navigate('/sales-management/quotation')}>
          <span aria-hidden>←</span> Cancel
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
                    /* Always GOES somewhere — never creates. The branch here
                       used to call create when the count was falsy, which made
                       one row mix navigation with a record-modifying action,
                       against the rule this component is built on. It also
                       caught Customer, whose count is null rather than 0, so
                       the single most-clicked button in the row offered to
                       create a second customer for the RFQ. An empty
                       destination is still a destination. */
                    onClick={() => toast.notImplemented(
                      `open the ${b.count === 1 ? b.label.toLowerCase() : b.plural.toLowerCase()} linked to RFQ${q.no}`)}>
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
            {/* "After the RFQ is created successfully, the system displays an
                additional New Customer status at the top-right corner of the
                RFQ screen." It sits with the other statuses rather than in the
                corner on its own, because it answers the same question they do
                — what kind of RFQ is this — and a lone badge in the opposite
                corner would be read as belonging to the buttons under it. */}
            {q.newCustomer && (
              <span className="vy-flag vy-flag--new-customer"
                    title="This customer was not in Customer Management when the RFQ was created">
                New Customer
              </span>
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
                {/* Disabled while a required field is empty — "the Save button
                    becomes enabled after the user enters or selects values for
                    all required fields". The label and tooltip say WHICH are
                    outstanding, because a disabled button with no explanation
                    is a dead end: you can see it is off, not why. */}
                <Button variant="filled"
                        disabled={!dirty || missingRequired.length > 0}
                        title={missingRequired.length
                          ? `Still needed: ${missingRequired.map(f => f.label).join(', ')}`
                          : undefined}
                        onClick={saveEdit}>
                  {missingRequired.length
                    ? `${missingRequired.length} field${missingRequired.length === 1 ? '' : 's'} still needed`
                    : dirty ? `Save ${changeCount} ${changeCount === 1 ? 'change' : 'changes'}` : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => { setDraft({ ...q }); setTouched(new Set()); }}>Edit</Button>
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
        {/* Above the fields and below the actions, where the deck puts it.

            Shown for as long as edit mode has a blocking field, NOT gated on a
            save attempt. There is no save attempt to gate on: Save is disabled
            while anything is missing, so the branch in saveEdit that marks
            everything touched cannot be reached by clicking, and a panel waiting
            for that moment would never appear.

            Which leaves the disabled button saying "1 field still needed" and
            declining to say which — the exact gap this panel exists to close. On
            an EXISTING record being edited, naming the blocker on arrival is
            help rather than nagging; the record already cannot be saved, and the
            user finds that out either now or after hunting for it. */}
        {editing && missingRequired.length > 0 && (
          <ValidationPanel
            missing={missingRequired}
            onGoTo={name => {
              const el = document.getElementById(`f-${name}`);
              if (!el) return;
              /* Scroll THEN focus. Focusing alone jumps the field into view with
                 no animation and often under the sticky header; centring it
                 first means the user sees where they were taken. */
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (el instanceof HTMLElement) el.focus({ preventScroll: true });
            }}
          />
        )}

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
                    <div key={def.name} className="vy-field-slot">
                      <RecordField def={def} value={(draft ?? q)[def.name]}
                                   editing={editing} onChange={setField} row={draft ?? q}
                                   touched={touched.has(def.name)} onBlur={markTouched} />
                      {/* "After the RFQ is created successfully, the system
                          displays an additional Add Contact button below the
                          Customer field." Only for a customer who has no record
                          to add contacts to — for everyone else the contacts
                          already exist in Customer Management, and a button
                          here would be a second, divergent place to create
                          them. */}
                      {def.name === 'customer' && q.newCustomer && (
                        <Button variant="text" className="vy-add-contact"
                                onClick={() => setContactOpen(true)}
                                title={`Add a contact for ${q.customer}`}>
                          + Add Contact
                        </Button>
                      )}
                    </div>
                  ))}

                {/* Historical RFQ appears only when Order Type is "Repeat", and
                    sits directly below it — the guideline says "displayed
                    below". Reads the DRAFT, so choosing Repeat mid-edit reveals
                    it immediately rather than after a save. */}
                {g.id === 'project' && showsHistoricalRfq(draft ?? q) && (
                  <RecordField def={HISTORICAL_RFQ_FIELD}
                               value={(draft ?? q).historicalRfq}
                               editing={editing} onChange={setField} row={draft ?? q}
                               touched={touched.has('historicalRfq')} onBlur={markTouched} />
                )}
              </dl>
            </section>
          ))}
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={setTab}
        tabs={[
          /* Tab names verbatim from the live record (docs/live-spec-25aug.md).
             All five had been shortened — "Requirements", "Result", "Activity" —
             without anyone asking for it. */
          { value: 'requirements', label: 'Specific Requirements', content:
            <RequirementsTab
              q={draft ?? q}
              editing={editing}
              onChange={setField}
              touched={touched}
              onBlur={markTouched}
            /> },
          { value: 'checklists',   label: 'Checklists & Assignment', count: checklistOutstanding, content: (
            /* CONTROLLED by the draft while editing, so the tab follows the
               record instead of a copy it took when it mounted. Its own state is
               seeded once from `q`, which meant the customer-configured Program
               Manager, Buyer and Engineer landed in the draft and never reached
               the screen — and, before that change, that editing a record and
               saving left this tab showing the people it loaded with. */
            <ChecklistsTab
              q={q}
              people={editing && draft
                ? { programManager: draft.programManager, buyer: draft.buyer, engineer: draft.engineer }
                : undefined}
              onPeopleChange={editing && draft
                ? p => setDraft(d => (d ? { ...d, ...p } : d))
                : undefined}
            />
          ) },
          { value: 'result',       label: 'Quotation Result', count: q.results.length,     content: <ResultTab q={q} onRun={() => setRunOpen(true)} /> },
          { value: 'conversations',label: 'Conversations',count: q.comments.length,    content: <ConversationsTab q={q} /> },
          { value: 'activity',     label: 'Activity Logs', content: <ActivityTab q={q} /> },
        ]}
      />

      {/* Names the fields, which is the whole reason this is not a confirm().
          Someone reaching for Cancel is usually unsure what they touched; a
          count answers a question they were not asking. */}
      <Dialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title={`Discard ${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}?`}
        subtitle="This cannot be recovered once you leave the record."
        actions={
          <>
            <Button variant="text" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
            <Button variant="danger" onClick={discardEdit}>Discard changes</Button>
          </>
        }
      >
        <p className="vy-dialog-lead">You changed:</p>
        <ul className="vy-discard-list">
          {changed.map(label => <li key={label}>{label}</li>)}
        </ul>
      </Dialog>

      {contactOpen && (
        <AddContactDialog
          open
          customer={q.customer}
          contacts={newContacts}
          onClose={() => setContactOpen(false)}
          onAdd={c => {
            const next = [...newContacts, c];
            setNewContacts(next);
            /* Committed to the RECORD, not the draft. Add Contact is reachable
               while merely reading — there is no Edit mode around it — and
               `setField` writes to the draft, so routing this through it made
               the first contact silently fail to be selected whenever the user
               had not pressed Edit, which is nearly always.

               The first contact added also becomes the selected one, matching
               what choosing an existing customer does: "if the selected
               customer has only one customer contact, the system automatically
               populates this field with that contact". */
            const names = next.map(x => x.name);
            const applyTo = <T extends Quotation>(on: T): T => ({
              ...on,
              newCustomerContacts: names,
              customerContact: on.customerContact || c.name,
            });
            setSaved(prev => applyTo(prev ?? q));
            /* And the draft, if one is open. Add Contact is reachable in both
               modes, and a contact that reached only the record would vanish
               from the dropdown the moment the user pressed Edit. */
            setDraft(d => (d ? applyTo(d) : d));
          }}
        />
      )}
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
function RequirementsTab({ q, editing, onChange, touched, onBlur }: {
  q: Quotation; editing: boolean; onChange: (name: string, v: unknown) => void;
  touched: Set<string>; onBlur: (name: string) => void;
}) {
  const group = (defs: typeof COMMERCIAL) =>
    defs.map(def => (
      <RecordField key={def.name} def={def} value={q[def.name]}
                   editing={editing} onChange={onChange} row={q}
                   touched={touched.has(def.name)} onBlur={onBlur} />
    ));

  return (
    <>
      <div className="vy-field-groups">
        {/* Section names verbatim from the live form. "Commercial",
            "Technical" and "Inventory & options" were invented; the live screen
            names these itself. */}
        <FieldGroup title="Quote Configuration">{group(COMMERCIAL)}</FieldGroup>
        <FieldGroup title="Technical Specifications">{group(TECHNICAL)}</FieldGroup>
        <FieldGroup title="Special Requirements & Options">{group(INVENTORY)}</FieldGroup>
      </div>

      {/* The live form's fourth section. It had no heading here, so two
          free-text boxes sat under the flags with nothing saying they were a
          section of their own. */}
      <section className="vy-field-group vy-field-group--notes">
        <h2 className="vy-field-group-title">Additional Notes</h2>
        <dl className="vy-notes-edit">{group(NOTES)}</dl>
      </section>
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



