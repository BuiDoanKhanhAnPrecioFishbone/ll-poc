import type { Quotation } from '../../data/quotations';

/**
 * Smart buttons — navigation to the records this one is linked to.
 *
 * Flagged as missing in the 25 Aug review: "In leading ERP systems, every record
 * must have related navigation." The live Voyager RFQ has none either, so this
 * is an addition rather than a restoration — but it is the addition the reviewer
 * asked for, and the Customer Invoice mockup carries the same row.
 *
 * Two rules, both from that review:
 *
 * 1. They are NOT action buttons and must not look like them. An action button
 *    does something TO this record and may be irreversible; a smart button just
 *    goes somewhere. Giving both the same shape teaches users to hesitate before
 *    every click in the header.
 *
 * 2. Each carries a COUNT, so it answers "is there anything there" without being
 *    pressed. A zero stays visible rather than being hidden — "no payments yet"
 *    is a fact worth knowing, and a row whose buttons come and go cannot be
 *    learned by position.
 */
export type SmartButton = {
  icon: string;
  /** Singular, used when the count is exactly 1. */
  label: string;
  plural: string;
  /** null means the destination is a single record, so a count is meaningless. */
  count: number | null;
};

export function smartButtonsFor(q: Quotation): SmartButton[] {
  return [
    /* The customer is one record, not a collection, so it takes no count —
       showing "1 Customer" would imply there could be more. */
    { icon: 'customer', label: 'Customer', plural: 'Customer', count: null },
    { icon: 'quote', label: 'Quote version', plural: 'Quote versions', count: q.results.length },
    { icon: 'task', label: 'Checklist task', plural: 'Checklist tasks', count: q.tasks.length },
    { icon: 'doc', label: 'Document', plural: 'Documents',
      count: q.tasks.filter(t => t.documentName).length },
    { icon: 'chat', label: 'Conversation', plural: 'Conversations', count: q.comments.length },
    { icon: 'log', label: 'Activity entry', plural: 'Activity log', count: q.activity.length },
  ];
}

const PATHS: Record<string, string> = {
  customer: 'M10 10a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4M4 17c0-3 2.7-4.6 6-4.6s6 1.6 6 4.6',
  quote:    'M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM12 3v3h3M7 11h6M7 14h4',
  task:     'M4 5.5 6 7.5 9.5 4M4 12.5 6 14.5 9.5 11M12 6h5M12 13h5',
  doc:      'M5 3h6l4 4v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 3v4h4',
  chat:     'M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13H8l-4 3z',
  log:      'M4 5h12M4 10h12M4 15h7',
  /* Reuses the shell's nav vocabulary for the header-group headings. */
  sell:     'M3 5h14l-1.5 8.5a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5zM7 17.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0m5 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0',
  parts:    'M10 2.5 17 6.5v7L10 17.5 3 13.5v-7zM10 2.5v15M3 6.5l7 4 7-4',
  insight:  'M4 16V8M8 16V4M12 16v-6M16 16v-9',
};

export function SmartIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name] ?? PATHS.doc} />
    </svg>
  );
}
