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
import * as META from './metadata';

export type QuotationStatus = 'New' | 'In-Progress' | 'Quoted' | 'Completed' | 'Cancelled';
export type Application = (typeof import('./metadata').APPLICATION)[number];
export type RfqType = (typeof import('./metadata').RFQ_TYPE)[number];
export type OrderType = (typeof import('./metadata').ORDER_TYPE)[number];

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
  /** A list of quantities, not a count — a textarea in the live system. */
  quantitiesToQuote: string;
  buildRequirement: string;
  testRequirements: string;
  assemblyTurnTime: number;
  excessAndMoq: string;
  netConsignedInventory: string;
  rocketConsignedInventory: string;
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
 * EVERY label this mockup changes, with the original alongside it.
 *
 * This list was eleven entries long. Nine of them were style opinions —
 * sentence case, shorter phrasing, a bare noun expanded into a sentence — and
 * decision D2 reverted every one. Renaming a label a user has already learned
 * costs them a re-learn and buys a tidier screenshot.
 *
 * What stays is the set a reasonable person would call an error rather than a
 * preference: a misspelling, and an acronym mangled past recognition.
 *
 * Verified 22 Aug 2026 against the live screen, field by field. Three fields
 * had gone missing in earlier passes and were restored: Customer Type,
 * Created Date, and BoM File on the Result grid.
 */
export const LABEL_FIXES: { was: string; now: string; why: string }[] = [
  { was: 'Polumeric Required', now: 'Polymeric Required',
    why: 'Misspelling. A word that is not a word is an error under any style, so it is corrected.' },
  { was: 'Provide Alt Aml For Out Stock', now: 'Provide Alt AML For Out of Stock',
    why: 'Two mangled fragments: AML is an acronym (Approved Manufacturer List) and "Out Stock" is missing a word. Title Case and the "Alt" abbreviation are LEFT ALONE — they are the house style, not mistakes.' },
];

/**
 * The customer master, as the live form actually uses it.
 *
 * Verified from the shipped bundle: the RFQ form loads `custMsts { … custType
 * isItar priceMarkup contactInfos { contactName … } }` and drives four things
 * from the row you pick —
 *
 *   custName        → Customer
 *   contactInfos    → the Customer Contact list, filtered to this customer and
 *                     defaulted to its first entry
 *   custType        → Customer Type
 *   isItar          → the ITAR flag
 *   priceMarkup     → Markup, but only while Markup is still unset
 *
 * This mockup had Customer and Customer Contact as free-text inputs, which let a
 * user type a customer that does not exist and a contact who does not work there.
 * See docs/bundle-evidence.md.
 */
export type Customer = {
  code: string;
  name: string;
  /** Display value, `code - name`, which is what the live picker shows. */
  label: string;
  contacts: string[];
  custType: string;
  isItar: boolean;
  priceMarkup: number;
  /** Project names already used by this customer. The live form fetches these. */
  projectNames: string[];
};

export const CUSTOMER_MASTER: Customer[] = [
  { code: '00455', name: 'Cerelogic Systems Inc.', label: '00455 - Cerelogic Systems Inc.',
    contacts: ['Dana Whitfield', 'Marc Oyelaran', 'Priya Raghunathan'],
    custType: 'Turnkey', isItar: false, priceMarkup: 12,
    projectNames: ['Halo Controller', 'Halo Backplane', 'Orion Sensor Board'] },
  { code: '00848', name: 'KT Controls Ltd', label: '00848 - KT Controls Ltd',
    contacts: ['Steven Achebe', 'Lena Brandt'],
    custType: 'Consign', isItar: false, priceMarkup: 9,
    projectNames: ['KT Drive Module', 'KT Panel Interface'] },
  { code: '00378', name: 'Nokia Networks Oy', label: '00378 - Nokia Networks Oy',
    contacts: ['Aino Virtanen', 'Petri Laaksonen', 'Sanna Koskinen'],
    custType: 'Hybrid', isItar: false, priceMarkup: 14,
    projectNames: ['RF Front-end Rev C', 'Baseband Carrier'] },
  { code: '01204', name: 'Meridian Avionics', label: '01204 - Meridian Avionics',
    contacts: ['Ruth Calderon', 'Devon Achterberg'],
    custType: 'Turnkey', isItar: true, priceMarkup: 18,
    projectNames: ['ADS-B Transponder', 'Flight Data Concentrator'] },
  { code: '00912', name: 'Halden Marine AS', label: '00912 - Halden Marine AS',
    contacts: ['Ingrid Solberg'],
    custType: 'TBD', isItar: false, priceMarkup: 11,
    projectNames: ['Bridge Display Unit'] },
  { code: '01455', name: 'Brightpath Medical', label: '01455 - Brightpath Medical',
    contacts: ['Yusuf Adeyemi', 'Carla Menendez'],
    custType: 'Turnkey', isItar: false, priceMarkup: 16,
    projectNames: ['Infusion Pump Main', 'Infusion Pump Sensor'] },
  { code: '00109', name: 'Comtec Industrial', label: '00109 - Comtec Industrial',
    contacts: ['Rob Tanaka', 'Hedy Lindqvist'],
    custType: 'Consign', isItar: false, priceMarkup: 10,
    projectNames: ['Comtec Gateway', 'Comtec IO Expander'] },
];

export const CUSTOMER_OPTIONS = CUSTOMER_MASTER.map(c => c.label);

