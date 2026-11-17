import { useState } from 'react';
import { DatePicker, DateTimePicker } from '@progress/kendo-react-dateinputs';
import { MultiColumnComboBox } from '@progress/kendo-react-dropdowns';
import { datePattern, fmtMoney, fmtNumber, useRegion } from './regional';

/**
 * The number and date fields of the BA's principles, 16 Nov 2026.
 *
 * Her Input widgets section names seven of these — Integer, Decimal,
 * Currency, Percent, Date, Datetime and Date range — and this system had none
 * of them. Every form here typed numbers and dates into a plain text box.
 *
 * TWO DIFFERENT ANSWERS, and the split is deliberate.
 *
 * Dates take a KendoReact control, because her spec describes a calendar
 * popup and because a date is the one field where typing is the fallback
 * rather than the point.
 *
 * Numbers do NOT. `@progress/kendo-react-inputs` was considered and left out:
 * her spec says "no spin buttons", which is the one thing NumericTextBox adds
 * over an input, and it formats through Kendo's own intl rather than through
 * `regional.ts` — so a German user would have got a German grid and an
 * American number box. A plain input formatted by the same `fmtNumber` and
 * `fmtMoney` the rest of the app uses cannot drift from the rest of the app.
 */

type Kind = 'integer' | 'decimal' | 'currency' | 'percent';

/* Her four number widgets differ by exactly this much. Currency's six
   decimals are not a flourish: `fmtMoney` already carries the note that a
   unit price here can be $0.000012, and her own example reads $1.240000. */
const SHAPE: Record<Kind, { decimals: number; money?: true }> = {
  integer:  { decimals: 0 },
  decimal:  { decimals: 2 },
  currency: { decimals: 6, money: true },
  percent:  { decimals: 2 },
};

export function NumberField({
  kind, label, hint, value, onChange, id, required, invalid, disabled, className = '',
}: {
  kind: Kind;
  /**
   * The unit lives in the LABEL, not in the box — "Markup (%)", "Unit Price
   * (USD)". Her examples are written that way and the reason holds on its own:
   * a suffix inside the field is something the user has to type around.
   */
  label?: string;
  hint?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  id?: string; required?: boolean; invalid?: boolean; disabled?: boolean;
  className?: string;
}) {
  useRegion();                       // re-render when the region setting changes
  const { decimals, money } = SHAPE[kind];

  /* FORMATTED AT REST, RAW WHILE EDITING. A field that reformats under the
     cursor fights the person typing — delete the "." in "1,240.00" and a
     formatter that runs on every keystroke puts it back somewhere else. So
     the formatted text is what you see until focus arrives, and the plain
     number is what you edit. */
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (
    value == null ? ''
      : money ? fmtMoney(value, { decimals })
      : fmtNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );

  return (
    <label className={`vy-field-control ${className}`.trim()}>
      {label && <span className="vy-field-label">{label}</span>}
      <input
        id={id} className="vy-input vy-input--number" inputMode="decimal"
        value={shown} required={required} disabled={disabled}
        aria-invalid={invalid || undefined}
        onFocus={() => setDraft(value == null ? '' : String(value))}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          /* Anything that is not a number leaves the value alone rather than
             writing null. Clearing the box IS null — that is the one way to
             empty a number, and it has to stay reachable. */
          const t = (draft ?? '').trim();
          if (t === '') onChange(null);
          else {
            const n = Number(t.replace(/[^0-9.+-]/g, ''));
            if (Number.isFinite(n)) onChange(n);
          }
          setDraft(null);
        }}
      />
      {hint && <span className="vy-field-hint">{hint}</span>}
    </label>
  );
}

export function DateField({
  label, hint, value, onChange, withTime, id, required, invalid, disabled, className = '',
}: {
  label?: string; hint?: string;
  value: Date | null;
  onChange: (v: Date | null) => void;
  /** Her Datetime widget. Same box, same icon, one more part to the value. */
  withTime?: boolean;
  id?: string; required?: boolean; invalid?: boolean; disabled?: boolean;
  className?: string;
}) {
  useRegion();
  const format = datePattern({ withTime });
  /* Kendo's two date controls take the same props; the only difference is
     whether the popup carries a clock. Picking the component rather than
     passing a flag keeps Kendo's own typing intact. */
  const Picker = withTime ? DateTimePicker : DatePicker;
  return (
    <label className={`vy-field-control ${className}`.trim()}>
      {label && <span className="vy-field-label">{label}</span>}
      <Picker
        id={id} size="medium" className="vy-date"
        format={format}
        /* The pattern doubles as the placeholder, so an empty box says what
           shape it wants instead of saying nothing. */
        placeholder={format.toLowerCase()}
        value={value} disabled={disabled} required={required} valid={!invalid}
        onChange={e => onChange(e.value)}
        ariaLabel={label}
      />
      {hint && <span className="vy-field-hint">{hint}</span>}
    </label>
  );
}

/**
 * Her Date range: "Two boxes H 34px, 8px apart" — not Kendo's single
 * DateRangePicker, which draws one box and a two-month popup. Two boxes is
 * what she drew and it is also the one that survives a narrow column.
 */
