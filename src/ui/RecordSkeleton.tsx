import type { HeaderGroup } from '../components/quotation/requirementFields';

/**
 * Loading state for the record pattern, as `GridSkeleton` is for the list.
 *
 * IT IS BUILT FROM THE SAME DECLARATIONS THE FORM IS. `GridSkeleton` takes the
 * column specs so its placeholder rows have the real grid's proportions; this
 * takes `HEADER_GROUPS`, the same array `QuotationDetail` renders from. The
 * consequence is the one that matters: a field added to the form appears here
 * too, and the skeleton cannot drift into describing a screen that no longer
 * exists.
 *
 * ---------------------------------------------------------------------------
 * THE LABELS ARE REAL, AND ONLY THE VALUES ARE BARS.
 *
 * A skeleton greys out what it does not know yet. On a record screen that is
 * less than people assume: the labels, the grouping and the order are in the
 * field declarations, which are already in the bundle — it is the customer's
 * name and the due date that are still in flight. Greying the labels as well
 * would be hiding something we are holding, and it would cost the reader the
 * one thing that makes a wait bearable: knowing what they are about to see.
 *
 * So Customer, Project and Schedule & ownership read normally from the first
 * frame, and the bars sit only where values will land. It also means nothing
 * moves when the data arrives — the labels are already in their final
 * positions, which is the whole promise a skeleton makes and the usual one it
 * breaks.
 * ---------------------------------------------------------------------------
 */
export function RecordSkeleton({ groups }: { groups: readonly HeaderGroup[] }) {
  return (
    <header className="vy-rfq-head vy-record-skeleton"
            role="status" aria-live="polite" aria-busy="true">
      <span className="vy-sr-only">Loading the record</span>

      {/* IT WEARS THE RECORD'S OWN CONTAINER CLASSES — `vy-rfq-head`,
          `vy-action-bar`, `vy-record-bar` — rather than a parallel set with
          numbers copied across. The spacing then comes from the same rules the
          real header uses, so the two cannot drift apart when one is edited.

          The first version skipped these rows entirely and the field groups
          sat 92px too high; when the record arrived the whole form jumped down
          — breaking the one promise a skeleton makes, in the same file whose
          comment claims it keeps it. Measured, not noticed. */}
      {/* `vy-back` and `vy-record-title` are worn too, not just the containers:
          measuring the swap showed the groups still 24px high, and 18 of those
          were margins that live on those two classes. Borrowing the class is
          exact; copying the number is exact until someone edits the original. */}
      <span className="vy-back vy-skeleton-cell vy-rec-sk-back" aria-hidden />
      <div className="vy-action-bar" aria-hidden>
        <span className="vy-skeleton-cell vy-rec-sk-btn" />
        <span className="vy-skeleton-cell vy-rec-sk-btn" />
        <span className="vy-skeleton-cell vy-rec-sk-btn" />
      </div>
      <div className="vy-record-bar" aria-hidden>
        <span className="vy-skeleton-cell" data-sk="ident" />
        <span className="vy-skeleton-cell" data-sk="chip" />
        <span className="vy-skeleton-cell" data-sk="chip" />
      </div>
      <h1 className="vy-record-title" aria-hidden>
        <span className="vy-skeleton-cell vy-rec-sk-title" />
      </h1>

      <div className="vy-header-groups">
        {groups.map(g => (
          <section className="vy-header-group" key={g.id}>
            {/* Real heading, real icon slot left empty — the glyph is one more
                thing we have and the title carries the meaning without it. */}
            <h2 className="vy-header-group-title">{g.title}</h2>
            <dl className="vy-record-fields">
              {g.fields.map(def => (
                <div className="vy-field-slot" key={def.name}>
                  <dt className="vy-rec-sk-label">{def.label}</dt>
                  {/* `data-sk` by field KIND, so a date's placeholder is a
                      date's width and a note's is two lines — the same idea as
                      GridSkeleton's widths by column role. A bar the wrong
                      length is a promise the arriving data breaks. */}
                  <dd className="vy-rec-sk-value">
                    <span className="vy-skeleton-cell" data-sk={def.kind} />
                    {def.kind === 'notes' && (
                      <span className="vy-skeleton-cell" data-sk="notes-2" />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </header>
  );
}
