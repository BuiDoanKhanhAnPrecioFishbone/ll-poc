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
  /**
   * The tab this button navigates to, when the destination is on this page.
   *
   * Every one of these buttons used to end at a `notImplemented` toast — under
   * a comment promising each one "always GOES somewhere". Five of the six had
   * somewhere to go all along: their COUNT is read from the same array the tab
   * renders, which is as close to proof of a destination as this app offers.
   *
   * `undefined` means the destination genuinely does not exist yet, and the
   * toast is still the honest answer. See docs/stub-audit.md.
   */
  tab?: string;
};

export function smartButtonsFor(q: Quotation): SmartButton[] {
  return [
    /* The customer is one record, not a collection, so it takes no count —
       showing "1 Customer" would imply there could be more.

       The ONE button with no tab: this prototype has no customer record screen,
       and inventing a destination for a navigation button is worse than
       admitting it has none. */
    { icon: 'customer', label: 'Customer', plural: 'Customer', count: null },
    { icon: 'quote', label: 'Quote version', plural: 'Quote versions', count: q.results.length,
      tab: 'result' },
    { icon: 'task', label: 'Checklist task', plural: 'Checklist tasks', count: q.tasks.length,
      tab: 'checklists' },
    /* No Documents tab exists, and the document IS the Checklists tab's Document
       column — which is where someone who pressed "3 Documents" has to end up
       regardless. The count is the same set of rows. */
    { icon: 'doc', label: 'Document', plural: 'Documents',
      count: q.tasks.filter(t => t.documentName).length, tab: 'checklists' },
    { icon: 'chat', label: 'Conversation', plural: 'Conversations', count: q.comments.length,
      tab: 'conversations' },
    /* "Activity log" is the name of the TAB, not the plural of an entry, so it
       cannot go here — the row renders `${count} ${plural}` and printed the
       ungrammatical "2 Activity log". */
    { icon: 'log', label: 'Activity entry', plural: 'Activity entries', count: q.activity.length,
      tab: 'activity' },
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
