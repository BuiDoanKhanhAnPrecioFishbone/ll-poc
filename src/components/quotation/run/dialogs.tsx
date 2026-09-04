import { useState } from 'react';
import { Dialog, Select } from '../../../ui/Overlays';
import { Button } from '../../../ui/Button';
import { TextField } from '../../../ui/Field';
import { MiniTable } from '../../../ui/MiniTable';
import { FileDrop } from '../../../ui/FileDrop';
import type { ColumnSpec } from '../../column-model';
import {
  PACKAGING_PARTS, totalQtyOf, money, money3, type BomLine,
} from '../../../data/bom';
import type { RunConfig } from './state';

/* =============================================================================
   REVIEW EXCLUDED PARTS — leaving step 2
   ========================================================================== */

/**
 * Shown on Next from step 2, before anything irreversible happens.
 *
 * The warning is the reason it is a dialog rather than a panel: "These parts
 * will not be used to quote from Nexar and cannot be recalled. Warning: After
 * Run Quote in Step 3, excluded parts cannot be recovered." A user who scrolls
 * past a banner has still consented; a user who presses Confirm & Continue has
 * been asked.
 */
export function ExcludedPartsDialog({ open, lines, onClose, onConfirm }: {
  open: boolean; lines: BomLine[]; onClose: () => void; onConfirm: () => void;
}) {
  const columns: ColumnSpec<BomLine>[] = [
    { field: 'part', title: 'Part Number', role: 'ident' },
    { field: 'revision', title: 'Part Rev', role: 'code', width: 96 },
    { field: 'description', title: 'Part Description', role: 'text' },
    { field: 'qty', title: 'Qty', role: 'number', width: 90 },
    { field: 'partSource', title: 'Part Source', role: 'code', width: 128,
      widthNote: 'Longest value is "MAKE/PHANT".' },
  ];
  return (
    <Dialog
      open={open} onClose={onClose} size="lg"
      title="Review Excluded Parts"
      subtitle={`${lines.length} ${lines.length === 1 ? 'part' : 'parts'} will not be quoted`}
      actions={<>
        <Button onClick={onClose}>Go Back</Button>
        <Button variant="filled" onClick={onConfirm}>Confirm &amp; Continue</Button>
      </>}
    >
      <div className="vy-run-banner" data-tone="warn">
        These parts will not be used to quote and <strong>cannot be recalled</strong>. After
        Run Quote on the next step, excluded parts cannot be recovered.
      </div>
      <MiniTable data={lines} columns={columns}
                 empty={<div className="vy-empty-inline"><strong>Nothing is excluded.</strong> Every
                        line will be quoted.</div>} />
    </Dialog>
  );
}

/* =============================================================================
   ADD ATTRITION — step 3
   ========================================================================== */

/**
 * Lines with no attrition, and a way to give them some.
 *
 * "Display only part lines with Attrition = 0. Do not display part lines that
 * were marked as excluded in the previous step." — so the list empties itself
 * as the user works, which is the guideline's stated behaviour: "After attrition
 * is added with a value greater than 0, the corresponding part line is removed
 * from the Add Attrition dialog."
 */
