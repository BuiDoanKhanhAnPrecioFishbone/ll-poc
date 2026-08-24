import { useState } from 'react';
import { Dialog, RadioGroup, Select } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { Stepper } from '../../ui/Stepper';
import { MiniTable } from '../../ui/MiniTable';
import { SearchField, TextField } from '../../ui/Field';
import type { ColumnSpec } from '../column-model';
import type { Quotation } from '../../data/quotations';
import { useToast } from '../../ui/Toast';

/**
 * Run Quotation.
 *
 * SOURCE. Mapped from the shipped production bundle — `chunk-BAkpvJLm.js` for the
 * wizard and `chunk-DtT2PYYA.js` for the summary render — by decoding the
 * obfuscated string tables. Nothing here was executed against the live system: a
 * real quote run costs money and writes records. Every label below is a literal
 * from that code. The full extract is in docs/bundle-evidence.md.
 *
 * WHAT THIS FILE GOT WRONG BEFORE, and why it matters.
 *
 * An earlier version claimed the live flow "is not a linear stepper" and that the
 * four steps were this mockup's own proposal. That was false. The reducer is
 * right there in the bundle with four named steps, NEXT/PREV/GOTO, and a
 * `isPreviousStepsValid` guard. Believing otherwise led to inventing a step
 * order, renaming all four steps, and quietly dropping three capabilities:
 *
 *   - the choice of BoM SOURCE (existing version / upload new / current, no
 *     changes) — the mockup only offered upload, so two of three real paths
 *     through step 1 did not exist
 *   - Save Draft and CONTINUE FROM DRAFTS — you could not stop half way
 *   - Assembly Details — which assembly and what build quantity you are costing
 *
 * It also moved the quote run itself from step 3 to step 4, and invented a
 * four-bucket "Quote Run Summary" that appears nowhere in the product.
 */

/* Verbatim, numbers included — the live labels carry their own step numbers. */
const STEPS = [
  { label: '1 - Config BoM', text: 'Choose the BoM and map its columns' },
  { label: '2 - Review BoM', text: 'Excluded parts, manufacturers, attrition' },
  { label: '3 - Quoting',    text: 'Run the quote and pick suppliers' },
  { label: '4 - Summary',    text: 'Cost estimation' },
];

/* The three BoM sources, verbatim. "User current BoM" is the live spelling. */
const BOM_SOURCES = [
  { value: 'existing', label: 'Run quote with existing BoM version' },
  { value: 'upload',   label: 'Upload new BoM file to replace current version' },
  { value: 'current',  label: 'User current BoM (no changes)' },
];

type Line = {
  id: number; part: string; partRev: string; partDesc: string; mfgpn: string;
  manufacturer: string; supplier: string; unitPrice: number; minQty: number;
  totalQty: number; onHand: number; needQty: number; orderQty: number;
  excessQty: number; excessAmt: number; leadDays: number;
  /** Live line states. There is no "Matched" — a line with no flag is fine. */
  flag: '' | 'No Match' | 'Not Enough Qty' | 'Out Stock' | 'Unselected Supplier';
  attrition: number | null;
  excluded: boolean;
};

