import { useMemo, useState } from 'react';
import { Dialog, Select } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Field';
import { MiniTable } from '../ui/MiniTable';
import { useToast } from '../ui/Toast';
import { SmartIcon } from './quotation/SmartButtons';
import { fmtDate } from '../ui/renderCell';
import { KNOWN_MANUFACTURERS } from '../data/bom';
import {
  ORDER_PREFERENCE, availableQty, belowSafetyStock, generateStock,
  mappingsFor, setMappings, totalOnHand,
  type MpnMapping, type OrderPreference, type StockLine,
} from '../data/mpnMapping';
import type { Part } from '../data/parts';
import type { ColumnSpec } from './column-model';

const money = (n: number) =>
  n.toLocaleString('en-GB', { style: 'currency', currency: 'USD' });

/**
 * MFG–MPN (AML) — the Approved Manufacturer List for one part.
 *
 * "Manages the list of valid Manufacturer and MPN combinations associated with
 * each Part … the foundation for identifying supply sources, supporting
 * quotation and pricing, and tracking inventory and cost data."
 *
 * Lives on the Part record's Quantity Info tab, where the sheet puts it.
 *
 * COLUMN AND BUTTON NAMES ARE THE LIVE SYSTEM'S, read from its own resource
 * bundle: Order Preference, Rocket OH, Customer OH, Total On Hand, Safety
 * Stock, AVG Cost, Last Purchased Cost, "Add a line", "Stock Report", "Update
 * Quantity", "Replenishment", "Add MPN Mapping". Decision D2 governs.
 *
 * NOT GATED ON PART SOURCE, deliberately. The sheet's step 1 reads "Open a Part
 * detail (Part has Part Source is MAKE, MAKE/BUY)", which is how the tester
 * reaches the screen rather than a rule about when it appears — the same
 * document states display rules explicitly where it means them ("the BoM button
 * should be displayed ONLY WHEN Part Source = …") and does not here. Gating on
 * it would take the Approved Manufacturer List away from BUY parts, which are
 * the ones actually purchased. Raised as an open question rather than decided
 * by inference in either direction.
 */
export function MpnMappingSection({ part }: { part: Part }) {
  const toast = useToast();
  const [rows, setRows] = useState<MpnMapping[]>(
    () => mappingsFor(part.partNumber, part.description));
  const [detail, setDetail] = useState<MpnMapping | null>(null);
  const [stockFor, setStockFor] = useState<MpnMapping | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  /** Every change goes through here, so the session store cannot drift. */
  function commit(next: MpnMapping[]) {
    setRows(next);
    setMappings(part.partNumber, next);
  }

  const columns = useMemo(
    () => mappingColumns(setDetail, setStockFor), []);

  return (
    <section className="vy-mpn">
      <div className="vy-mpn-head">
        <h3 className="vy-field-group-title">MPN Mapping</h3>
        {/* "Add a line" — the live button's own label, which is why it is not
            the more obvious "Add MPN". The modal it opens IS called Add MPN
            Mapping, and that name is on the dialog. */}
        <Button variant="tonal" onClick={() => setAddOpen(true)}>Add a line</Button>
      </div>

      {rows.length === 0 ? (
        <div className="vy-empty-state">
          <strong>No approved manufacturers yet</strong>
          <p>
            An MPN Mapping names a manufacturer and the exact part number to buy. Quoting,
            sourcing and inventory all read this list, so a part without one cannot be
            purchased against.
          </p>
          <Button variant="filled" onClick={() => setAddOpen(true)}>Add a line</Button>
        </div>
      ) : (
        <MiniTable data={rows} columns={columns}
                   rowTone={r => (belowSafetyStock(r) ? 'short' : undefined)} />
      )}

      {rows.length > 0 && !rows.some(m => m.orderPreference === 'Primary') && (
        /* Order Preference exists to guide buyers, so a part where every
           manufacturer is an Alternate guides nobody. NOT enforced — the sheet
           states no constraint, and inventing one could reject a combination
           the business allows — but said out loud, because it is the kind of
           gap nobody goes looking for. */
        <p className="vy-field-hint">
          No Primary set. Buyers have no default manufacturer to order against for this part.
        </p>
      )}

      {rows.some(belowSafetyStock) && (
        /* Safety stock exists "to prevent material shortages", so a row under it
           is the one fact on this table worth saying out loud rather than
           leaving to whoever compares two numbers per row. */
        <p className="vy-field-hint">
          {rows.filter(belowSafetyStock).length} of {rows.length} below safety stock —
          shaded above.
        </p>
      )}

      {detail && (
        <MappingDetailDialog
          mapping={detail}
          onClose={() => setDetail(null)}
          onSave={m => { commit(rows.map(r => (r.id === m.id ? m : r))); setDetail(null);
                         toast.success(`${m.manufacturer} ${m.mpn} updated.`); }}
          onDelete={m => { commit(rows.filter(r => r.id !== m.id)); setDetail(null);
                           toast.success(`${m.manufacturer} ${m.mpn} deleted from the AML.`); }}
        />
      )}

      {stockFor && (
        <StockReportDialog
          mapping={stockFor} customer={part.customer}
          onClose={() => setStockFor(null)}
        />
      )}

      {addOpen && (
        <AddMappingDialog
          part={part} existing={rows}
          onClose={() => setAddOpen(false)}
          onAdd={m => {
            commit([...rows, m]);
            setAddOpen(false);
            toast.success(`New MPN Mapping created: ${m.manufacturer} ${m.mpn}.`);
          }}
        />
      )}
    </section>
  );
}

