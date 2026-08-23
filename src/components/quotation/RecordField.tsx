import { TextField, TextArea } from '../../ui/Field';
import { Select, Checkbox } from '../../ui/Overlays';

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
  | { kind: 'number'; suffix?: string; min?: number; max?: number }
  | { kind: 'flag' };

export type FieldDef<T> = FieldKind & {
  name: Extract<keyof T, string>;
  label: string;
  /** Shown under the control while editing — units, constraints, consequences. */
  hint?: string;
};

export function RecordField<T extends Record<string, any>>({ def, value, editing, onChange }: {
  def: FieldDef<T>;
  value: T[keyof T];
  editing: boolean;
  onChange: (name: string, v: unknown) => void;
}) {
  if (!editing) return <ReadField def={def} value={value} />;

  switch (def.kind) {
    case 'select':
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}</label></dt>
          <dd>
            <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                    options={[...def.options]} onChange={v => onChange(def.name, v)} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
    case 'number':
      return (
        <div className="vy-field vy-field--editing">
          <dt><label htmlFor={`f-${def.name}`}>{def.label}</label></dt>
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
          <dt><label htmlFor={`f-${def.name}`}>{def.label}</label></dt>
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
          <dt><label htmlFor={`f-${def.name}`}>{def.label}</label></dt>
          <dd>
            <TextField id={`f-${def.name}`} value={String(value ?? '')}
                       onChange={e => onChange(def.name, e.target.value)} />
            {def.hint && <span className="vy-field-hint">{def.hint}</span>}
          </dd>
        </div>
      );
  }
}

function ReadField<T>({ def, value }: { def: FieldDef<T>; value: unknown }) {
  if (def.kind === 'flag') {
    return (
      <div className="vy-flag-row" data-on={Boolean(value)}>
        <span className="vy-flag-mark" aria-hidden>{value ? '✓' : '–'}</span>
        <span>{def.label}</span>
      </div>
    );
  }
  const empty = value === undefined || value === null || value === '';
  /* "42%" but "12 days": a symbol binds to its number, a word does not. */
  const shown = def.kind === 'number' && !empty && def.suffix
    ? `${value}${/^[%°]/.test(def.suffix) ? '' : ' '}${def.suffix}`
    : value;
  return (
    <div className={'vy-field' + (def.kind === 'notes' ? ' vy-field--wide' : '')}>
      <dt>{def.label}</dt>
      <dd className={empty ? 'is-empty' : undefined}>{empty ? 'Not set' : String(shown)}</dd>
    </div>
  );
}
