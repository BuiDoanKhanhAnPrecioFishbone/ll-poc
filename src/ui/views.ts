import type { Quotation } from '../data/quotations';

/**
 * Saved views.
 *
 * The real system's advanced filter is not a condition builder — it is a named,
 * savable VIEW. See docs/filter-spec.md, captured from the live screens.
 *
 * A view holds three things, which is exactly what its dialog's three tabs are:
 *   filter  — which fields are filterable, and their current values
 *   column  — which columns the grid shows
 *   sort    — the order
 *
 * The prototype previously modelled this as an ad-hoc stack of
 * field/operator/value conditions. That was invented: the live filter has no
 * operators at all. A field takes a value; a date takes an explicit From and To.
 */

export type FilterKind = 'select' | 'date-range';

export type ViewField = {
  /** Matches the record property, or the base name for a date range. */
  field: string;
  /** Verbatim from the live screen. */
  label: string;
  kind: FilterKind;
  options?: readonly string[];
  /** Pulls the comparable value out of a row. */
  value: (q: Quotation) => string | Date | null | undefined;
};

/** A date range is two inputs and one concept, so it stores two values. */
export type FilterValues = Record<string, string>;

/**
 * One column inside a view.
 *
 * `label` overrides the column's own title. The live Column tab renders the
 * name as a TEXT INPUT, so a user can rename a column inside their own view —
 * "Customer Name" becomes "Client" for whoever wants that. Nothing in the
 * prototype anticipated this, and it is the reason a view stores columns as
 * objects rather than a list of field names.
 */
export type ViewColumn = {
  field: string;
  /** Renamed by the user. Undefined means "use the column's own title". */
  label?: string;
  /** Pixels. Undefined means "use the width the column role gives it". */
  width?: number;
};

/** Multi-level: the live Sort tab lets you stack fields and reorder them. */
export type ViewSort = { field: string; dir: 'asc' | 'desc' };

export type SavedView = {
  id: string;
  name: string;
  isDefault: boolean;
  /** Which fields the filter panel shows — chosen on the Filter tab. */
  fields: string[];
  /** Which columns the grid shows, in order. */
  columns: ViewColumn[];
  /** Applied outermost-first, as the list is ordered. */
  sort: ViewSort[];
  /** Built in. Cannot be renamed or deleted. */
  system?: boolean;
};

/**
 * Sorts rows by a stacked sort.
 *
 * Stable and multi-level: the second field only decides rows the first field
 * ties on, which is the whole point of stacking them.
 */
export function applySort<T>(
  rows: T[],
  sort: ViewSort[],
  valueOf: (row: T, field: string) => unknown,
): T[] {
  if (!sort.length) return rows;
  return [...rows].sort((a, b) => {
    for (const s of sort) {
      const av = valueOf(a, s.field);
      const bv = valueOf(b, s.field);
      if (av === bv) continue;
      /* Empty sorts last in both directions. A blank is an absence, not a
         value smaller than every other one, and burying real rows under a
         block of blanks is never what someone sorting wanted. */
      if (av === null || av === undefined || av === '') return 1;
      if (bv === null || bv === undefined || bv === '') return -1;
      const cmp = av instanceof Date && bv instanceof Date
        ? av.getTime() - bv.getTime()
        : typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      if (cmp !== 0) return s.dir === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}

const dayStart = (s: string) => { const d = new Date(s); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dayOf = (v: unknown) => {
  const d = v instanceof Date ? new Date(v) : new Date(String(v));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Applies the panel's values.
 *
 * An EMPTY value matches everything. A filter panel sits permanently on screen
 * with every field visible and most of them blank — if blank meant "match
 * nothing" the grid would start empty and never recover.
 *
 * A date range with only one end set is still a valid filter: "from 1 August"
 * with no end means everything since. Requiring both would make the common case
 * — an open-ended window — impossible to express.
 */
export function applyView(rows: Quotation[], fields: ViewField[], values: FilterValues): Quotation[] {
  const active = fields.filter(f =>
    f.kind === 'date-range'
      ? values[f.field + 'From'] || values[f.field + 'To']
      : values[f.field]);
  if (!active.length) return rows;

  return rows.filter(q => active.every(f => {
    const raw = f.value(q);
    if (f.kind === 'date-range') {
      const from = values[f.field + 'From'];
      const to = values[f.field + 'To'];
      const v = dayOf(raw);
      if (from && v < dayStart(from)) return false;
      /* Inclusive of the To date. A user typing 31 August means "up to and
         including", not "before the 31st". */
      if (to && v > dayStart(to)) return false;
      return true;
    }
    return String(raw ?? '') === values[f.field];
  }));
}

/** How many fields are actually filtering, for the badge on the funnel. */
export function activeCount(fields: ViewField[], values: FilterValues): number {
  return fields.filter(f =>
    f.kind === 'date-range'
      ? values[f.field + 'From'] || values[f.field + 'To']
      : values[f.field]).length;
}

export const emptyValues = (): FilterValues => ({});
