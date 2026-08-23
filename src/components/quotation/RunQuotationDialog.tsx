import { useState } from 'react';
import { Dialog } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { Stepper } from '../../ui/Stepper';
import { MiniTable } from '../../ui/MiniTable';
import { SearchField } from '../../ui/Field';
import { Select } from '../../ui/Overlays';
import type { ColumnSpec } from '../column-model';
import type { Quotation } from '../../data/quotations';
import { useToast } from '../../ui/Toast';

/**
 * Run Quotation.
 *
 * SOURCE OF THIS STRUCTURE. The live flow was NOT executed — running a
 * quotation on a production ERP costs money and writes records. It was mapped
 * instead by reading the shipped bundle for
 * `src/pages/quotation/features/wizard/RfqProcessWizard.tsx`
 * (assets/chunk-BAkpvJLm.js), which yields these verbatim strings:
 *
 *   "RFQ Information", "Upload BoM File", "Upload Quote File",
 *   "Upload BoM and create a new version", "Please select Column Detection",
 *   "Review Excluded Parts", "Missing Attrition", "Add Missing Attrition",
 *   "Attrition Qty", "Attrition Set", "Manufacturer Information",
 *   "Create a new Manufacturer", "Add to Alias", "Matches Another Supplier",
 *   "No Match", "No Bid", "Quote Run Summary", "Nexar",
 *   "Search by Part/Desc/MPN/MFG/Supplier...", and the grid columns
 *   Part / MFGPN / Manufacturer / PART SOURCE / REVISION / Price / Source /
 *   Stock / Minimum Qty / Total Qty / Notes.
 *
 * WHAT IS NOT CONFIRMED. The live flow is not a linear stepper — those strings
 * belong to a working screen plus four modals. The step sequence below is this
 * mockup's PROPOSAL for how that work should be ordered, not a reproduction.
 * The four Quote Run Summary buckets are also unconfirmed: the bundle shows
 * four counts with colours (one green, #16a34a) but their labels sit in an
 * RC4-encoded string table that cannot be resolved without running the app.
 * They are marked in the UI as needing confirmation.
 */
const STEPS = [
  { label: 'BoM', text: 'Upload and map columns' },
  { label: 'Parts', text: 'Resolve manufacturers' },
  { label: 'Pricing', text: 'Review prices and attrition' },
  { label: 'Summary', text: 'Confirm and run' },
];

type Line = {
  id: number; part: string; mfgpn: string; manufacturer: string; source: string;
  rev: string; qty: number; price: number; stock: number; minQty: number;
  match: 'Matched' | 'No Match' | 'Matches Another Supplier' | 'No Bid';
  attrition: number | null;
};

const LINES: Line[] = [
  { id: 1, part: 'RES-0603-10K', mfgpn: 'CRCW060310K0FKEA', manufacturer: 'Vishay', source: 'Nexar', rev: 'A', qty: 1200, price: 0.012, stock: 480000, minQty: 5000, match: 'Matched', attrition: 3 },
  { id: 2, part: 'CAP-0402-100N', mfgpn: 'GRM155R71C104KA88D', manufacturer: 'Murata', source: 'Nexar', rev: 'A', qty: 2400, price: 0.008, stock: 1200000, minQty: 10000, match: 'Matched', attrition: 5 },
  { id: 3, part: 'IC-PWR-BUCK-3A', mfgpn: 'TPS62130ARGTR', manufacturer: 'Texas Instruments', source: 'Nexar', rev: 'B', qty: 50, price: 2.41, stock: 8200, minQty: 1, match: 'Matched', attrition: null },
  { id: 4, part: 'CONN-HDR-2X10', mfgpn: 'TSW-110-07-G-D', manufacturer: 'Samtec', source: 'Manual', rev: 'A', qty: 50, price: 3.18, stock: 0, minQty: 1, match: 'Matches Another Supplier', attrition: null },
  { id: 5, part: 'XTAL-16MHZ', mfgpn: 'ABM8G-16.000MHZ', manufacturer: 'Abracon', source: 'Nexar', rev: 'A', qty: 50, price: 0.64, stock: 14000, minQty: 100, match: 'No Match', attrition: null },
  { id: 6, part: 'PCB-MAIN-REVC', mfgpn: '—', manufacturer: '—', source: '—', rev: 'C', qty: 50, price: 0, stock: 0, minQty: 1, match: 'No Bid', attrition: null },
];

