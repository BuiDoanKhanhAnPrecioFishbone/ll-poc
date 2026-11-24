import { TextField, TextArea } from '../../ui/Field';
import { DateField, NumberField, YesNoField, YesNoValue, formatOnScale } from '../../ui/Inputs';
import { Select, Checkbox, RadioGroup } from '../../ui/Overlays';
import { Priority, priorityLevel, PRIORITY_LEVELS, type PriorityLevel } from '../../ui/Priority';
import { OPTION_MEANINGS } from '../../data/metadata';
import { PEOPLE_DIRECTORY } from '../../data/quotations';
import { PeoplePicker } from '../../ui/PeoplePicker';
import { fmtDate, fmtDateTime } from '../../ui/renderCell';
import { FieldRow, RequiredMark } from '../../ui/FieldRow';
import { Icon } from '../../ui/icons';

/* Re-exported: four screens import the marker from here, which is where they
   learned to look for it. It now lives beside the row that renders it. */
export { RequiredMark };

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
  /**
   * A number, on one of her four scales.
   *
   * `suffix` IS GONE, and that is the point of this field's rewrite. It put the
   * unit INSIDE the box — `[ 12.00 ] %` — and her Number widget says the unit
   * belongs in the label: *"Markup (%)"*, *"Unit Price (USD)"*. The reason
   * stands on its own: a suffix inside the box is something the user has to
   * type around, and a user who types `12%` into a field already showing `%`
   * has made an error the field invented. The design system's own Number field
   * page has carried that as a Do/Don't card since 20 Nov, drawn from her
   * sheet — and this form was the Don't card, three times over.
   *
   * `scale` replaces it: `NumberField` formats by her four kinds (integer 0
   * decimals, decimal 2, currency 6, percent 2) rather than by a string glued
   * to the end of the value.
   */
  | { kind: 'number'; scale?: 'integer' | 'decimal' | 'currency' | 'percent';
      min?: number; max?: number }
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
  /**
   * A stamp the system writes, shown with its time.
   *
   * Separate from `date` because the two are not the same field. Due Date is a
   * day the user picks; Created Date is a moment the system recorded, and the
   * guideline says so — "displays the date and time when the RFQ was created".
   * Formatting both with one helper is how the time got dropped.
   */
  | { kind: 'datetime' }
  /**
   * A boolean. WITH `words` it is a record attribute; without, it is a
   * question the user answers.
   *
   * Her Yes/no field draws the line: *"label ITAR, value **Required** or
   * **Not required**. The label is the question, the value is the answer"* —
   * against a checkbox, where the label IS the question and a tick answers it.
   * Her rule for which: the value has to read as a word written for that
   * field, never "yes", never "true", and **never a ticked box sitting on its
   * own with the reader left to work out what a tick means here**.
   *
   * ITAR was exactly that. It rendered as `– ITAR` in view mode, and a dash
   * beside an acronym does not say whether ITAR is not required, not checked,
   * or not filled in. `Conformal Coating` is the other case and keeps its
   * tick: there the label is the question and `✓ Conformal Coating` reads.
   *
   * `words` HAS NO DEFAULT, deliberately, the same as on the component. A
   * field that cannot say what its two states are called in its own vocabulary
   * is a checkbox, and this type makes that the author's decision rather than
   * a fallback nobody notices.
   */
  | { kind: 'flag'; words?: { on: string; off: string } }
  /** High / Medium / Low, stored 1-3. Rendered as a dot and a word, not stars. */
  | { kind: 'priority' }
  /**
   * SEVERAL people, held as an array of names.
   *
   * Assigned To was a single-value select of bare names until An sent the live
   * control: a multi-select whose options carry an avatar and an email. The
   * guideline lists the field only among the required ones and never says how
   * many, so the live system governs.
   */
  | { kind: 'people' };

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
 * Is this field empty in a way that fails validation?
 *
 * A flag is never "empty" — false is a legitimate answer to a yes/no question —
 * and a number of 0 is a value, not an absence.
 */
