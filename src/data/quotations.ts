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
};

const CUSTOMERS = [
  '00455 - Cerelogic Systems Inc.', '00848 - KT Controls Ltd', '00378 - Nokia Networks Oy',
  '01204 - Meridian Avionics', '00912 - Halden Marine AS', '01455 - Brightpath Medical',
  '00109 - Comtec Industrial',
];
const OWNERS = ['Toan Dinh', 'Huyen NTN', 'Mai Pham', 'Duc Le', 'Linh Tran'];
const APPLICATIONS: Application[] = ['System', 'PCBA', 'PCBA', 'Sub-assy Box Build'];
const RFQ_TYPES: RfqType[] = ['Consigned', 'Consigned', 'Turnkey', 'Mixed'];
const STATUSES: QuotationStatus[] = ['New', 'New', 'In-Progress', 'Quoted', 'Quoted', 'Completed', 'Cancelled'];
const QUOTE_FOCUS = ['Stock-High cost', 'Lead time', 'Lowest cost', 'Balanced'];
const PACKAGING = ['Cut Tape', 'Full Reel', 'Tube', 'Tray'];
const BUILD_REQ = ['System', 'PCBA only', 'Box build', 'Turnkey assembly'];
const PROJECT_TYPES = ['Production', 'Prototype', 'NPI', 'Re-quote'];

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
    const created = new Date(needed.getTime() - (5 + Math.floor(rnd() * 50)) * 86400000);
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
      lastUpdated: new Date(Math.min(created.getTime() + Math.floor(rnd() * 20) * 86400000, new Date(2026, 7, 19).getTime())),
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
  { field: 'priority', title: 'Priority', role: 'rating' },
  { field: 'no', title: 'RFQ No', role: 'ident', searchable: true, width: 150,
    widthNote: 'RFQ numbers are a fixed 10 digits; the 240px ident default was sized for part numbers and wastes 90px here.' },
  { field: 'projectName', title: 'Project', role: 'text', searchable: true, width: 220,
    widthNote: 'Project names observed run to ~22 characters; 280px over-reserves.' },
  { field: 'customer', title: 'Customer', role: 'text', searchable: true },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'dateNeeded', title: 'Date Needed', role: 'date' },
  { field: 'assignedTo', title: 'Assigned To', role: 'code', width: 140,
    widthNote: 'Holds full names, not an enum; 96px clips every value.' },
  { field: 'application', title: 'Application', role: 'code', width: 150,
    widthNote: 'Longest member is "Sub-assy Box Build" — the 96px role default clips it.' },
  { field: 'rfqType', title: 'RFQ Type', role: 'code' },
  { field: 'orderType', title: 'Order Type', role: 'code' },
  { field: 'createdDate', title: 'Created', role: 'date', hiddenByDefault: true,
    note: 'Rarely used when working a queue; Date Needed is the operative date' },
  { field: 'lastUpdated', title: 'Last Updated', role: 'date', hiddenByDefault: true,
    note: 'Audit field — available, but not what an estimator sorts by' },
];

/** Days until the RFQ is due. Negative is overdue. */
export function daysUntil(d: Date, today = new Date(2026, 7, 19)): number {
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}
