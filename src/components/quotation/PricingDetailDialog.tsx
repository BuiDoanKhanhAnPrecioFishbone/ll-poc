import { useMemo, useState } from 'react';
import { Dialog, Select } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { TextField, TextArea } from '../../ui/Field';
import { ReadValue } from '../../ui/FieldRow';
import { Icon } from '../../ui/icons';
import { SmartIcon } from './SmartButtons';
import { money, money6 } from '../../data/bom';
import {
  SALE_TYPES, emptyCostLine, lineAmount, otherCostLines, otherCostTotals,
  referenceCosts, type OtherCostLine,
} from '../../data/otherCost';
import type { QuoteResult } from '../../data/quotations';

/**
 * Other Quoted Cost — what Pricing Detail opens.
 *
 * REBUILT 1 NOV AGAINST A PHOTOGRAPH OF THE LIVE WINDOW,
 * `docs/_ref/live-other-quoted-cost-29oct.png`. The first version was built
 * from her spoken description two days earlier and got the purpose right and
 * eight details wrong; she had sent the screenshot at the same time and I had
 * opened one of the five images she attached.
 *
 * WHAT THE WINDOW IS FOR. A quote run prices MATERIAL. The number that goes to
 * the customer also carries labour, consulting and whatever else the program
 * is selling, and a PM wants both of those beside the history of what this
 * assembly has cost before.
 *
 * READ-ONLY UNTIL `Edit`, which is hers and is the right default: this screen
 * is opened to be read far more often than to be changed, and a form that is
 * already editable invites a stray keystroke into a number somebody is about
 * to quote from.
 *
 * WHY LG, UNMAXIMISED. Two blocks side by side and one short table, not a work
 * surface, so it does not open filling the screen the way the result view
 * behind it does. It is not `md` either: measured at 640px the cost table lost
 * its last column, and "Amount with Markup" is the figure the screen exists to
 * produce.
 *
 * WHAT APPLY DOES, said once here so the screen does not have to imply it: it
 * hands the total back to the result view for this session. Nothing is saved —
 * the prototype has no store behind it — and the result view says so where the
 * number appears rather than letting a changed total look persisted.
 */