/** The ten columns the sheet lists, in its order, plus the two action controls. */
function mappingColumns(onDetail: (m: MpnMapping) => void,
                        onStock: (m: MpnMapping) => void): ColumnSpec<MpnMapping>[] { return [
  { field: 'manufacturer', title: 'Manufacturer', role: 'text', width: 170,
    widthNote: 'Manufacturer names run long.' },
  /* The identifier, and what opens the detail popup — the same convention as
     every other list in the app, where the thing you would copy out is also the
     thing you click. */
  { field: 'mpn', title: 'MPN', role: 'ident', width: 200,
    render: m => (
      <button type="button" className="vy-cell-link" onClick={() => onDetail(m)}
              title={`Open the MPN Mapping detail for ${m.mpn}`}>
        {m.mpn}
      </button>
    ) },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'orderPreference', title: 'Order Preference', role: 'code', width: 150,
    render: m => (
      <span className="vy-pref" data-primary={m.orderPreference === 'Primary' || undefined}>
        {m.orderPreference}
      </span>
    ) },
  { field: 'rocketOh', title: 'Rocket OH', role: 'number', width: 116,
    render: m => m.rocketOh.toLocaleString() },
  { field: 'customerOh', title: 'Customer OH', role: 'number', width: 130,
    render: m => m.customerOh.toLocaleString() },
  /* Derived, and marked as such — a stored total is a third number that can
     disagree with the two beside it. */
  { field: 'id', title: 'Total On Hand', role: 'number', width: 140,
    widthNote: 'The heading is longer than its values.',
    render: m => (
      <strong title="Rocket OH + Customer OH">{totalOnHand(m).toLocaleString()}</strong>
    ) },
  { field: 'safetyStock', title: 'Safety Stock', role: 'number', width: 130,
    tone: m => (belowSafetyStock(m) ? 'short' : undefined),
    render: m => (
      <span title={belowSafetyStock(m)
        ? `Total On Hand ${totalOnHand(m).toLocaleString()} is below the ${m.safetyStock.toLocaleString()} buffer`
        : undefined}>
        {m.safetyStock ? m.safetyStock.toLocaleString() : <span className="vy-empty" aria-hidden>—</span>}
      </span>
    ) },
  { field: 'avgCost', title: 'AVG Cost', role: 'money', render: m => money(m.avgCost) },
  { field: 'lastPurchasedCost', title: 'Last Purchased Cost', role: 'money', width: 170,
    widthNote: 'The longest heading on this table.',
    render: m => money(m.lastPurchasedCost) },
  /* "Click on the Stock icon button" — an icon, as the sheet says, with a
     label for anything that cannot see it. */
  { field: 'partNumber', title: 'Stock', role: 'code', width: 80, sortable: false,
    widthNote: 'Holds one icon-sized control.',
    render: m => (
      <button type="button" className="vy-cell-link" onClick={() => onStock(m)}
              aria-label={`Stock Report for ${m.mpn}`} title={`Stock Report for ${m.mpn}`}>
        <SmartIcon name="log" />
      </button>
    ) },
]; }

/* ============================================================================
   MPN MAPPING DETAIL
   ========================================================================= */

