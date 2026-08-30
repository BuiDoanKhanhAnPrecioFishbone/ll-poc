import { Select } from './Overlays';
import { TextField } from './Field';
import type { FilterValues, ViewField } from './views';

/**
 * The filter toolbar — the panel behind the funnel.
 *
 * Read off the live screen. Two things about it are unusual enough to be worth
 * stating, because the prototype previously got both wrong:
 *
 * 1. THERE ARE NO OPERATORS. A field takes a value; a date takes an explicit
 *    From and To. No "contains", no "is not", no "between". The condition
 *    builder that was here before was invented outright.
 *
 * 2. EVERY FIELD IS VISIBLE AT ONCE. There is no add-a-condition flow. Which
 *    fields appear is a property of the saved View, chosen in View Setting —
 *    not something assembled per session.
 *
 * The panel is hidden by default and toggled by the funnel, as the live screen
 * has it: "clicking the button again collapses the filter area". A permanently
 * open filter panel costs vertical space on every visit to serve the minority
 * of visits that filter.
 */
export function FilterToolbar({ fields, values, onChange, onClear, activeCount, onEditFields }: {
  fields: ViewField<any>[];
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  onClear: () => void;
  activeCount: number;
  /**
   * Opens View Setting on its Filter tab — where these fields are chosen.
   *
   * The two screens are easy to confuse because both are called "Filter". A
   * user who wants a field that is not here has no way to guess that the answer
   * lives behind a button called "Setup View Template" at the other end of the
   * toolbar. The link goes from the place the problem is noticed to the place
   * it is fixed. Omitted in the View Setting preview, which is already there.
   */
  onEditFields?: () => void;
}) {
  const set = (key: string, v: string) => onChange({ ...values, [key]: v });

  return (
    <div className="vy-filter-toolbar">
      <div className="vy-filter-fields">
        {fields.map(f => f.kind === 'date-range' ? (
          /* One label, two inputs — the range is one idea. Splitting it into
             "Date Needed From" and "Date Needed To" as separate fields, which is
             how the live screen labels them, doubles the label count and makes
             the pair read as two unrelated filters. */
          <div className="vy-filter-field vy-filter-field--range" key={f.field}>
            <span className="vy-filter-label-sm">{f.label}</span>
            <div className="vy-filter-range">
              <TextField type="date" aria-label={`${f.label} from`}
                         value={values[f.field + 'From'] ?? ''}
                         onChange={e => set(f.field + 'From', e.target.value)} />
              <span className="vy-filter-range-sep" aria-hidden>–</span>
              <TextField type="date" aria-label={`${f.label} to`}
                         value={values[f.field + 'To'] ?? ''}
                         onChange={e => set(f.field + 'To', e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="vy-filter-field" key={f.field}>
            <span className="vy-filter-label-sm">{f.label}</span>
            <Select label={f.label}
                    value={values[f.field] ?? ''}
                    /* The blank option is how a filter is cleared. Without it
                       the only way back to "any" is Clear all, which throws
                       away every other field too. */
                    options={['', ...(f.options ?? [])]}
                    onChange={v => set(f.field, v)} />
          </div>
        ))}
      </div>

      <div className="vy-filter-toolbar-foot">
        {/* Named as the live control is, and disabled when there is nothing to
            clear — an enabled button that does nothing is worse than an absent
            one, because pressing it looks like a failure. */}
        <button type="button" className="vy-clear-all"
                disabled={activeCount === 0}
                onClick={onClear}>
          Clear all
        </button>
        {activeCount > 0 && (
          <span className="vy-filter-active">
            {activeCount} {activeCount === 1 ? 'filter' : 'filters'} applied
          </span>
        )}
        {onEditFields && (
          <button type="button" className="vy-filter-edit-fields" onClick={onEditFields}
                  title="Choose which fields appear in this toolbar">
            Edit fields
          </button>
        )}
      </div>
    </div>
  );
}