const LINES: Line[] = [
  { id: 1, part: 'RES-0603-10K', partRev: 'A', partDesc: 'Resistor 10k 1% 0603', mfgpn: 'CRCW060310K0FKEA', manufacturer: 'Vishay', supplier: 'Digi-Key', unitPrice: 0.012, minQty: 5000, totalQty: 1236, onHand: 480000, needQty: 1236, orderQty: 5000, excessQty: 3764, excessAmt: 45.17, leadDays: 3, flag: '', attrition: 3, excluded: false },
  { id: 2, part: 'CAP-0402-100N', partRev: 'A', partDesc: 'Cap 100nF 16V X7R 0402', mfgpn: 'GRM155R71C104KA88D', manufacturer: 'Murata', supplier: 'Mouser', unitPrice: 0.008, minQty: 10000, totalQty: 2520, onHand: 1200000, needQty: 2520, orderQty: 10000, excessQty: 7480, excessAmt: 59.84, leadDays: 5, flag: '', attrition: 5, excluded: false },
  { id: 3, part: 'IC-PWR-BUCK-3A', partRev: 'B', partDesc: 'Buck converter 3A 17V', mfgpn: 'TPS62130ARGTR', manufacturer: 'Texas Instruments', supplier: 'Arrow', unitPrice: 2.41, minQty: 1, totalQty: 50, onHand: 8200, needQty: 50, orderQty: 50, excessQty: 0, excessAmt: 0, leadDays: 12, flag: '', attrition: null, excluded: false },
  { id: 4, part: 'CONN-HDR-2X10', partRev: 'A', partDesc: 'Header 2x10 2.54mm', mfgpn: 'TSW-110-07-G-D', manufacturer: 'Samtec', supplier: '—', unitPrice: 3.18, minQty: 1, totalQty: 50, onHand: 0, needQty: 50, orderQty: 0, excessQty: 0, excessAmt: 0, leadDays: 0, flag: 'Unselected Supplier', attrition: null, excluded: false },
  { id: 5, part: 'XTAL-16MHZ', partRev: 'A', partDesc: 'Crystal 16MHz 20ppm', mfgpn: 'ABM8G-16.000MHZ', manufacturer: 'Abracon', supplier: '—', unitPrice: 0, minQty: 100, totalQty: 50, onHand: 0, needQty: 50, orderQty: 0, excessQty: 0, excessAmt: 0, leadDays: 0, flag: 'No Match', attrition: null, excluded: false },
  { id: 6, part: 'LED-GRN-0805', partRev: 'A', partDesc: 'LED green 0805', mfgpn: 'LTST-C170KGKT', manufacturer: 'Lite-On', supplier: 'Digi-Key', unitPrice: 0.09, minQty: 3000, totalQty: 100, onHand: 640, needQty: 100, orderQty: 3000, excessQty: 2900, excessAmt: 261.0, leadDays: 8, flag: 'Not Enough Qty', attrition: 2, excluded: false },
  { id: 7, part: 'DNI-TESTPOINT', partRev: 'A', partDesc: 'Test point — do not install', mfgpn: '—', manufacturer: '—', supplier: '—', unitPrice: 0, minQty: 0, totalQty: 0, onHand: 0, needQty: 0, orderQty: 0, excessQty: 0, excessAmt: 0, leadDays: 0, flag: '', attrition: null, excluded: true },
];

const MISMATCHED_MFG = [
  { bom: 'TEXAS INSTR.', z2data: 'Texas Instruments' },
  { bom: 'LITEON', z2data: 'Lite-On Technology' },
];

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const money3 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 });

