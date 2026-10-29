import { useMemo, useState } from 'react';
import { Dialog, Select } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { TextField } from '../../ui/Field';
import { Icon } from '../../ui/icons';
import { SmartIcon } from './SmartButtons';
import { money, money3 } from '../../data/bom';
import {
  SALE_TYPES, emptyCostLine, lineAmount, otherCostLines, otherCostTotals,
  referenceCosts, type OtherCostLine,
} from '../../data/otherCost';
import type { QuoteResult } from '../../data/quotations';

/**
 * Other Quoted Cost — what Pricing Detail opens.
 *
 * HER SCREEN, AND THE LAST OF HER NINE ANSWERS. A quote run prices material;
 * the number that goes to the customer also carries labour, consulting and
 * whatever else the program is selling, and a PM wants both of those beside the
 * history of what this assembly has cost before. Until 29 Oct this button
 * raised "not implemented", which was honest — pressing it in her own prototype
 * also does nothing, so what it opened was a question for her, not something to
 * invent. She answered it.
 *
 * WHY LG, UNMAXIMISED. It is a form with two short tables, not a work surface,
 * so it does not open filling the screen the way the result view behind it
 * does — `startMaximised` is off, which is the one place in this app that
 * overrides the size's default. It is not `md` either: measured at 640px the
 * cost table lost its last column, and "Amount with markup" is the figure the
 * screen exists to produce.
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
  const [lines, setLines] = useState<OtherCostLine[]>(() => otherCostLines(result));
  const reference = useMemo(() => referenceCosts(result), [result]);
  const totals = otherCostTotals(lines, result.markupPct);
  const material = lines.find(l => l.locked);
  /* What Apply hands back: the quote already knows its material cost, and
     adding it twice is the one arithmetic mistake this screen can make. */
  const added = totals.subtotal - (material ? lineAmount(material) : 0);

  const patch = (id: string, p: Partial<OtherCostLine>) =>
    setLines(ls => ls.map(l => (l.id === id ? { ...l, ...p } : l)));

  return (
    <Dialog
      open={open} onClose={onClose} size="lg" startMaximised={false}
      title="Other Quoted Cost"
      subtitle={`${result.partNumber} · Rev ${result.partRev} · ${result.lastRunVersion} · ${result.buildQty.toLocaleString()} boards`}
      actions={<>
        <Button onClick={onClose}>Close</Button>
        <Button variant="filled" onClick={() => { onApply(added); onClose(); }}
                title="Add these costs to the quoted total on the result view">
          Apply to quote
        </Button>
      </>}
    >
      <div className="vy-pricing-detail">
        <section className="vy-run-section">
          <h3 className="vy-field-group-title">
            <SmartIcon name="finance" />Reference cost, per unit
          </h3>
          {/* SAID, NOT IMPLIED. These five figures are purchase history, and
              this prototype has none: they are derived from the run so the
              screen can be read and compared. A derived number presented as a
              last purchase order is the kind of thing a PM quotes from. */}
          <p className="vy-field-hint">
            Derived from this run — the live system takes them from the
            customer's purchase history.
          </p>
          <table className="vy-ref-cost">
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">Per unit</th>
                <th scope="col">vs this run</th>
              </tr>
            </thead>
            <tbody>
              {reference.map(c => {
                const delta = c.perUnit - result.costPerBoard;
                return (
                  <tr key={c.label}>
                    <th scope="row" title={c.hint}>{c.label}</th>
                    <td>{money3(c.perUnit)}</td>
                    {/* The sign is the whole point of the column, so it is
                        written rather than left to the reader's subtraction. */}
                    <td data-tone={delta > 0 ? 'excess' : undefined}>
                      {Math.abs(delta) < 0.0005 ? '—'
                        : `${delta > 0 ? '+' : '−'}${money3(Math.abs(delta)).replace('$', '$')}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="vy-run-section">
          <h3 className="vy-field-group-title">
            <SmartIcon name="quote" />Quoted cost lines
          </h3>
          <table className="vy-cost-lines">
            <thead>
              <tr>
                <th scope="col">Sale type</th>
                {/* `data-typed` = a column whose cells hold an input, so the
                    heading takes the input's own text inset and sits flush
                    with the figures under it. */}
                <th scope="col" data-typed>Unit price</th>
                <th scope="col" data-typed>Qty</th>
                <th scope="col">Amount</th>
                <th scope="col">With markup</th>
                <th scope="col"><span className="vy-sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => {
                const amount = lineAmount(l);
                return (
                  <tr key={l.id} data-locked={l.locked || undefined}>
                    <td>
                      {/* THE MATERIAL LINE IS THE RUN'S OWN OUTPUT. Letting it
                          be retyped here would mean two screens disagreeing
                          about what the BoM costs, and only one of them priced
                          it. */}
                      {l.locked
                        ? <span className="vy-locked-cell">
                            {l.saleType}
                            {/* The padlock goes LAST, like `ReadValue`'s. Ahead
                                of the word it pushed "Material" 10px right of
                                every sale type under it, and a column of names
                                that do not start in the same place is the
                                first thing the eye catches. */}
                            <Icon name="lock" size={13} />
                            <span className="vy-sr-only"> read-only</span>
                          </span>
                        : <Select label="Sale type" size="small" value={l.saleType}
                                  options={SALE_TYPES.filter(t => t !== 'Material')}
                                  onChange={v => patch(l.id, { saleType: v as OtherCostLine['saleType'] })} />}
                    </td>
                    {/* The locked value wears the input's own text inset, so
                        the digits line up down the column rather than the
                        boxes — see the stylesheet. */}
                    <td>
                      {l.locked ? <span className="vy-typed-static">{money3(l.unitPrice)}</span> : (
                        <TextField type="number" min={0} step="0.01" className="vy-num-cell"
                                   aria-label={`${l.saleType} unit price`}
                                   value={String(l.unitPrice)}
                                   onChange={e => patch(l.id, { unitPrice: Number(e.target.value) || 0 })}
                                   onBlur={e => { if (Number(e.target.value) < 0) patch(l.id, { unitPrice: 0 }); }} />
                      )}
                    </td>
                    <td>
                      {l.locked ? <span className="vy-typed-static">{l.qty.toLocaleString()}</span> : (
                        <TextField type="number" min={1} className="vy-num-cell"
                                   aria-label={`${l.saleType} quantity`}
                                   value={String(l.qty)}
                                   onChange={e => patch(l.id, { qty: Number(e.target.value) || 0 })}
                                   onBlur={e => { if (!(Number(e.target.value) > 0)) patch(l.id, { qty: 1 }); }} />
                      )}
                    </td>
                    <td>{money(amount)}</td>
                    <td>{money(amount * (1 + result.markupPct / 100))}</td>
                    <td>
                      {!l.locked && (
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
            <tfoot>
              <tr>
                <th scope="row" colSpan={3}>Subtotal</th>
                <td>{money(totals.subtotal)}</td>
                <td />
                <td />
              </tr>
              <tr>
                <th scope="row" colSpan={3}>Markup ({result.markupPct}%)</th>
                <td>{money(totals.markup)}</td>
                <td />
                <td />
              </tr>
              <tr>
                <th scope="row" colSpan={3}>Total quoted</th>
                <td data-emphasis>{money(totals.totalQuoted)}</td>
                <td />
                <td />
              </tr>
            </tfoot>
          </table>
          <Button size="sm" onClick={() => setLines(ls => [...ls, emptyCostLine(ls)])}>
            Add cost line
          </Button>
          {/* ONE LINE, and it is the one thing the screen cannot show: what
              Apply will do. That material is locked is said by the padlock in
              the row itself. */}
          <p className="vy-field-hint">
            Apply adds {money(added)} to the quoted total, for this session.
          </p>
        </section>
      </div>
    </Dialog>
  );
}
