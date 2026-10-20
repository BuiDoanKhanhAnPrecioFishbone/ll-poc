import type { ReactNode } from 'react';
import { Checkbox, Select } from '../../../ui/Overlays';
import { SearchField, TextField } from '../../../ui/Field';
import { ReadValue } from '../../../ui/FieldRow';
import {
  EXCESS_AND_MOQ, MATERIAL_PACKAGE_TYPE, NET_CONSIGNED_INVENTORY,
  QUOTE_FOCUS, ROCKET_CONSIGNED_INVENTORY,
} from '../../../data/metadata';
import { sameSuppliers, supplierSummary } from '../../../data/suppliers';
import { Icon } from '../../../ui/icons';
import { PRIMARY_PROVIDERS, type PrimaryProvider } from '../../../data/bom';
import type { QuoteSetup } from './state';

/**
 * Quote Setup — the strip of facts the results were computed from.
 *
 * Steps 2, 3 and 4 each open with "System show quoting BoM information get from
 * previous step", listing the same fields. Building it once means the three
 * steps cannot drift apart — which matters more than it sounds, because the
 * values on it feed the total-quantity formula, and a user who sees a different
 * Build Qty on step 3 than on step 2 has no way to tell which one the numbers
 * were computed from.
 *
 * TWO SETUPS, since 20 Oct, after the customer's Quoting BoM mockup of 16 Oct:
 * `applied` is what the numbers in the grid below came from, `pending` is what
 * the user has typed since. Step 3 passes both and the fields become controls;
 * everywhere else passes `applied` alone and they stay boxed and locked.
 *
 * A field whose pending value differs from the applied one is marked, and says
 * so on hover — "Current results use: 100". It is not an error and not a
 * warning: it is work the user has done that the grid has not been told about
 * yet, which is exactly what Update Results is for. The mark clears when they
 * press it.
 */
