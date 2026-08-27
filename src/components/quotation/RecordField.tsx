import { TextField, TextArea } from '../../ui/Field';
import { Select, Checkbox, RadioGroup } from '../../ui/Overlays';
import { Priority, priorityLevel, PRIORITY_LEVELS, type PriorityLevel } from '../../ui/Priority';
import { OPTION_MEANINGS } from '../../data/metadata';
import { fmtDate } from '../../ui/renderCell';

const LEVEL_TO_N: Record<PriorityLevel, number> = { High: 3, Medium: 2, Low: 1 };

/**
 * One field declaration drives both reading and editing.
 *
 * The same principle as column roles in the grid: state what a value IS, and
 * let the system decide how to render and how to collect it. Declaring the
 * read view and the edit view separately is how they drift — a field gains a
 * unit in one and not the other, or becomes a dropdown to edit while still
 * rendering raw text to read.
 *
 * Read mode renders VALUES. The live system renders every field as a disabled
 * input whether or not you are editing, so a record you are only looking at
 * reads as a form that failed to load.
 */
export type FieldKind =
  | { kind: 'text' }
  | { kind: 'notes' }
  | { kind: 'select'; options: readonly string[] }
  /**
   * A single choice shown in full, rather than behind a dropdown.
   *
   * The live form renders Excess and MOQ, Net Consigned Inventory and Rocket
   * Consigned Inventory this way, and the guideline says of each: "Allows the
   * user to check one option." Two or three options are not worth a dropdown —
   * collapsing them hides the whole vocabulary behind a click, and these are
   * precisely the fields whose options need comparing against each other.
   */
  | { kind: 'radio'; options: readonly string[] }
  /**
   * A reference to another record. Options depend on the rest of the form.
   *
   * `freeTextWhen` covers the case where the referenced record does not exist
   * yet: an RFQ created with "New Customer?" names a customer who is not in
   * Customer Management, so a dropdown over that list has nothing to show and
   * the name the user typed on create disappears the moment they press Edit.
   */
  | { kind: 'lookup'; optionsFor: (row: any) => readonly string[];
      freeTextWhen?: (row: any) => boolean; placeholder?: string }
  /**
   * Type anything, with the known values offered as suggestions.
   *
   * Project Name is the case: the guideline says it "allows the user to enter
   * the project name", while the live form offers the customer's existing
   * projects. Both are true, and a closed dropdown serves only the second — for
   * a customer created through "New Customer?" it has no options at all, so the
   * one required field naming the project became impossible to fill.
   */
  | { kind: 'combo'; optionsFor: (row: any) => readonly string[] }
  | { kind: 'number'; suffix?: string; min?: number; max?: number }
  /**
   * A calendar date, held as a Date and read back in the system's one format.
   *
   * Due Date and Created Date used to be hand-written rows on the record page
   * rather than field declarations, which is how they escaped every rule the
   * other fields obey: Due Date carried a required marker with no control
   * behind it in edit mode, and Created Date — which the system stamps — never
   * got the read-only treatment the customer signed off on. Anything with a
   * label and a value is a field; hand-rolling one opts it out of the
   * conventions rather than exempting it from needing them.
   */
  | { kind: 'date' }
  | { kind: 'flag' }
  /** High / Medium / Low, stored 1-3. Rendered as a dot and a word, not stars. */
  | { kind: 'priority' };

export type FieldDef<T> = FieldKind & {
  name: Extract<keyof T, string>;
  label: string;
  /** Shown under the control while editing — units, constraints, consequences. */
  hint?: string;
  /**
   * Not editable on the live form. Two reasons, and the UI distinguishes them:
   * the system owns it (RFQ No, Created Date), or another field determines it
   * (Customer Type follows Customer). Marking a field read-only is a claim about
   * the LIVE system, so it needs evidence — see docs/bundle-evidence.md.
   */
  readOnly?: boolean;
  /** Which field determines this one. Renders as "follows Customer". */
  derivedFrom?: string;
  /**
   * Required on the live form, which marks these with a trailing `(*)`.
   *
   * Seventeen fields on the Specific Requirements tab carry it, plus Program
   * Manager and Buyer on Checklists & Assignment. The prototype marked none of
   * them, so a user filling this in had no way to tell which fields the system
   * would refuse to save without — they would find out on submit.
   */
  required?: boolean;
};

/**
 * The required marker.
 *
 * Rendered as the live system writes it — a trailing `(*)` — rather than the
 * more usual bare asterisk, because that is the convention users here have
 * learned and the customer's requirements do not ask for it to change.
 *
 * `aria-hidden` on the glyph with the word "required" for screen readers: a
 * reader announcing "open paren star close paren" is noise, and the field also
 * carries `aria-required` where it is a real control.
 */
