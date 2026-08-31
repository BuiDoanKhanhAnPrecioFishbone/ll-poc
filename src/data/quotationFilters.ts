import { CUSTOMER_OPTIONS, type Quotation } from './quotations';
import { MEASURES, ME, isOpen } from './queues';
import type { ViewField } from '../ui/views';
import { priorityLevel } from '../ui/Priority';

/**
 * The Project Requirements filter fields.
 *
 * Read off the live filter toolbar, 25 Aug 2026. Eleven controls, five pickers
 * and three date ranges, with NO operators anywhere — see docs/filter-spec.md.
 *
 * Every non-date field is a PICKER, including "No" and "Project Name": the live
 * placeholders are "Select No" and "Select Project Name", not "Enter". You
 * choose from values that exist rather than typing one that might not, which is
 * why a filter here can never return nothing by typo.
 */
export function quotationFilterFields(rows: Quotation[]): ViewField[] {
  /* Options come from the data actually present, sorted, de-duplicated. A
     picker offering a value no record has is a dead end. */
  const uniq = (xs: string[]) => [...new Set(xs)].filter(Boolean).sort();

  return [
    { field: 'priority', label: 'Priority', kind: 'select',
      options: ['High', 'Medium', 'Low'],
      value: q => priorityLevel(q.priority) },

    { field: 'no', label: 'No', kind: 'select',
      options: uniq(rows.map(q => q.no)),
      value: q => q.no },

    { field: 'projectName', label: 'Project Name', kind: 'select',
      options: uniq(rows.map(q => q.projectName)),
      value: q => q.projectName },

    { field: 'customer', label: 'Customer Name', kind: 'select',
      options: [...CUSTOMER_OPTIONS],
      value: q => q.customer },

    { field: 'status', label: 'Status', kind: 'select',
      options: ['New', 'In-Progress', 'Quoted', 'Completed', 'Cancelled'],
      value: q => q.status },

    /* Three ranges, each an explicit From and To. The live control is two date
       inputs, not an operator plus a value. */
    { field: 'dateNeeded', label: 'Date Needed', kind: 'date-range', value: q => q.dateNeeded },
    { field: 'createdDate', label: 'Created Date', kind: 'date-range', value: q => q.createdDate },
    { field: 'lastUpdated', label: 'Last Updated Date', kind: 'date-range', value: q => q.lastUpdated },
  ];
}

/**
 * Quick filters — the review's other tier: "displays basic filter sets per
 * module", kept alongside the field panel rather than replacing it.
 *
 * These are the questions people bring to this screen daily, and they reuse the
 * My Queues predicates so "overdue" cannot mean two different things on two
 * screens.
 */
export const QUOTATION_QUICK = [
  { key: 'mine', label: `Assigned to ${ME}`, match: (q: Quotation) => q.assignedTo.includes(ME) },
  { key: 'open', label: 'Open only', match: isOpen },
  ...MEASURES
    /* "Unassigned" is dropped from this row: it contradicts "mine", and a chip
       that empties the grid whenever another chip is on is a trap. */
    .filter(m => m.key !== 'unassigned')
    .map(m => ({ key: m.key, label: m.label, match: m.match })),
];