export function RunQuotationDialog({ q, onClose }: { q: Quotation; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const goTo = (i: number) => { setStep(i); setFurthest(f => Math.max(f, i)); };
  const toast = useToast();

  const [source, setSource] = useState('current');
  const [hasRun, setHasRun] = useState(false);

  const active = LINES.filter(l => !l.excluded);
  const excluded = LINES.filter(l => l.excluded);
  const unresolved = active.filter(l => l.flag !== '').length;
  const missingAttrition = active.filter(l => l.attrition === null).length;

  /* The live guard: you cannot go forward past a step that has been marked
     invalid. Step 3 is invalid until the quote has actually been run —
     "Please run quotation for continue process!" */
  const stepValid = (i: number) => (i === 2 ? hasRun : true);
  const canContinue = stepValid(step);

  const totalQty = active.reduce((n, l) => n + l.totalQty, 0);
  const costBoard = active.reduce((n, l) => n + l.unitPrice * l.totalQty, 0);
  const excessAmount = active.reduce((n, l) => n + l.excessAmt, 0);
  const markup = q.markup / 100;

  return (
    <Dialog open size="xl" title={`Run Quotation — RFQ${q.no}`}
            subtitle={STEPS[step].text}
            onClose={onClose}
            actions={<>
              <Button onClick={onClose}>Cancel</Button>
              {/* Live has Save Draft on the BoM step, and this mockup had dropped
                  it. Losing a half-finished BoM import because you had to leave
                  is a real cost, not a nicety. */}
              {step === 0 && (
                <Button onClick={() => toast.notImplemented('save this BoM configuration as a draft')}>
                  Save Draft
                </Button>
              )}
              <Button onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
              {step < STEPS.length - 1
                ? <Button variant="filled" disabled={!canContinue} onClick={() => goTo(step + 1)}>
                    Continue
                  </Button>
                : <Button variant="filled"
                          onClick={() => { toast.notImplemented('write this quote version to the Quotation Result tab'); onClose(); }}>
                    Add Quotation
                  </Button>}
            </>}>
      <div className="vy-run">
        <Stepper steps={STEPS} value={step} furthest={furthest} onChange={goTo} numbered={false} />

        {/* The live wizard shows RFQ context on step 1 only, so by the pricing
            grid you can no longer see which RFQ you are costing. It stays. */}
        <div className="vy-run-context">
          <span className="vy-ident">RFQ{q.no}</span>
          <span>{q.customer}</span>
          <span className="vy-code">{q.application}</span>
          <span className="vy-code">{q.rfqType}</span>
        </div>

        {step === 0 && <StepConfigBom q={q} source={source} setSource={setSource} toast={toast} />}
        {step === 1 && <StepReviewBom excluded={excluded} missingAttrition={missingAttrition} toast={toast} />}
        {step === 2 && <StepQuoting active={active} unresolved={unresolved} hasRun={hasRun}
                                    onRun={() => { setHasRun(true); toast.success(`Quote run complete for RFQ${q.no}.`); }}
                                    toast={toast} />}
        {step === 3 && <StepSummary q={q} totalQty={totalQty} costBoard={costBoard}
                                    excessAmount={excessAmount} markup={markup} />}
      </div>
    </Dialog>
  );
}

/* ---- 1 - Config BoM ------------------------------------------------------ */

function StepConfigBom({ q, source, setSource, toast }: {
  q: Quotation; source: string; setSource: (v: string) => void;
  toast: ReturnType<typeof useToast>;
}) {
  const [detection, setDetection] = useState('');
  const [keyDetection, setKeyDetection] = useState('');
  const [version, setVersion] = useState('v3 — 12 Aug 2026');
  const [buildQty, setBuildQty] = useState('50');

  return (
    <div className="vy-run-step">
      {/* The three sources are the whole point of this step, so they lead it.
          Which BoM you are costing decides everything downstream. */}
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Bom Options</h3>
        <RadioGroup label="Bom Options" options={BOM_SOURCES} value={source} onChange={setSource} />

        {source === 'existing' && (
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Run Version</span>
            <Select label="Run Version" value={version} onChange={setVersion}
                    options={['v3 — 12 Aug 2026', 'v2 — 28 Jul 2026', 'v1 — 14 Jul 2026']} />
          </label>
        )}

        {source === 'upload' && (
          <>
            <div className="vy-dropzone">
              <strong>Drop the BoM file here</strong>
              <span>or</span>
              <Button onClick={() => toast.notImplemented('open a file picker for the BoM spreadsheet')}>
                Upload File
              </Button>
              <p className="vy-hint">
                .xlsx or .xls — the BoM must include Part Number, Part Rev, Part Description and Qty Per
              </p>
            </div>
            <div className="vy-run-cols">
              <label className="vy-inline-field vy-inline-field--stack">
                <span>Select Column Detection</span>
                <Select label="Select Column Detection" value={detection} onChange={setDetection}
                        options={['', 'Customer template', 'Standard template', 'Map manually']} />
              </label>
              <label className="vy-inline-field vy-inline-field--stack">
                <span>Select Key Column Detection</span>
                <Select label="Select Key Column Detection" value={keyDetection} onChange={setKeyDetection}
                        options={['', 'Part Number', 'Manufacturer PN', 'Rocket PN']} />
                <p className="vy-hint">Which column identifies a line uniquely when matching.</p>
              </label>
            </div>
          </>
        )}

        {source === 'current' && (
          <p className="vy-hint">
            Costs the BoM already attached to this RFQ. Nothing is uploaded and no new version is created.
          </p>
        )}
      </section>

      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Assembly Details</h3>
        <div className="vy-run-cols">
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Assembly Name</span>
            <TextField value={q.projectName} readOnly />
          </label>
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Assembly Part Number</span>
            <TextField value={`${q.projectName}-01`} readOnly />
          </label>
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Build Qty</span>
            <TextField type="number" min={1} value={buildQty}
                       onChange={e => setBuildQty(e.target.value)} />
          </label>
        </div>
      </section>

      <div className="vy-run-drafts">
        <span>Started this before?</span>
        <Button size="sm" variant="tonal"
                onClick={() => toast.notImplemented('list saved BoM drafts for this RFQ')}>
          CONTINUE FROM DRAFTS
        </Button>
      </div>
    </div>
  );
}

/* ---- 2 - Review BoM ------------------------------------------------------ */

function StepReviewBom({ excluded, missingAttrition, toast }: {
  excluded: Line[]; missingAttrition: number; toast: ReturnType<typeof useToast>;
}) {
  const excludedCols: ColumnSpec<Line>[] = [
    { field: 'part', title: 'PART NUMBER', role: 'ident' },
    { field: 'partRev', title: 'PART REV', role: 'code', width: 96 },
    { field: 'partDesc', title: 'PART DESCRIPTION', role: 'text' },
  ];
  return (
    <div className="vy-run-step">
      {/* Irreversible, so it is stated before the list rather than after it. */}
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Review Excluded Parts</h3>
        <div className="vy-run-banner" data-tone="warn">
          Please review those exclude part(s) as listed below. These parts will not be used
          to quote from Nexar and <strong>cannot be recalled</strong>.
        </div>
        {excluded.length
          ? <MiniTable data={excluded} columns={excludedCols} />
          : <p className="vy-hint">No parts are excluded.</p>}
        <p className="vy-hint">Do not install item must be excluded from the quotation.</p>
      </section>

      <section className="vy-run-section">
        <h3 className="vy-field-group-title">MFG Mismatch Review</h3>
        <div className="vy-run-banner" data-tone={MISMATCHED_MFG.length ? 'warn' : 'ok'}>
          The following BOM manufacturers mismatch with Z2Data. Do you want to add them to the system?
        </div>
        <ul className="vy-mismatch">
          {MISMATCHED_MFG.map(m => (
            <li key={m.bom}>
              <span className="vy-code">{m.bom}</span>
              <span className="vy-mismatch-arrow" aria-hidden>→</span>
              <span>{m.z2data}</span>
              <span className="vy-mismatch-actions">
                <Button size="sm" variant="tonal"
                        onClick={() => toast.notImplemented(`link ${m.bom} to an existing manufacturer`)}>
                  Link to an existing Manufacturer
                </Button>
                <Button size="sm"
                        onClick={() => toast.notImplemented(`create ${m.bom} as a new manufacturer`)}>
                  Create a new Manufacturer
                </Button>
                <Button size="sm"
                        onClick={() => toast.notImplemented(`add ${m.bom} as an alias`)}>
                  Add to Alias
                </Button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="vy-run-section">
        <h3 className="vy-field-group-title">Attrition</h3>
        <div className="vy-run-banner" data-tone={missingAttrition ? 'warn' : 'ok'}>
          {missingAttrition
            ? <><strong>{missingAttrition} {missingAttrition === 1 ? 'line has' : 'lines have'} no attrition set.</strong>{' '}
                Attrition is the overage ordered to cover placement loss; without it the quote understates material cost.</>
            : <><strong>Attrition set on every line.</strong></>}
        </div>
        <div className="vy-run-actions">
          <Button size="sm" onClick={() => toast.notImplemented('add attrition to the lines that have none')}>
            Add Attrition
          </Button>
          <Button size="sm" variant="tonal"
                  onClick={() => toast.notImplemented('change attrition quantity in batch')}>
            Batch attrition qty change
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ---- 3 - Quoting --------------------------------------------------------- */

function StepQuoting({ active, unresolved, hasRun, onRun, toast }: {
  active: Line[]; unresolved: number; hasRun: boolean;
  onRun: () => void; toast: ReturnType<typeof useToast>;
}) {
  const [preferredOnly, setPreferredOnly] = useState(false);

  const columns: ColumnSpec<Line>[] = [
    { field: 'part', title: 'Part', role: 'ident' },
    { field: 'mfgpn', title: 'MPN', role: 'ident' },
    { field: 'manufacturer', title: 'Manufacturer Name', role: 'text' },
    { field: 'supplier', title: 'Supplier', role: 'text', width: 130 },
    { field: 'unitPrice', title: 'Unit Price', role: 'money',
      render: l => l.unitPrice ? money3(l.unitPrice) : <span className="vy-empty">—</span> },
    { field: 'minQty', title: 'Minimum Qty', role: 'number', render: l => l.minQty.toLocaleString() },
    { field: 'totalQty', title: 'Total Qty', role: 'number', render: l => l.totalQty.toLocaleString() },
    { field: 'onHand', title: 'On Hand', role: 'number', render: l => l.onHand.toLocaleString() },
    { field: 'needQty', title: 'Need Qty', role: 'number', render: l => l.needQty.toLocaleString() },
    { field: 'orderQty', title: 'Order Qty', role: 'number', render: l => l.orderQty.toLocaleString() },
    { field: 'excessQty', title: 'Excess Qty', role: 'number', render: l => l.excessQty.toLocaleString() },
    { field: 'excessAmt', title: 'Excess Amt', role: 'money',
      render: l => l.excessAmt ? money(l.excessAmt) : <span className="vy-empty">—</span> },
    { field: 'leadDays', title: 'Lead Days', role: 'number',
      render: l => l.leadDays ? String(l.leadDays) : <span className="vy-empty">—</span> },
    { field: 'flag', title: 'Status', role: 'status', width: 170,
      widthNote: 'Longest value is "Unselected Supplier".',
      render: l => l.flag
        ? <span className="vy-match" data-match={l.flag}>{l.flag}</span>
        : <span className="vy-empty">—</span> },
  ];

  const totalExcess = active.reduce((n, l) => n + l.excessAmt, 0);

  return (
    <div className="vy-run-step">
      {/* The run happens HERE. An earlier version of this file moved it to the
          last step, which put the slowest, most consequential action after the
          screen that reports its results. */}
      <div className="vy-run-banner" data-tone={hasRun ? (unresolved ? 'warn' : 'ok') : 'info'}>
        {!hasRun
          ? <><strong>Please run quotation for continue process!</strong> Pricing is fetched from Nexar for every line.</>
          : unresolved
            ? <><strong>{unresolved} of {active.length} lines need a decision.</strong>{' '}
                The following part are unselected and will be changed to NO BID if you continue.</>
            : <><strong>Every line priced.</strong></>}
      </div>

      <div className="vy-run-actions">
        <Button variant={hasRun ? 'text' : 'filled'} onClick={onRun}>
          {hasRun ? 'Re-run Quote' : 'Run Quote'}
        </Button>
        {hasRun && <>
          <Button size="sm" variant="tonal"
                  onClick={() => toast.notImplemented('load more suppliers for the selected line')}>
            ➕ Load More Suppliers
          </Button>
          <Button size="sm" variant={preferredOnly ? 'filled' : 'tonal'}
                  aria-pressed={preferredOnly} onClick={() => setPreferredOnly(v => !v)}>
            🔼 Show Preferred Only
          </Button>
          <Button size="sm" variant="tonal"
                  onClick={() => toast.notImplemented('apply a price range across the selection')}>
            Apply Price Range
          </Button>
          <Button size="sm" variant="tonal"
                  onClick={() => toast.notImplemented('return these lines to rework')}>
            Back to Rework
          </Button>
        </>}
      </div>

      {hasRun ? (
        <>
          <SearchField placeholder="Search by Part / Description / MPN / MFG / Supplier"
                       aria-label="Search by Part / Description / MPN / MFG / Supplier" />
          <MiniTable data={active} columns={columns} />
          <p className="vy-run-total">Total Excess Amount : <strong>{money(totalExcess)}</strong></p>
        </>
      ) : (
        /* Not an empty grid. An empty grid says "no results"; this says "you
           have not asked yet", which is a different thing. */
        <div className="vy-empty-state vy-empty-state--inline">
          <strong>No pricing yet</strong>
          <p>Please run the quote to get new data.</p>
        </div>
      )}
    </div>
  );
}

/* ---- 4 - Summary --------------------------------------------------------- */

function StepSummary({ q, totalQty, costBoard, excessAmount, markup }: {
  q: Quotation; totalQty: number; costBoard: number; excessAmount: number; markup: number;
}) {
  const costBoardWMarkup = costBoard * (1 + markup);
  const totalCost = costBoard;
  const totalCostWMarkup = costBoardWMarkup;

  return (
    <div className="vy-run-step vy-run-summary-step">
      {/* Live labels come from RFQ_Page.Run_Quotation.Form.* — the keys are in the
          bundle, their English is in a runtime translation resource. The key
          names are used verbatim as labels rather than paraphrased. */}
      <div className="vy-summary-detail">
        <dl className="vy-field-list">
          <Row label="Assembly Part Number" value={`${q.projectName}-01`} />
          <Row label="Description" value={q.projectName} />
          <Row label="Qty" value={totalQty.toLocaleString()} />
          <Row label="Attrition" value="3%" />
        </dl>
        <dl className="vy-field-list">
          <Row label="Quote Focus" value={q.quoteFocus} />
          <Row label="Material Pkg Type" value={q.materialPackageType} />
          <Row label="MarkUp" value={`${q.markup}%`} />
        </dl>
        <dl className="vy-field-list">
          <Row label="Primary Provider" value="Nexar" />
          <Row label="Run Date" value="19/08/2026 09:24:11" />
        </dl>
      </div>

      {/* The live Cost Estimation card. This mockup previously showed four
          invented status buckets here — "Priced / No match / Supplier mismatch /
          No bid" — none of which exist in the product. */}
      <section className="vy-cost-card">
        <h3 className="vy-cost-title">Cost Estimation</h3>
        <dl className="vy-cost-list">
          <Cost label="Cost/Board" value={money3(costBoard / Math.max(1, totalQty))} />
          <Cost label="Cost/Board With MarkUp" value={money3(costBoardWMarkup / Math.max(1, totalQty))} />
          <Cost label="TotalCost" value={money(totalCost)} />
          <Cost label="Total Cost With MarkUp" value={money(totalCostWMarkup)} emphasis />
          <Cost label="Excess Amount" value={money(excessAmount)} />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="vy-field"><dt>{label}</dt><dd>{value}</dd></div>;
}

function Cost({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="vy-cost-row" data-emphasis={emphasis || undefined}>
      <dt>{label}</dt><dd>{value}</dd>
    </div>
  );
}
