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
import { createdQuotations } from './createdQuotations';
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
  /**
   * Assignees. PLURAL, because the live control is a MultiSelect — An's
   * screenshot of 31 Aug 2026, confirmed in the bundle. The Testing Guideline
   * lists Assigned To only among the required fields and never says single or
   * multiple, so the live system governs per docs/precedence.md tier 2.
   *
   * Empty means unassigned, which the Unassigned queue depends on.
   */
  assignedTo: string[];
  dateNeeded: Date;
  createdDate: Date;
  lastUpdated: Date;

  /**
   * Created for a customer who was not yet in Customer Management.
   *
   * Set by the create modal's "New Customer?" tick and kept on the record,
   * because the guideline gives it two consequences that outlive creation: a
   * "New Customer" status at the top right of the RFQ screen, and an Add
   * Contact button under the Customer field.
   */
  newCustomer?: boolean;

  /**
   * Contacts entered through Add Contact, for a customer who has no record in
   * Customer Management yet. They become the Customer Contact options.
   */
  newCustomerContacts?: string[];

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
/**
 * DERIVED from the document, never chosen.
 *
 * The guideline states all three and what causes each: "The default status is
 * To do ... The status is In Progress ... when a file has been uploaded but has
 * not yet been approved ... The status is Completed ... when a file has been
 * uploaded and approved." So it is a readout of the document's state, and
 * `taskStatus()` below is the only thing that produces it.
 *
 * "Completed", not "Done" — the sheet's word. And "In Progress" with a capital
 * P, likewise.
 */
export type TaskStatus = 'To do' | 'In Progress' | 'Completed';

export function taskStatus(t: { documentName: string; approved: boolean }): TaskStatus {
  if (!t.documentName) return 'To do';
  return t.approved ? 'Completed' : 'In Progress';
}

export type ChecklistTask = {
  /** The checklist item this task came from. */
  type: string;
  documentName: string;
  uploadedBy: string;
  uploadedDate: Date | null;
  assignee: string;
  /** Whether the attached document has been approved. Drives the status. */
  approved: boolean;
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
  /**
   * The roles this customer has configured, if any.
   *
   * The guideline, for each of Program Manager, Buyer and Engineer: "If a
   * [role] has been configured for the corresponding customer in Sales
   * Management > Customer Management, that user is displayed as the DEFAULT
   * selected value" — and "the user can change the selected [role] to another
   * active user". So this is a default, never a restriction: the picker still
   * offers everyone.
   *
   * Optional per role, because the guideline's "if" only makes sense when some
   * customers have none — and a customer with nobody configured is what proves
   * the field still works without one.
   */
  roles?: { programManager?: string; buyer?: string; engineer?: string };
  /** Project names already used by this customer. The live form fetches these. */
  projectNames: string[];
};