/**
 * "View all of the information (Part Number, Manufacturer, Description, MPN,
 * Order Preference) · Edit any information (except Part Number and
 * Description) · Delete MFG-MPN (AML)."
 *
 * The two exceptions are read-only rather than absent: they identify what is
 * being edited, and a dialog that changes a mapping without naming the part it
 * belongs to is a dialog you can apply to the wrong record.
 */
function MappingDetailDialog({ mapping, onClose, onSave, onDelete }: {
  mapping: MpnMapping;
  onClose: () => void;
  onSave: (m: MpnMapping) => void;
  onDelete: (m: MpnMapping) => void;
}) {
  const [draft, setDraft] = useState(mapping);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const changed = JSON.stringify(draft) !== JSON.stringify(mapping);
  const invalid = !draft.manufacturer.trim() || !draft.mpn.trim();

  return (
    <Dialog
      open onClose={onClose} size="md"
      title="MPN Mapping detail"
      subtitle={`${mapping.manufacturer} · ${mapping.mpn}`}
      actions={
        <>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
          <Button variant="filled" onClick={() => onSave(draft)}
                  disabled={!changed || invalid}
                  title={invalid ? 'Manufacturer and MPN are both needed'
                        : changed ? 'Save this mapping' : 'Nothing has changed yet'}>
            Save
          </Button>
        </>
      }
    >
      <dl className="vy-record-fields">
        <Row label="Part Number" locked>{mapping.partNumber}</Row>
        <Row label="Description" locked>{mapping.description}</Row>

        <EditRow label="Manufacturer">
          <Select label="Manufacturer" value={draft.manufacturer}
                  options={[...KNOWN_MANUFACTURERS].sort()}
                  onChange={v => setDraft(d => ({ ...d, manufacturer: v }))} />
        </EditRow>
        <EditRow label="MPN">
          <TextField value={draft.mpn} aria-label="MPN"
                     onChange={e => setDraft(d => ({ ...d, mpn: e.target.value }))} />
        </EditRow>
        <EditRow label="Order Preference"
                 hint="Primary is what buyers order against; Alternate is approved but second choice.">
          <Select label="Order Preference" value={draft.orderPreference}
                  options={[...ORDER_PREFERENCE]}
                  onChange={v => setDraft(d => ({ ...d, orderPreference: v as OrderPreference }))} />
        </EditRow>
      </dl>

      {confirmDelete && (
        /* Deleting a mapping removes a supply source that quoting and sourcing
           both read, and nothing else on this screen is destructive. It gets a
           confirm, and the confirm says what depends on it. */
        <Dialog
          open onClose={() => setConfirmDelete(false)}
          title="Delete MFG-MPN (AML)"
          actions={
            <>
              <Button onClick={() => setConfirmDelete(false)}>No</Button>
              <Button variant="danger" onClick={() => onDelete(mapping)}>Yes, delete</Button>
            </>
          }
        >
          <p>
            Remove <strong>{mapping.manufacturer} {mapping.mpn}</strong> from the approved list
            for {mapping.partNumber}?
          </p>
          <p className="vy-field-hint">
            Quoting and sourcing read this list. The part cannot be purchased against this
            manufacturer once it is gone.
          </p>
        </Dialog>
      )}
    </Dialog>
  );
}

/* ============================================================================
   ADD MPN MAPPING
   ========================================================================= */

/**
 * "Display the Add MPN Mapping modal to enter all required information."
 *
 * The sheet does not list the fields; the detail popup's list is what a mapping
 * consists of, so those are the fields, minus the two the system supplies.
 *
 * `Is Existing Mfg` is the live modal's own field — spelt "Is Exsisting Mfg"
 * there. Decision D2 corrects outright misspellings and keeps everything else,
 * so the word is fixed and the fix is recorded.
 */
