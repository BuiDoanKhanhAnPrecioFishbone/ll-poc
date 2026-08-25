import { PEOPLE, type Quotation } from './quotations';
import {
  PROJECT_TYPE, ORDER_TYPE, RFQ_TYPE, CUSTOMER_TYPE, APPLICATION, QUOTE_FOCUS,
} from './metadata';
import { CUSTOMER_OPTIONS } from './quotations';
import { MEASURES, ME, isOpen } from './queues';
import type { FilterField, QuickFilter } from '../ui/filters';
import { priorityLevel } from '../ui/Priority';

/**
 * Quotations: the quick set, and the fields the advanced filter can reach.
 *
 * The quick set is the questions people bring to this screen every day. The
 * four queue measures are here too, so the same question asked from My Queues
 * and from the list gets the same answer — they import one predicate rather
 * than defining "overdue" twice.
 */
export const QUOTATION_QUICK: QuickFilter<Quotation>[] = [
  { key: 'mine', label: `Assigned to ${ME}`, match: q => q.assignedTo === ME },
  { key: 'open', label: 'Open only', match: isOpen },
  ...MEASURES
    /* "Unassigned" is dropped from the quick row: it contradicts "mine", and a
       chip that empties the grid whenever another chip is on is a trap. It stays
       reachable from My Queues and from the advanced filter. */
    .filter(m => m.key !== 'unassigned')
    .map(m => ({ key: m.key, label: m.label, match: m.match })),
];

/**
 * Every field the advanced filter can reach — including ones that are not
 * columns on this grid. That is the point of the tier: "cases where users want
 * to access additional fields of a transaction/record".
 */
export const QUOTATION_FILTER_FIELDS: FilterField<Quotation>[] = [
  { field: 'no', label: 'RFQ No', type: 'text', value: q => `RFQ${q.no}` },
  { field: 'projectName', label: 'Project', type: 'text', value: q => q.projectName },
  { field: 'customer', label: 'Customer', type: 'select', options: CUSTOMER_OPTIONS, value: q => q.customer },
  { field: 'customerContact', label: 'Customer Contact', type: 'text', value: q => q.customerContact },
  { field: 'status', label: 'Status', type: 'select',
    options: ['New', 'In-Progress', 'Quoted', 'Completed', 'Cancelled'], value: q => q.status },
  { field: 'assignedTo', label: 'Assigned To', type: 'select', options: PEOPLE, value: q => q.assignedTo },
  { field: 'priority', label: 'Priority', type: 'select',
    options: ['High', 'Medium', 'Low'], value: q => priorityLevel(q.priority) },
  { field: 'dateNeeded', label: 'Due Date', type: 'date', value: q => q.dateNeeded },
  { field: 'createdDate', label: 'Created Date', type: 'date', value: q => q.createdDate },
  { field: 'projectType', label: 'Project Type', type: 'select', options: PROJECT_TYPE, value: q => q.projectType },
  { field: 'orderType', label: 'Order Type', type: 'select', options: ORDER_TYPE, value: q => q.orderType },
  { field: 'rfqType', label: 'RFQ Type', type: 'select', options: RFQ_TYPE, value: q => q.rfqType },
  { field: 'customerType', label: 'Customer Type', type: 'select', options: CUSTOMER_TYPE, value: q => q.customerType },
  { field: 'application', label: 'Application', type: 'select', options: APPLICATION, value: q => q.application },
  /* Below here are fields the grid never shows. They are why the advanced tier
     exists — "which RFQs did we quote at under 12% markup" is a real question
     and the list has no column for it. */
  { field: 'quoteFocus', label: 'Quote Focus', type: 'select', options: QUOTE_FOCUS, value: q => q.quoteFocus },
  { field: 'markup', label: 'Markup %', type: 'number', value: q => q.markup },
  { field: 'leadTimeDays', label: 'Acceptable LeadTime In Day', type: 'number', value: q => q.leadTimeDays },
  { field: 'itar', label: 'ITAR', type: 'boolean', value: q => q.itar },
  { field: 'historicalRfq', label: 'Historical RFQ', type: 'text', value: q => q.historicalRfq },
  { field: 'internalNotes', label: 'Internal Notes', type: 'text', value: q => q.internalNotes },
];
