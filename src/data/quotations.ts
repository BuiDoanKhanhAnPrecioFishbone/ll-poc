/* =============================================================================
   QUOTATIONS (RFQ)
   -----------------------------------------------------------------------------
   Field names, enumerations and value distributions are taken from the live
   screen at /sales-management/quotation, read on 19 Aug 2026. Customer names
   and numbers are synthetic; nothing here is production data.

   Observed enumerations, verbatim:
     STATUS       New · In-Progress · Quoted · Completed   (+ Cancelled, seen on
                  the dashboard chart legend but not in the first 20 rows)
     APPLICATION  System · PCBA · Sub-assy Box Build
     RFQ TYPE     Consigned · Turnkey · Mixed
     ORDER TYPE   New · Repeat
     PRIORITY     a 3-star Kendo Rating, editable inline in the grid
   ========================================================================== */

import type { ColumnSpec } from '../components/column-model';

export type QuotationStatus = 'New' | 'In-Progress' | 'Quoted' | 'Completed' | 'Cancelled';
export type Application = 'System' | 'PCBA' | 'Sub-assy Box Build';
export type RfqType = 'Consigned' | 'Turnkey' | 'Mixed';
export type OrderType = 'New' | 'Repeat';

export type Quotation = {
  id: string;
  no: string;
  priority: number;          // 1–3, the live Rating's scale
  projectName: string;
  customer: string;
  customerContact: string;
  application: Application;
  rfqType: RfqType;
  orderType: OrderType;
  status: QuotationStatus;
  assignedTo: string;
  dateNeeded: Date;
  createdDate: Date;
  lastUpdated: Date;

  /* Header fields visible on the detail screen */
  projectType: string;
  customerType: string;
  historicalRfq: string;
  itar: boolean;

  /* "Specific Requirements" tab */
  quoteFocus: string;
  materialPackageType: string;
  markup: number;
  leadTimeDays: number;
  quantitiesToQuote: number;
  buildRequirement: string;
  testRequirements: string;
  assemblyTurnTime: number;
  excessAndMoq: 'None' | 'Low' | 'OK';
  netConsignedInventory: 'No' | 'Yes-No Charge';
  rocketConsignedInventory: 'No' | 'Yes-No Charge' | 'Yes-Charge';
  conformalCoating: boolean;
  provideAlternateAml: boolean;
  broker: boolean;
  customerNotes: string;
  internalNotes: string;

  /* --- Checklists & Assignment tab -------------------------------------- */
  programManager: string;
  buyer: string;
  engineer: string;
  /** Which checklist items apply to this RFQ. Each selected one becomes a task. */
  tasks: ChecklistTask[];

  /* --- Quotation Result tab --------------------------------------------- */
  results: QuoteResult[];

  /* --- Conversations tab ------------------------------------------------- */
  comments: Comment[];

  /* --- Activity Logs tab -------------------------------------------------- */
  activity: ActivityEntry[];
};

/**
 * A checklist item that has been SELECTED becomes a task with its own state.
 *
 * Verified against the live system on 22 Aug 2026: the ticked checklist items
 * are exactly the rows of the grid beside them. Ticking "Assembly Drive" adds
 * an "Assembly Drive" task; the grid then carries its document, assignee and
 * status. The tick means "this applies to this RFQ", NOT "this is finished".
 *
 * This mockup previously modelled them as two unrelated things — a checklist of
 * done/not-done, and a separate list of documents — and reported progress as
 * "3 of 5 done", which measured something the system does not track.
 */
export type TaskStatus = 'To do' | 'In progress' | 'Done';

export type ChecklistTask = {
  /** The checklist item this task came from. */
  type: string;
  documentName: string;
  uploadedBy: string;
  uploadedDate: Date | null;
  assignee: string;
  status: TaskStatus;
};


export type QuoteResult = {
  id: string;
  partNumber: string;
  partRev: string;
  description: string;
  buildQty: number;
  costPerBoard: number;
  totalAmount: number;
  totalWithMarkup: number;
  lastRunBy: string;
  lastRunDate: Date;
  lastRunVersion: string;
  bomFile: string;
};

export type Comment = {
  id: string;
  author: string;
  initials: string;
  at: Date;
  body: string;
  emailed: boolean;
};

export type ActivityEntry = {
  id: string;
  author: string;
  initials: string;
  at: Date;
  action: 'Create' | 'Update' | 'Status';
  summary: string;
  changes?: { field: string; from: string; to: string }[];
};

/* Checklist item names are verbatim from the live screen, including the
   misspelling of "Polumeric" — corrected here to "Polymeric" and recorded as a
   content fix, not silently changed. See LABEL_FIXES below. */
