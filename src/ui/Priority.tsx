/**
 * Priority.
 *
 * Was three stars. The 25 Aug review asked for a dot plus a word, and the
 * reasoning holds: a star rating is an INPUT idiom — it says "rate this" — and
 * it makes the reader count. Two filled stars out of three is a fraction the
 * eye has to resolve before it means anything, and it means nothing at all
 * unless you already know the scale runs to three.
 *
 * "Medium" needs no scale and no counting. The dot keeps the colour, so a row
 * can still be scanned without reading the words.
 */
export type PriorityLevel = 'High' | 'Medium' | 'Low';

/** The live record stores 1-3. Three is most urgent. */
export const priorityLevel = (n: number): PriorityLevel =>
  n >= 3 ? 'High' : n === 2 ? 'Medium' : 'Low';

export const PRIORITY_LEVELS: PriorityLevel[] = ['High', 'Medium', 'Low'];

export function Priority({ value }: { value: number }) {
  const level = priorityLevel(value);
  return (
    <span className="vy-priority" data-level={level}>
      <span className="vy-priority-dot" aria-hidden />
      {level}
    </span>
  );
}
