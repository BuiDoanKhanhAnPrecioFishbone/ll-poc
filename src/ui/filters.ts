/**
 * The filter model.
 *
 * The 25 Aug review put this first: "Having the full set of features already
 * implemented (the basic and advanced filter sections)". Voyager supports two
 * tiers and the prototype had neither — it had two hard-coded chips.
 *
 *   QUICK FILTER    a named set per module. One click, no configuration. This is
 *                   what people use all day: "mine", "open", "late".
 *   ADVANCED FILTER pick a field, an operator and a value, and stack conditions.
 *                   This is what people use when the quick set does not cover the
 *                   question they actually have.
 *
 * Both are DECLARED per screen, the same way column roles are, so a new list
 * costs a declaration rather than a filter implementation.
 */

export type QuickFilter<T> = {
  key: string;
  label: string;
  match: (row: T) => boolean;
};

export type FilterFieldType = 'text' | 'select' | 'number' | 'date' | 'boolean';

export type FilterField<T> = {
  field: string;
  label: string;
  type: FilterFieldType;
  /** Required for `select`. */
  options?: readonly string[];
  /** Pulls the comparable value out of a row. */
  value: (row: T) => string | number | boolean | Date | null | undefined;
};

export type Operator =
  | 'contains' | 'not_contains' | 'is' | 'is_not' | 'empty' | 'not_empty'
  | 'gt' | 'lt' | 'between'
  | 'before' | 'after' | 'last_days';

/** Which operators make sense for which kind of value. */
export const OPERATORS: Record<FilterFieldType, { op: Operator; label: string }[]> = {
  text: [
    { op: 'contains', label: 'contains' },
    { op: 'not_contains', label: 'does not contain' },
    { op: 'is', label: 'is exactly' },
    { op: 'empty', label: 'is empty' },
    { op: 'not_empty', label: 'is not empty' },
  ],
  select: [
    { op: 'is', label: 'is' },
    { op: 'is_not', label: 'is not' },
    { op: 'empty', label: 'is empty' },
  ],
  number: [
    { op: 'is', label: '=' },
    { op: 'is_not', label: '≠' },
    { op: 'gt', label: '>' },
    { op: 'lt', label: '<' },
    { op: 'between', label: 'between' },
  ],
  date: [
    { op: 'is', label: 'on' },
    { op: 'before', label: 'before' },
    { op: 'after', label: 'after' },
    { op: 'between', label: 'between' },
    /* The review asked for this explicitly: "allow choosing either a specific
       date or count date from today". "Late by more than 7 days" is a question
       people actually ask; "before 18 August" is the same question in a form
       that has to be recalculated every morning. */
    { op: 'last_days', label: 'in the last (days)' },
  ],
  boolean: [
    { op: 'is', label: 'is' },
  ],
};

export type Condition = {
  /** Stable across edits so React keys and removal behave. */
  id: number;
  field: string;
  op: Operator;
  value: string;
  /** Second operand, for `between`. */
  value2?: string;
};

const asText = (v: unknown) => String(v ?? '').toLowerCase();
const asNum = (v: unknown) => (v instanceof Date ? v.getTime() : Number(v));
const dayStart = (s: string) => { const d = new Date(s); d.setHours(0, 0, 0, 0); return d.getTime(); };

/**
 * Evaluates one condition against one row.
 *
 * An INCOMPLETE condition matches everything rather than nothing. Half-typed
 * filters are the normal state of a filter panel — you pick a field, then an
 * operator, then start typing — and a panel that empties the grid on every
 * keystroke of setup reads as broken.
 */
export function evaluate<T>(row: T, c: Condition, fields: FilterField<T>[]): boolean {
  const f = fields.find(x => x.field === c.field);
  if (!f) return true;
  const raw = f.value(row);
  const needsValue = c.op !== 'empty' && c.op !== 'not_empty';
  if (needsValue && c.value === '') return true;

  switch (c.op) {
    case 'empty':        return raw === null || raw === undefined || raw === '';
    case 'not_empty':    return !(raw === null || raw === undefined || raw === '');
    case 'contains':     return asText(raw).includes(c.value.toLowerCase());
    case 'not_contains': return !asText(raw).includes(c.value.toLowerCase());
    case 'is':
      if (f.type === 'date') return dayStart(String(raw)) === dayStart(c.value);
      if (f.type === 'number') return asNum(raw) === Number(c.value);
      if (f.type === 'boolean') return String(!!raw) === c.value;
      return asText(raw) === c.value.toLowerCase();
    case 'is_not':
      if (f.type === 'number') return asNum(raw) !== Number(c.value);
      return asText(raw) !== c.value.toLowerCase();
    case 'gt':     return asNum(raw) > Number(c.value);
    case 'lt':     return asNum(raw) < Number(c.value);
    case 'before': return dayStart(String(raw)) < dayStart(c.value);
    case 'after':  return dayStart(String(raw)) > dayStart(c.value);
    case 'between': {
      if (c.value2 === undefined || c.value2 === '') return true;
      const lo = f.type === 'date' ? dayStart(c.value) : Number(c.value);
      const hi = f.type === 'date' ? dayStart(c.value2) : Number(c.value2);
      const v = f.type === 'date' ? dayStart(String(raw)) : asNum(raw);
      /* Reversed bounds are a slip, not a request for nothing. */
      return v >= Math.min(lo, hi) && v <= Math.max(lo, hi);
    }
    case 'last_days': {
      const n = Number(c.value);
      if (!Number.isFinite(n)) return true;
      const v = raw instanceof Date ? raw.getTime() : dayStart(String(raw));
      return v >= Date.now() - n * 86400000 && v <= Date.now();
    }
    default: return true;
  }
}

/**
 * Conditions combine with AND.
 *
 * OR is deliberately not offered. Mixed AND/OR needs grouping to be
 * unambiguous, grouping needs a visual nesting model, and the question people
 * actually bring to an RFQ list — "mine, open, late" — is a conjunction. If OR
 * turns out to be needed it should arrive with grouping, not before it.
 */
export function applyConditions<T>(rows: T[], conds: Condition[], fields: FilterField<T>[]): T[] {
  if (!conds.length) return rows;
  return rows.filter(r => conds.every(c => evaluate(r, c, fields)));
}

/** A short human summary, for the chip shown when the panel is closed. */
export function describe<T>(c: Condition, fields: FilterField<T>[]): string {
  const f = fields.find(x => x.field === c.field);
  if (!f) return '';
  const opLabel = OPERATORS[f.type].find(o => o.op === c.op)?.label ?? c.op;
  if (c.op === 'empty' || c.op === 'not_empty') return `${f.label} ${opLabel}`;
  if (c.op === 'between') return `${f.label} ${opLabel} ${c.value} – ${c.value2 ?? ''}`;
  return `${f.label} ${opLabel} ${c.value}`;
}
