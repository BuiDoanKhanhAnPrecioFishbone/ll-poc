import { useMemo, useState } from 'react';
import { Dialog, Select, RadioGroup } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Field';
import { useToast } from '../ui/Toast';
import { MiniTable } from '../ui/MiniTable';
import { ImportFileDialog } from './quotation/run/dialogs';
import { withPrefix } from './AddPartDialog';
import { PART_CLASS, PART_CLASS_TYPES } from '../data/partMetadata';
import { CUSTOMER_OPTIONS } from '../data/quotations';
import { assembliesFor, KNOWN_MANUFACTURERS } from '../data/bom';
import {
  AML_FORMATS, IMPORTED_ROWS, EXISTING_PAIRS, withCustomerCode,
  unknownManufacturers, duplicatePairs, partIsKnown, planSubmit,
  type AmlFormat, type ImportedRow,
} from '../data/bomImport';
import type { ColumnSpec } from './column-model';

/** How an unknown manufacturer is being resolved. */
type MfgResolution = { kind: 'map'; to: string } | { kind: 'create' };

/**
 * Create the new BoM — Inventory Management » Bill of Materials » Upload BoM.
 *
 * Two steps, as the sheet names them: Config BoM, then Review BoM.
 *
 * LABELS ARE THE LIVE SYSTEM'S. This form's label set was read out of the live
 * app's own resource bundle on 31 Aug 2026 (`chunk-CqZKuw2K.js`, plaintext, not
 * obfuscated): Select Action, Import New BoM, Load Existing BoM, Assembly Info,
 * Component Info, Assembly Part Number, BoM Version, Quantity, Run by, Created
 * Date, Last Updated Date, Select AML Format, Vertical, Horizontal, Customer
 * Template. Decision D2 governs — users have learned these names.
 *
 * ONE DISAGREES WITH THE SHEET AND THE LIVE SYSTEM WINS. The guideline calls the
 * button "Create Customer Template"; the live app calls it **Create Custom
 * Template**, right beside a separate field called Customer Template. D2 is
 * explicit that phrasing follows the live system, so that is the label here, and
 * the difference is written up rather than smoothed over.
 *
 * TWO STEPS, NOT FOUR. The quoting wizard has four; this sheet describes two,
 * and it is a different job — quoting prices a BoM, this one loads it.
 */