function AddMappingDialog({ part, existing, onClose, onAdd }: {
  part: Part; existing: MpnMapping[];
  onClose: () => void; onAdd: (m: MpnMapping) => void;
}) {
  const [isExisting, setIsExisting] = useState(true);
  const [manufacturer, setManufacturer] = useState('');
  const [newMfg, setNewMfg] = useState('');
  const [mpn, setMpn] = useState('');
  /* Primary when the part has none, Alternate when it already has one. A
     DEFAULT, not a rule: the first approved manufacturer is obviously the one
     buyers order against, and the sheet states no constraint, so the form
     suggests and does not enforce. */
  const hasPrimary = existing.some(m => m.orderPreference === 'Primary');
  const [pref, setPref] = useState<OrderPreference>(hasPrimary ? 'Alternate' : 'Primary');

  const mfg = isExisting ? manufacturer : newMfg.trim();
  /* "{MFG-MPN} must be unique in every Part" — the rule Create BoM enforces on
     an uploaded file, and the same rule applies to a line typed by hand. */
  const duplicate = mfg !== '' && mpn.trim() !== '' &&
    existing.some(m => m.manufacturer.toLowerCase() === mfg.toLowerCase() &&
                       m.mpn.trim().toLowerCase() === mpn.trim().toLowerCase());
  const missing = [!mfg && 'Manufacturer', !mpn.trim() && 'MPN'].filter(Boolean) as string[];

  return (
    <Dialog
      open onClose={onClose} size="md"
      title="Add MPN Mapping"
      subtitle={`A new approved manufacturer for ${part.partNumber}`}
      actions={
        <Button variant="filled" disabled={missing.length > 0 || duplicate}
                title={duplicate ? 'That manufacturer and MPN are already on this part'
                      : missing.length ? `Still needed: ${missing.join(', ')}` : 'Create this mapping'}
                onClick={() => onAdd({
                  id: `${part.partNumber}-${Date.now()}`,
                  partNumber: part.partNumber,
                  manufacturer: mfg,
                  mpn: mpn.trim(),
                  description: part.description,
                  orderPreference: pref,
                  /* A mapping that has never been bought has no stock and no
                     cost history. Zeroes here are facts, not placeholders. */
                  rocketOh: 0, customerOh: 0, safetyStock: 0,
                  avgCost: 0, lastPurchasedCost: 0,
                })}>
          Save
        </Button>
      }
    >
      <dl className="vy-record-fields">
        <Row label="Part Number" locked>{part.partNumber}</Row>
        <Row label="Description" locked>{part.description}</Row>

        <EditRow label="Is Existing Mfg"
                 hint="Off if this manufacturer is not in Manufacturer Management yet.">
          <div className="vy-radios">
            <label className="vy-radio">
              <input type="radio" name="is-existing-mfg" checked={isExisting}
                     onChange={() => setIsExisting(true)} />
              <span>Yes — choose from the list</span>
            </label>
            <label className="vy-radio">
              <input type="radio" name="is-existing-mfg" checked={!isExisting}
                     onChange={() => setIsExisting(false)} />
              <span>No — name a new one</span>
            </label>
          </div>
        </EditRow>

        <EditRow label="Manufacturer">
          {isExisting
            ? <Select label="Manufacturer" value={manufacturer}
                      options={[...KNOWN_MANUFACTURERS].sort()}
                      onChange={setManufacturer} />
            : <TextField value={newMfg} aria-label="Manufacturer"
                         placeholder="New manufacturer name"
                         onChange={e => setNewMfg(e.target.value)} />}
        </EditRow>

        <EditRow label="MPN" hint="The exact manufacturer part number used for purchasing.">
          <TextField value={mpn} aria-label="MPN"
                     onChange={e => setMpn(e.target.value)} />
        </EditRow>

        <EditRow label="Order Preference"
                 hint={hasPrimary
                   ? 'This part already has a Primary.'
                   : 'The first approved manufacturer, so Primary by default.'}>
          <Select label="Order Preference" value={pref} options={[...ORDER_PREFERENCE]}
                  onChange={v => setPref(v as OrderPreference)} />
        </EditRow>
      </dl>

      {duplicate && (
        <p className="vy-field-error" role="alert">
          <strong>{mfg} {mpn}</strong> is already on {part.partNumber}. Each MFG–MPN must be
          unique within a part.
        </p>
      )}
    </Dialog>
  );
}

/* ============================================================================
   STOCK REPORT
   ========================================================================= */

/**
 * "Display the Stock Report pop-up, user can: Update Quantity … Replenishment."
 *
 * Columns are the live report's: Date, Location, Manufacturer, MPN, Owner,
 * Quantity, Available Qty, Unit. Available Qty is Quantity − Allocate Qty,
 * computed rather than stored for the same reason as Total On Hand.
 */
