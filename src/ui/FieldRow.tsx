import type { ReactNode } from 'react';
import { Icon } from './icons';

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
        {/* The lock, 14 Oct 2026: "read only with lock icon and disable fill
            bg". The glyph says THAT the field is locked at a glance; the words
            beside it say WHY, which a padlock cannot. */}
        {note && (
          <span className="vy-field-locked">
            <Icon name="lock" size={13} />{note}
          </span>
        )}
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
 * A BARE `*`, since 20 Oct. It was `(*)` — the live system's spelling, which we
 * followed as tier-2 evidence while the written requirement said nothing. It
 * does say something now, twice: the standard asks for a red `*`, and the
 * Quoting BoM mockup of 16 Oct writes `{label}{req && <span className="req">*
 * </span>}`. A written requirement outranks the live screen, so the parentheses
 * go.
 *
 * `aria-hidden` on the glyph with the word "required" for screen readers: an
 * asterisk read aloud is noise, and the field also carries `aria-required`
 * where it is a real control.
 *
 * Lives here rather than in `RecordField` so that the row and its marker are
 * one import, and so `ui/` does not depend on `components/`.
 */
export function RequiredMark() {
  return (
    <>
      <span className="vy-required" aria-hidden>*</span>
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
 * ALWAYS LOCKED, and it says so. Every one of these sits among live controls —
 * a dialog, a step of Run Quotation — never in a read view, where `FieldRow`'s
 * own box is the one that renders. So this is the edit view's read-only state,
 * which the customer defined on 14 Oct 2026 as a lock icon plus a disabled
 * fill, and there is nothing for a `locked` prop to vary: the three call sites
 * that passed it were marking as special what all twenty of them are.
 *
 * On Run Quotation step 1 that distinction is the whole point of the panel —
 * eight values carried from the RFQ, three the step can actually change — and
 * until now all eleven were white boxes.
 *
 * `lock` OPTS OUT, for the one case that earns it: a strip where NOTHING is
 * editable. Run Quotation step 4 shows the same facts as steps 2 and 3 with the
 * run already finished, and a padlock on every one of seven values says only
 * what the whole panel already says. The box stays — the fill is what marks a
 * value you cannot type into — and the lock goes where it distinguishes.
 */
export function ReadValue({ children, lock = true }: { children?: ReactNode; lock?: boolean }) {
  const empty = children === undefined || children === null || children === '';
  return (
    <p className="vy-read-value" data-empty={empty || undefined}>
      <span className="vy-read-value-text">{empty ? 'Not set' : children}</span>
      {lock && <Icon name="lock" size={13} />}
      {/* The glyph is decorative to a screen reader, so the state needs words
          of its own — otherwise a locked value and an editable one are
          announced identically. */}
      {lock && <span className="vy-sr-only"> read-only</span>}
    </p>
  );
}