export function CreateBomDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);

  /* ---- Step 1 state ------------------------------------------------------ */
  const [customer, setCustomer] = useState('');
  const [action, setAction] = useState<'import-new' | 'load-existing'>('import-new');
  const [assemblyPn, setAssemblyPn] = useState('');
  const [rev, setRev] = useState('');
  const [description, setDescription] = useState('');
  const [partClass, setPartClass] = useState('');
  const [partType, setPartType] = useState('');
  const [existingAssembly, setExistingAssembly] = useState('');
  const [amlFormat, setAmlFormat] = useState<AmlFormat>('Vertical');
  const [file, setFile] = useState('');
  const [fileOpen, setFileOpen] = useState(false);

  /* ---- Step 2 state ------------------------------------------------------ */
  const [resolutions, setResolutions] = useState<Record<string, MfgResolution>>({});
  /* The parsed file is STATE, not a constant, because one of the rules the user
     must satisfy is about the file's own contents: a part carrying the same
     MFG-MPN twice blocks Submit, and blocking with no way forward is a dead
     end. Dropping the repeat is the one edit this screen allows. */
  const [rows, setRows] = useState<ImportedRow[]>(IMPORTED_ROWS);

  /** Drop a repeated MFG-MPN, keeping the first occurrence. */
  function dropDuplicate(partId: number, pair: string) {
    setRows(rs => rs.map(r => {
      if (r.id !== partId) return r;
      const seen = new Set<string>();
      return { ...r, pairs: r.pairs.filter(p => {
        const key = `${p.mfg} ${p.mpn}`;
        if (key !== pair) return true;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }) };
    }));
  }

  const code = customer.split(' ')[0] ?? '';
  const assemblies = useMemo(() => assembliesFor(customer), [customer]);
  const chosen = assemblies.find(a => a.label === existingAssembly);

  /* "Automatically add Customer Code prefix if missing (Assembly + Component)."
     The assembly half happens here, as the user types, so the identifier they
     are about to check for duplicates is the one the system will store. */
  function pickCustomer(v: string) {
    const next = v.split(' ')[0] ?? '';
    setAssemblyPn(pn => (pn ? withPrefix(pn, next, customer) : pn));
    setCustomer(v);
  }

  function setClass(v: string) {
    setPartClass(v);
    /* Same rule as Create New Part: a type that is still valid survives. */
    const valid = PART_CLASS_TYPES[v] ?? [];
    setPartType(t => (t && valid.includes(t) ? t : ''));
  }

  /* Load Existing BoM auto-populates five read-only fields "based on the option
     chosen in Assembly Part Number", so the effective values differ by action. */
  const effective = action === 'load-existing'
    ? {
        assemblyPn: chosen?.partNumber ?? '', rev: chosen?.rev ?? '',
        description: chosen?.description ?? '',
        version: chosen?.version ?? '', quantity: chosen ? '1' : '',
        partClass: chosen ? 'ASSEMBLY' : '', partType: chosen ? 'ELEC-PCB' : '',
      }
    : { assemblyPn, rev, description, version: '0', quantity: '1', partClass, partType };

  /**
   * "Assembly (Part Number + Rev + Customer) is duplicated -> Show error, can't
   * process the next step."
   *
   * The triple, not the pair — this is a different rule from Part Master's Part
   * Number + Revision, because the same assembly number may legitimately belong
   * to two customers. Checked against the assemblies this customer already has.
   */
  const duplicate = (() => {
    if (action !== 'import-new' || assemblyPn.trim() === '') return false;
    /* Compared in its PREFIXED form. The field itself only gains the customer
       code on blur — prefixing every keystroke fights the typist, who would
       watch "184" become "00848-184" and then keep typing into the middle of
       it. That left the check comparing `184-6456` against the stored
       `00848-184-6456` and finding no clash, so a duplicate assembly passed
       validation for as long as the field had focus. Normalising here makes the
       rule true whenever it runs, rather than only after a blur. */
    const pn = withCustomerCode(assemblyPn.trim(), code).toLowerCase();
    return assemblies.some(a =>
      a.partNumber.toLowerCase() === pn &&
      a.rev.toLowerCase() === rev.trim().toLowerCase());
  })();

  const step1Missing = (() => {
    const m: string[] = [];
    if (!customer) m.push('Customer');
    if (action === 'import-new') {
      if (!assemblyPn.trim()) m.push('Assembly Part Number');
      if (!description.trim()) m.push('Description');
      if (!partClass) m.push('Part Class');
      if (!partType) m.push('Part Type');
    } else if (!existingAssembly) m.push('Assembly Part Number');
    if (!file) m.push('Upload file');
    return m;
  })();

  /* ---- Step 2 derivations ------------------------------------------------ */
  const unknownMfgs = useMemo(() => unknownManufacturers(rows), [rows]);
  const duplicates = useMemo(() => duplicatePairs(rows), [rows]);
  const unresolved = unknownMfgs.filter(m => !resolutions[m]);

  function next() {
    if (step1Missing.length || duplicate) {
      toast.error(duplicate
        ? `${assemblyPn}${rev ? ` - ${rev}` : ''} already exists for ${code}. Assembly Part Number, Revision and Customer must be unique together.`
        : `Still needed: ${step1Missing.join(', ')}`);
      return;
    }
    /* Normalise on the way out, so step 2 and the Submit message both name the
       assembly the way the system will store it. The field prefixes itself on
       blur, but Next can be reached by keyboard without ever blurring it, and
       an assembly reported one way here and stored another is the kind of
       difference that gets read as two records. */
    if (action === 'import-new' && code) setAssemblyPn(pn => withCustomerCode(pn.trim(), code));
    setStep(1);
  }

  function submit() {
    /* "Not enough maps yet: block submit + show error (Ex: Manufacturers don't
       exist: KEMETA)" — the sheet's own example, and the message it predicts. */
    if (unresolved.length) {
      toast.error(`Manufacturers don't exist: ${unresolved.join(', ')}`);
      return;
    }
    if (duplicates.length) {
      toast.error(`${duplicates[0].pair} appears twice on ${duplicates[0].part}. Each MFG-MPN must be unique within a part.`);
      return;
    }
    const plan = planSubmit(rows, code, EXISTING_PAIRS);
    onClose();
    toast.success(
      `BoM submitted for ${effective.assemblyPn}. ` +
      `${plan.partsCreated.length} parts created, ${plan.partsSkipped.length} already existed; ` +
      `${plan.mappingsCreated.length} MFG-MPN mappings created, ${plan.mappingsSkipped.length} skipped.`);
  }

  return (
    <Dialog
      open={open} onClose={onClose} size="xl"
      title="Bill of Materials"
      subtitle={step === 0 ? 'Step 1 — Config BoM' : 'Step 2 — Review BoM'}
      actions={step === 0
        ? (
          <Button variant="filled" onClick={next}
                  disabled={step1Missing.length > 0 || duplicate}
                  title={duplicate
                    ? 'That assembly, revision and customer already exist'
                    : step1Missing.length ? `Still needed: ${step1Missing.join(', ')}` : 'Review the parsed BoM'}>
            Next
          </Button>
        )
        : (
          <>
            <Button onClick={() => setStep(0)}>Previous</Button>
            <Button variant="filled" onClick={submit}
                    title={unresolved.length
                      ? `Map or create: ${unresolved.join(', ')}`
                      : 'Create the parts and MFG-MPN mappings this file needs'}>
              Submit
            </Button>
          </>
        )}
    >
      {step === 0 ? (
        <div className="vy-run-step">
          {/* ---- RFQ Information ------------------------------------------ */}
          <section className="vy-run-section">
            <h3 className="vy-field-group-title">RFQ Information</h3>
            <div className="vy-quote-config-grid">
              <Labelled label="Customer" required>
                <Select label="Customer" value={customer} options={CUSTOMER_OPTIONS}
                        onChange={pickCustomer} />
              </Labelled>
              {/* Three read-only stamps. The system owns them, so they are shown
                  as values rather than as disabled inputs — a greyed box reads
                  as a control that failed, not as a fact. */}
              <Labelled label="Run by"><ReadValue>An Bui</ReadValue></Labelled>
              <Labelled label="Created Date"><ReadValue>{stamp()}</ReadValue></Labelled>
              <Labelled label="Last Updated Date"><ReadValue>{stamp()}</ReadValue></Labelled>
            </div>
          </section>

          {/* ---- Select Action -------------------------------------------- */}
          <section className="vy-run-section">
            <h3 className="vy-field-group-title">Select Action</h3>
            {/* The sheet calls these two "checkbox", with Import New BoM
                "default selected". They are mutually exclusive — the whole of
                Assembly Info and Component Info changes with the choice — and a
                pair of checkboxes that cannot both be ticked is a radio group
                wearing the wrong control. Radio, so the keyboard and the screen
                reader both get the exclusivity the behaviour already has. */}
            <RadioGroup label="Select Action" value={action}
                        options={[
                          { value: 'import-new', label: 'Import New BoM' },
                          { value: 'load-existing', label: 'Load Existing BoM' },
                        ]}
                        onChange={v => setAction(v as typeof action)} />
            <p className="vy-hint">
              {action === 'import-new'
                ? 'Create a new assembly from a BoM file.'
                : 'Add a new BoM version to an assembly already in the system.'}
            </p>
          </section>

          {/* ---- Assembly Info -------------------------------------------- */}
          <section className="vy-run-section">
            <h3 className="vy-field-group-title">Assembly Info</h3>
            {action === 'import-new' ? (
              <>
                <div className="vy-quote-config-grid">
                  <Labelled label="Assembly Part Number" required
                            hint="The Customer Code is added as a prefix if it is not already there.">
                    <TextField value={assemblyPn} aria-label="Assembly Part Number"
                               onChange={e => setAssemblyPn(e.target.value)}
                               onBlur={() => code && setAssemblyPn(pn =>
                                 pn ? withCustomerCode(pn.trim(), code) : pn)} />
                  </Labelled>
                  <Labelled label="Revision">
                    <TextField value={rev} aria-label="Revision"
                               onChange={e => setRev(e.target.value)} />
                  </Labelled>
                  <Labelled label="Description" required>
                    <TextField value={description} aria-label="Description"
                               onChange={e => setDescription(e.target.value)} />
                  </Labelled>
                  {/* Read-only on a new assembly, and the sheet says so: a BoM
                      that does not exist yet is version 0 and the quantity the
                      recipe is scaled for is 1. */}
                  <Labelled label="BoM Version"><ReadValue>0</ReadValue></Labelled>
                  <Labelled label="Quantity"><ReadValue>1</ReadValue></Labelled>
                  <Labelled label="Part Class" required>
                    <Select label="Part Class" value={partClass} options={PART_CLASS}
                            onChange={setClass} />
                  </Labelled>
                  <Labelled label="Part Type" required
                            hint={partClass ? `Types valid for ${partClass}.`
                                            : 'Choose a Part Class first.'}>
                    <Select label="Part Type" value={partType}
                            options={[...(PART_CLASS_TYPES[partClass] ?? [])]}
                            onChange={setPartType} />
                  </Labelled>
                </div>
                {duplicate && (
                  <p className="vy-field-error" role="alert">
                    <strong>{assemblyPn}{rev ? ` - ${rev}` : ''}</strong> already exists for{' '}
                    {code}. Assembly Part Number, Revision and Customer must be unique together.
                  </p>
                )}
              </>
            ) : (
              <div className="vy-quote-config-grid">
                <Labelled label="Assembly Part Number" required
                          hint={customer ? undefined : 'Choose a Customer first.'}>
                  <Select label="Assembly Part Number" value={existingAssembly}
                          options={assemblies.map(a => a.label)}
                          onChange={setExistingAssembly} />
                </Labelled>
                {/* "Auto-populate value based on the option chosen in Assembly
                    Part Number" — five fields, all of them. */}
                <Labelled label="Description"><ReadValue>{effective.description}</ReadValue></Labelled>
                <Labelled label="BoM Version"><ReadValue>{effective.version}</ReadValue></Labelled>
                <Labelled label="Quantity"><ReadValue>{effective.quantity}</ReadValue></Labelled>
                <Labelled label="Part Class"><ReadValue>{effective.partClass}</ReadValue></Labelled>
                <Labelled label="Part Type"><ReadValue>{effective.partType}</ReadValue></Labelled>
              </div>
            )}
          </section>

          {/* ---- Component Info ------------------------------------------- */}
          <section className="vy-run-section">
            <h3 className="vy-field-group-title">Component Info</h3>

            <div className="vy-quote-config-grid">
              <Labelled label="Upload file" required>
                <div className="vy-inline-actions">
                  <Button onClick={() => setFileOpen(true)}>
                    {file ? 'Change file' : 'Upload file'}
                  </Button>
                  {file
                    ? <span className="vy-code">{file}</span>
                    : <span className="vy-field-hint">No file chosen yet.</span>}
                </div>
              </Labelled>
            </div>

            {action === 'import-new' ? (
              <>
                <div className="vy-aml">
                  <span className="vy-quote-fact-label">Select AML Format</span>
                  <RadioGroup label="Select AML Format" value={amlFormat}
                              options={AML_FORMATS.map(f => ({ value: f, label: f }))}
                              onChange={v => setAmlFormat(v as AmlFormat)} />
                  {/* THE CHOICE DESCRIBES THE FILE, NOT THE RESULT. Both formats
                      normalise to one layout, which the sheet states twice and
                      which is exactly what a user picking between two options
                      would not assume. Saying so here costs one line and saves
                      the "I picked the wrong one" support call. */}
                  <p className="vy-hint">
                    {amlFormat === 'Vertical'
                      ? 'MFG–MPN pairs are arranged by columns in the file.'
                      : 'MFG–MPN pairs are arranged by rows in the file.'}{' '}
                    Either way the system normalises them to
                    {' '}<span className="vy-code">MFG1 | MPN1 | MFG2 | MPN2 | …</span> on the
                    next step — the format describes your file, not the result.
                  </p>
                </div>

                <p className="vy-hint">
                  Download template:{' '}
                  <button type="button" className="vy-link"
                          onClick={() => toast.notImplemented('download the vertical BoM template')}>
                    Download vertical template
                  </button>
                  {' · '}
                  <button type="button" className="vy-link"
                          onClick={() => toast.notImplemented('download the horizontal BoM template')}>
                    Download horizontal template
                  </button>
                </p>
              </>
            ) : (
              <div className="vy-quote-config-grid">
                <Labelled label="Customer Template">
                  <ReadValue>{customer ? `${code} — default BoM template` : ''}</ReadValue>
                </Labelled>
                <Labelled label="Create Custom Template"
                          hint="Enabled once a file is attached — the template is built from it.">
                  {/* "Default disabled, enable when attach file via upload file."
                      The live label is "Create Custom Template"; the sheet writes
                      "Create Customer Template". D2 puts the live wording on
                      screen — see the note at the top of this file. */}
                  <Button disabled={!file}
                          onClick={() => toast.notImplemented(
                            `create a customer template from ${file}`)}>
                    Create Custom Template
                  </Button>
                </Labelled>
              </div>
            )}
          </section>

          <ImportFileDialog open={fileOpen} onClose={() => setFileOpen(false)}
                            onPick={name => { setFile(name); setFileOpen(false); }} />
        </div>
      ) : (
        <ReviewBom
          rows={rows} code={code} amlFormat={amlFormat}
          assembly={`${effective.assemblyPn}${effective.rev ? ` - ${effective.rev}` : ''}`}
          unknownMfgs={unknownMfgs} resolutions={resolutions}
          onResolve={(mfg, r) => setResolutions(s => ({ ...s, [mfg]: r }))}
          duplicates={duplicates} onDropDuplicate={dropDuplicate}
        />
      )}
    </Dialog>
  );
}