export function QuoteContextBar({
  assembly, description, applied, pending, onPending, onSuppliers, extra,
}: {
  assembly: string; description: string;
  /** What the grid's numbers were computed from. */
  applied: QuoteSetup;
  /** Step 3 only: the setup being edited. Absent means a read-only strip. */
  pending?: QuoteSetup;
  onPending?: (patch: Partial<QuoteSetup>) => void;
  /** Opens the Preferred Suppliers dialog. Step 3 only — it is the one step
   *  where the setup can be changed. */
  onSuppliers?: () => void;
  /** Run by / Run Date / Run Version, which only step 4 has. */
  extra?: { label: string; value: string }[];
}) {
  const editable = Boolean(pending && onPending);
  const s = pending ?? applied;
  /* The same comparison `setupChanged` makes, one field at a time. */
  const changed = (k: keyof QuoteSetup) => editable && String(s[k]) !== String(applied[k]);
  const was = (k: keyof QuoteSetup) =>
    changed(k) ? `Current results use: ${applied[k]}` : undefined;
  const supChanged = editable && !sameSuppliers(s.suppliers, applied.suppliers);

  return (
    <div className="vy-quote-context">
      {/* THE ASSEMBLY IS A HEADING, NOT A FIELD — 20 Oct, following the
          customer's mockup, which carries it in the card's title row. As two
          boxed facts it took 400px of the field row, and with Excess and MOQ
          and Preferred Suppliers added the row wrapped: 134px, where one row
          is 76. It is also not a setting — nothing about it can be changed
          here — so a row of settings is the wrong company for it. */}
      <p className="vy-quote-context-head">
        <strong>{assembly}</strong>
        {description && <span>{description}</span>}
        {/* THE SUPPLIER LIST IS A SETTING TOO, and the one that changes the
            answer most — it decides which offers auto-pick may even consider.
            It sits on the heading line rather than in the row of fields for
            two reasons: fourteen suppliers are not a value, and ten settings
            already fill that row to the pixel. What it carries is the line
            that matters once the list has been touched: "2 not used · 1
            moved". */}
        {onSuppliers && (
          <button type="button" className="vy-sup-btn" onClick={onSuppliers}
                  data-changed={supChanged || undefined}
                  title={supChanged
                    ? 'Preferred suppliers — not yet applied to the results below'
                    : 'Choose which suppliers this quote may use'}>
            <span className="vy-sup-btn-label">Preferred Suppliers</span>
            <span className="vy-sup-btn-value">{supplierSummary(s.suppliers)}</span>
            <Icon name="chevron-right" />
          </button>
        )}
      </p>

      <div className="vy-quote-context-fields">
      {editable ? (
        <>
          {/* THE ORDER IS THE MOCKUP'S, in pairs: the two quantities, then the
              two that price them, then packaging, then the provider. */}
          <QtyField label="Build Qty" value={s.buildQty} changed={changed('buildQty')}
                    title={was('buildQty')} onChange={n => onPending!({ buildQty: n })} />
          <QtyField label="Attrition Set" value={s.attritionSet} changed={changed('attritionSet')}
                    title={was('attritionSet')} onChange={n => onPending!({ attritionSet: n })} />
          <PickField label="Quote Focus" value={s.quoteFocus} options={[...QUOTE_FOCUS]}
                     width={172}
                     changed={changed('quoteFocus')} title={was('quoteFocus')}
                     onChange={v => onPending!({ quoteFocus: v })} />
          <QtyField label="Markup %" value={s.markup} min={0} changed={changed('markup')}
                    title={was('markup')} onChange={n => onPending!({ markup: n })} />
          {/* "Package Type", not "Material Package Type" — the customer's own
              mockup labels it that way, and on a strip of ten settings the
              dropped word is 30px that the grid gets instead. The full name
              survives on the read-only strips, where there is room. */}
          <PickField label="Package Type" value={s.materialPackageType} width={130}
                     options={[...MATERIAL_PACKAGE_TYPE]} changed={changed('materialPackageType')}
                     title={was('materialPackageType')}
                     onChange={v => onPending!({ materialPackageType: v })} />
          {/* EXCESS AND MOQ decides more of the quoted cost than anything else
              on this strip: a 5,000-piece reel against a 500-piece build is
              where excess comes from, and this is the setting that says whether
              to accept it. */}
          <PickField label="Excess and MOQ" value={s.excessMoq} width={132}
                     options={[...EXCESS_AND_MOQ]} changed={changed('excessMoq')}
                     title={was('excessMoq')}
                     onChange={v => onPending!({ excessMoq: v })} />
          {/* THE TWO CONSIGNED SETTINGS have been on the RFQ record since
              August and changed nothing until today: a quote that said "the
              customer supplies 2,000 of these" priced all of them anyway. They
              come off the quantity before a supplier is asked. */}
          <PickField label="Net Consigned" value={s.netConsigned} width={136}
                     options={[...NET_CONSIGNED_INVENTORY]} changed={changed('netConsigned')}
                     title={was('netConsigned')}
                     onChange={v => onPending!({ netConsigned: v })} />
          <PickField label="Rocket Consigned" value={s.rocketConsigned} width={152}
                     options={[...ROCKET_CONSIGNED_INVENTORY]} changed={changed('rocketConsigned')}
                     title={was('rocketConsigned')}
                     onChange={v => onPending!({ rocketConsigned: v })} />
          {/* THE PROVIDER MOVES HERE from the grid toolbar. It is setup, not an
              action: it decides where the next price request goes, and leaving
              it beside Get Prices implied it took effect on its own. */}
          <PickField label="Primary Provider" value={s.provider} width={134}
                     options={[...PRIMARY_PROVIDERS]}
                     changed={changed('provider')} title={was('provider')}
                     onChange={v => onPending!({ provider: v as PrimaryProvider })} />

        </>
      ) : (
        <>
          <Fact label="Quote Focus" value={applied.quoteFocus} />
          <Fact label="Material Package Type" value={applied.materialPackageType} />
          <Fact label="Markup" value={`${applied.markup}%`} />
          <Fact label="Excess and MOQ" value={applied.excessMoq} />
          <Fact label="Net Consigned" value={applied.netConsigned} />
          <Fact label="Rocket Consigned" value={applied.rocketConsigned} />
          <Fact label="Build Qty" value={String(applied.buildQty)} />
          <Fact label="Attrition Set" value={String(applied.attritionSet)} />
          <Fact label="Primary Provider" value={applied.provider} />
        </>
      )}

      {extra?.map(e => <Fact key={e.label} label={e.label} value={e.value} />)}
      </div>
    </div>
  );
}

function Fact({ label, value, locked = false, wide }: {
  label: string; value: string; locked?: boolean; wide?: boolean;
}) {
  return (
    <div className="vy-quote-fact" data-wide={wide || undefined}>
      <span className="vy-quote-fact-label">{label}</span>
      <ReadValue lock={locked}>{value}</ReadValue>
    </div>
  );
}

