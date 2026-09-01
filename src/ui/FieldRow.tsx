import type { ReactNode } from 'react';

/**
 * ONE labelled row. Every label-and-value pair in the app is this.
 *
 * WHY THIS EXISTS. The same fourteen-line block — `div.vy-field`, a `dt` with a
 * label and maybe a required marker, a `dd` with the control, an error and a
 * hint — was written out fourteen times: ten inside `RecordField`'s own switch,
 * once each in `CreateBomDialog`, `MpnMapping`, `PartDetail` and
 * `StepConfigBom`. Two of those files independently defined a helper called
 * `ReadValue` with different props.
 *
 * Nothing was visibly broken. That is the problem with this kind of drift: each
 * copy is defensible on its own, and the cost only shows up as a hint that sits
 * a little differently on one screen, a required marker that is missing on
 * another, a locked note that says "set by the record" where the value is
 * actually computed. The most repeated element in the product is the last one
 * that should be rendered four ways.
 *
 * WHAT IT DOES NOT DO. It does not choose a control. `RecordField` maps a field
 * DECLARATION to an input and is still the right thing wherever a `FieldDef`
 * exists; it now renders through this. This row is for the cases a declaration
 * cannot describe — a button, a radio pair, a computed read-out — which is
 * exactly what the four local copies were for.
 */
export function FieldRow({
  label, htmlFor, labelId, required, hint, note, error, invalid, editing, empty, variant, children,
}: {
  /** Omit where the control carries its own label — a checkbox does. */
  label?: ReactNode;
  /** Points the label at the control. Omit for a read-only value. */
  htmlFor?: string;
  /**
   * Puts the id on the heading itself, for a group of controls that has no
   * single element to point a `<label>` at — a radio group is labelled BY its
   * heading, not by a label pointing into it.
   */
  labelId?: string;
  required?: boolean;
  /** Guidance, under the control. */
  hint?: ReactNode;
  /**
   * Why this value cannot be edited — "set by the system", "follows Customer",
   * "computed, not stored". Its presence is what marks the row locked, because
   * a locked row with no reason reads as broken or as a missing permission.
   */
  note?: ReactNode;
  /** A validation message. Shown instead of the hint, never both. */
  error?: ReactNode;
  invalid?: boolean;
  editing?: boolean;
  /** Renders the value as absent rather than as a value. */
  empty?: boolean;
  /** A layout modifier: `radio` for options shown in full, `wide` to span. */
  variant?: 'radio' | 'wide';
  children: ReactNode;
}) {
  const cls = ['vy-field'];
  if (editing) cls.push('vy-field--editing');
  if (variant) cls.push(`vy-field--${variant}`);

  const heading = (
    <>
      {label}
      {required && <RequiredMark />}
    </>
  );

  return (
    <div className={cls.join(' ')}
         data-invalid={invalid || undefined}
         data-locked={note ? true : undefined}>
      <dt id={labelId}>
        {label === undefined ? null
          : htmlFor ? <label htmlFor={htmlFor}>{heading}</label>
          : heading}
      </dt>
      <dd className={empty ? 'is-empty' : undefined}>
        {children}
        {note && <span className="vy-field-locked">{note}</span>}
        {error}
        {/* Never both. An error and a hint together make the reader work out
            which one is telling them what to do next. */}
        {hint && !error && <span className="vy-field-hint">{hint}</span>}
      </dd>
    </div>
  );
}

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
 *
 * Lives here rather than in `RecordField` so that the row and its marker are
 * one import, and so `ui/` does not depend on `components/`.
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
 * A read-only value in a box — the form's counterpart to a control.
 *
 * Distinct from a `FieldRow`, which is the label-and-value pair; this is what
 * goes INSIDE one when the value cannot be edited. Two files had their own
 * copy and they had drifted: one emitted `data-empty`, which the stylesheet
 * styles as italic grey, and the other an `is-empty` CLASS, which nothing
 * styles at all — so every "Not set" on Create BoM rendered as ordinary black
 * text while the same words elsewhere read as absent.
 *
 * `locked` is for a value the system owns and the user might expect to edit;
 * a plain read-out does not need it.
 */
export function ReadValue({ children, locked }: { children?: ReactNode; locked?: boolean }) {
  const empty = children === undefined || children === null || children === '';
  return (
    <p className="vy-read-value" data-locked={locked || undefined} data-empty={empty || undefined}>
      {empty ? 'Not set' : children}
    </p>
  );
}
