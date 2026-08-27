import { RadioGroup, Select } from '../../../ui/Overlays';
import { Button } from '../../../ui/Button';
import { TextField, TextArea } from '../../../ui/Field';
import { useToast } from '../../../ui/Toast';
import { QtyField } from './QuoteContext';
import { BOM_TEMPLATES, COLUMN_DETECTION } from '../../../data/bom';
import { findCustomer, type Quotation } from '../../../data/quotations';
import { MATERIAL_PACKAGE_TYPE, QUOTE_FOCUS } from '../../../data/metadata';
import type { RunConfig } from './state';

/**
 * The BoM sources, verbatim from the shipped bundle.
 *
 * The guideline only documents one of them — "Select Action = Import New BoM" —
 * because Quick Quote is the new-BoM path. Standard Quote is the same wizard
 * entered on an existing BoM, so the other two are real and stay; dropping them
 * would remove two of the three ways into this screen to satisfy a sheet that
 * only describes the third.
 */
export const BOM_SOURCES = [
  { value: 'upload',   label: 'Import New BoM' },
  { value: 'existing', label: 'Run quote with existing BoM version' },
  { value: 'current',  label: 'User current BoM (no changes)' },
];

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
 * Two halves. The top is what the Project Requirement already decided, mostly
 * read-only, with the three fields the guideline says may be changed here:
 * Quote Focus, Material Package Type and Markup. The bottom is the BoM itself.
 */
export function StepConfigBom({ q, cfg, set }: {
  q: Quotation; cfg: RunConfig; set: (patch: Partial<RunConfig>) => void;
}) {
  const toast = useToast();
  const customer = findCustomer(q.customer);
  const xlsx = ATTACHMENTS.filter(a => a.ok);

  return (
    <div className="vy-run-step">
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Quoting information</h3>
        <p className="vy-hint">
          Carried from the Project Requirement. Quote Focus, Material Package Type and Markup
          may be changed for this run; the rest is shown for reference.
        </p>

        <div className="vy-quote-config-grid">
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
            {/* The customer's own two sheets disagree: this one lists "Reel",
                the Create PR sheet lists "Reels". The shared constant wins,
                because the value arrives here from the Project Requirement — a
                second spelling would blank the field on open, which is exactly
                what it did. Raised as part of open question 3. */}
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
        {/* "Precondition: Only show this option when user attach at least 1 file
            in this corresponding project requirements." Saying why it is absent
            beats it silently not being there. */}
        {xlsx.length === 0 ? (
          <div className="vy-run-banner" data-tone="warn">
            <strong>Import New BoM is unavailable.</strong> It needs at least one .xlsx attachment
            on this Project Requirement, and there are none.
          </div>
        ) : (
          <RadioGroup label="Action" value={cfg.action}
                      options={BOM_SOURCES}
                      onChange={v => set({ action: v as RunConfig['action'] })} />
        )}
      </section>

      {cfg.action === 'upload' && (
        <section className="vy-run-section">
          <h3 className="vy-field-group-title">BoM Options</h3>
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
        </section>
      )}

      {cfg.action === 'existing' && (
        <section className="vy-run-section">
          <h3 className="vy-field-group-title">BoM Options</h3>
          <Field label="Run Version">
            <Select label="Run Version" value={cfg.version}
                    options={['v3 — 12 Aug 2026', 'v2 — 28 Jul 2026', 'v1 — 14 Jul 2026']}
                    onChange={v => set({ version: v })} />
          </Field>
        </section>
      )}

      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Assembly Details</h3>
        <div className="vy-quote-config-grid">
          <Field label="Assembly Part Number" required>
            <TextField aria-label="Assembly Part Number" value={cfg.assemblyPartNumber}
                       placeholder="3032606"
                       onChange={e => set({ assemblyPartNumber: e.target.value })}
                       /* "After the user enters a value and clicks outside the
                          field, the system automatically prefixes the entered
                          value with the customer code in the format:
                          0CustomerCode-Part Number (for example: 0455-3032606)."
                          On blur, and only once — re-prefixing an already
                          prefixed value on every blur would grow it forever. */
                       onBlur={e => {
                         /* Reads the FIELD, not the state. The handler closes
                            over whatever `cfg` held when it was created, so a
                            value typed and blurred in the same tick prefixed
                            an empty string. The input's own value is always
                            the current one. */
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
      </section>
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
