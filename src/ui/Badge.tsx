import { STATUS_TOKEN } from '../data/status';

/**
 * Status badge — the six-token vocabulary, unchanged from the Kendo build.
 * The vocabulary was always the design decision; the component rendering it
 * was incidental. Fixed width (formerly GAP-01) is now just a token, with no
 * library to work around.
 */
export function StatusBadge({ value }: { value: string }) {
  const token = STATUS_TOKEN[value] ?? 'draft';
  return <span className="vy-badge" data-token={token}>{value}</span>;
}

/** Neutral count/label pill, for tab counts and inline metadata. */
export function Pill({ children }: { children: React.ReactNode }) {
  return <span className="vy-pill">{children}</span>;
}