/**
 * Build Qty, Attrition Set and Markup.
 *
 * The two quantities revert to 1 rather than accepting a value at or below
 * zero: "If the user adjust Build Quantity <= 0 — the value automatically
 * reverts to the default value of 1", stated three times across steps 1, 2 and
 * 3. Correcting on BLUR rather than on keystroke, because a field that snaps
 * back to 1 the moment you clear it cannot be retyped. Markup takes 0, which is
 * a real answer.
 */
export function QtyField({ label, value, onChange, min = 1, changed, title }: {
  label: string; value: number; onChange: (n: number) => void;
  min?: number; changed?: boolean; title?: string;
}) {
  return (
    <label className="vy-quote-fact vy-quote-fact--input" data-changed={changed || undefined} title={title}>
      <span className="vy-quote-fact-label">{label}</span>
      <TextField type="number" min={min} value={String(value)}
                 aria-label={label}
                 onChange={e => onChange(Number(e.target.value))}
                 onBlur={e => { if (!(Number(e.target.value) >= min)) onChange(min); }} />
    </label>
  );
}

function PickField({ label, value, options, onChange, changed, title, wide, width }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
  changed?: boolean; title?: string; wide?: boolean;
  /** Narrower than the default where the label allows it — the strip is one
   *  row and every pixel spent here comes off the grid below. */
  width?: number;
}) {
  return (
    <div className="vy-quote-fact vy-quote-fact--pick" data-changed={changed || undefined}
         data-wide={wide || undefined} title={title}
         style={width ? { inlineSize: width } : undefined}>
      <span className="vy-quote-fact-label">{label}</span>
      <Select label={label} size="small" value={value} options={options} onChange={onChange} />
    </div>
  );
}

/**
 * Search plus the step's filter checkboxes.
 *
 * Each step has its own filters but the same shape, and the guideline pins
 * their left-to-right order on all three — so order is the caller's array
 * order, not something this component sorts.
 */
export function QuoteToolbar({ search, onSearch, placeholder, filters, leading, actions, trailing }: {
  search: string; onSearch: (v: string) => void; placeholder: string;
  filters: { key: string; label: string; on: boolean; onToggle: (v: boolean) => void }[];
  /**
   * Controls that configure the run, before the search — step 3's Primary
   * Provider. ONE BAND INSTEAD OF TWO, asked for on 15 Oct: the provider and
   * the four run buttons had a row of their own above this one, and step 3's
   * grid was down to nine lines of a fifty-eight-line BoM. Everything on this
   * row acts on the grid below it, so there was never a reason for two.
   */
  leading?: ReactNode;
  /** The run actions, beside the provider on the left. */
  actions?: ReactNode;
  /** The Columns chooser. Last on the row, which is where the standard puts it. */
  trailing?: ReactNode;
}) {
  /* THE ORDER IS THE STANDARD'S, from 16 Oct: "Left: actions that change the
     grid... Right: filters (no counts), then search", with Columns last. Ours
     ran provider, search, filters, actions — the actions, which are the point
     of the row, finished last on the right while the search led.

     NO COUNTS on the filters, also theirs, and it is the one rule in this
     component we would rather argue than obey: a count tells you whether a
     filter is worth clicking before you click it. Followed here because the
     standard says it twice and says it plainly; raised in the review instead
     of quietly kept. */
  return (
    <div className="vy-quote-toolbar">
      {leading}
      {actions}
      <div className="vy-quote-filters">
        {filters.map(f => (
          <Checkbox key={f.key} checked={f.on} onCheckedChange={f.onToggle} label={f.label} />
        ))}
      </div>
      <SearchField placeholder={placeholder} aria-label={placeholder}
                   value={search} onChange={e => onSearch(e.target.value)} />
      {trailing}
    </div>
  );
}

/**
 * An empty grid, saying what to do about it.
 *
 * WAS "No records available." — the earlier guideline's own words, and the new
 * standard of 14 Oct names that shape as the thing not to do: its ✕ example is
 * "No data", with the note "the user does not know what to do next". Its ✓ is
 * "No quote results yet. Click Run Quote to get prices and auto-select a
 * supplier for each part." Two instructions from the same customer, and the
 * later one is right — so the caller says which emptiness this is.
 *
 * The two causes need different sentences and used to share one. A grid with
 * nothing in it yet is waiting for an action; a grid emptied by a filter is
 * waiting for the filter to be cleared, and telling that user to run a quote
 * would be wrong.
 */
export function NoRecords({ title, hint }: { title?: string; hint?: string } = {}) {
  return (
    <div className="vy-empty-inline">
      <strong>{title ?? 'No records available.'}</strong>
      {hint && <p className="vy-empty-hint">{hint}</p>}
    </div>
  );
}