export const PROGRAM_CHECKLIST = [
  'Assembly Drive', 'BoM Scrub', 'FAB Drive', 'Polymeric Required', 'Quoting Report',
] as const;

export const ENGINEERING_CHECKLIST = [
  'DFM Report', 'Document validation', 'Engineer Test', 'SMT', 'Tooling/Stencil Review',
] as const;

/**
 * EVERY label this mockup renames, with the original alongside it.
 *
 * The point is that no field is quietly changed: a reviewer can read this list
 * and check each decision. Renames are for readability only — no field was
 * dropped, merged or repurposed.
 *
 * Verified 22 Aug 2026 against the live screen, field by field. Three fields
 * had gone missing in earlier passes and were restored: Customer Type,
 * Created Date, and BoM File on the Result grid.
 */
export const LABEL_FIXES: { was: string; now: string; why: string }[] = [
  { was: 'Item Ant Quantities To Quote', now: 'Quantities to quote',
    why: '"Ant" is not a word in this context; the field holds a count of quantities.' },
  { was: 'Provide Alt Aml For Out Stock', now: 'Provide alternate AML for out-of-stock',
    why: 'AML is Approved Manufacturer List; the original drops articles and mis-cases the acronym.' },
  { was: 'Acceptable LeadTime In Day', now: 'Acceptable lead time (days)',
    why: 'camelCase in a UI label, and the unit belongs in parentheses, not the noun.' },
  { was: 'Polumeric Required', now: 'Polymeric Required',
    why: 'Misspelling.' },
  { was: 'Historical RFQ', now: 'Previous RFQ',
    why: '"Historical" reads as an archive; the field holds the single RFQ this one re-quotes.' },
  { was: 'Due Date', now: 'Date needed',
    why: 'Matches the column heading already used on the list, so one date has one name.' },
  { was: 'Material Package Type', now: 'Material packaging',
    why: '"Package Type" is two nouns doing one job.' },
  { was: 'Customer specific needs', now: 'Customer notes',
    why: 'Pairs with "Internal notes"; the original two labels did not read as a pair.' },
  { was: 'Broker', now: 'Broker sourcing permitted',
    why: 'A bare noun as a checkbox label does not say what ticking it does.' },
  { was: 'Customer Type', now: 'Customer type',
    why: 'Case only. KEPT SEPARATE from RFQ type: the live system carries both, holding the same three values. Whether they are one field duplicated or two distinct ones is a question for the business, not something to resolve by guessing.' },
  { was: 'Rocket Consigned Inventory', now: 'Rocket consigned inventory',
    why: 'Case only. UNRESOLVED — "Rocket" may be a customer, a system or a typo. Left as-is pending an answer rather than guessed.' },
];

const CUSTOMERS = [
  '00455 - Cerelogic Systems Inc.', '00848 - KT Controls Ltd', '00378 - Nokia Networks Oy',
  '01204 - Meridian Avionics', '00912 - Halden Marine AS', '01455 - Brightpath Medical',
  '00109 - Comtec Industrial',
];
/** Who can be assigned. Exported so the record can offer the same list. */
export const PEOPLE = ['Toan Dinh', 'Huyen NTN', 'Mai Pham', 'Duc Le', 'Linh Tran'] as const;
const OWNERS = [...PEOPLE];
const APPLICATIONS: Application[] = ['System', 'PCBA', 'PCBA', 'Sub-assy Box Build'];
const RFQ_TYPES: RfqType[] = ['Consigned', 'Consigned', 'Turnkey', 'Mixed'];
const STATUSES: QuotationStatus[] = ['New', 'New', 'In-Progress', 'Quoted', 'Quoted', 'Completed', 'Cancelled'];
const QUOTE_FOCUS = ['Stock-High cost', 'Lead time', 'Lowest cost', 'Balanced'];
const PACKAGING = ['Cut Tape', 'Full Reel', 'Tube', 'Tray'];
const BUILD_REQ = ['System', 'PCBA only', 'Box build', 'Turnkey assembly'];
const PROJECT_TYPES = ['Production', 'Prototype', 'NPI', 'Re-quote'];

/** The mockup's "now". One constant, so dates cannot disagree between screens. */
export const TODAY = new Date(2026, 7, 19);
const TASK_STATUSES: TaskStatus[] = ['To do', 'To do', 'In progress', 'Done'];
const RESULT_DESC = [
  'Main controller assembly', 'Power distribution board', 'Sensor interface PCBA',
  'Backplane assembly', 'RF front-end module',
];
const COMMENT_BODIES = [
  'Customer confirmed the build quantity — proceeding with 250.',
  'Second-source pricing came back 12% lower; re-running the quote.',
  'Waiting on the fab drawing before the DFM report can be closed.',
  'Attrition set for the 0402 passives, BoM scrub complete.',
];