export function PricingDetailDialog({ result, open, onClose, onApply }: {
  result: QuoteResult;
  open: boolean;
  onClose: () => void;
  /** The cost of everything that is not the run's own material. */
  onApply: (otherCost: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [markupPct, setMarkupPct] = useState(result.markupPct);
  const [quantity, setQuantity] = useState(result.buildQty);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<OtherCostLine[]>(() => otherCostLines(result));
  const reference = useMemo(() => referenceCosts(result), [result]);

  /* The header's Quantity drives the material line, as it does on the live
     window: one quantity for the quote, not one per row that happens to
     agree. The typed lines keep their own. */
  const priced = lines.map(l => (l.locked ? { ...l, qty: quantity } : l));
  const totals = otherCostTotals(priced, markupPct);
  const material = priced.find(l => l.locked);
  /* What Apply hands back: the quote already knows its material cost, and
     adding it twice is the one arithmetic mistake this screen can make. */
  const added = totals.subtotal - (material ? lineAmount(material) : 0);

  const patch = (id: string, p: Partial<OtherCostLine>) =>
    setLines(ls => ls.map(l => (l.id === id ? { ...l, ...p } : l)));

  return (
    <Dialog
      open={open} onClose={onClose} size="lg" startMaximised={false}
      title="Other Quoted Cost"
      subtitle={`${result.partNumber} · Rev ${result.partRev} · ${result.lastRunVersion}`}
      actions={<>
        <Button onClick={onClose}>Close</Button>
        <Button variant="filled" onClick={() => { onApply(added); onClose(); }}
                title="Add these costs to the quoted total on the result view">
          Apply to Quote
        </Button>
      </>}
    >
      <div className="vy-oqc">
        {/* TOP LEFT, as hers is — and as every other screen in this app puts
            the control that changes the mode. In edit mode it becomes Discard
            Changes, which is the customer's own word for it: "Discard
            Changes, not Cancel, in edit mode; Cancel only in dialogs". */}
        <div className="vy-oqc-mode">
          {editing ? (
            <Button onClick={() => {
              setEditing(false);
              setMarkupPct(result.markupPct);
              setQuantity(result.buildQty);
              setNotes('');
              setLines(otherCostLines(result));
            }}>
              Discard Changes
            </Button>
          ) : (
            /* No icon: hers has none, and `Edit` is a word that needs no help.
               The sliders glyph we have means "configure", which is a
               different promise. */
            <Button onClick={() => setEditing(true)}>Edit</Button>
          )}
        </div>

        <div className="vy-oqc-head">
          <section className="vy-oqc-form">
            <Pair label="Part Number - Part Rev"
                  value={`${result.partNumber} · Rev: ${result.partRev}`} />
            <Pair label="Description" value={result.description} />
            {/* The unit is in the label, so the value does not repeat it —
                hers reads `18`, not `18%`. */}
            <Field label="Markup (%)" editing={editing} value={String(markupPct)}>
              <TextField type="number" min={0} max={100} aria-label="Markup (%)"
                         value={String(markupPct)}
                         onChange={e => setMarkupPct(Number(e.target.value) || 0)}
                         onBlur={e => { if (Number(e.target.value) < 0) setMarkupPct(0); }} />
            </Field>
            <Field label="Quantity" editing={editing} value={quantity.toLocaleString()}>
              <TextField type="number" min={1} aria-label="Quantity"
                         value={String(quantity)}
                         onChange={e => setQuantity(Number(e.target.value) || 0)}
                         onBlur={e => { if (!(Number(e.target.value) > 0)) setQuantity(1); }} />
            </Field>
            <div className="vy-oqc-notes">
              <Field label="Notes" editing={editing} value={notes}>
                <TextArea rows={3} aria-label="Notes" placeholder="Enter notes"
                          value={notes} onChange={e => setNotes(e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="vy-oqc-ref">
            <h3 className="vy-oqc-ref-title">
              <SmartIcon name="finance" />
              Reference Cost <span>(Per unit)</span>
            </h3>
            {/* SAID, NOT IMPLIED. These five figures are purchase history, and
                this prototype has none: they are derived from the run so the
                screen can be read and compared. A derived number presented as
                a last purchase order is the kind of thing a PM quotes from. */}
            <p className="vy-field-hint">
              Derived from this run — the live system takes them from the
              customer's purchase history.
            </p>
            <dl className="vy-oqc-ref-list">
              {reference.map(c => (
                <div key={c.label} title={c.hint}>
                  <dt>{c.label}</dt>
                  <dd>{money6(c.perUnit)}</dd>
                  {/* The arrow is the whole point of the column: which side of
                      this run the reference falls on. Zero gets neither. */}
                  <dd className="vy-oqc-delta"
                      data-dir={Math.abs(c.deltaPct) < 0.005 ? 'flat' : c.deltaPct < 0 ? 'down' : 'up'}>
                    {Math.abs(c.deltaPct) < 0.005 ? '—'
                      : `${c.deltaPct < 0 ? '↓' : '↑'} ${Math.abs(c.deltaPct).toFixed(2)}%`}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <section className="vy-oqc-lines">
          {/* ABOVE THE TABLE, where hers is — the strip reads as the table's
              own toolbar rather than as the next thing down the page. */}
          <div className="vy-oqc-lines-bar">
            <Button size="sm" disabled={!editing}
                    title={editing ? 'Add a quoted cost line' : 'Press Edit first'}
                    onClick={() => setLines(ls => [...ls, emptyCostLine(ls)])}>
              Add a Line
            </Button>
          </div>
          <table className="vy-cost-lines">
            <thead>
              <tr>
                <th scope="col" className="vy-oqc-no">No</th>
                <th scope="col" className="vy-oqc-sale">Sale Type</th>
                <th scope="col" data-typed={editing || undefined}>Unit Price</th>
                <th scope="col" data-typed={editing || undefined}>Qty</th>
                <th scope="col">Amount</th>
                <th scope="col">Amount with Markup</th>
                <th scope="col"><span className="vy-sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {priced.map((l, i) => {
                const amount = lineAmount(l);
                return (
                  <tr key={l.id} data-locked={l.locked || undefined}>
                    <td className="vy-oqc-no">{i + 1}</td>
                    <td className="vy-oqc-sale">
                      {/* THE MATERIALS LINE IS THE RUN'S OWN OUTPUT. Letting it
                          be retyped here would mean two screens disagreeing
                          about what the BoM costs, and only one of them
                          priced it. */}
                      {l.locked || !editing
                        ? <span className="vy-locked-cell">
                            {l.saleType}
                            {l.locked && <>
                              <Icon name="lock" size={13} />
                              <span className="vy-sr-only"> read-only</span>
                            </>}
                          </span>
                        : <Select label="Sale type" size="small" value={l.saleType}
                                  options={SALE_TYPES.filter(t => t !== 'Materials')}
                                  onChange={v => patch(l.id, { saleType: v as OtherCostLine['saleType'] })} />}
                    </td>
                    <td data-typed={!editing || l.locked || undefined}>
                      {l.locked || !editing
                        ? <span className="vy-typed-static">{money6(l.unitPrice)}</span>
                        : (
                          <TextField type="number" min={0} step="0.000001" className="vy-num-cell"
                                     aria-label={`${l.saleType} unit price`}
                                     value={String(l.unitPrice)}
                                     onChange={e => patch(l.id, { unitPrice: Number(e.target.value) || 0 })}
                                     onBlur={e => { if (Number(e.target.value) < 0) patch(l.id, { unitPrice: 0 }); }} />
                        )}
                    </td>
                    <td data-typed={!editing || l.locked || undefined}>
                      {l.locked || !editing
                        ? <span className="vy-typed-static">{l.qty.toLocaleString()}</span>
                        : (
                          <TextField type="number" min={1} className="vy-num-cell"
                                     aria-label={`${l.saleType} quantity`}
                                     value={String(l.qty)}
                                     onChange={e => patch(l.id, { qty: Number(e.target.value) || 0 })}
                                     onBlur={e => { if (!(Number(e.target.value) > 0)) patch(l.id, { qty: 1 }); }} />
                        )}
                    </td>
                    <td>{money6(amount)}</td>
                    <td>{money6(amount * (1 + markupPct / 100))}</td>
                    <td>
                      {editing && !l.locked && (
                        <button type="button" className="vy-icon-btn"
                                title={`Remove the ${l.saleType} line`}
                                aria-label={`Remove the ${l.saleType} line`}
                                onClick={() => setLines(ls => ls.filter(x => x.id !== l.id))}>
                          <Icon name="trash" size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ACROSS THE FOOT, not down it — hers reads left to right, and the
              three figures are one sentence: this much, plus this much, comes
              to this. In a tfoot they read as three more rows of the table
              above, which is what the first version did. */}
          <dl className="vy-oqc-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{money6(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>Markup ({markupPct}%)</dt>
              <dd data-add>+{money6(totals.markup)}</dd>
            </div>
            <div>
              <dt>Total Quoted</dt>
              <dd data-emphasis>{money6(totals.totalQuoted)}</dd>
            </div>
          </dl>
          <p className="vy-field-hint">
            Apply adds {money(added)} to the quoted total, for this session.
          </p>
        </section>
      </div>
    </Dialog>
  );
}

/** A value this screen never edits: the assembly it is about. */
function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="vy-field-control">
      <span className="vy-field-label">{label}</span>
      <ReadValue>{value}</ReadValue>
    </div>
  );
}

/**
 * One header field, in whichever of the two states the window is in.
 *
 * The read state is a `ReadValue` box rather than bare text — the app's own
 * rule since 14 Oct, and the reason this screen can switch modes without the
 * layout moving: both states are the same shape.
 */
function Field({ label, editing, value, children }: {
  label: string; editing: boolean; value: string; children: React.ReactNode;
}) {
  return (
    <div className="vy-field-control">
      <span className="vy-field-label">{label}</span>
      {editing ? children : <ReadValue>{value}</ReadValue>}
    </div>
  );
}