export function isMissing<T>(def: FieldDef<T>, value: unknown): boolean {
  if (!def.required) return false;
  if (def.kind === 'flag') return false;
  /* An empty ARRAY is empty. Without this a required people field counted an
     unassigned RFQ as filled — [] is neither undefined, null nor "", so the
     three checks below all passed it and Save would have accepted a record with
     nobody on it. */
  if (Array.isArray(value)) return value.length === 0;
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

  /* Every case below is the SAME row with a different control in it. That row
     used to be written out ten times here, which is how three of them drifted:
     `people` never rendered the required error, `flag` rendered neither the
     error nor the hint — so the six explanatory hints on Create New Part's
     Requests & Controls checkboxes ("NCNR — once ordered, it cannot be
     cancelled or returned") were invisible — and only `radio` labelled its
     group correctly. `FieldRow` is that row, once. */
  const rowProps = {
    editing: true as const,
    invalid: missing || undefined,
    label: def.label,
    required: def.required,
    htmlFor: `f-${def.name}`,
    error: err,
    hint: def.hint,
  };

  switch (def.kind) {
    case 'radio':
      return (
        /* Labelled BY the heading rather than by a label pointing at one of the
           options, which is what a group of radios needs. */
        <FieldRow {...rowProps} variant="radio" htmlFor={undefined} labelId={`f-${def.name}`}>
          <RadioGroup label={def.label} value={String(value ?? '')}
                      options={def.options.map(o => ({
                        value: o,
                        /* The meaning rides with the option, so the difference
                           between "Low" and "OK" is legible at the point of
                           choosing rather than in a tooltip nobody opens. */
                        label: o,
                      }))}
                      onChange={v => { onChange(def.name, v); onBlur?.(def.name); }} />
        </FieldRow>
      );
    case 'people':
      return (
        <FieldRow {...rowProps}>
          <PeoplePicker id={`f-${def.name}`} label={def.label} invalid={missing}
                        value={Array.isArray(value) ? (value as string[]) : []}
                        onChange={next => onChange(def.name, next as unknown as T[keyof T])} />
        </FieldRow>
      );
    case 'priority':
      return (
        <FieldRow {...rowProps}>
          <Select id={`f-${def.name}`} label={def.label}
                  value={priorityLevel(Number(value))}
                  options={[...PRIORITY_LEVELS]}
                  onChange={v => { onChange(def.name, LEVEL_TO_N[v as PriorityLevel]); onBlur?.(def.name); }} />
        </FieldRow>
      );
    case 'combo': {
      const list = def.optionsFor(row ?? {});
      return (
        <FieldRow {...rowProps}>
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
        </FieldRow>
      );
    }
    case 'lookup':
      if (def.freeTextWhen?.(row ?? {})) {
        return (
          <FieldRow {...rowProps}>
            <TextField id={`f-${def.name}`} value={String(value ?? '')}
                       placeholder={def.placeholder}
                       aria-invalid={missing || undefined}
                       onBlur={() => onBlur?.(def.name)}
                       onChange={e => onChange(def.name, e.target.value)} />
          </FieldRow>
        );
      }
      return (
        <FieldRow {...rowProps}>
          <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                  required={def.required} invalid={Boolean(missing)}
                  options={[...def.optionsFor(row ?? {})]}
                  onChange={v => { onChange(def.name, v); onBlur?.(def.name); }} />
        </FieldRow>
      );
    case 'select':
      return (
        <FieldRow {...rowProps}>
          <Select id={`f-${def.name}`} label={def.label} value={String(value ?? '')}
                  required={def.required} invalid={Boolean(missing)}
                  options={[...def.options]}
                  onChange={v => { onChange(def.name, v); onBlur?.(def.name); }} />
        </FieldRow>
      );
    case 'date':
      /* `DateField`, not `<input type="date">`. The native control draws the
         browser's own calendar in the browser's own date order, which is the
         one thing the Regional Format setting exists to decide — a user whose
         records read 13/10/2026 was being asked to type into a box that said
         10/13/2026. Her Date widget is a text box in the system's format with
         a calendar at the right, and typing still works. */
      return (
        <FieldRow {...rowProps}>
          <DateField id={`f-${def.name}`}
                     value={(value as unknown) instanceof Date ? (value as Date) : null}
                     required={def.required} invalid={Boolean(missing)}
                     onChange={d => { onChange(def.name, d); onBlur?.(def.name); }} />
        </FieldRow>
      );
    case 'number':
      /* The unit is in the label now; the box holds the number and nothing
         else. `NumberField` formats at rest on her scale and hands back the
         raw value while it is being typed. */
      return (
        <FieldRow {...rowProps}>
          <NumberField id={`f-${def.name}`} kind={def.scale ?? 'integer'}
                       value={typeof value === 'number' ? value : null}
                       required={def.required} invalid={Boolean(missing)}
                       onChange={n => onChange(def.name, n)} />
        </FieldRow>
      );
    case 'flag':
      return (
        /* No heading — the Checkbox carries the label itself, and a `dt`
           repeating it would announce the field twice. The HINT still shows,
           which it did not before: these are the fields whose consequences most
           need explaining. */
        def.words ? (
          /* With words it is an attribute of the record, so it keeps the row's
             own label and puts the ANSWER in the value slot. */
          <FieldRow {...rowProps}>
            <YesNoField id={`f-${def.name}`} words={def.words} value={Boolean(value)}
                        onChange={v => onChange(def.name, v)} />
          </FieldRow>
        ) : (
          <FieldRow {...rowProps} label={undefined} htmlFor={undefined}>
            <Checkbox checked={Boolean(value)} onCheckedChange={c => onChange(def.name, c)}
                      label={def.label} />
          </FieldRow>
        )
      );
    case 'notes':
      return (
        <FieldRow {...rowProps} variant="wide">
          <TextArea id={`f-${def.name}`} rows={3} value={String(value ?? '')}
                    aria-invalid={missing || undefined}
                    onBlur={() => onBlur?.(def.name)}
                    onChange={e => onChange(def.name, e.target.value)} />
        </FieldRow>
      );
    default:
      return (
        <FieldRow {...rowProps}>
          <TextField id={`f-${def.name}`} value={String(value ?? '')}
                     aria-invalid={missing || undefined}
                     onBlur={() => onBlur?.(def.name)}
                     onChange={e => onChange(def.name, e.target.value)} />
        </FieldRow>
      );
  }
}