export function AddAttritionDialog({ open, cfg, lines, onClose, onSet }: {
  open: boolean; cfg: RunConfig; lines: BomLine[];
  onClose: () => void; onSet: (id: number, attrition: number) => void;
}) {
  const [draft, setDraft] = useState<Record<number, string>>({});
  const pending = lines.filter(l => !l.excluded && l.attrition === 0);

  const columns: ColumnSpec<BomLine>[] = [
    {
      field: 'id', title: 'Actions', role: 'code', width: 130,
      widthNote: 'Holds a button.',
      render: l => (
        <Button size="sm" variant="tonal"
                disabled={!(Number(draft[l.id]) > 0)}
                title={Number(draft[l.id]) > 0
                  ? `Set attrition ${draft[l.id]} on ${l.part}`
                  : 'Enter an attrition quantity above 0 first'}
                onClick={() => { onSet(l.id, Number(draft[l.id])); setDraft(d => ({ ...d, [l.id]: '' })); }}>
          Add
        </Button>
      ),
    },
    { field: 'part', title: 'Part', role: 'ident', width: 170,
      widthNote: 'Part numbers must not truncate.' },
    { field: 'description', title: 'Description', role: 'text' },
    { field: 'mfg', title: 'MFG', role: 'text', width: 160,
      widthNote: 'Manufacturer names run long.' },
    { field: 'mpn', title: 'MPN', role: 'ident', width: 190,
      widthNote: 'Manufacturer part numbers are long.' },
    { field: 'qty', title: 'Qty', role: 'number', width: 90 },
    {
      field: 'attrition', title: 'Attrition Qty', role: 'number', width: 130,
      widthNote: 'Holds an input.',
      render: l => (
        <TextField className="vy-cell-input" type="number" min={0}
                   aria-label={`Attrition quantity for ${l.part}`}
                   value={draft[l.id] ?? ''}
                   onChange={e => setDraft(d => ({ ...d, [l.id]: e.target.value }))} />
      ),
    },
    { field: 'number', title: 'Total Qty', role: 'number', width: 110,
      widthNote: 'A computed total.',
      /* Previews what the typed attrition would make the total — the number the
         user is actually deciding about. */
      render: l => totalQtyOf({ ...l, attrition: Number(draft[l.id]) || 0 },
                              cfg.buildQty, cfg.attritionSet).toLocaleString() },
  ];

  return (
    <Dialog
      open={open} onClose={onClose} size="xl"
      title="Add Attrition"
      subtitle={`${pending.length} ${pending.length === 1 ? 'line has' : 'lines have'} no attrition set`}
      actions={<Button variant="filled" onClick={onClose}>Done</Button>}
    >
      <MiniTable data={pending} columns={columns}
                 empty={<div className="vy-empty-inline"><strong>Every line has attrition.</strong> Nothing
                        left to set here.</div>} />
    </Dialog>
  );
}

/* =============================================================================
   CONFIRM — leaving step 3
   ========================================================================== */

/**
 * What continuing costs you.
 *
 * Two lists and one number: the lines about to become NO BID, the lines
 * carrying excess, and the Total Excess Amount "at the bottom-right of the
 * dialog". Both lists matter for different reasons — one is work you are giving
 * up on, the other is money you are about to commit to material you will not
 * use.
 */
export function ConfirmQuoteDialog({ open, lines, onClose, onAccept }: {
  open: boolean; lines: BomLine[]; onClose: () => void; onAccept: () => void;
}) {
  const willNoBid = lines.filter(l => !l.excluded && !l.supplier);
  const withExcess = lines.filter(l => l.excessAmt > 0);
  const totalExcess = withExcess.reduce((n, l) => n + l.excessAmt, 0);

  const noBidCols: ColumnSpec<BomLine>[] = [
    { field: 'part', title: 'Part', role: 'ident' },
    { field: 'revision', title: 'Rev', role: 'code', width: 80 },
    { field: 'description', title: 'Description', role: 'text' },
    { field: 'mfg', title: 'MFG', role: 'text', width: 160,
      widthNote: 'Manufacturer names run long.' },
    { field: 'qty', title: 'Qty', role: 'number', width: 90 },
  ];
  const excessCols: ColumnSpec<BomLine>[] = [
    { field: 'part', title: 'Part', role: 'ident' },
    { field: 'supplier', title: 'Supplier', role: 'text', width: 140 },
    { field: 'orderQty', title: 'Order Qty', role: 'number', width: 110,
      render: l => l.orderQty.toLocaleString() },
    { field: 'excessQty', title: 'Excess Qty', role: 'number', width: 116,
      render: l => l.excessQty.toLocaleString() },
    { field: 'excessAmt', title: 'Excess AMT', role: 'money', width: 130,
      render: l => money(l.excessAmt) },
  ];

  return (
    <Dialog
      open={open} onClose={onClose} size="xl"
      title="Confirm before continuing"
      actions={<>
        <Button onClick={onClose}>Back to Rework</Button>
        <Button variant="filled" onClick={onAccept}>Accept &amp; Continue</Button>
      </>}
    >
      <section className="vy-run-section">
        <h3 className="vy-field-group-title">
          Will become NO BID{willNoBid.length > 0 && <span className="vy-count-badge">{willNoBid.length}</span>}
        </h3>
        <p className="vy-hint">
          These lines have no supplier selected. Continuing sets their status to NO BID.
        </p>
        <MiniTable data={willNoBid} columns={noBidCols}
                   empty={<div className="vy-empty-inline"><strong>Every line has a supplier.</strong> Nothing
                          will be dropped.</div>} />
      </section>

      <section className="vy-run-section">
        <h3 className="vy-field-group-title">
          Excess{withExcess.length > 0 && <span className="vy-count-badge">{withExcess.length}</span>}
        </h3>
        <p className="vy-hint">
          Material ordered beyond what the build consumes, mostly because a supplier's minimum
          order exceeds what you need.
        </p>
        <MiniTable data={withExcess} columns={excessCols}
                   empty={<div className="vy-empty-inline"><strong>No excess.</strong></div>} />
        <p className="vy-run-total">
          Total Excess Amount: <strong>{money(totalExcess)}</strong>
        </p>
      </section>
    </Dialog>
  );
}

