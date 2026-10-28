import { useState } from 'react';
import { ReadValue } from '../../../ui/FieldRow';
import { SmartIcon } from '../SmartButtons';
import { RadioGroup, Select } from '../../../ui/Overlays';
import { Button } from '../../../ui/Button';
import { TextField, TextArea } from '../../../ui/Field';
import { Icon } from '../../../ui/icons';
import { useToast } from '../../../ui/Toast';
import { QtyField } from './QuoteContext';
import { DraftsTable } from './DraftsTable';
import { draftQuotesFor, type DraftQuote } from '../../../data/draftQuotes';
import { ImportFileDialog } from './dialogs';
import { BOM_TEMPLATES, COLUMN_DETECTION, assembliesFor } from '../../../data/bom';
import { findCustomer, type Quotation } from '../../../data/quotations';
import type { RunConfig } from './state';

/**
 * The two ways into the wizard.
 *
 * Quick Quote's sheet says `Select Action = "Import New BoM"`; Standard Quote's
 * says `Select Action = "Load Exisiting Assembly"` (their spelling). They are
 * not two screens — they are the two values of one control, and everything
 * after step 1 is identical for both, verified row by row against the sheets.
 *
 * This replaces a flat three-way radio taken from the production bundle. The
 * bundle's third source, "User current BoM (no changes)", turns out not to be a
 * sibling of the other two at all: the guideline nests it INSIDE Load Existing
 * Assembly, alongside "Upload BoM and create a new version". Reading it as a
 * peer put a choice about an existing assembly's BoM next to a choice about
 * which flow you are in.
 */
export const ACTIONS = [
  /* RENAMED 16 Oct 2026, and the standard names these two strings itself:
     "Labels match the user's task — Quick Quote from BoM File · Existing
     Assembly", against "Import new BoM (when nothing is imported)". The point
     is sound. "Import New BoM" says NEW against an old one, when the question
     being asked is which of two things you are quoting from; and these two
     actions are exactly the customer's two quote types, which the new wording
     makes visible where the old hid it.

     It overrides their own sheets, which say `Select Action = "Import New BoM"`
     and `"Load Exisiting Assembly"` — later instruction, same author, about
     these exact words. */
  { value: 'import-new', label: 'Quick Quote from BoM File',
    hint: 'Quote a BoM file attached to this Project Requirement, against an assembly you name.' },
  { value: 'load-existing', label: 'Existing Assembly',
    hint: 'Quote an assembly already approved and loaded in the system through the ECO process.' },
  /* HER THIRD ACTION, 16 Oct — and disabled, as it is in her own prototype:
     `{ v: "completed", label: "Import Completed Quote", help: "Migration only.
     Store a quote finished in Voyager.", disabled: true }`.

     IT IS NOT A QUOTE RUN AT ALL, which is why it can sit here switched off
     without being a hole in the wizard: nothing downstream of this screen would
     run. It stores a quote that was finished in the old system, so the three
     steps after this one — parse, price, submit — have already happened
     elsewhere. Leaving it out would have answered the wrong question: a reader
     migrating from Voyager would conclude the new system cannot take their
     finished quotes, where the truth is that this screen is not where it
     happens.

     THE `Import` BUTTON ON THE RESULT GRID IS THE OTHER END OF THIS, and also
     unbuilt — both are waiting on the same answer about what a completed
     Voyager quote arrives as. */
  { value: 'completed', label: 'Import Completed Quote', disabled: true,
    hint: 'Migration only — stores a quote that was finished in Voyager. Not part of quoting, so it is switched off here.' },
  /* RESUME DRAFT QUOTE IS NOT HERE ANY MORE. It was, as a third option, and it
     was the wrong shape: the other two answer "what am I quoting", while
     resuming answers "where was I" — and choosing it replaced both sections
     below with a table, so a third of this screen existed in order to be
     hidden. Resuming is an entry point, so it now sits where entry points live:
     on the record, as Run Quotation > Resume draft. */
];

