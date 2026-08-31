import { daysUntil, type Quotation } from './quotations';

/**
 * The four queue measures, defined ONCE.
 *
 * Both the queues page and the Quotations list use these. Re-implementing the
 * filter on the list is the bug where a tile reads "4 overdue", you click it,
 * and the list shows six — with nothing on screen to say which number is wrong.
 * One predicate, imported twice, cannot disagree with itself.
 */

/** The signed-in user in this mockup. */
export const ME = 'Huyen NTN';

/** Open means the work is still live. A late RFQ nobody can act on is not late. */
export const isOpen = (q: Quotation) => q.status === 'New' || q.status === 'In-Progress';

export type QueueKey = 'overdue' | 'due-week' | 'unassigned' | 'waiting-doc';

export type Measure = {
  key: QueueKey;
  label: string;
  /** What the number means, in the words someone would use out loud. */
  meaning: string;
  tone: 'overdue' | 'soon' | 'open' | 'waiting';
  match: (q: Quotation) => boolean;
};

export const MEASURES: Measure[] = [
  {
    key: 'overdue', label: 'Overdue', tone: 'overdue',
    meaning: 'Past the due date and still open',
    /* Decision D5. An RFQ carries only Due Date and Created Date — there is no
       SLA field on the record — so "overdue" can only mean past Due Date. The
       status test is what stops a completed RFQ being reported late forever. */
    match: q => isOpen(q) && daysUntil(q.dateNeeded) < 0,
  },
  {
    key: 'due-week', label: 'Due this week', tone: 'soon',
    meaning: 'Due within the next seven days',
    match: q => { const d = daysUntil(q.dateNeeded); return isOpen(q) && d >= 0 && d <= 7; },
  },
  {
    key: 'unassigned', label: 'Unassigned', tone: 'open',
    meaning: 'Open, with nobody carrying it',
    match: q => isOpen(q) && q.assignedTo.length === 0,
  },
  {
    key: 'waiting-doc', label: 'Waiting on a document', tone: 'waiting',
    meaning: 'A checklist task is started but its document has not arrived',
    /* A task that applies, has been picked up, and still has no file. Tasks left
       at "To do" are not waiting on anything — they have not begun. */
    match: q => isOpen(q) && q.tasks.some(t => t.status === 'In progress' && !t.documentName),
  },
];

export const measureFor = (key: string | null) =>
  MEASURES.find(m => m.key === key);

/** Mine narrows to the signed-in user; Team is everyone. */
export const scopeFilter = (scope: string | null) =>
  scope === 'team' ? () => true : (q: Quotation) => q.assignedTo.includes(ME);