function ReadField<T>({ def, value, editing }: { def: FieldDef<T>; value: unknown; editing?: boolean }) {
  if (def.kind === 'flag') {
    /* WITH WORDS IT IS A ROW, NOT A TICK. ITAR is read-only and derived, so
       it never reaches the edit switch — it has always rendered here, and
       here it was `– ITAR`. A dash beside an acronym does not say whether
       ITAR is not required, not ticked, or not filled in, which is the exact
       failure her Yes/no field exists to stop. `readOnly` on the control, so
       it draws her muted value box rather than something that looks
       pressable. */
    if (def.words) {
      /* `YesNoValue`, not `YesNoField readOnly`: this row's `dd` is already
         her value box, and the control would bring a second one — the same
         fill inside the same fill, the same line under the same line. See the
         note on `YesNoValue`. */
      return (
        <FieldRow label={def.label} required={def.required}
                  note={editing && def.readOnly ? lockReason(def) : undefined}>
          <YesNoValue words={def.words} value={Boolean(value)} />
        </FieldRow>
      );
    }
    return (
      <div className="vy-flag-row" data-on={Boolean(value)} data-locked={editing && def.readOnly || undefined}>
        <span className="vy-flag-mark" aria-hidden>{value ? '✓' : '–'}</span>
        <span>{def.label}{def.required && <RequiredMark />}</span>
        {/* The same lock the field rows carry — this row renders itself rather
            than going through FieldRow, which is how it came to be the one
            locked field on the screen with no padlock on it. */}
        {editing && def.readOnly && (
          <span className="vy-field-locked">
            <Icon name="lock" size={13} />{lockReason(def)}
          </span>
        )}
      </div>
    );
  }
  /* The lock note appears only while EDITING — when you are just reading, every
     field is read-only and the note would be noise on all of them. Computed once
     because six branches used to spell out the same condition. */
  const note = editing && def.readOnly ? lockReason(def) : undefined;
  const base = { label: def.label, required: def.required, note };

  if (def.kind === 'people') {
    const names = Array.isArray(value) ? (value as string[]) : [];
    return (
      <FieldRow {...base} empty={names.length === 0}>
        {names.length ? (
          <span className="vy-people-read">
            {names.map(n => {
              const p = PEOPLE_DIRECTORY.find(x => x.name === n);
              return (
                <span className="vy-people-chip" key={n}>
                  <span className="vy-avatar vy-avatar--sm" aria-hidden>{p?.initials ?? '?'}</span>
                  <span className="vy-people-chip-name">{n}</span>
                </span>
              );
            })}
          </span>
        ) : 'Unassigned'}
      </FieldRow>
    );
  }
  if (def.kind === 'priority') {
    return <FieldRow {...base}><Priority value={Number(value)} /></FieldRow>;
  }
  if (def.kind === 'radio') {
    const chosen = String(value ?? '');
    return (
      <FieldRow {...base} empty={!chosen}>
        {chosen || 'Not set'}
        {chosen && OPTION_MEANINGS[chosen] && (
          <span className="vy-option-meaning">{OPTION_MEANINGS[chosen]}</span>
        )}
      </FieldRow>
    );
  }
  if (def.kind === 'datetime' || def.kind === 'date') {
    const d = value instanceof Date ? value : undefined;
    return (
      <FieldRow {...base} empty={!d}>
        {d ? (def.kind === 'datetime' ? fmtDateTime(d) : fmtDate(d)) : 'Not set'}
      </FieldRow>
    );
  }
  const empty = value === undefined || value === null || value === '';
  /* THE SAME FORMATTER THE BOX USES. This line used to glue the unit onto the
     value — "42%", "12 days" — which was the read-mode half of the suffix the
     edit control has now dropped: the unit is in the label, and printing it
     again beside the number says it twice. It also printed `String(value)`
     where the box prints `12.00`, so pressing Edit changed the number on
     screen without changing the record. */
  const shown = def.kind === 'number' && typeof value === 'number'
    ? formatOnScale(def.scale ?? 'integer', value)
    : value;
  return (
    <FieldRow {...base} empty={empty} variant={def.kind === 'notes' ? 'wide' : undefined}>
      {empty ? 'Not set' : String(shown)}
    </FieldRow>
  );
}

/**
 * WHY a field cannot be edited.
 *
 * "Set by the system" and "follows Customer" are different answers to the same
 * question, and a user who gets neither will assume the form is broken or that
 * they lack a permission. Returns the words; `FieldRow` renders them, and its
 * presence is what marks the row locked.
 */
function lockReason<T>(def: FieldDef<T>): string {
  return def.derivedFrom ? `follows ${def.derivedFrom}` : 'set by the system';
}


/* `toDateInput` / `fromDateInput` LIVED HERE and are gone, 23 Nov. They
   converted a Date to and from the `yyyy-mm-dd` an `<input type="date">`
   wants, carefully, out of LOCAL parts rather than `toISOString()` — because
   an ISO string is UTC, and for any user east of Greenwich a date at local
   midnight renders as the previous day in the box.

   The whole problem went with the native input. `DateField` holds a `Date`
   and prints it through the Regional Format, so there is no string in the
   middle to get the timezone wrong in. `MpnMapping.tsx` still has its own
   copy of `toDateInput` for its own native input; that one is a separate
   swap, not collateral of this one. */