/**
 * What to do with a BoM that is already on file — Load Existing Assembly only.
 *
 * The guidance under each is the guideline's own and worth keeping: these two
 * are easy to choose wrongly, and the consequence of the second — a new BoM
 * version nobody asked for — is not visible at the point of choosing.
 */
export const BOM_OPTIONS = [
  { value: 'current', label: 'User current BoM (no changes)' },
  { value: 'new-version', label: 'Upload BoM and create a new version' },
];

const BOM_OPTION_HINT: Record<string, string> = {
  current: 'Use when the existing BoM in the system is already correct and no update is needed.',
  'new-version': 'Use when the BoM needs updating by uploading a new file, which creates a new version.',
};

/**
 * Attachments on the Project Requirement.
 *
 * "The selectable file source comes from the Attachments list in the current
 * Project Requirement" and "The system accepts only .xlsx files for selection"
 * — so the .pdf is here deliberately, to be excluded rather than to be absent.
 */
const ATTACHMENTS = [
  { name: 'BOM_RevC_2026-08-12.xlsx', ok: true },
  { name: 'BOM_RevB_2026-07-02.xlsx', ok: true },
  { name: 'Assembly drawing RevC.pdf', ok: false },
];

/**
 * The ones this screen can process, in the order they are attached.
 *
 * EXPORTED SO THE WIZARD'S DEFAULT COMES FROM HERE. `RunQuotationDialog` opened
 * with `attachment: 'BOM_RevC_2026-08-12.xlsx'` typed out a second time — the
 * same file name in two files, which is fine until this list changes and the
 * dialog opens with a file that is no longer attached. It also made the new
 * required rule unreachable: a field that is never empty cannot fail, and the
 * one case the rule exists for is the RFQ with no .xlsx on it.
 */
export const RFQ_XLSX = ATTACHMENTS.filter(a => a.ok).map(a => a.name);

/**
 * Step 1 — Config BoM.
 *
 * Three parts: the quoting information carried from the Project Requirement,
 * the Action that decides everything below it, then BoM Options and Assembly
 * Details, whose contents follow from the Action.
 */
