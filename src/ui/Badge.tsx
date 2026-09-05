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

/* `Pill` lived here and nothing ever rendered it — five screens write
   `className="vy-pill"` directly instead, so the CSS stays and the component
   does not. Worth a line rather than a silent deletion: if a Pill component is
   wanted later, the callers to convert are in PartDetail, ChecklistsTab,
   ConversationsTab and StepSummary. */