export const findCustomer = (label: string) =>
  CUSTOMER_MASTER.find(c => c.label === label);

/** The contacts that belong to a customer — the live list is filtered this way. */
export const contactsFor = (label: string) => findCustomer(label)?.contacts ?? [];

const CUSTOMERS = CUSTOMER_OPTIONS;
/** Who can be assigned. Exported so the record can offer the same list. */
export const PEOPLE = ['Toan Dinh', 'Huyen NTN', 'Mai Pham', 'Duc Le', 'Linh Tran'] as const;
const OWNERS = [...PEOPLE];


/* Status is no longer picked freely — it follows the RFQ's age. See the two
   populations in generateQuotations. */





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

    /* Two populations, because an ERP holds both and they behave differently.
       An earlier version generated only the second, which made every RFQ in the
       system land in a two-month window — fine for a queue, but it turned the
       twelve-month chart on Home into nine empty columns and three tall ones,
       which reads as a broken chart rather than a quiet year.

       RFQ numbers descend with `i`, so the newest work must come first: the
       first fifth is live, the rest is history.

       1. LIVE (first 20%) — open work. Due dates cluster around today, with
          roughly 15% already overdue. Deriving the due date from the creation
          date instead put 71% of the queue overdue, a distribution no estimator
          would recognise.
       2. HISTORICAL (the rest) — closed work spread across the preceding year.
          Due date follows creation by a normal quoting turnaround, and the
          status is a closed one, because an RFQ raised eight months ago that is
          still "New" would be a data problem, not a backlog. */
    const live = i < Math.floor(count * 0.2);

    let needed: Date;
    let created: Date;
    let status: QuotationStatus;

    if (live) {
      const overdue = rnd() < 0.15;
      const dueOffset = overdue ? -(1 + Math.floor(rnd() * 10)) : Math.floor(rnd() * 45);
      needed = new Date(2026, 7, 19 + dueOffset);
      /* Never in the future: deriving creation naively from the due date put 26%
         of the queue on a creation date that had not happened yet, with
         activity-log entries to match. */
      const naiveCreated = needed.getTime() - (5 + Math.floor(rnd() * 50)) * 86400000;
      created = new Date(Math.min(naiveCreated, TODAY.getTime() - 86400000));
      status = rnd() < 0.45 ? 'New' : 'In-Progress';
    } else {
      /* 30 to 365 days back, so the year fills without spilling into the live
         window and double-counting the current month. */
      const age = 30 + Math.floor(rnd() * 335);
      created = new Date(TODAY.getTime() - age * 86400000);
      needed = new Date(created.getTime() + (10 + Math.floor(rnd() * 40)) * 86400000);
      status = rnd() < 0.28 ? 'Quoted' : rnd() < 0.82 ? 'Completed' : 'Cancelled';
    }

    /* Working-hours time, so the activity log reads like a log rather than a
       column of midnights. */
    created.setHours(8 + Math.floor(rnd() * 9), Math.floor(rnd() * 60), 0, 0);
    out.push({
      id: `rfq-${i + 1}`,
      no: String(358 - i).padStart(10, '0'),
      priority: 1 + Math.floor(rnd() * 3),
      /* Either a project this customer already runs, or a new assembly number.
         The live form offers the customer's existing `projectNames` and lets you
         type a new one, so both shapes are real. */
      projectName: rnd() > 0.45
        ? pick(findCustomer(cust)!.projectNames)
        : `${cust.slice(0, 5)}-${100 + Math.floor(rnd() * 800)}-${1000 + Math.floor(rnd() * 8000)}-01-F`,
      customer: cust,
      /* A real contact belonging to THIS customer, the way the live form
         populates it — not a name sliced out of the company string. */
      customerContact: pick(findCustomer(cust)!.contacts),
      application: pick(META.APPLICATION),
      rfqType: pick(META.RFQ_TYPE),
      orderType: pick(META.ORDER_TYPE),
      status,
      assignedTo: pick(OWNERS),
      dateNeeded: needed,
      createdDate: created,
      lastUpdated: new Date(Math.min(created.getTime() + Math.floor(rnd() * 20) * 86400000, TODAY.getTime())),
      projectType: pick(META.PROJECT_TYPE),
      /* Derived from the customer record on the live form, not picked freely. */
      customerType: findCustomer(cust)!.custType,
      historicalRfq: rnd() > 0.75 ? String(300 - Math.floor(rnd() * 200)).padStart(10, '0') : '',
      /* ITAR follows the customer's `isItar` flag on the live form. */
      itar: findCustomer(cust)!.isItar,
      quoteFocus: pick(META.QUOTE_FOCUS),
      materialPackageType: pick(META.MATERIAL_PACKAGE_TYPE),
      markup: 10 + Math.floor(rnd() * 20),
      leadTimeDays: 10 + Math.floor(rnd() * 30),
      quantitiesToQuote: pick(['100', '250, 500', '1, 10, 100', '50, 100, 250, 500']),
      buildRequirement: pick(META.APPLICATION),
      testRequirements: pick(META.TEST_REQUIREMENTS),
      assemblyTurnTime: 5 + Math.floor(rnd() * 20),
      excessAndMoq: pick(META.EXCESS_AND_MOQ),
      netConsignedInventory: pick(META.NET_CONSIGNED_INVENTORY),
      rocketConsignedInventory: pick(META.ROCKET_CONSIGNED_INVENTORY),
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