export function StepConfigBom({ q, cfg, set, invalid = [], onResume }: {
  q: Quotation; cfg: RunConfig; set: (patch: Partial<RunConfig>) => void;
  /** Field names that failed on the last press of Next, so they can say so. */
  invalid?: readonly string[];
  /** Pick up a saved draft in this same dialog. */
  onResume?: (d: DraftQuote) => void;
}) {
  const toast = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const customer = findCustomer(q.customer);
  const xlsx = RFQ_XLSX;
  const assemblies = assembliesFor(q.customer);
  const drafts = draftQuotesFor(q.customer);

  return (
    /* THREE REGIONS, NOT FOUR STACKED SECTIONS.
       Stacked, this step measured 1453px against 669px of dialog: the user
       scrolled 2.2 screens to reach the fields Next requires. The live system
       holds the same content on one screen by placing it side by side.
       Reference on the left; the work on the right — what you are doing
       (Action), then the two halves of it (the file, and the assembly). */
    <div className="vy-run-step vy-run-step--config">
      <section className="vy-run-section vy-run-ref">
        {/* "Quote Strategy", her own name for it — 22 Oct. It was "Quoting
            information", which named the panel after the fact that it contains
            facts. */}
        <h3 className="vy-field-group-title"><SmartIcon name="quote" />Quote Strategy</h3>
        {/* The sentence that used to follow — "Quote Focus, Material Package
            Type and Markup may be changed for this run; the rest is shown for
            reference" — is gone because the fields now say it themselves: from
            14 Oct 2026 a value you cannot edit carries a lock, so naming the
            three editable ones in prose was the same fact twice, in the one
            panel short of vertical room. */}
        <p className="vy-hint">
          Carried from the Project Requirement. Change them in Quoting, step 3.
        </p>

        <div className="vy-quote-config-grid">
          {/* THE PROJECT REQUIREMENT'S OWN NUMBER IS GONE, 22 Oct — the
              customer removed it from her step 1 and she is right: the dialog
              is titled "Run Quotation — RFQ0000000358", so the panel under it
              was repeating the title. */}
          <Field label="Customer">
            {/* "[Customer Code] - Full Customer name" — which is what the
                customer label already is, so it is not reassembled here. */}
            <ReadValue>{q.customer}</ReadValue>
          </Field>

          {/* "Qty to Quote", her label. Ours was the Testing Guideline's "Item
              Ant Quantities to Quote", which is the live system's spelling of
              a field whose meaning nobody has ever had trouble with. Two of
              the customer's own documents, and the later one is the one she
              asked us to follow. */}
          <Field label="Qty to Quote">
            <ReadValue>{q.quantitiesToQuote}</ReadValue>
          </Field>

          {/* ALL SIX STRATEGY FIELDS, READ-ONLY — "Các trường là chốt rùi, và
              chỉ đc sửa ở step 3 nha." Three of them were missing from this
              panel entirely: Excess and MOQ, Net Consigned and Rocket
              Consigned decide how much gets bought and what gets charged, and
              a quoter setting up a run could not see what they were set to
              without walking two steps forward. */}
          <Divider>Quote Strategy</Divider>

          <Field label="Quote Focus">
            <ReadValue>{cfg.quoteFocus}</ReadValue>
          </Field>

          <Field label="Mark up">
            <ReadValue>{`${cfg.markup}%`}</ReadValue>
          </Field>

          <Field label="Excess and MOQ">
            <ReadValue>{cfg.excessMoq}</ReadValue>
          </Field>

          <Field label="Material Package Type">
            <ReadValue>{cfg.materialPackageType}</ReadValue>
          </Field>

          <Field label="Net Consigned">
            <ReadValue>{cfg.netConsigned}</ReadValue>
          </Field>

          <Field label="Rocket Consigned">
            <ReadValue>{cfg.rocketConsigned}</ReadValue>
          </Field>

          <Divider>Notes</Divider>

          <Field label="Customer Special Need" wide>
            <ReadValue>{q.customerNotes}</ReadValue>
          </Field>

          <Field label="Internal Notes" wide>
            <ReadValue>{q.internalNotes}</ReadValue>
          </Field>
        </div>

        <Attachments onOpen={what => toast.notImplemented(what)} />
      </section>

      <div className="vy-run-work">
      <section className="vy-run-section">
        <h3 className="vy-field-group-title"><SmartIcon name="task" />Action</h3>
        {/* THE SENTENCES MOVED ONTO THE OPTIONS, and the `as RunConfig['action']`
            cast went with them. One hint under the group could only ever
            describe the current selection, which left the third Action — the
            one nobody can select — with nothing to say for itself. The guard
            replaces the cast: `completed` is not one of the wizard's two flows,
            and telling the compiler to accept it anyway is how the result
            dialog ended up with two fields of the wrong type last week. */}
        <RadioGroup label="Action" value={cfg.action} tiles
                    options={ACTIONS}
                    onChange={v => {
                      if (v === 'import-new' || v === 'load-existing') set({ action: v });
                    }} />
        {/* "Precondition: Only show this option when user attach at least 1 file
            in this corresponding project requirements." Saying why beats the
            option quietly not being there. */}
        {cfg.action === 'import-new' && xlsx.length === 0 && (
          <div className="vy-run-banner" data-tone="warn">
            {/* THE ACTION'S OWN NAME, found by finally being able to see this
                banner. It said "Import New BoM", the label this radio stopped
                using on 16 Oct, so the one message a user meets when the
                screen cannot proceed named a control that is not on it. */}
            <strong>Quick Quote from BoM File needs an attachment.</strong> It reads .xlsx files
            from this Project Requirement, and there are none.
          </div>
        )}
      </section>

      {/* ---- The two halves of the choice, side by side ---------------------
          The file it is parsed from, and the assembly it is quoted against.
          They are siblings — one column each — because neither is a step of the
          other, and stacking them is what pushed Assembly Details below the
          fold. */}
      <div className="vy-run-pair">
      <section className="vy-run-section">
        <h3 className="vy-field-group-title"><SmartIcon name="bom" />BoM Options</h3>

        {cfg.action === 'import-new' ? (
          <>
            <p className="vy-hint">
              Uses the default template configured in Inventory Management unless you choose
              another below.
            </p>
            <div className="vy-quote-config-grid">
              {/* HER LABEL AND HER ASTERISK, 16 Oct: `<Field id="att"
                  label="Attachment to Process" req>`. Ours read "Please select
                  an attachment you would like to process" — the guideline's
                  whole sentence used as a label, which made the one field on
                  this panel with a decision in it the widest thing on the
                  screen and still did not say the file had to be chosen. The
                  sentence is not lost: it is the hint, which is where an
                  instruction belongs.

                  REQUIRED, AND NOW ENFORCED. The asterisk was the easy half —
                  `missingStep1` holds the other, so Next stops here with the
                  field marked instead of parsing a run with no file. */}
              <Field label="Attachment to Process" required wide
                     error={invalid.includes('attachment')}>
                <Select label="Attachment to Process" value={cfg.attachment}
                        options={xlsx} required invalid={invalid.includes('attachment')}
                        onChange={v => set({ attachment: v })} />
                <span className="vy-field-hint">
                  Which attached file holds the BoM. Only .xlsx files from this RFQ's attachments.
                  {xlsx.length === 1 && ' There is one, so it is selected for you.'}
                </span>
              </Field>

              {/* NO `File Name` HERE ANY MORE. The guideline has one (r23-r25),
                  read-only and auto-filled — and what it filled with was the
                  file the picker above it had just been set to, so the panel
                  printed one string twice in adjacent cells. Renaming the
                  picker to her `Attachment to Process` put the two side by side
                  and made it obvious.

                  A read-only box is worth its space when it shows something
                  you could not otherwise see: the Load Existing flow keeps its
                  File name field for exactly that reason, because there the
                  file arrives through an upload dialog and the field is the
                  only record of which one. Here the picker IS the file name.
                  Her own prototype has no such field in BoM Options. */}
              <Field label="Select template">
                {/* PREVIEW AND DOWNLOAD BESIDE THE PICKER, as her prototype has
                    them. A template is a column map, and the question somebody
                    has before choosing one is "what does this map" — which a
                    name cannot answer and a preview can. Disabled until one is
                    chosen, because there is nothing to look at before that. */}
                <div className="vy-with-actions">
                  <Select label="Select template" value={cfg.template}
                          options={[...BOM_TEMPLATES]}
                          onChange={v => set({ template: v })} />
                  <button type="button" className="vy-icon-btn" disabled={!cfg.template}
                          title="Preview Template" aria-label="Preview Template"
                          onClick={() => toast.notImplemented(`preview ${cfg.template}`)}>
                    <Icon name="eye" size={15} />
                  </button>
                  <button type="button" className="vy-icon-btn" disabled={!cfg.template}
                          title="Download Template" aria-label="Download Template"
                          onClick={() => toast.notImplemented(`download ${cfg.template}`)}>
                    <Icon name="download" size={15} />
                  </button>
                </div>
                <span className="vy-field-hint">
                  Maps and validates the file. It must find Qty, MFG and MPN, or you cannot continue.
                </span>
              </Field>

              <Field label="Select Column Detection">
                <Select label="Select Column Detection" value={cfg.detection}
                        options={[...COLUMN_DETECTION]}
                        onChange={v => set({ detection: v })} />
                <span className="vy-field-hint">
                  Which column identifies a line uniquely. If the column you pick is empty in the
                  file, separate lines can be merged into one.
                </span>
              </Field>
            </div>

            {/* "The option should be enabled when no Select Template value has
                been chosen. The option should be disabled after the user has
                selected a template." */}
            <div className="vy-run-drafts">
              <span>Don't see your template?</span>
              <Button size="sm" variant="tonal" disabled={Boolean(cfg.template)}
                      title={cfg.template
                        ? 'A template is already selected — clear it to create a new one'
                        : `Create a BoM template for ${q.customer}`}
                      onClick={() => toast.notImplemented(`create a new BoM template for ${q.customer}`)}>
                Create a new template
              </Button>
            </div>
          </>
        ) : (
          <>
            <RadioGroup label="BoM Options" value={cfg.bomOption}
                        options={BOM_OPTIONS}
                        onChange={v => set({ bomOption: v as RunConfig['bomOption'] })} />
            <p className="vy-hint">{BOM_OPTION_HINT[cfg.bomOption]}</p>

            {cfg.bomOption === 'current' ? (
              /* "Uses the default template configured in Inventory Management.
                 (The template selection is hidden from the user to prevent
                 incorrect template selection.)" The control is hidden; WHICH
                 template is not a secret, and naming it answers the obvious
                 question at no cost. */
              <p className="vy-hint">
                Parsed with <strong>{BOM_TEMPLATES[0]}</strong>, the default configured in
                Inventory Management. The template is not offered here, so it cannot be set
                wrongly.
              </p>
            ) : (
              <div className="vy-quote-config-grid">
                <Field label="Select template">
                  <Select label="Select template" value={cfg.template || BOM_TEMPLATES[0]}
                          options={[...BOM_TEMPLATES]}
                          onChange={v => set({ template: v })} />
                  <span className="vy-field-hint">
                    Defaults to the template configured in Inventory Management.
                  </span>
                </Field>

                {/* ONE ROW: the file name and the control that fills it.
                    They were two fields, so the grid put a locked box in one
                    cell and the button that fills it in another — the reader
                    had to work out that the two were the same thing, and the
                    button read as an action on the whole step rather than on
                    that field. A read-only value whose only way to change is a
                    button belongs beside the button. */}
                <Field label="File name">
                  <div className="vy-file-row">
                    <ReadValue>{cfg.uploadedFile}</ReadValue>
                    <Button onClick={() => setImportOpen(true)}
                            title="Choose a BoM file from Voyager or from this machine">
                      Upload file
                    </Button>
                  </div>
                  <span className="vy-field-hint">Filled in when you upload.</span>
                </Field>
              </div>
            )}
          </>
        )}
      </section>

      {/* ---- Assembly Details ------------------------------------------------ */}
      <section className="vy-run-section">
        <h3 className="vy-field-group-title"><SmartIcon name="factory" />Assembly Details</h3>

        {cfg.action === 'import-new' ? (
          <div className="vy-quote-config-grid">
            <Field label="Assembly Part Number" required error={invalid.includes('assemblyPartNumber')}>
              <TextField aria-label="Assembly Part Number" value={cfg.assemblyPartNumber}
                         placeholder="3032606"
                         onChange={e => set({ assemblyPartNumber: e.target.value })}
                         /* "After the user enters a value and clicks outside the
                            field, the system automatically prefixes the entered
                            value with the customer code in the format:
                            0CustomerCode-Part Number (for example: 0455-3032606)." */
                         onBlur={e => {
                           /* Reads the FIELD, not the state. The handler closes
                              over whatever `cfg` held when it was created, so a
                              value typed and blurred in the same tick prefixed
                              an empty string. */
                           const raw = e.target.value.trim();
                           const code = customer?.code ?? '';
                           if (!raw || !code) return;
                           const prefix = `0${code.replace(/^0+/, '')}-`;
                           if (!raw.startsWith(prefix)) set({ assemblyPartNumber: prefix + raw });
                         }} />
              <span className="vy-field-hint">
                Prefixed with the customer code when you leave the field.
              </span>
            </Field>

            <Field label="Revision" required error={invalid.includes('partRev')}>
              <TextField aria-label="Revision" value={cfg.partRev} placeholder="A"
                         onChange={e => set({ partRev: e.target.value })} />
            </Field>

            <Field label="Description" required wide error={invalid.includes('partDesc')}>
              <TextArea aria-label="Description" rows={2} value={cfg.partDesc}
                        onChange={e => set({ partDesc: e.target.value })} />
            </Field>

            <QtyField label="Build Quantity" value={cfg.buildQty}
                      onChange={n => set({ buildQty: n })} />
            <QtyField label="Attrition Set" value={cfg.attritionSet}
                      onChange={n => set({ attritionSet: n })} />
          </div>
        ) : (
          <div className="vy-quote-config-grid">
            <Field label="Please select assembly" required wide error={invalid.includes('assembly')}>
              <div className="vy-assembly-pick">
                <Select label="Please select assembly" value={cfg.assembly}
                        options={assemblies.map(a => a.label)}
                        onChange={v => {
                          const a = assemblies.find(x => x.label === v);
                          /* "The Description will be automatically populated
                             based on the selected assembly value (and can't be
                             more adjusted)." The part number and revision come
                             with it too, so everything the other flow asks you
                             to type follows from this one choice. */
                          set({
                            assembly: v,
                            partDesc: a?.description ?? '',
                            assemblyPartNumber: a?.partNumber ?? '',
                            partRev: a?.rev ?? '',
                          });
                        }} />
                {/* "User can clear and chose another value again in this field." */}
                {cfg.assembly && (
                  <Button size="sm" variant="text"
                          title="Clear the selected assembly"
                          onClick={() => set({ assembly: '', partDesc: '',
                                               assemblyPartNumber: '', partRev: '' })}>
                    Clear
                  </Button>
                )}
              </div>
              <span className="vy-field-hint">
                {assemblies.length
                  ? `${assemblies.length} on file for ${q.customer}. Format: Customer Code - Part Number - Rev - Version.`
                  : `No assemblies are loaded for ${q.customer}. Use Import New BoM instead.`}
              </span>
            </Field>

            <Field label="Description" wide>
              {/* Locked, not merely read-only: the guideline says it "can't be
                  more adjusted", and it belongs to the assembly rather than to
                  this quote run. */}
              <ReadValue>{cfg.partDesc}</ReadValue>
              <span className="vy-field-hint">Comes from the assembly and cannot be changed here.</span>
            </Field>

            <QtyField label="Build Quantity" value={cfg.buildQty}
                      onChange={n => set({ buildQty: n })} />
            <QtyField label="Attrition Set" value={cfg.attritionSet}
                      onChange={n => set({ attritionSet: n })} />
          </div>
        )}
      </section>
      </div>

      {/* CONTINUE FROM DRAFTS — 21 Oct, from the customer's mockup, which puts
          the saved drafts on step 1 under the work rather than behind a menu.

          They were reachable before, through the chevron on the Run Quotation
          button, and that is a worse place for them: by the time this dialog is
          open the user has already answered "new or saved", and if the answer
          was "saved" they have to close it and find a control they did not know
          was a menu. A draft is picked up where a quote is set up. */}
      {/* SHOWN WITH NOTHING IN IT TOO, from 28 Oct. The section used to appear
          only once a draft existed, and drafts live in this browser session —
          so anyone opening the prototype met a screen with no sign that
          resuming is a thing the wizard does, and the empty state written for
          exactly that moment was the one thing they could not see.

          Her mockup keeps the card on screen the whole time. The alternative
          was seeding demo drafts to fill it, which was declined: a draft is a
          record of work somebody did in this session, and three fake ones
          would open a BoM that no previous sitting ever configured. An empty
          table that says where drafts come from is the honest version of the
          same card. */}
      {onResume && (
        <section className="vy-run-section vy-run-draft-list">
          <h3 className="vy-field-group-title">
            <SmartIcon name="quote" />Continue from Drafts
            {/* No badge at nothing — a count pill reading "0 saved" dresses an
                absence up as a quantity, and the table below says it in
                words. */}
            {drafts.length > 0 && <span className="vy-pill">{drafts.length} saved</span>}
          </h3>
          <DraftsTable drafts={drafts} customer={q.customer} onContinue={onResume} />
        </section>
      )}
      </div>

      <ImportFileDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onPick={name => { set({ uploadedFile: name }); setImportOpen(false); }}
      />
    </div>
  );
}

