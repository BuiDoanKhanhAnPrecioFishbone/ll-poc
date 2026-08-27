import type { Quotation } from '../../data/quotations';
import { Icon } from '../../ui/icons';

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


/**
 * The smart-button glyph.
 *
 * A thin wrapper over the one shared icon set rather than a second map — this
 * file used to carry its own, which duplicated six paths and silently drew a
 * document for any name it lacked.
 */
export function SmartIcon({ name }: { name: string }) {
  return <Icon name={name} size={15} />;
}