export function RequiredMark() {
  return (
    <>
      <span className="vy-required" aria-hidden>(*)</span>
      <span className="vy-sr-only"> required</span>
    </>
  );
}

/**
 * Is this field empty in a way that fails validation?
 *
 * A flag is never "empty" — false is a legitimate answer to a yes/no question —
 * and a number of 0 is a value, not an absence.
 */
export function isMissing<T>(def: FieldDef<T>, value: unknown): boolean {
  if (!def.required) return false;
  if (def.kind === 'flag') return false;
  return value === undefined || value === null || value === '';
}

export function RecordField<T extends Record<string, any>>({
  def, value, editing, onChange, row, touched, onBlur,
}: {
  def: FieldDef<T>;
  value: T[keyof T];
  editing: boolean;
  onChange: (name: string, v: unknown) => void;
  /** The whole record, so a lookup can narrow its options to the current row. */
  row?: T;
  /**
   * Has the user left this field yet?
   *
   * The guideline triggers validation when the user "clicks outside", not on
   * every keystroke — so a field you have not reached yet stays silent. Marking
   * a form red before it has been filled in is the commonest way to make a
   * required-field indicator useless.
   */
  touched?: boolean;
  onBlur?: (name: string) => void;
}) {
  const missing = editing && touched && isMissing(def, value);
  const err = missing
    ? <span className="vy-field-error" role="alert">This field is required.</span>
    : null;
  /* A read-only field looks the same whether or not you are editing. Rendering
     it as a disabled input instead would be worse than useless: a greyed control
     reads as "broken" or "you lack permission", when the truth is that the value
     is decided elsewhere. The derivation note says where. */
  if (!editing || def.readOnly) return <ReadField def={def} value={value} editing={editing} />;

  switch (def.kind) {
    case 'radio':
      return (
        <div className="vy-field vy-field--editing vy-field--radio" data-invalid={missing || undefined}>
          <dt id={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</dt>
          <dd>
            <RadioGroup label={def.label} value={String(value ?? '')}
                        options={def.options.map(o => ({
                          value: o,
                          /* The meaning rides with the option, so the difference
                             between "Low" and "OK" is legible at the point of
                             choosing rather than in a tooltip nobody opens. */
                          label: o,
                        }))}
                        onChange={v => { onChange(def.name, v); onBlur?.(def.name); }} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'priority':
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label}
                    value={priorityLevel(Number(value))}
                    options={[...PRIORITY_LEVELS]}
                    onChange={v => { onChange(def.name, LEVEL_TO_N[v as PriorityLevel]); onBlur?.(def.name); }} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'combo': {
      const list = def.optionsFor(row ?? {});
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <TextField id={`f-${def.name}`} value={String(value ?? '')}
                       list={list.length ? `dl-${def.name}` : undefined}
                       aria-invalid={missing || undefined}
                       onBlur={() => onBlur?.(def.name)}
                       onChange={e => onChange(def.name, e.target.value)} />
            {list.length > 0 && (
              <datalist id={`dl-${def.name}`}>
                {list.map(o => <option key={o} value={o} />)}
              </datalist>
            )}
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    }
    case 'lookup':
      if (def.freeTextWhen?.(row ?? {})) {
        return (
          <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
            <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
            <dd>
              <TextField id={`f-${def.name}`} value={String(value ?? '')}
                         placeholder={def.placeholder}
                         aria-invalid={missing || undefined}
                         onBlur={() => onBlur?.(def.name)}
                         onChange={e => onChange(def.name, e.target.value)} />
              {err}
              {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
            </dd>
          </div>
        );
      }
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                    required={def.required} invalid={Boolean(missing)}
                    options={[...def.optionsFor(row ?? {})]}
                    onChange={v => { onChange(def.name, v); onBlur?.(def.name); }} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'select':
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                    required={def.required} invalid={Boolean(missing)}
                    options={[...def.options]}
                    onChange={v => { onChange(def.name, v); onBlur?.(def.name); }} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'date':
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <TextField id={`f-${def.name}`} type="date" value={toDateInput(value)}
                       aria-invalid={missing || undefined}
                       onBlur={() => onBlur?.(def.name)}
                       onChange={e => onChange(def.name, fromDateInput(e.target.value))} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'number':
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <div className="vy-suffixed">
              <TextField id={`f-${def.name}`} type="number" value={String(value ?? '')}
                         min={def.min} max={def.max} aria-invalid={missing || undefined}
                         onBlur={() => onBlur?.(def.name)}
                         onChange={e => onChange(def.name, Number(e.target.value))} />
              {def.suffix && <span className="vy-suffix">{def.suffix}</span>}
            </div>
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'flag':
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt />
          <dd>
            <Checkbox checked={Boolean(value)} onCheckedChange={c => onChange(def.name, c)}
                      label={def.label} />
          </dd>
        </div>
      );
    case 'notes':
      return (
        <div className="vy-field vy-field--editing vy-field--wide" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <TextArea id={`f-${def.name}`} rows={3} value={String(value ?? '')}
                      aria-invalid={missing || undefined}
                      onBlur={() => onBlur?.(def.name)}
                      onChange={e => onChange(def.name, e.target.value)} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    default:
      return (
        <div className="vy-field vy-field--editing" data-invalid={missing || undefined}>
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <TextField id={`f-${def.name}`} value={String(value ?? '')}
                       aria-invalid={missing || undefined}
                       onBlur={() => onBlur?.(def.name)}
                       onChange={e => onChange(def.name, e.target.value)} />
            {err}
            {def.hint && !missing && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
  }
}

function ReadField<T>({ def, value, editing }: { def: FieldDef<T>; value: unknown; editing?: boolean }) {
  if (def.kind === 'flag') {
    return (
      <div className="vy-flag-row" data-on={Boolean(value)} data-locked={editing && def.readOnly || undefined}>
        <span className="vy-flag-mark" aria-hidden>{value ? '✓' : '–'}</span>
        <span>{def.label}{def.required && <RequiredMark />}</span>
        {editing && def.readOnly && <LockNote def={def} />}
      </div>
    );
  }
  if (def.kind === 'priority') {
    return (
      <div className="vy-field" data-locked={editing && def.readOnly || undefined}>
        <dt>{def.label}{def.required && <RequiredMark />}</dt>
        <dd><Priority value={Number(value)} /></dd>
      </div>
    );
  }
  if (def.kind === 'radio') {
    const chosen = String(value ?? '');
    return (
      <div className="vy-field">
        <dt>{def.label}{def.required && <RequiredMark />}</dt>
        <dd className={chosen ? undefined : 'is-empty'}>
          {chosen || 'Not set'}
          {chosen && OPTION_MEANINGS[chosen] && (
            <span className="vy-option-meaning">{OPTION_MEANINGS[chosen]}</span>
          )}
        </dd>
      </div>
    );
  }
  if (def.kind === 'date') {
    const d = value instanceof Date ? value : undefined;
    return (
      <div className="vy-field" data-locked={editing && def.readOnly || undefined}>
        <dt>{def.label}{def.required && <RequiredMark />}</dt>
        <dd className={d ? undefined : 'is-empty'}>
          {d ? fmtDate(d) : 'Not set'}
          {editing && def.readOnly && <LockNote def={def} />}
        </dd>
      </div>
    );
  }
  const empty = value === undefined || value === null || value === '';
  /* "42%" but "12 days": a symbol binds to its number, a word does not. */
  const shown = def.kind === 'number' && !empty && def.suffix
    ? `${value}${/^[%°]/.test(def.suffix) ? '' : ' '}${def.suffix}`
    : value;
  return (
    <div className={'vy-field' + (def.kind === 'notes' ? ' vy-field--wide' : '')}
         data-locked={editing && def.readOnly || undefined}>
      <dt>{def.label}{def.required && <RequiredMark />}</dt>
      <dd className={empty ? 'is-empty' : undefined}>
        {empty ? 'Not set' : String(shown)}
        {editing && def.readOnly && <LockNote def={def} />}
      </dd>
    </div>
  );
}

/**
 * Says WHY a field cannot be edited, and only while editing — when you are just
 * reading, every field is read-only and the note would be noise on all of them.
 *
 * "Set by the system" and "follows Customer" are different answers to the same
 * question, and a user who gets neither will assume the form is broken or that
 * they lack a permission.
 */
function LockNote<T>({ def }: { def: FieldDef<T> }) {
  return (
    <span className="vy-field-locked">
      {def.derivedFrom ? `follows ${def.derivedFrom}` : 'set by the system'}
    </span>
  );
}


/* ---- Date <-> <input type="date"> ------------------------------------------
   Built from LOCAL parts, not toISOString(). An ISO string is UTC, so for any
   user east of Greenwich — which is all of them, this customer being in
   Ho Chi Minh City — a date at midnight local renders as the PREVIOUS day in
   the input. The field would show one date while the record held another. */
function toDateInput(v: unknown): string {
  if (!(v instanceof Date) || Number.isNaN(v.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
}

/** Parsed as local midnight for the same reason, rather than `new Date(str)`,
 *  which reads a bare yyyy-mm-dd as UTC. */
function fromDateInput(s: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return undefined;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
