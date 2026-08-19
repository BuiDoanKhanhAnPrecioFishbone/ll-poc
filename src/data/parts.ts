/* =============================================================================
   MOCK PART MASTER
   -----------------------------------------------------------------------------
   Shaped to match the production Part Master's real columns and value
   distributions, so the grid is exercised under realistic conditions:
     - part numbers long enough to clip at the legacy 108px column width
     - ABC always empty (it is 100% empty in production)
     - Part Class / Part Type ~55% empty (as measured in production)
   No customer data is reproduced; names and numbers are synthetic.
   ========================================================================== */

export type Part = {
  id: number;
  partNumber: string;
  customer: string;
  rev: string;
  description: string;
  partSource: 'MAKE' | 'BUY';
  partClass: string;
  partType: string;
  abc: string;
  uom: string;
  onHand: number;
  allocated: number;
  unitCost: number;
  lastChange: Date;
  status: 'Active' | 'Inactive' | 'Obsolete' | 'Pending';
};

const CUSTOMERS = [
  '00455 - Cerelogic Systems', '00848 - KT Controls Ltd', '00378 - Nokia Networks Oy',
  '01204 - Meridian Avionics', '00912 - Halden Marine AS', '01455 - Brightpath Medical',
];
const CLASSES = ['ASSEMBLY', 'COMPONENT', 'RAW', 'CONSUMABLE'];
const TYPES = ['MECH-FMA', 'ELEC-PCB', 'ELEC-PAS', 'MECH-MCH', '0402', '0603'];
const UOMS = ['EACH', 'EACH', 'EACH', 'METRE', 'KG', 'ROLL'];
const STATUSES: Part['status'][] = ['Active', 'Active', 'Active', 'Active', 'Inactive', 'Obsolete', 'Pending'];
const DESCRIPTORS = [
  'RES-CHIP_THICK FILM 10K 1% 0603', 'CAP_CER-X7R 100NF 50V 0402',
  'IC PWR MGMT BUCK 3A SYNC 4.5-18V', 'IC_LM4041BIM3-1.2 VREF SHUNT',
  'Standoff, 6mm M3 hex brass nickel', 'CONN-HDR 2.54MM 2X10 VERT THT',
  'PCB ASSY MAIN CONTROLLER REV C', 'SCREW M3x8 PAN HEAD SS A2',
  'DIODE SCHOTTKY 40V 3A SMC', 'XTAL 16MHZ 18PF HC49 SMD',
];

/* A tiny deterministic PRNG keeps the demo stable across reloads and builds. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateParts(count = 2000): Part[] {
  const rnd = mulberry32(20260819);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const out: Part[] = [];
  for (let i = 0; i < count; i++) {
    const cust = pick(CUSTOMERS);
    const prefix = cust.slice(0, 5);
    const partNumber = rnd() > 0.45
      ? `${prefix}-1AB${String(Math.floor(rnd() * 900000) + 100000)}`
      : `${prefix}-${String(Math.floor(rnd() * 900) + 100)}-${String(Math.floor(rnd() * 9000) + 1000)}`;
    const hasClass = rnd() > 0.55;   // matches the ~55% empty measured in production
    const onHand = Math.floor(rnd() * 4000);
    out.push({
      id: i + 1,
      partNumber,
      customer: cust,
      rev: rnd() > 0.2 ? String.fromCharCode(65 + Math.floor(rnd() * 4)) : '',
      description: pick(DESCRIPTORS),
      partSource: rnd() > 0.35 ? 'MAKE' : 'BUY',
      partClass: hasClass ? pick(CLASSES) : '',
      partType: hasClass ? pick(TYPES) : '',
      abc: '',                        // 100% empty in production — kept, to be hidden by default
      uom: rnd() > 0.1 ? pick(UOMS) : '',
      onHand,
      allocated: Math.floor(onHand * rnd() * 0.6),
      unitCost: Math.round(rnd() * 24000) / 100,
      lastChange: new Date(2026, 7, 19 - Math.floor(rnd() * 400), Math.floor(rnd() * 24), Math.floor(rnd() * 60)),
      status: pick(STATUSES),
    });
  }
  return out;
}

/* =============================================================================
   COLUMN MODEL — THE STANDARDISED TABLE PATTERN
   -----------------------------------------------------------------------------
   The production grid gives every column an identical 108px. Measured against
   live data that clips the PART NUMBER — the primary identifier — in 85% of
   rows, CUSTOMER NAME in 100%, and LAST CHANGE in 100%, while an always-empty
   ABC column is granted the same 108px.

   The fix is a typed column model. Width follows from what the column holds:

     ident     240px  never truncates — it is how a user refers to the record
     text      280px  the only truncatable role; truncates with the full value in a tooltip
     code       96px  short enumerations, sized to the longest member
     number    104px  right-aligned, tabular figures
     money     124px  right-aligned, currency-aware
     date      150px  sized to the full rendered format — dates never truncate
     status    128px  one badge from the shared status vocabulary

   When the roles do not sum to the viewport the grid scrolls horizontally. That
   is the correct outcome: squeezing eleven columns into the available width is
   exactly what produces the 108px uniform column being replaced here.
   ========================================================================== */

export type ColumnRole = 'ident' | 'text' | 'code' | 'number' | 'money' | 'date' | 'status';

export type ColumnSpec = {
  field: keyof Part;
  title: string;
  role: ColumnRole;
  /** Hidden by default; still available from the column chooser. */
  hiddenByDefault?: boolean;
  /** Why it is hidden — surfaced in the column chooser so the choice is auditable. */
  note?: string;
};

export const ROLE_WIDTH: Record<ColumnRole, number> = {
  ident: 240,
  text: 280,
  code: 96,
  number: 104,
  money: 124,
  date: 150,
  status: 128,
};

export const PART_COLUMNS: ColumnSpec[] = [
  { field: 'partNumber', title: 'Part Number', role: 'ident' },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'customer', title: 'Customer', role: 'text' },
  { field: 'rev', title: 'Rev', role: 'code' },
  { field: 'partSource', title: 'Source', role: 'code' },
  { field: 'onHand', title: 'On Hand', role: 'number' },
  { field: 'allocated', title: 'Allocated', role: 'number' },
  { field: 'unitCost', title: 'Unit Cost', role: 'money' },
  { field: 'uom', title: 'UoM', role: 'code' },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'lastChange', title: 'Last Changed', role: 'date' },
  { field: 'partClass', title: 'Part Class', role: 'code', hiddenByDefault: true, note: 'Empty in 55% of records' },
  { field: 'partType', title: 'Part Type', role: 'code', hiddenByDefault: true, note: 'Empty in 55% of records' },
  { field: 'abc', title: 'ABC', role: 'code', hiddenByDefault: true, note: 'Empty in 100% of records — hidden until it is populated' },
];

/** Maps every module's lifecycle vocabulary onto the six shared status tokens. */
export const STATUS_TOKEN: Record<string, 'draft' | 'open' | 'progress' | 'done' | 'blocked' | 'cancelled'> = {
  Pending: 'draft', Draft: 'draft',
  Active: 'done', Released: 'done', Completed: 'done', Paid: 'done',
  Open: 'open', New: 'open', Quoted: 'open',
  'In-Progress': 'progress', Partial: 'progress',
  Inactive: 'cancelled', Cancelled: 'cancelled', Closed: 'cancelled',
  Obsolete: 'blocked', Blocked: 'blocked', Overdue: 'blocked',
};
