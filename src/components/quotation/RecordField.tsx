import { TextField, TextArea } from '../../ui/Field';
import { Select, Checkbox } from '../../ui/Overlays';
import { Priority, priorityLevel, PRIORITY_LEVELS, type PriorityLevel } from '../../ui/Priority';

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
  /** A reference to another record. Options depend on the rest of the form. */
  | { kind: 'lookup'; optionsFor: (row: any) => readonly string[] }
  | { kind: 'number'; suffix?: string; min?: number; max?: number }
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

export function RecordField<T extends Record<string, any>>({ def, value, editing, onChange, row }: {
  def: FieldDef<T>;
  value: T[keyof T];
  editing: boolean;
  onChange: (name: string, v: unknown) => void;
  /** The whole record, so a lookup can narrow its options to the current row. */
  row?: T;
}) {
  /* A read-only field looks the same whether or not you are editing. Rendering
     it as a disabled input instead would be worse than useless: a greyed control
     reads as "broken" or "you lack permission", when the truth is that the value
     is decided elsewhere. The derivation note says where. */
  if (!editing || def.readOnly) return <ReadField def={def} value={value} editing={editing} />;

  switch (def.kind) {
    case 'priority':
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label}
                    value={priorityLevel(Number(value))}
                    options={[...PRIORITY_LEVELS]}
                    onChange={v => onChange(def.name, LEVEL_TO_N[v as PriorityLevel])} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'lookup':
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                    options={[...def.optionsFor(row ?? {})]}
                    onChange={v => onChange(def.name, v)} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'select':
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                    required={def.required}
                    options={[...def.options]} onChange={v => onChange(def.name, v)} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'number':
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <div className="vy-suffixed">
              <TextField id={`f-${def.name}`} type="number" value={String(value ?? '')}
                         min={def.min} max={def.max}
                         onChange={e => onChange(def.name, Number(e.target.value))} />
              {def.suffix && <span className="vy-suffix">{def.suffix}</span>}
            </div>
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'flag':
      return (
        <div className="vy-field vy-field--editing">
          <dt />
          <dd>
            <Checkbox checked={Boolean(value)} onCheckedChange={c => onChange(def.name, c)}
                      label={def.label} />
          </dd>
        </div>
      );
    case 'notes':
      return (
        <div className="vy-field vy-field--editing vy-field--wide">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <TextArea id={`f-${def.name}`} rows={3} value={String(value ?? '')}
                      onChange={e => onChange(def.name, e.target.value)} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    default:
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}{def.required && <RequiredMark />}</label></dt>
          <dd>
            <TextField id={`f-${def.name}`} value={String(value ?? '')}
                       onChange={e => onChange(def.name, e.target.value)} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
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
