import { Checkbox } from '../../../ui/Overlays';
import { SearchField, TextField } from '../../../ui/Field';

/**
 * The strip of quoting facts that rides along from step to step.
 *
 * Steps 2, 3 and 4 each open with "System show quoting BoM information get from
 * previous step", listing the same fields. Building it once means the three
 * steps cannot drift apart — which matters more than it sounds, because the two
 * editable values on it (Build Qty and Attrition Set) feed the total-quantity
 * formula, and a user who sees a different Build Qty on step 3 than on step 2
 * has no way to tell which one the numbers were computed from.
 */
export function QuoteContextBar({
  assembly, description, quoteFocus, materialPackageType, markup,
  buildQty, attritionSet, onBuildQty, onAttritionSet, editable = true, extra,
}: {
  assembly: string; description: string; quoteFocus: string;
  materialPackageType: string; markup: number;
  buildQty: number; attritionSet: number;
  onBuildQty?: (n: number) => void;
  onAttritionSet?: (n: number) => void;
  /** Step 4 shows the same facts but the run is finished — nothing to adjust. */
  editable?: boolean;
  /** Run by / Run Date / Run Version, which only step 4 has. */
  extra?: { label: string; value: string }[];
}) {
  return (
    <div className="vy-quote-context">
      <Fact label="Assembly Part Number - Rev" value={assembly} wide />
      <Fact label="Description" value={description} wide />
      <Fact label="Quote Focus" value={quoteFocus} />
      <Fact label="Material Package Type" value={materialPackageType} />
      <Fact label="Markup" value={`${markup}%`} />
      {editable ? (
        <>
          <QtyField label="Build Qty" value={buildQty} onChange={onBuildQty!} />
          <QtyField label="Attrition Set" value={attritionSet} onChange={onAttritionSet!} />
        </>
      ) : (
        <>
          <Fact label="Build Qty" value={String(buildQty)} />
          <Fact label="Attrition Set" value={String(attritionSet)} />
        </>
      )}
      {extra?.map(e => <Fact key={e.label} label={e.label} value={e.value} />)}
    </div>
  );
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className="vy-quote-fact" data-wide={wide || undefined}>
      <span className="vy-quote-fact-label">{label}</span>
      <span className="vy-quote-fact-value">{value || '—'}</span>
    </div>
  );
}

/**
 * Build Qty and Attrition Set.
 *
 * Both revert to 1 rather than accepting a value at or below zero: "If the user
 * adjust Build Quantity <= 0 — the value automatically reverts to the default
 * value of 1", stated three times across steps 1, 2 and 3. Correcting on BLUR
 * rather than on keystroke, because a field that snaps back to 1 the moment you
 * clear it cannot be retyped.
 */
export function QtyField({ label, value, onChange }: {
  label: string; value: number; onChange: (n: number) => void;
}) {
  return (
    <label className="vy-quote-fact vy-quote-fact--input">
      <span className="vy-quote-fact-label">{label}</span>
      <TextField type="number" min={1} value={String(value)}
                 aria-label={label}
                 onChange={e => onChange(Number(e.target.value))}
                 onBlur={e => { if (!(Number(e.target.value) > 0)) onChange(1); }} />
    </label>
  );
}

/**
 * Search plus the step's filter checkboxes.
 *
 * Each step has its own filters but the same shape, and the guideline pins
 * their left-to-right order on all three — so order is the caller's array
 * order, not something this component sorts.
 */
export function QuoteToolbar({ search, onSearch, placeholder, filters }: {
  search: string; onSearch: (v: string) => void; placeholder: string;
  filters: { key: string; label: string; on: boolean; onToggle: (v: boolean) => void; count?: number }[];
}) {
  return (
    <div className="vy-quote-toolbar">
      <SearchField placeholder={placeholder} aria-label={placeholder}
                   value={search} onChange={e => onSearch(e.target.value)} />
      <div className="vy-quote-filters">
        {filters.map(f => (
          <Checkbox key={f.key} checked={f.on} onCheckedChange={f.onToggle}
                    label={<>{f.label}{f.count !== undefined && <span className="vy-count-badge">{f.count}</span>}</>} />
        ))}
      </div>
    </div>
  );
}

/** "No records available" — the guideline's own words for an empty filter. */
export function NoRecords() {
  return <div className="vy-empty-inline"><strong>No records available.</strong></div>;
}