function StockReportDialog({ mapping, customer, onClose }: {
  mapping: MpnMapping; customer: string; onClose: () => void;
}) {
  const toast = useToast();
  const [lines, setLines] = useState<StockLine[]>(
    () => generateStock(mapping, customer));
  const [editing, setEditing] = useState<StockLine | null>(null);
  const [replenishing, setReplenishing] = useState(false);

  const total = lines.reduce((a, l) => a + l.quantity, 0);
  const free = lines.reduce((a, l) => a + availableQty(l), 0);

  return (
    <Dialog
      open onClose={onClose} size="lg"
      title="Stock Report"
      subtitle={`${mapping.manufacturer} · ${mapping.mpn}`}
      actions={<Button variant="filled" onClick={() => setReplenishing(true)}>Replenishment</Button>}
    >
      <div className="vy-result-summary">
        <div className="vy-fact">
          <div className="vy-fact-label">Quantity</div>
          <div className="vy-fact-value">{total.toLocaleString()}</div>
        </div>
        <div className="vy-fact">
          <div className="vy-fact-label">Available</div>
          <div className="vy-fact-value">{free.toLocaleString()}</div>
        </div>
        <div className="vy-fact">
          <div className="vy-fact-label">Allocated</div>
          <div className="vy-fact-value">{(total - free).toLocaleString()}</div>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="vy-empty-state">
          <strong>No stock on hand</strong>
          <p>Nothing has been received against this MPN. Replenishment adds a stock line.</p>
        </div>
      ) : (
        <MiniTable data={lines} columns={stockColumns(setEditing)} />
      )}

      {editing && (
        <UpdateQuantityDialog
          line={editing}
          onClose={() => setEditing(null)}
          onSave={l => {
            setLines(ls => ls.map(x => (x.id === l.id ? l : x)));
            setEditing(null);
            toast.success(`${l.location} updated to ${l.quantity.toLocaleString()} ${l.unit}.`);
          }}
        />
      )}

      {replenishing && (
        <UpdateQuantityDialog
          replenish
          line={{
            id: `${mapping.id}-new-${Date.now()}`,
            date: new Date(), location: '', manufacturer: mapping.manufacturer,
            mpn: mapping.mpn, owner: 'Rocket EMS', ownerType: 'Rocket',
            quantity: 0, allocatedQty: 0, unit: 'EACH',
          }}
          onClose={() => setReplenishing(false)}
          onSave={l => {
            setLines(ls => [...ls, l]);
            setReplenishing(false);
            toast.success(`${l.quantity.toLocaleString()} ${l.unit} added at ${l.location}.`);
          }}
        />
      )}
    </Dialog>
  );
}

function stockColumns(onEdit: (l: StockLine) => void): ColumnSpec<StockLine>[] { return [
  { field: 'date', title: 'Date', role: 'date', render: l => fmtDate(l.date) },
  { field: 'location', title: 'Location', role: 'code', width: 130 },
  { field: 'manufacturer', title: 'Manufacturer', role: 'text', width: 160 },
  { field: 'mpn', title: 'MPN', role: 'ident', width: 190 },
  { field: 'owner', title: 'Owner', role: 'text', width: 170 },
  { field: 'quantity', title: 'Quantity', role: 'number', render: l => l.quantity.toLocaleString() },
  { field: 'allocatedQty', title: 'Available Qty', role: 'number', width: 140,
    render: l => (
      <span title={`Quantity ${l.quantity.toLocaleString()} − Allocate Qty ${l.allocatedQty.toLocaleString()}`}>
        {availableQty(l).toLocaleString()}
      </span>
    ) },
  { field: 'unit', title: 'Unit', role: 'code', width: 96 },
  { field: 'id', title: 'Action', role: 'code', width: 110, sortable: false,
    render: l => (
      <button type="button" className="vy-cell-link" onClick={() => onEdit(l)}
              title={`Update the quantity at ${l.location}`}>
        Update
      </button>
    ) },
]; }

/**
 * Update Quantity — and Replenishment, which is the same form on a new line.
 *
 * The live popup's fields: Date, Location, Manufacturer, MPN, Owner, Quantity,
 * Available Qty, Allocate Qty, Unit, Owner Type. Manufacturer and MPN are fixed
 * — this is stock OF that MPN, and letting them change here would move stock
 * between mappings from a dialog that does not say so.
 */