/** A labelled rule inside the reference panel — the customer's own device for
 *  breaking it into Quote Strategy, Notes and Attachments. */
function Divider({ children }: { children: React.ReactNode }) {
  return <p className="vy-config-divider">{children}</p>;
}

function Field({ label, required, wide, error, rfq, value, children }: {
  label: string; required?: boolean; wide?: boolean; error?: boolean;
  /**
   * What the Project Requirement holds for this field.
   *
   * ASKED FOR by the standard — a value changed from the one it was carried
   * with is shown blue — and by the mockup, which puts the original in the
   * field's own tooltip as "RFQ value: Reels".
   *
   * THE MARK IS ON THE QUOTE, NOT ON THE RECORD. These three fields arrive
   * from the RFQ and this screen may override them for one quote; the record
   * keeps its own value either way. Without the mark a reader has no way to
   * tell which numbers are the customer's and which are this quote's, and the
   * difference is exactly what a reviewer is looking for.
   */
  rfq?: string | number;
  value?: string | number;
  children: React.ReactNode;
}) {
  const changed = rfq !== undefined && String(rfq) !== String(value);
  return (
    /* `data-invalid` is what the step's Next scrolls to and focuses, and what
       paints the field. The error is on the FIELD because that is where the fix
       is; the toast keeps the customer's own sentence. */
    <div className="vy-quote-config-field" data-wide={wide || undefined}
         data-invalid={error || undefined} data-changed={changed || undefined}
         title={changed ? `RFQ value: ${rfq}` : undefined}>
      <span className="vy-quote-fact-label">
        {label}{required && <span className="vy-required" aria-hidden>*</span>}
      </span>
      {children}
      {changed && <span className="vy-field-changed">Changed for this quote</span>}
      {error && <span className="vy-field-error" role="alert">Required to continue</span>}
    </div>
  );
}

