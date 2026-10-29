/**
 * A deterministic hash over a record id, and the picker built on it.
 *
 * WHY THIS EXISTS AT ALL. `generateQuotations` draws every value from one
 * seeded stream, and adding a draw to it re-rolls everything after — the canary
 * is the Customer RFQs count on a record, which moves if the stream does. So
 * when a screen needs a fact the generator never stored (which quote focus a
 * saved run used, what the last purchase order paid, how many versions an
 * assembly has) that fact is derived HERE, from the record's own id, through a
 * hash that touches no shared stream. Same id, same answer, every reload — and
 * the generator's numbers do not move by a digit.
 *
 * Lived in `quoteRun.ts` until the result view's version picker and the Other
 * Quoted Cost screen needed the same trick; three copies of eight lines is how
 * two of them quietly stop agreeing.
 */

/** FNV-1a over the id. Small, stable, and not the generator's `rnd`. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic pick: the nth value, chosen by the id and a salt. */
export const pickBy = <T,>(id: string, salt: string, xs: readonly T[]): T =>
  xs[hash(id + salt) % xs.length];

/**
 * A deterministic number in `[lo, hi)`, to `step` precision.
 *
 * The salt is what keeps two figures derived from one id independent: without
 * it every call on the same record returns the same number, which shows up as
 * a reference-cost table whose five rows are all equal.
 */
export const numBy = (id: string, salt: string, lo: number, hi: number, step = 1): number => {
  const steps = Math.max(1, Math.round((hi - lo) / step));
  return lo + (hash(id + salt) % steps) * step;
};