/* ============================================================================
   STEP 2 — REVIEW BoM
   ========================================================================= */

function ReviewBom({ rows, code, amlFormat, assembly, unknownMfgs, resolutions, onResolve,
                    duplicates, onDropDuplicate }: {
  rows: ImportedRow[]; code: string; amlFormat: AmlFormat; assembly: string;
  unknownMfgs: string[];
  resolutions: Record<string, MfgResolution>;
  onResolve: (mfg: string, r: MfgResolution) => void;
  duplicates: { part: string; pair: string }[];
  onDropDuplicate: (partId: number, pair: string) => void;
}) {
  const unresolved = unknownMfgs.filter(m => !resolutions[m]);
  const prefixed = rows.filter(r => !r.part.startsWith(`${code}-`)).length;
  const missingParts = rows.filter(r => !partIsKnown(r.part, code)).length;

  return (
    <div className="vy-run-step">
      <div className="vy-run-banner" data-tone={unresolved.length || duplicates.length ? 'warn' : 'ok'}>
        {unresolved.length
          ? <><strong>Manufacturers don't exist: {unresolved.join(', ')}</strong>{' '}
              Map each to a manufacturer already in the system, or create it. Submit stays
              blocked until every one is resolved.</>
          : duplicates.length
            ? <><strong>One duplicated MFG–MPN to resolve.</strong>{' '}
                Every manufacturer is accounted for; see below.</>
          : <><strong>{assembly} is ready to submit.</strong>{' '}
              {rows.length} components, {missingParts} of which will be created in Part Master.</>}
      </div>

      <p className="vy-hint">
        Parsed as a <strong>{amlFormat}</strong> file and normalised to{' '}
        <span className="vy-code">MFG1 | MPN1 | MFG2 | MPN2 | …</span>.
        {prefixed > 0 && <> The Customer Code <span className="vy-code">{code}</span> was added
          to {prefixed} component {prefixed === 1 ? 'number' : 'numbers'} that arrived without
          it.</>}
      </p>

      <MiniTable data={rows} columns={reviewColumns(code)} />

      {duplicates.map(d => {
        const row = rows.find(r => r.part === d.part);
        return (
          /* An error with a way out of it. The rule is the customer's — "{MFG-MPN}
             must be unique in every Part" — but a Submit blocked by the file's
             own contents, with nothing on screen that changes them, leaves the
             user to guess that the remedy is to fix the spreadsheet and start
             again. Dropping the repeat is what they would do anyway. */
          <div className="vy-run-banner" data-tone="warn" key={`${d.part}-${d.pair}`}>
            <strong>Duplicated MFG–MPN.</strong>{' '}
            <span className="vy-code">{d.pair}</span> appears twice on{' '}
            <span className="vy-code">{d.part}</span>, and each MFG–MPN must be unique within a
            part. Submit is blocked until it is resolved.{' '}
            {row && (
              <Button size="sm" variant="tonal"
                      onClick={() => onDropDuplicate(row.id, d.pair)}
                      title={`Keep one ${d.pair} on ${d.part} and drop the repeat`}>
                Remove the repeat
              </Button>
            )}
          </div>
        );
      })}

      {unknownMfgs.length > 0 && (
        <section className="vy-run-section">
          <h3 className="vy-field-group-title">MFG Mapping</h3>
          <p className="vy-hint">
            Every manufacturer in the file must either map to one the system already holds, or
            be created. Mapping is for the same company written differently; create is for one
            that is genuinely new.
          </p>
          <ul className="vy-mfg-map">
            {unknownMfgs.map(mfg => {
              const r = resolutions[mfg];
              return (
                <li key={mfg}>
                  <span className="vy-code">{mfg}</span>
                  <Select label={`Map ${mfg} to`}
                          value={r?.kind === 'map' ? r.to : ''}
                          options={[...KNOWN_MANUFACTURERS].sort()}
                          onChange={to => onResolve(mfg, { kind: 'map', to })} />
                  <Button size="sm" variant={r?.kind === 'create' ? 'filled' : 'tonal'}
                          onClick={() => onResolve(mfg, { kind: 'create' })}
                          title={`Add ${mfg} to Manufacturer Management`}>
                    Create new
                  </Button>
                  <span className="vy-field-hint">
                    {!r ? 'Not resolved'
                       : r.kind === 'create' ? `${mfg} will be created`
                       : `Mapped to ${r.to}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * The parsed file's columns.
 *
 * Green and red are the sheet's, on two different subjects: "Part exists:
 * background green / Part doesn't exist: red" and the same for MFG. They are
 * the same colours the quoting wizard's step 2 already uses for the same
 * question, so a user who has learned one screen has learned this one.
 */
function reviewColumns(code: string): ColumnSpec<ImportedRow>[] { return [
  { field: 'id', title: 'No.', role: 'number', width: 64 },
  { field: 'part', title: 'Component Part', role: 'ident', width: 200,
    /* The same two tones the quoting wizard's step 2 uses for the same
       question — "Part exists: green / doesn't exist: red". Reused rather than
       renamed, so one rule has one colour across the app. */
    tone: r => (partIsKnown(r.part, code) ? 'known' : 'missing'),
    render: r => (
      <span title={partIsKnown(r.part, code)
        ? 'In Part Master'
        : 'Not in Part Master — Submit will create it'}>
        {withCustomerCode(r.part, code)}
      </span>
    ) },
  { field: 'revision', title: 'Revision', role: 'code', width: 96 },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'partSource', title: 'Part Source', role: 'code', width: 120 },
  { field: 'qty', title: 'Quantity', role: 'number', width: 100 },
  /* The normalised pairs, in the sheet's order: MFG1 | MPN1 | MFG2 | MPN2.
     Rendered as pairs rather than as four columns because the number of pairs
     varies by row, and four fixed columns would be empty on most of them. */
  { field: 'pairs', title: 'MFG | MPN', role: 'text', width: 340,
    widthNote: 'Holds up to two manufacturer/part-number pairs.',
    render: r => (
      <span className="vy-pairs">
        {r.pairs.map((p, i) => (
          <span key={`${p.mfg}-${p.mpn}-${i}`} className="vy-pair"
                data-known={KNOWN_MANUFACTURERS.has(p.mfg) || undefined}
                title={KNOWN_MANUFACTURERS.has(p.mfg)
                  ? `${p.mfg} is in Manufacturer Management`
                  : `${p.mfg} is not in Manufacturer Management`}>
            {p.mfg} | <span className="vy-code">{p.mpn}</span>
          </span>
        ))}
      </span>
    ) },
]; }

/* ---- Small shared bits ---------------------------------------------------- */

function Labelled({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="vy-field vy-field--editing">
      <div className="vy-field-label">
        {label}
        {required && <>
          <span className="vy-required" aria-hidden>(*)</span>
          <span className="vy-sr-only"> required</span>
        </>}
      </div>
      <div>
        {children}
        {hint && <span className="vy-field-hint">{hint}</span>}
      </div>
    </div>
  );
}

function ReadValue({ children }: { children: React.ReactNode }) {
  const empty = children === '' || children === undefined || children === null;
  return <div className={empty ? 'vy-read-value is-empty' : 'vy-read-value'}>
    {empty ? 'Not set' : children}
  </div>;
}

/** The moment the form was opened, in the system's one format. */
function stamp() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