export function DateRangeField({
  label, from, to, onFrom, onTo, id, disabled,
}: {
  label?: string;
  from: Date | null; to: Date | null;
  onFrom: (v: Date | null) => void; onTo: (v: Date | null) => void;
  id?: string; disabled?: boolean;
}) {
  return (
    <div className="vy-field-control">
      {label && <span className="vy-field-label" id={id && `${id}-label`}>{label}</span>}
      <div className="vy-date-range" role="group" aria-labelledby={id && `${id}-label`}>
        <DateField label="From" value={from} onChange={onFrom} disabled={disabled} />
        <DateField label="To" value={to} onChange={onTo} disabled={disabled} />
      </div>
    </div>
  );
}

/**
 * Her **Yes / no field** — a boolean that is a FIELD, not a bare checkbox.
 *
 * The difference is the point of it. A bare checkbox is a box and a label
 * that names the box: "✓ Save as default". A yes/no field is a labelled row
 * whose VALUE happens to be a boolean, and her rule is that the value reads
 * as a word written for that field — ITAR is *Required* or *Not required*,
 * never "yes" and never a ticked box with nothing beside it.
 *
 * That is why `words` has no default. A field that cannot say what its two
 * states mean in its own vocabulary should be a checkbox instead.
 */
export function YesNoField({
  label, words, value, onChange, id, changed, disabled, readOnly,
}: {
  label?: string;
  /** What this field's two states are called. "Required" / "Not required". */
  words: { on: string; off: string };
  value: boolean;
  onChange: (v: boolean) => void;
  id?: string;
  /** Differs from the saved value — the same brand border as any field. */
  changed?: boolean;
  disabled?: boolean;
  /** View mode: the grey value box, with the same box and word in it. */
  readOnly?: boolean;
}) {
  const word = value ? words.on : words.off;
  if (readOnly) {
    return (
      <label className="vy-field-control">
        {label && <span className="vy-field-label">{label}</span>}
        <p className="vy-read-value vy-yesno vy-yesno--read">
          <span className="vy-yesno-box" data-on={value || undefined} aria-hidden />
          <span className="vy-read-value-text">{word}</span>
        </p>
      </label>
    );
  }
  return (
    <label className={`vy-field-control${changed ? ' vy-field--changed' : ''}`}>
      {label && <span className="vy-field-label">{label}</span>}
      {/* The box is a real checkbox, so the whole thing keeps a checkbox's
          keyboard and its announcement; the word is the label. The field
          shell around it is what makes it read as a field. */}
      <span className="vy-input vy-yesno">
        <input id={id} type="checkbox" className="vy-yesno-input"
               checked={value} disabled={disabled}
               onChange={e => onChange(e.target.checked)} />
        <span className="vy-yesno-box" data-on={value || undefined} aria-hidden />
        <span className="vy-yesno-word">{word}</span>
      </span>
    </label>
  );
}

/**
 * Her **Multi-column list** — a lookup whose popup is a small grid.
 *
 * The case it exists for is the one in her example: a part number is
 * `0455-300-0017-11`, and the one beside it is `0455-300-0017-12`. Those two
 * strings differ in the last character, so a single-column list makes the
 * user read eleven characters to reject a row. Put Rev and Description in
 * their own columns and the eye lands on the difference instead.
 *
 * KendoReact's MultiColumnComboBox, from the dropdowns package this app
 * already uses — not a second lookup component. The filtering is held here
 * rather than left to Kendo for the same reason `Select` holds it: the
 * operator is ours, `contains` with case ignored, and it stays visible
 * instead of moving with a Kendo release.
 */
export function MultiColumnList<T extends Record<string, unknown>>({
  columns, data, value, onChange, textField, dataItemKey,
  label, id, required, invalid, disabled,
}: {
  columns: { field: string; header: string; width: string }[];
  data: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
  /** The column whose text goes in the box once a row is picked. */
  textField: string;
  dataItemKey: string;
  label?: string; id?: string;
  required?: boolean; invalid?: boolean; disabled?: boolean;
}) {
  const [filter, setFilter] = useState('');
  /* Every column is searchable, not just the one shown in the box. Typing a
     description to find a part number is the whole reason the other columns
     are on screen. */
  const shown = filter.trim()
    ? data.filter(row => columns.some(c =>
        String(row[c.field] ?? '').toLowerCase().includes(filter.trim().toLowerCase())))
    : data;

  return (
    <label className="vy-field-control">
      {label && <span className="vy-field-label">{label}</span>}
      <MultiColumnComboBox
        id={id} size="medium" className="vy-mcl"
        data={shown as T[]} columns={columns}
        textField={textField} dataItemKey={dataItemKey}
        value={value} disabled={disabled} required={required} valid={!invalid}
        filterable onFilterChange={e => setFilter(e.filter.value)}
        /* Off, like `Select`'s: it is the other route to the null that the
           change handler below refuses, so leaving it on would be a button
           that does nothing. Her drawing shows a chevron and no ✕. */
        clearButton={false}
        /* Null is ignored, for the reason `Select` gives at length: with no
           custom values allowed, Kendo answers unmatched text by clearing the
           value, so typing over a chosen part and clicking away would lose
           it. */
        onChange={e => { if (e.value != null) onChange(e.value as T); setFilter(''); }}
        ariaLabel={label}
      />
    </label>
  );
}