const money = (n: number) => n.toLocaleString('en-GB', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 });

export function RunQuotationDialog({ q, onClose }: { q: Quotation; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();

  const unresolved = LINES.filter(l => l.match !== 'Matched').length;
  const missingAttrition = LINES.filter(l => l.attrition === null && l.match === 'Matched').length;

  return (
    <Dialog open size="xl" title={`Run quotation — RFQ${q.no}`}
            subtitle="Upload a BoM, resolve manufacturers, then price every line."
            onClose={onClose}
            actions={<>
              <Button onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
              {step < STEPS.length - 1
                ? <Button variant="filled" onClick={() => setStep(s => s + 1)}>Continue</Button>
                : <Button variant="filled"
                          onClick={() => { toast.notImplemented('price every line and write a new version to the Result tab'); onClose(); }}>
                    Run quotation
                  </Button>}
            </>}>
      <div className="vy-run">
        {/* Kendo Stepper. The live flow has no visible progress model at all;
            you discover what is left by hitting errors. */}
        <Stepper steps={STEPS} value={step} onChange={setStep} />

        {/* Context stays on screen. The live wizard shows an "RFQ Information"
            panel only on its first screen, so by the parts grid you can no
            longer see which RFQ or customer you are costing. */}
        <div className="vy-run-context">
          <span className="vy-ident">RFQ{q.no}</span>
          <span>{q.customer}</span>
          <span className="vy-code">{q.application}</span>
          <span className="vy-code">{q.rfqType}</span>
        </div>

        {step === 0 && <StepBom toast={toast} />}
        {step === 1 && <StepParts unresolved={unresolved} toast={toast} />}
        {step === 2 && <StepPricing missingAttrition={missingAttrition} toast={toast} />}
        {step === 3 && <StepSummary unresolved={unresolved} />}
      </div>

    </Dialog>
  );
}

function StepBom({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [detection, setDetection] = useState('Automatic');
  const [sheet, setSheet] = useState('Sheet1');
  return (
    <div className="vy-run-step">
      <div className="vy-dropzone">
        <strong>Drop the BoM file here</strong>
        <span>or</span>
        <Button onClick={() => toast.notImplemented('open a file picker for the BoM spreadsheet')}>
          Select file…
        </Button>
        <p className="vy-hint">.xlsx or .csv — uploading creates a new BoM version</p>
      </div>
      <div className="vy-run-cols">
        <label className="vy-inline-field vy-inline-field--stack">
          <span>Column detection</span>
          <Select label="Column detection" value={detection} onChange={setDetection}
                  options={['Automatic', 'Use template', 'Map manually']} />
          <p className="vy-hint">
            Which spreadsheet columns hold the part number, revision, quantity and source.
          </p>
        </label>
        <label className="vy-inline-field vy-inline-field--stack">
          <span>Sheet</span>
          <Select label="Sheet" value={sheet} onChange={setSheet}
                  options={['Sheet1', 'BOM', 'Consolidated']} />
        </label>
      </div>
    </div>
  );
}

function StepParts({ unresolved, toast }: { unresolved: number; toast: ReturnType<typeof useToast> }) {
  const columns: ColumnSpec<Line>[] = [
    { field: 'part', title: 'Part', role: 'ident' },
    { field: 'mfgpn', title: 'MPN', role: 'ident' },
    { field: 'manufacturer', title: 'Manufacturer', role: 'text' },
    { field: 'rev', title: 'Rev', role: 'code', render: l => <span className="vy-code">{l.rev}</span> },
    { field: 'source', title: 'Source', role: 'code', width: 110,
      widthNote: 'Values include "Manual" alongside "Nexar".',
      render: l => <span className="vy-code">{l.source}</span> },
    { field: 'match', title: 'Match', role: 'status', width: 210,
      widthNote: 'Longest value is "Matches Another Supplier".',
      render: l => <span className="vy-match" data-match={l.match}>{l.match}</span> },
    { field: 'id', title: 'Action', role: 'code', width: 120,
      widthNote: 'Holds a button, not a code.',
      render: l => l.match !== 'Matched'
        ? <Button size="sm" variant="tonal"
                  onClick={() => toast.notImplemented(`open manufacturer matching for ${l.part}`)}>
            Resolve
          </Button>
        : <span className="vy-empty">—</span> },
  ];
  return (
    <div className="vy-run-step">
      <div className="vy-run-banner" data-tone={unresolved ? 'warn' : 'ok'}>
        {unresolved
          ? <><strong>{unresolved} of {LINES.length} {unresolved === 1 ? 'lines needs' : 'lines need'} a decision.</strong> Everything else priced automatically from Nexar.</>
          : <><strong>All lines matched.</strong></>}
      </div>
      <SearchField placeholder="Search by part, description, MPN, manufacturer or supplier"
                   aria-label="Search parts" />
      <MiniTable data={LINES} columns={columns} />
    </div>
  );
}

function StepPricing({ missingAttrition, toast }: { missingAttrition: number; toast: ReturnType<typeof useToast> }) {
  const columns: ColumnSpec<Line>[] = [
    { field: 'part', title: 'Part', role: 'ident' },
    { field: 'qty', title: 'Total Qty', role: 'number', render: l => l.qty.toLocaleString() },
    { field: 'attrition', title: 'Attrition %', role: 'number',
      render: l => l.attrition === null
        ? <span className="vy-warn-cell">Not set</span>
        : `${l.attrition}%` },
    { field: 'price', title: 'Unit Price', role: 'money',
      render: l => l.price ? money(l.price) : <span className="vy-empty">—</span> },
    { field: 'stock', title: 'Stock', role: 'number', render: l => l.stock.toLocaleString() },
    { field: 'minQty', title: 'Min Qty', role: 'number', render: l => l.minQty.toLocaleString() },
    { field: 'id', title: 'Action', role: 'code', width: 120,
      widthNote: 'Holds a button, not a code.',
      render: l => l.attrition === null && l.match === 'Matched'
        ? <Button size="sm" variant="tonal"
                  onClick={() => toast.notImplemented(`set the attrition percentage for ${l.part}`)}>
            Set
          </Button>
        : <span className="vy-empty">—</span> },
  ];
  return (
    <div className="vy-run-step">
      <div className="vy-run-banner" data-tone={missingAttrition ? 'warn' : 'ok'}>
        {missingAttrition
          ? <><strong>{missingAttrition} {missingAttrition === 1 ? 'line has' : 'lines have'} no attrition set.</strong> Attrition is the overage ordered to cover placement loss; without it the quote understates material cost.</>
          : <><strong>Attrition set on every line.</strong></>}
      </div>
      <MiniTable data={LINES} columns={columns} />
    </div>
  );
}

function StepSummary({ unresolved }: { unresolved: number }) {
  const matched = LINES.length - unresolved;
  return (
    <div className="vy-run-step">
      {/* The live "Quote Run Summary" modal shows four counts. Their labels are
          in an RC4-encoded string table and could not be resolved without
          running the app, so these four are this mockup's reading of the
          vocabulary elsewhere in the same bundle — flagged, not asserted. */}
      <div className="vy-unverified">
        Bucket names below are inferred from the wizard bundle and need confirming against a
        real quote run.
      </div>
      <div className="vy-run-summary">
        <Bucket n={matched} label="Priced" tone="done" />
        <Bucket n={LINES.filter(l => l.match === 'No Match').length} label="No match" tone="blocked" />
        <Bucket n={LINES.filter(l => l.match === 'Matches Another Supplier').length} label="Supplier mismatch" tone="open" />
        <Bucket n={LINES.filter(l => l.match === 'No Bid').length} label="No bid" tone="cancelled" />
      </div>
      <p className="vy-hint">
        Running the quotation writes a new version to the Quotation Result tab. Lines that are
        not priced are excluded from the total rather than counted as zero.
      </p>
    </div>
  );
}

function Bucket({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <div className="vy-bucket" data-tone={tone}>
      <div className="vy-bucket-n">{n}</div>
      <div className="vy-bucket-label">{label}</div>
    </div>
  );
}
