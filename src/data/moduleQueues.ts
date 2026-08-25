import { generateQuotations, TODAY } from './quotations';
import { MEASURES, ME, type Measure } from './queues';
import type { Quotation } from './quotations';
import { can, type Role } from './permissions';

/**
 * Queues, grouped by the module they belong to.
 *
 * The 25 Aug review: "an ERP/EMS system will have many modules, and when
 * linking to them we should clearly separate which module the action belongs
 * to, so that users accessing it will find it more logical. Otherwise, if it's
 * just Project Requirement, it will be a bit lacking."
 *
 * So a queue is no longer a bare count. It carries the module it came from and
 * the screen it opens, and the page groups by module — which also means the
 * same word can mean different things in different places without confusing
 * anyone: "Overdue" under Procurement is a late purchase order, "Overdue" under
 * Sales Management is a late RFQ, and the heading says which.
 *
 * WHAT IS REAL HERE. Only the Project Requirements queues are computed from an
 * actual record set — the 330 generated RFQs, using the same predicates the
 * Quotations list filters with. Every other module's counts are ILLUSTRATIVE:
 * those record types are not modelled in this prototype, and the page says so
 * rather than presenting invented numbers as measured ones.
 */

export type ModuleQueue = {
  key: string;
  label: string;
  meaning: string;
  tone: 'overdue' | 'soon' | 'open' | 'waiting';
  count: number;
  /** Where the tile goes. Always a real screen. */
  href: string;
  /** False when the number is illustrative rather than computed. */
  measured: boolean;
};

export type QueueModule = {
  /** The live menu group this belongs to — the words the user already knows. */
  module: string;
  /** The screen inside it. */
  screen: string;
  /** Menu path, which is also what the permission check runs against. */
  path: string;
  icon: string;
  queues: ModuleQueue[];
};

/** Deterministic, so a reviewer sees the same figures on every load. */
function seeded(n: number, salt: number) {
  const x = Math.sin(n * 12.9898 + salt * 78.233) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * 12);
}

function rfqQueues(rows: Quotation[], scope: 'mine' | 'team'): ModuleQueue[] {
  const inScope = scope === 'mine' ? rows.filter(q => q.assignedTo === ME) : rows;
  return MEASURES.map((m: Measure) => ({
    key: m.key,
    label: m.label,
    meaning: m.meaning,
    tone: m.tone,
    count: inScope.filter(m.match).length,
    href: `/sales-management/quotation?queue=${m.key}&scope=${scope}`,
    measured: true,
  }));
}

/** Shapes an illustrative module's queues without pretending they are counted. */
function stub(path: string, salt: number, defs: [string, string, string, ModuleQueue['tone']][], scope: 'mine' | 'team'): ModuleQueue[] {
  return defs.map(([key, label, meaning, tone], i) => ({
    key, label, meaning, tone,
    /* Team is a superset of Mine, so its numbers must be larger — a stub that
       shrank when you widened the scope would read as a bug. */
    count: seeded(salt + i, scope === 'team' ? 3 : 1) * (scope === 'team' ? 3 : 1),
    href: path,
    measured: false,
  }));
}

export function moduleQueues(role: Role, scope: 'mine' | 'team'): QueueModule[] {
  const rows = generateQuotations(330);

  const all: QueueModule[] = [
    {
      module: 'Sales Management', screen: 'Project Requirements',
      path: '/sales-management/quotation', icon: 'quote',
      queues: rfqQueues(rows, scope),
    },
    {
      module: 'Sales Management', screen: 'Sales Orders',
      path: '/sales-management/so-mst', icon: 'order',
      queues: stub('/sales-management/so-mst', 11, [
        ['ship-week', 'Shipping this week', 'Promised inside seven days', 'soon'],
        ['past-promise', 'Past promise date', 'Committed date has passed', 'overdue'],
      ], scope),
    },
    {
      module: 'Procurement Management', screen: 'Purchase Orders',
      path: '/sales-management/po-mst', icon: 'buy',
      queues: stub('/sales-management/po-mst', 23, [
        ['unack', 'Awaiting acknowledgement', 'Sent to the supplier, not yet confirmed', 'waiting'],
        ['late-delivery', 'Late delivery', 'Past the supplier commit date', 'overdue'],
      ], scope),
    },
    {
      module: 'Procurement Management', screen: 'Purchase Requisition',
      path: '/procurement/purchase-order-lines', icon: 'requisition',
      queues: stub('/procurement/purchase-order-lines', 31, [
        ['to-approve', 'Waiting on approval', 'Raised, not yet released to a PO', 'open'],
      ], scope),
    },
    {
      module: 'Production', screen: 'Work Orders',
      path: '/sales-management/work-orders', icon: 'make',
      queues: stub('/sales-management/work-orders', 41, [
        ['short', 'Short of material', 'Released but a part is not on hand', 'overdue'],
        ['due-week', 'Due this week', 'Scheduled to finish inside seven days', 'soon'],
      ], scope),
    },
    {
      module: 'Accounting', screen: 'Customer Invoices',
      path: '/accounting/customer-invoices', icon: 'invoice',
      queues: stub('/accounting/customer-invoices', 53, [
        ['unpaid', 'Overdue payment', 'Past the payment terms', 'overdue'],
      ], scope),
    },
  ];

  /* The permission filter. A module the role cannot open must not appear as a
     queue either — a count you are told about and then cannot act on is worse
     than not being told. */
  return all.filter(m => can(role, m.path));
}

/** For the header badge: what is late, across every module this role can see. */
export function overdueFor(role: Role, scope: 'mine' | 'team' = 'mine') {
  return moduleQueues(role, scope)
    .flatMap(m => m.queues)
    .filter(q => q.tone === 'overdue')
    .reduce((n, q) => n + q.count, 0);
}

export { TODAY };
