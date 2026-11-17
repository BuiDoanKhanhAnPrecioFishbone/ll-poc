import { useState } from 'react';
import { DatePicker, DateTimePicker } from '@progress/kendo-react-dateinputs';
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