function UpdateQuantityDialog({ line, replenish, onClose, onSave }: {
  line: StockLine; replenish?: boolean;
  onClose: () => void; onSave: (l: StockLine) => void;
}) {
  const [draft, setDraft] = useState(line);
  const invalid = !draft.location.trim() || draft.quantity <= 0 ||
    draft.allocatedQty > draft.quantity;

  return (
    <Dialog
      open onClose={onClose} size="md"
      title={replenish ? 'Replenishment' : 'Update Quantity'}
      subtitle={replenish
        ? `Add stock of ${line.mpn}`
        : `${line.location} · ${line.mpn}`}
      actions={
        <Button variant="filled" onClick={() => onSave(draft)} disabled={invalid}
                title={invalid
                  ? (draft.allocatedQty > draft.quantity
                      ? 'Allocated cannot exceed the quantity held'
                      : 'A location and a quantity above zero are needed')
                  : 'Save'}>
          Save
        </Button>
      }
    >
      <dl className="vy-record-fields">
        <Row label="Manufacturer" locked>{draft.manufacturer}</Row>
        <Row label="MPN" locked>{draft.mpn}</Row>

        <EditRow label="Date">
          <TextField type="date" aria-label="Date"
                     value={toDateInput(draft.date)}
                     onChange={e => setDraft(d => ({ ...d, date: new Date(e.target.value) }))} />
        </EditRow>
        <EditRow label="Location">
          <TextField value={draft.location} aria-label="Location"
                     placeholder="A-01-03"
                     onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} />
        </EditRow>
        <EditRow label="Owner Type"
                 hint="Rocket stock serves any project; customer stock is consigned and restricted.">
          <Select label="Owner Type" value={draft.ownerType} options={['Rocket', 'Customer']}
                  onChange={v => setDraft(d => ({ ...d, ownerType: v as StockLine['ownerType'] }))} />
        </EditRow>
        <EditRow label="Owner">
          <TextField value={draft.owner} aria-label="Owner"
                     onChange={e => setDraft(d => ({ ...d, owner: e.target.value }))} />
        </EditRow>
        <EditRow label="Quantity">
          <TextField type="number" min={0} aria-label="Quantity" value={String(draft.quantity)}
                     onChange={e => setDraft(d => ({ ...d, quantity: Number(e.target.value) }))} />
        </EditRow>
        <EditRow label="Allocate Qty"
                 hint="Already committed to orders. Available Qty is what is left.">
          <TextField type="number" min={0} aria-label="Allocate Qty"
                     value={String(draft.allocatedQty)}
                     onChange={e => setDraft(d => ({ ...d, allocatedQty: Number(e.target.value) }))} />
        </EditRow>
        <EditRow label="Unit">
          <Select label="Unit" value={draft.unit} options={['EACH', 'REEL', 'TRAY']}
                  onChange={v => setDraft(d => ({ ...d, unit: v }))} />
        </EditRow>
        {/* Derived, so it is shown and not asked for. */}
        <Row label="Available Qty" note="Quantity − Allocate Qty. Computed, not stored.">
          {availableQty(draft).toLocaleString()}
        </Row>
      </dl>

      {draft.allocatedQty > draft.quantity && (
        <p className="vy-field-error" role="alert">
          Allocate Qty is larger than the quantity held. Stock cannot be committed twice.
        </p>
      )}
    </Dialog>
  );
}

/* ---- Small shared bits ---------------------------------------------------- */

/**
 * A value you cannot edit — and WHY, which is not one reason but two.
 *
 * `locked` means the record owns it: Part Number and Description identify what
 * is being edited. `note` carries anything else. Available Qty is neither
 * stored nor owned — it is arithmetic on two fields in the same dialog — and
 * telling the user it was "set by the record" would send them looking for a
 * record that holds it.
 */
function Row({ label, locked, note, children }: {
  label: string; locked?: boolean; note?: string; children: React.ReactNode;
}) {
  const hint = note ?? (locked ? 'Set by the record — not editable here.' : undefined);
  return (
    <div className="vy-field">
      <dt>{label}</dt>
      <dd>
        {children}
        {hint && <span className="vy-field-hint">{hint}</span>}
      </dd>
    </div>
  );
}

function EditRow({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="vy-field vy-field--editing">
      <dt>{label}</dt>
      <dd>
        {children}
        {hint && <span className="vy-field-hint">{hint}</span>}
      </dd>
    </div>
  );
}

function toDateInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