/* =============================================================================
   ADD: PACKAGES — step 4
   ========================================================================== */

/**
 * Adds a packaging line to the quotation.
 *
 * "The Select Part dropdown list displays only parts that belong to the same
 * Customer as the current quotation, and are created with Part Source =
 * Packaging." Description, MFG and MPN fill themselves from the chosen part and
 * are read-only; quantity, unit price and notes are the user's.
 */
export function AddPackageDialog({ open, buildQty, onClose, onAdd }: {
  open: boolean;
  /** Needed to turn a per-board package quantity into a total. */
  buildQty: number;
  onClose: () => void;
  onAdd: (line: { part: string; description: string; mfg: string; mpn: string;
                  qty: number; unitPrice: number; notes: string }) => void;
}) {
  const [part, setPart] = useState('');
  const [qty, setQty] = useState('1');
  const [unitPrice, setUnitPrice] = useState('0');
  const [notes, setNotes] = useState('');

  const chosen = PACKAGING_PARTS.find(p => p.part === part);
  /**
   * "Total Quantity: ... default value is 1 when the dialog is opened
   * (read-only). After the user enters Select Quantity, this field is
   * automatically updated accordingly."
   *
   * "Accordingly" is not spelled out, so this reads Select Quantity as PER
   * BOARD and multiplies by Build Qty — the same relationship every other line
   * on the BoM has. The alternative, Total Quantity simply echoing Select
   * Quantity, would make one of the two fields pointless, and it broke the cost
   * summary: a package entered as 50 raised Cost/Board by the whole $21 rather
   * than by the $0.42 one board actually consumes. Flagged in
   * docs/testing/quick-quote-results.md — the guideline does not state it.
   */
  const perBoard = Number(qty) > 0 ? Number(qty) : 1;
  const totalQty = perBoard * Math.max(1, buildQty);
  const amount = totalQty * (Number(unitPrice) || 0);

  function reset() { setPart(''); setQty('1'); setUnitPrice('0'); setNotes(''); }

  return (
    <Dialog
      open={open} onClose={() => { reset(); onClose(); }} size="md"
      title="Add: Packages"
      /* "Action button (Add and Discard) display on top left" — the guideline
         is specific about the corner. This dialog's action row is its footer,
         which is where every other dialog in the prototype puts them; moving
         one dialog's buttons to the top-left would make the app inconsistent
         with itself to match one line of a spec. Flagged, not silently ignored:
         see docs/testing/quick-quote-results.md. */
      actions={<>
        <Button onClick={() => { reset(); onClose(); }}>Discard</Button>
        <Button variant="filled" disabled={!chosen}
                title={chosen ? 'Add this package line' : 'Choose a part first'}
                onClick={() => {
                  if (!chosen) return;
                  onAdd({ part: chosen.part, description: chosen.description, mfg: chosen.mfg,
                          mpn: chosen.mpn, qty: perBoard, unitPrice: Number(unitPrice) || 0, notes });
                  reset(); onClose();
                }}>
          Add
        </Button>
      </>}
    >
      <div className="vy-quote-config-grid">
        <div className="vy-quote-config-field" data-wide>
          <span className="vy-quote-fact-label">Select Part</span>
          <Select label="Select Part" value={part}
                  options={PACKAGING_PARTS.map(p => p.part)}
                  onChange={setPart} />
          <span className="vy-field-hint">
            Packaging parts belonging to this customer.
          </span>
        </div>

        <ReadOnly label="Description" value={chosen?.description} />
        <ReadOnly label="MFG" value={chosen?.mfg} />
        <ReadOnly label="MPN" value={chosen?.mpn} />

        <div className="vy-quote-config-field">
          <span className="vy-quote-fact-label">Select Quantity</span>
          <TextField type="number" min={1} aria-label="Select Quantity" value={qty}
                     onChange={e => setQty(e.target.value)}
                     onBlur={e => { if (!(Number(e.target.value) > 0)) setQty('1'); }} />
          <span className="vy-field-hint">Per board.</span>
        </div>
        <ReadOnly label="Total Quantity" value={`${totalQty.toLocaleString()}  (${perBoard} × ${buildQty} boards)`} />

        <div className="vy-quote-config-field">
          <span className="vy-quote-fact-label">Unit Price</span>
          <TextField type="number" min={0} step="0.001" aria-label="Unit Price" value={unitPrice}
                     onChange={e => setUnitPrice(e.target.value)}
                     onBlur={e => { if (Number(e.target.value) < 0) setUnitPrice('0'); }} />
        </div>
        <ReadOnly label="Amount" value={money3(amount)} />

        <div className="vy-quote-config-field" data-wide>
          <span className="vy-quote-fact-label">Notes</span>
          <TextField aria-label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
    </Dialog>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string }) {
  return (
    <div className="vy-quote-config-field">
      <span className="vy-quote-fact-label">{label}</span>
      <p className="vy-read-value" data-locked data-empty={!value || undefined}>
        {value || 'Choose a part first'}
      </p>
    </div>
  );
}