export const CUSTOMER_MASTER: Customer[] = [
  { code: '00455', name: 'Cerelogic Systems Inc.', label: '00455 - Cerelogic Systems Inc.',
    contacts: ['Dana Whitfield', 'Marc Oyelaran', 'Priya Raghunathan'],
    custType: 'Turnkey', isItar: false, priceMarkup: 12,
    roles: { programManager: 'Toan Dinh', buyer: 'Mai Pham', engineer: 'Duc Le' },
    projectNames: ['Halo Controller', 'Halo Backplane', 'Orion Sensor Board'] },
  { code: '00848', name: 'KT Controls Ltd', label: '00848 - KT Controls Ltd',
    contacts: ['Steven Achebe', 'Lena Brandt'],
    custType: 'Consigned', isItar: false, priceMarkup: 9,
    /* Buyer only — the guideline's "if configured" has to be exercised per role,
       not just per customer. */
    roles: { buyer: 'Huyen NTN' },
    projectNames: ['KT Drive Module', 'KT Panel Interface'] },
  { code: '00378', name: 'Nokia Networks Oy', label: '00378 - Nokia Networks Oy',
    contacts: ['Aino Virtanen', 'Petri Laaksonen', 'Sanna Koskinen'],
    custType: 'Mixed', isItar: false, priceMarkup: 14,
    projectNames: ['RF Front-end Rev C', 'Baseband Carrier'] },
  { code: '01204', name: 'Meridian Avionics', label: '01204 - Meridian Avionics',
    contacts: ['Ruth Calderon', 'Devon Achterberg'],
    custType: 'Turnkey', isItar: true, priceMarkup: 18,
    projectNames: ['ADS-B Transponder', 'Flight Data Concentrator'] },
  { code: '00912', name: 'Halden Marine AS', label: '00912 - Halden Marine AS',
    contacts: ['Ingrid Solberg'],
    custType: 'Managed Consigned', isItar: false, priceMarkup: 11,
    projectNames: ['Bridge Display Unit'] },
  { code: '01455', name: 'Brightpath Medical', label: '01455 - Brightpath Medical',
    contacts: ['Yusuf Adeyemi', 'Carla Menendez'],
    custType: 'Turnkey', isItar: false, priceMarkup: 16,
    projectNames: ['Infusion Pump Main', 'Infusion Pump Sensor'] },
  { code: '00109', name: 'Comtec Industrial', label: '00109 - Comtec Industrial',
    contacts: ['Rob Tanaka', 'Hedy Lindqvist'],
    custType: 'Consigned', isItar: false, priceMarkup: 10,
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

/**
 * The people an RFQ can be assigned to, with what the live picker shows.
 *
 * An sent the live Assigned To control on 31 Aug 2026: a multi-select whose
 * options carry an AVATAR and an EMAIL under the name, not a bare list of
 * names. Confirmed in the bundle — `component: "MultiSelect"` with `tagRender`,
 * and an option `avatar`.
 *
 * The email is the reason the avatar is not decoration. Two of the live users
 * are "Linh Tran 1" and "Linh Tran 5"; on this data "Linh Tran" and "Toan Dinh"
 * both initialise to nothing useful. A list of colleagues is exactly where names
 * collide, and the email is what tells them apart.
 */
export type Person = { name: string; email: string; initials: string };

export const PEOPLE_DIRECTORY: Person[] = PEOPLE.map(name => ({
  name,
  /* first.last@ — the shape of the two real addresses in the live screenshot
     (`linh.ttt@linhlongengineering.com`). */
  email: name.toLowerCase().replace(/\s+/g, '.') + '@linhlongengineering.com',
  initials: name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
}));
const OWNERS = [...PEOPLE];


/* Status is no longer picked freely — it follows the RFQ's age. See the two
   populations in generateQuotations. */





/** The mockup's "now". One constant, so dates cannot disagree between screens. */
export const TODAY = new Date(2026, 7, 19);
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
  /* Anything created in this session sits at the top, newest first, exactly
     where the next sequential RFQ number puts it. Prepending here rather than
     at each call site means the list, the record screen, Home and My Queues
     all see a new RFQ without any of them knowing it was created rather than
     generated. */
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
  const out: Quotation[] = [...createdQuotations()];
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

    /* Needed before the record literal, because Historical RFQ depends on it. */
    const orderType = pick(META.ORDER_TYPE);
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
      orderType,
      status,
      /* Most RFQs have one owner and some have two — a single-element array
         would make the plural shape true and never exercised. A few have none,
         which is what the Unassigned queue is for. */
      assignedTo: (() => {
        const r = rnd();
        if (r < 0.08) return [];
        if (r > 0.82) return [pick(OWNERS), pick(OWNERS)].filter((v, i, a) => a.indexOf(v) === i);
        return [pick(OWNERS)];
      })(),
      dateNeeded: needed,
      createdDate: created,
      lastUpdated: new Date(Math.min(created.getTime() + Math.floor(rnd() * 20) * 86400000, TODAY.getTime())),
      projectType: pick(META.PROJECT_TYPE),
      /* Derived from the customer record on the live form, not picked freely. */
      customerType: findCustomer(cust)!.custType,
      /* Only a Repeat order has one, because that is the only case where the
         field is shown. The customer's Testing Guideline: "Precondition:
         displays when selected Order Type is Repeat." A stored value on a New
         order would be data the form can never show or clear. */
      historicalRfq: orderType === 'Repeat'
        ? `RFQ${String(300 - Math.floor(rnd() * 200)).padStart(10, '0')}`
        : '',
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
          /* The DOCUMENT is generated and the status follows it, which is the
             direction the guideline states. This used to pick a status first
             and derive the document from it — so a row could read "Done" with
             nothing attached, a state the real system cannot produce. */
          const hasDoc = rnd() > 0.45;
          const approved = hasDoc && rnd() > 0.4;
          return {
            type,
            documentName: hasDoc ? `${type.replace(/[^A-Za-z]+/g, '-')}-${cust.slice(0, 5)}.xlsx` : '',
            uploadedBy: hasDoc ? pick(OWNERS) : '',
            uploadedDate: hasDoc ? withHour(new Date(created.getTime() + (j + 1) * 86400000), 10 + j) : null,
            assignee: pick(OWNERS),
            approved,
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
              /* Blank when the run used the BoM already on the RFQ: "the BOM
                 File field is blank when the quotation is run from an existing
                 BOM". Roughly a third of runs, since re-runs against the
                 current BoM are the common case. */
              bomFile: rnd() > 0.35 ? `BOM-${cust.slice(0, 5)}-v${1 + j}.xlsx` : '',
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

/**
 * The list columns, named and ordered as the customer's Testing Guideline lists
 * them. The live Column tab offers exactly these and no others.
 *
 * Five had been reworded here — "RFQ No", "Project", "Customer", "Created",
 * "Last Updated" — and the order differed.
 *
 * `Order Type` carries a SPACE. The live system renders "OrderType" without
 * one; the guideline writes it correctly, and the guideline outranks the
 * running build. Recorded as a live defect in docs/gap-list.md.
 *
 * REMOVED: "Assigned To". It is not a live column and the Column tab does not
 * offer it, so it cannot be turned on either. Worth raising — My Queues is
 * built on assignment, and an estimator cannot see who owns a row without
 * opening it — but it is an addition to request, not a gap to fill quietly.
 *
 * `required` marks the columns the live Column tab will not let you remove.
 */
export const QUOTATION_COLUMNS: ColumnSpec<Quotation>[] = [
  { field: 'priority', title: 'Priority', role: 'priority', priority: 2, required: true },
  { field: 'no', title: 'No', role: 'ident', searchable: true, width: 150, required: true,
    widthNote: 'RFQ numbers are a fixed 10 digits; the 240px ident default was sized for part numbers and wastes 90px here.' },
  { field: 'projectName', title: 'Project Name', role: 'text', searchable: true, width: 220, priority: 1, required: true,
    widthNote: 'Project names observed run to ~22 characters; 280px over-reserves.' },
  { field: 'customer', title: 'Customer Name', role: 'text', searchable: true, priority: 2, required: true },
  { field: 'application', title: 'Application', role: 'code', width: 150, priority: 3,
    widthNote: 'Longest member is "Sub-assy Box Build" — the 96px role default clips it.' },
  { field: 'rfqType', title: 'RFQ Type', role: 'code', width: 140, priority: 3,
    widthNote: 'Longest value "Managed Consigned" measures 127px; the 96px code default wraps it and makes the row taller than every other.' },
  { field: 'orderType', title: 'Order Type', role: 'code', priority: 3 },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'dateNeeded', title: 'Date Needed', role: 'date', required: true },
  { field: 'createdDate', title: 'Created Date', role: 'date' },
  { field: 'lastUpdated', title: 'Last Updated Date', role: 'date', width: 160, required: true,
    widthNote: 'The heading is longer than the 150px date default allows.' },
];

/** Days until the RFQ is due. Negative is overdue. */
export function daysUntil(d: Date, today = TODAY): number {
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
