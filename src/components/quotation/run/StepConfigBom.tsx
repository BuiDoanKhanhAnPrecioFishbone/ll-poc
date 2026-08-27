import { useState } from 'react';
import { RadioGroup, Select } from '../../../ui/Overlays';
import { Button } from '../../../ui/Button';
import { TextField, TextArea } from '../../../ui/Field';
import { useToast } from '../../../ui/Toast';
import { QtyField } from './QuoteContext';
import { ImportFileDialog } from './dialogs';
import { BOM_TEMPLATES, COLUMN_DETECTION, assembliesFor } from '../../../data/bom';
import { findCustomer, type Quotation } from '../../../data/quotations';
import { MATERIAL_PACKAGE_TYPE, QUOTE_FOCUS } from '../../../data/metadata';
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
  { value: 'import-new', label: 'Import New BoM' },
  { value: 'load-existing', label: 'Load Existing Assembly' },
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
 * Step 1 — Config BoM.
 *
 * Three parts: the quoting information carried from the Project Requirement,
 * the Action that decides everything below it, then BoM Options and Assembly
 * Details, whose contents follow from the Action.
 */
export function StepConfigBom({ q, cfg, set }: {
  q: Quotation; cfg: RunConfig; set: (patch: Partial<RunConfig>) => void;
}) {
  const toast = useToast();
  const [importOpen, setImportOpen] = useState(false);
  const customer = findCustomer(q.customer);
  const xlsx = ATTACHMENTS.filter(a => a.ok);
  const assemblies = assembliesFor(q.customer);

  return (
    <div className="vy-run-step">
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Quoting information</h3>
        <p className="vy-hint">
          Carried from the Project Requirement. Quote Focus, Material Package Type and Markup
          may be changed for this run; the rest is shown for reference.
        </p>

        <div className="vy-quote-config-grid">
          {/* Named on the Standard Quote sheet and not the Quick Quote one.
              Shown for both: it is one panel, and a field that appears on only
              one of two paths through one screen reads as a bug. */}
          <Field label="Project Requirement">
            <ReadValue>{`RFQ${q.no} — ${q.projectName}`}</ReadValue>
          </Field>

          <Field label="Customer">
            {/* "[Customer Code] - Full Customer name" — which is what the
                customer label already is, so it is not reassembled here. */}
            <ReadValue>{q.customer}</ReadValue>
          </Field>

          <Field label="Quote Focus">
            <Select label="Quote Focus" value={cfg.quoteFocus}
                    options={[...QUOTE_FOCUS]}
                    onChange={v => set({ quoteFocus: v })} />
          </Field>

          <Field label="Material Package Type">
            {/* The customer's own two sheets disagree: Quick Quote lists "Reel",
                Create PR lists "Reels". The shared constant wins, because the
                value arrives here from the Project Requirement — a second
                spelling blanks the field on open, which is what it did.
                Raised as part of open question 3. */}
            <Select label="Material Package Type" value={cfg.materialPackageType}
                    options={[...MATERIAL_PACKAGE_TYPE]}
                    onChange={v => set({ materialPackageType: v })} />
          </Field>

          <Field label="Mark up">
            <div className="vy-suffixed">
              <TextField type="number" min={0} aria-label="Mark up" value={String(cfg.markup)}
                         onChange={e => set({ markup: Number(e.target.value) })}
                         onBlur={e => { if (Number(e.target.value) < 0) set({ markup: 0 }); }} />
              <span className="vy-suffix">%</span>
            </div>
          </Field>

          <Field label="Item Ant Quantities to Quote">
            <ReadValue>{q.quantitiesToQuote}</ReadValue>
          </Field>

          <Field label="Customer Special Need" wide>
            <ReadValue>{q.customerNotes}</ReadValue>
          </Field>

          <Field label="Internal Notes" wide>
            <ReadValue>{q.internalNotes}</ReadValue>
          </Field>
        </div>

        <Attachments />
      </section>

      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Action</h3>
        <RadioGroup label="Action" value={cfg.action}
                    options={ACTIONS}
                    onChange={v => set({ action: v as RunConfig['action'] })} />
        <p className="vy-hint">
          {cfg.action === 'import-new'
            ? 'Quote a BoM file attached to this Project Requirement, against an assembly you name.'
            : 'Quote an assembly already approved and loaded in the system through the ECO process.'}
        </p>
        {/* "Precondition: Only show this option when user attach at least 1 file
            in this corresponding project requirements." Saying why beats the
            option quietly not being there. */}
        {cfg.action === 'import-new' && xlsx.length === 0 && (
          <div className="vy-run-banner" data-tone="warn">
            <strong>Import New BoM needs an attachment.</strong> It reads .xlsx files from this
            Project Requirement, and there are none.
          </div>
        )}
      </section>

      {/* ---- BoM Options ---------------------------------------------------- */}
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">BoM Options</h3>

        {cfg.action === 'import-new' ? (
          <>
            <p className="vy-hint">
              Uses the default template configured in Inventory Management unless you choose
              another below.
            </p>
            <div className="vy-quote-config-grid">
              <Field label="Please select an attachment you would like to process" wide>
                <Select label="Attachment" value={cfg.attachment}
                        options={xlsx.map(a => a.name)}
                        onChange={v => set({ attachment: v })} />
                <span className="vy-field-hint">
                  Only .xlsx files from this RFQ's attachments.
                  {xlsx.length === 1 && ' There is one, so it is selected for you.'}
                </span>
              </Field>

              <Field label="File Name">
                {/* Read-only and auto-filled, per r23-r25. */}
                <ReadValue locked>{cfg.attachment}</ReadValue>
              </Field>

              <Field label="Select template">
                <Select label="Select template" value={cfg.template}
                        options={[...BOM_TEMPLATES]}
                        onChange={v => set({ template: v })} />
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

                <Field label="File name">
                  <ReadValue locked>{cfg.uploadedFile}</ReadValue>
                  <span className="vy-field-hint">Filled in when you upload.</span>
                </Field>

                <Field label="Upload file">
                  <Button onClick={() => setImportOpen(true)}
                          title="Choose a BoM file from Voyager or from this machine">
                    Upload file
                  </Button>
                </Field>
              </div>
            )}
          </>
        )}
      </section>

      {/* ---- Assembly Details ------------------------------------------------ */}
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Assembly Details</h3>

        {cfg.action === 'import-new' ? (
          <div className="vy-quote-config-grid">
            <Field label="Assembly Part Number" required>
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

            <Field label="Revision" required>
              <TextField aria-label="Revision" value={cfg.partRev} placeholder="A"
                         onChange={e => set({ partRev: e.target.value })} />
            </Field>

            <Field label="Description" required wide>
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
            <Field label="Please select assembly" required wide>
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
              <ReadValue locked>{cfg.partDesc}</ReadValue>
              <span className="vy-field-hint">Comes from the assembly and cannot be changed here.</span>
            </Field>

            <QtyField label="Build Quantity" value={cfg.buildQty}
                      onChange={n => set({ buildQty: n })} />
            <QtyField label="Attrition Set" value={cfg.attritionSet}
                      onChange={n => set({ attritionSet: n })} />
          </div>
        )}
      </section>

      <ImportFileDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onPick={name => { set({ uploadedFile: name }); setImportOpen(false); }}
      />
    </div>
  );
}

function Field({ label, required, wide, children }: {
  label: string; required?: boolean; wide?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="vy-quote-config-field" data-wide={wide || undefined}>
      <span className="vy-quote-fact-label">
        {label}{required && <span className="vy-required" aria-hidden> (*)</span>}
      </span>
      {children}
    </div>
  );
}

/** A value carried from elsewhere. `locked` marks the ones the system fills. */
function ReadValue({ children, locked }: { children: React.ReactNode; locked?: boolean }) {
  const empty = !children || children === '';
  return (
    <p className="vy-read-value" data-locked={locked || undefined} data-empty={empty || undefined}>
      {empty ? 'Not set' : children}
    </p>
  );
}

/** "User can view less or more files by clicking on View More". */
function Attachments() {
  return (
    <div className="vy-attachments">
      <span className="vy-quote-fact-label">Attachments</span>
      <ul>
        {ATTACHMENTS.map(a => (
          <li key={a.name} data-usable={a.ok || undefined}>
            <span className="vy-code">{a.name}</span>
            {!a.ok && <span className="vy-field-hint">not .xlsx — cannot be quoted from</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