/* =============================================================================
   IMPORT FILE FROM VOYAGER — step 1, Upload BoM and create a new version
   ========================================================================== */

/** Files already in Voyager that could serve as a BoM. */
const VOYAGER_FILES = [
  { name: 'BOM_RevD_2026-08-26.xlsx', where: 'Project Requirement attachments', when: '26 Aug 2026' },
  { name: 'BOM_RevC_2026-08-12.xlsx', where: 'Project Requirement attachments', when: '12 Aug 2026' },
  { name: 'ECO-4471_approved_BOM.xlsx', where: 'Engineering change orders', when: '04 Aug 2026' },
  { name: 'Customer_BOM_master.xlsx', where: 'Customer Management', when: '19 Jul 2026' },
];

/**
 * "Display 'Import File from Voyager' modal dialog and can It is possible to
 * upload files from a local machine."
 *
 * Two sources, one dialog: files already in Voyager, and a file on this
 * machine. The guideline names the modal after the first but requires the
 * second, so both are here rather than the local upload hiding behind a
 * separately-named control.
 */
export function ImportFileDialog({ open, onClose, onPick }: {
  open: boolean; onClose: () => void; onPick: (name: string) => void;
}) {
  return (
    <Dialog
      open={open} onClose={onClose} size="lg"
      title="Import File from Voyager"
      subtitle="Choose a BoM file already in the system, or upload one from this machine"
      actions={<Button onClick={onClose}>Cancel</Button>}
    >
      <ul className="vy-voyager-files">
        {VOYAGER_FILES.map(f => (
          <li key={f.name}>
            <div>
              <span className="vy-code">{f.name}</span>
              <span className="vy-field-hint">{f.where} · {f.when}</span>
            </div>
            <Button size="sm" variant="tonal" onClick={() => onPick(f.name)}
                    title={`Use ${f.name} as the new BoM version`}>
              Select
            </Button>
          </li>
        ))}
      </ul>

      <div className="vy-dropzone">
        <strong>Or upload from this machine</strong>
        {/* A real picker now, with drag and drop. Choosing a file here returns
            its NAME to the caller, exactly as picking a Voyager file above
            does — so the two paths end in the same place and the wizard cannot
            tell them apart. Parsing the spreadsheet is still unbuilt, and the
            docs say so. */}
        <FileDrop accept=".xlsx" onPick={names => { if (names.length) onPick(names[0]); }} />
      </div>
    </Dialog>
  );
}