/** Same date, a stated hour — so timelines don't render as a column of 00:00. */
function withHour(d: Date, h: number) {
  const c = new Date(d); c.setHours(h, (h * 7) % 60, 0, 0); return c;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateQuotations(count = 330): Quotation[] {
  const rnd = mulberry32(20260819);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
  const out: Quotation[] = [];
  for (let i = 0; i < count; i++) {
    const cust = pick(CUSTOMERS);
    /* Due dates are spread around "today" so the queue looks like a real one:
       roughly 15% overdue, the rest ahead. An earlier version derived the due
       date from the created date, which put 71% of the queue overdue — a
       distribution no estimator would recognise. */
    const overdue = rnd() < 0.15;
    const dueOffset = overdue ? -(1 + Math.floor(rnd() * 10)) : Math.floor(rnd() * 45);
    const needed = new Date(2026, 7, 19 + dueOffset);
    /* Created is derived backwards from the due date, but must never land in the
       future: deriving it naively put 26% of the queue on a creation date that
       had not happened yet, with activity-log entries to match. Clamped to at
       most yesterday, and given a working-hours time so the log reads like a
       log rather than a row of midnights. */
    const naiveCreated = needed.getTime() - (5 + Math.floor(rnd() * 50)) * 86400000;
    const latestAllowed = TODAY.getTime() - 86400000;
    const created = new Date(Math.min(naiveCreated, latestAllowed));
    created.setHours(8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60), 0, 0);
    const status = pick(STATUSES);
    out.push({
      id: `rfq-${i + 1}`,
      no: String(358 - i).padStart(10, '0'),
      priority: 1 + Math.floor(rnd() * 3),
      projectName: rnd() > 0.5
        ? `${cust.slice(0, 5)}-${100 + Math.floor(rnd() * 800)}-${1000 + Math.floor(rnd() * 8000)}-01-F`
        : `TuLinh${300 + Math.floor(rnd() * 60)}`,
      customer: cust,
      customerContact: cust.split(' - ')[1].split(' ')[0],
      application: pick(APPLICATIONS),
      rfqType: pick(RFQ_TYPES),
      orderType: rnd() > 0.65 ? 'Repeat' : 'New',
      status,
      assignedTo: pick(OWNERS),
      dateNeeded: needed,
      createdDate: created,
      lastUpdated: new Date(Math.min(created.getTime() + Math.floor(rnd() * 20) * 86400000, TODAY.getTime())),
      projectType: pick(PROJECT_TYPES),
      customerType: pick(RFQ_TYPES),
      historicalRfq: rnd() > 0.75 ? String(300 - Math.floor(rnd() * 200)).padStart(10, '0') : '',
      itar: rnd() > 0.85,
      quoteFocus: pick(QUOTE_FOCUS),
      materialPackageType: pick(PACKAGING),
      markup: 10 + Math.floor(rnd() * 20),
      leadTimeDays: 10 + Math.floor(rnd() * 30),
      quantitiesToQuote: pick([1, 5, 10, 25, 50, 100]),
      buildRequirement: pick(BUILD_REQ),
      testRequirements: rnd() > 0.6 ? 'ICT + Functional' : 'NA',
      assemblyTurnTime: 5 + Math.floor(rnd() * 20),
      excessAndMoq: pick(['None', 'Low', 'OK'] as const),
      netConsignedInventory: pick(['No', 'Yes-No Charge'] as const),
      rocketConsignedInventory: pick(['No', 'Yes-No Charge', 'Yes-Charge'] as const),
      conformalCoating: rnd() > 0.7,
      provideAlternateAml: rnd() > 0.5,
      broker: rnd() > 0.8,
      customerNotes: rnd() > 0.6 ? 'Customer requires RoHS documentation with the quote.' : '',
      internalNotes: rnd() > 0.7 ? 'Awaiting pricing from second-source supplier.' : '',
      programManager: pick(OWNERS),
      buyer: pick(OWNERS),
      engineer: rnd() > 0.3 ? pick(OWNERS) : '',
      /* A handful of the checklist items are selected; each is a task. */
      tasks: [...PROGRAM_CHECKLIST, ...ENGINEERING_CHECKLIST]
        .filter(() => rnd() > 0.62)
        .map((type, j) => {
          const status = pick(TASK_STATUSES);
          const hasDoc = status !== 'To do' && rnd() > 0.35;
          return {
            type,
            documentName: hasDoc ? `${type.replace(/[^A-Za-z]+/g, '-')}-${cust.slice(0, 5)}.xlsx` : '',
            uploadedBy: hasDoc ? pick(OWNERS) : '',
            uploadedDate: hasDoc ? withHour(new Date(created.getTime() + (j + 1) * 86400000), 10 + j) : null,
            assignee: pick(OWNERS),
            status,
          };
        }),
      /* Only quoted/completed RFQs have results — a New one has never been run. */
      results: (status === 'Quoted' || status === 'Completed')
        ? Array.from({ length: 1 + Math.floor(rnd() * 3) }, (_, j) => {
            const qty = pick([25, 50, 100, 250, 500]);
            const cpb = Math.round(rnd() * 18000) / 100 + 12;
            const markup = 10 + Math.floor(rnd() * 20);
            return {
              id: `res-${i}-${j}`,
              partNumber: `${cust.slice(0, 5)}-${100 + Math.floor(rnd() * 800)}-${1000 + Math.floor(rnd() * 8000)}`,
              partRev: String.fromCharCode(65 + Math.floor(rnd() * 4)),
              description: pick(RESULT_DESC),
              buildQty: qty,
              costPerBoard: cpb,
              totalAmount: Math.round(cpb * qty * 100) / 100,
              totalWithMarkup: Math.round(cpb * qty * (1 + markup / 100) * 100) / 100,
              lastRunBy: pick(OWNERS),
              lastRunDate: new Date(created.getTime() + 86400000 * (2 + j)),
              lastRunVersion: `v${1 + j}`,
              bomFile: `BOM-${cust.slice(0, 5)}-v${1 + j}.xlsx`,
            };
          })
        : [],
      comments: Array.from({ length: Math.floor(rnd() * 3) }, (_, j) => {
        const who = pick(OWNERS);
        return {
          id: `cm-${i}-${j}`,
          author: who,
          initials: who.split(' ').map(w => w[0]).join('').slice(0, 2),
          at: withHour(new Date(created.getTime() + 86400000 * (1 + j)), 9 + j * 3),
          body: pick(COMMENT_BODIES),
          emailed: rnd() > 0.6,
        };
      }),
      activity: (() => {
        const who = pick(OWNERS);
        const init = who.split(' ').map(w => w[0]).join('').slice(0, 2);
        const log: ActivityEntry[] = [{
          id: `ac-${i}-0`, author: who, initials: init, at: created,
          action: 'Create', summary: 'RFQ was created',
        }];
        if (status !== 'New') {
          log.unshift({
            id: `ac-${i}-1`, author: who, initials: init,
            at: withHour(new Date(created.getTime() + 86400000), 14),
            action: 'Status', summary: `Status changed to ${status}`,
            changes: [{ field: 'Status', from: 'New', to: status }],
          });
        }
        return log;
      })(),
    });
  }
  return out;
}

