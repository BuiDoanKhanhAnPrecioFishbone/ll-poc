import type { FieldDef } from './RecordField';

/**
 * What is wrong, and where to fix it.
 *
 * From the kick-off deck's last slide, titled "Notification Form" but not a
 * notifications inbox: a panel at the top of a form listing each problem in
 * words, every one carrying a link to the field at fault — *"Total Schedule Qty
 * exceeds order quantity by 3 units. Adjust Schedule Qty"*.
 *
 * WHY IT IS NOT REDUNDANT with what we already had. The record already refused
 * to save, marked each offending field, and counted the outstanding ones on the
 * button. Between them those answer "can I save" and "how many", and neither
 * answers WHICH — on a form of 23 fields spread over three tab panels and two
 * column groups, that is the only question the user actually has. The toast that
 * used to carry the message says it once and then removes the evidence.
 *
 * It shows for as long as a blocking field exists, rather than waiting for a
 * save attempt — because there is no save attempt to wait for. Save is disabled
 * while anything is missing, so the "you pressed Save and it refused" moment
 * this kind of panel usually keys off never happens here. What happens instead
 * is a greyed button reading "1 field still needed", which states the count and
 * withholds the identity.
 *
 * Enabling Save and letting it refuse would give that moment back, and is what
 * I would design from scratch — a disabled control cannot explain itself. It is
 * NOT changed here: the disabled-Save-with-a-count is an existing decision on
 * this record, and replacing it is a separate call to make deliberately rather
 * than a side effect of adding a panel. Raised in docs/kickoff-deck-gaps.md.
 *
 * It also empties itself. Each row disappears as its field is satisfied, so the
 * panel is a live worklist rather than a snapshot of a failure — which is the
 * whole advantage it has over the toast.
 */
export function ValidationPanel({ missing, onGoTo }: {
  missing: FieldDef<any>[];
  onGoTo: (name: string) => void;
}) {
  if (!missing.length) return null;

  return (
    <div className="vy-validation" role="group" aria-labelledby="vy-validation-title">
      {/* Polite, not assertive, and only the SENTENCE is live. The list beneath
          changes on every keystroke that fixes something; announcing all of it
          each time would talk over the person typing. */}
      <p className="vy-validation-title" id="vy-validation-title" aria-live="polite">
        <strong>
          {missing.length} required {missing.length === 1 ? 'field is' : 'fields are'} still empty.
        </strong>{' '}
        This record cannot be saved until each one has a value.
      </p>
      <ul className="vy-validation-list">
        {missing.map(f => (
          <li key={f.name}>
            <span className="vy-validation-what">{f.label} is required.</span>
            {/* The verb names the destination, as the deck's own links do —
                "Adjust MRP Date", not "Go" or an arrow. A link that says where
                it goes can be read out of context, which is how someone
                scanning a list of eight decides which to press first. */}
            <button type="button" className="vy-link vy-validation-goto"
                    onClick={() => onGoTo(f.name)}>
              Go to {f.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
