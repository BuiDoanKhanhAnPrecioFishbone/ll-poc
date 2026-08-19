import { STATUS_TOKEN } from '../data/parts';

/**
 * The single status vocabulary. Every module maps its lifecycle onto six
 * tokens, so "what state is this record in" is answered the same way in Sales
 * Orders, Work Orders and the Part Master. The legacy app coloured every Part
 * Master status the same green, which made the column decorative rather than
 * informative.
 */
export function StatusBadge({ value }: { value: string }) {
  const token = STATUS_TOKEN[value] ?? 'draft';
  return (
    <span className="vy-status" data-token={token}>
      {value}
    </span>
  );
}