/* -----------------------------------------------------------------------------
   COLUMN SPEC

   Ordered by what an estimator working a queue needs first: how urgent, which
   RFQ, whose customer, what state, when it is due. The live screen leads with a
   60px eye-icon column and puts Date Needed ninth.
   -------------------------------------------------------------------------- */

export const QUOTATION_COLUMNS: ColumnSpec<Quotation>[] = [
  { field: 'priority', title: 'Priority', role: 'rating', priority: 2 },
  { field: 'no', title: 'RFQ No', role: 'ident', searchable: true, width: 150,
    widthNote: 'RFQ numbers are a fixed 10 digits; the 240px ident default was sized for part numbers and wastes 90px here.' },
  { field: 'projectName', title: 'Project', role: 'text', searchable: true, width: 220, priority: 1,
    widthNote: 'Project names observed run to ~22 characters; 280px over-reserves.' },
  { field: 'customer', title: 'Customer', role: 'text', searchable: true, priority: 2 },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'dateNeeded', title: 'Date Needed', role: 'date' },
  { field: 'assignedTo', title: 'Assigned To', role: 'code', width: 140, priority: 3,
    widthNote: 'Holds full names, not an enum; 96px clips every value.' },
  { field: 'application', title: 'Application', role: 'code', width: 150, priority: 3,
    widthNote: 'Longest member is "Sub-assy Box Build" — the 96px role default clips it.' },
  { field: 'rfqType', title: 'RFQ Type', role: 'code', priority: 3 },
  { field: 'orderType', title: 'Order Type', role: 'code', priority: 3 },
  { field: 'createdDate', title: 'Created', role: 'date', hiddenByDefault: true,
    note: 'Rarely used when working a queue; Date Needed is the operative date' },
  { field: 'lastUpdated', title: 'Last Updated', role: 'date', hiddenByDefault: true,
    note: 'Audit field — available, but not what an estimator sorts by' },
];

/** Days until the RFQ is due. Negative is overdue. */
export function daysUntil(d: Date, today = TODAY): number {
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