/** A value carried from elsewhere. `locked` marks the ones the system fills. */
/**
 * Attachments, shortened until asked.
 *
 * "If there is more than one attachment, the system initially shows a shortened
 * list with a View more option to expand and display all files. Clicking again
 * changes it to View less to collapse the list."
 *
 * MORE THAN ONE is the customer's condition, so a single attachment gets no
 * control — a View more that reveals nothing is a button that lies. At exactly
 * two, "shortened" can only mean one, which is why the collapsed list is the
 * first file rather than a fixed handful.
 */
function Attachments({ onOpen }: { onOpen: (what: string) => void }) {
  /**
   * The files on the Project Requirement, each with the two things a reader
   * wants to do with one.
   *
   * ASKED FOR 22 Oct — "attachment thiết kế có thể xem hoặc tải như prototype
   * chị ấy gửi". Her list is a clip, the file name, and an action per row; ours
   * was a name in a code face and a "View more" link, which is a list you can
   * read and not use.
   *
   * VIEW AND DOWNLOAD, not download alone. Her prototype offers download for
   * an attachment and preview for a template; on this screen the question
   * someone has about a BoM file is usually "is this the revision I think it
   * is", which is a look rather than a copy on a laptop.
   *
   * ALL OF THEM, no expander. The panel scrolls and is ruled into three parts
   * now, so a list of three hiding two of itself behind a link cost a click to
   * answer "what else is attached" — which is most of why the section is here.
   */
  return (
    <div className="vy-attachments">
      {/* The count is the customer's — "Attachments (6)" — and it says how
          much is in the section before the eye has counted. */}
      <p className="vy-config-divider">Attachments ({ATTACHMENTS.length})</p>
      <ul className="vy-attach-list">
        {ATTACHMENTS.map(a => (
          <li key={a.name} data-usable={a.ok || undefined}>
            <Icon name="clip" size={13} />
            <span className="vy-attach-name" title={a.name}>{a.name}</span>
            {/* Not an error — a .pdf on an RFQ is perfectly normal. It is here
                to say why this one is not in the Attachment dropdown above. */}
            {!a.ok && <span className="vy-attach-note">not .xlsx</span>}
            <button type="button" className="vy-icon-btn" title={`View ${a.name}`}
                    aria-label={`View ${a.name}`} onClick={() => onOpen(`view ${a.name}`)}>
              <Icon name="eye" size={14} />
            </button>
            <button type="button" className="vy-icon-btn" title={`Download ${a.name}`}
                    aria-label={`Download ${a.name}`} onClick={() => onOpen(`download ${a.name}`)}>
              <Icon name="download" size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
