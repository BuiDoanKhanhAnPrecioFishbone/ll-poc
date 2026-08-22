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

import type { ColumnSpec } from '../components/column-model';

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

/* Column roles and their widths are defined once in components/column-model.ts
   and src/theme/tokens.ts; the rules behind them are in docs/table-patterns.md.
   This file only says which role each Part column has. */
export const PART_COLUMNS: ColumnSpec<Part>[] = [
  { field: 'partNumber', title: 'Part Number', role: 'ident', searchable: true },
  { field: 'description', title: 'Description', role: 'text', searchable: true },
  { field: 'customer', title: 'Customer', role: 'text', searchable: true, priority: 2 },
  { field: 'rev', title: 'Rev', role: 'code', priority: 3 },
  { field: 'partSource', title: 'Source', role: 'code', priority: 3 },
  { field: 'onHand', title: 'On Hand', role: 'number' },
  { field: 'allocated', title: 'Allocated', role: 'number', priority: 3 },
  { field: 'unitCost', title: 'Unit Cost', role: 'money', priority: 2 },
  { field: 'uom', title: 'UoM', role: 'code', priority: 3 },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'lastChange', title: 'Last Changed', role: 'date', priority: 2 },
  { field: 'partClass', title: 'Part Class', role: 'code', hiddenByDefault: true, note: 'Empty in 55% of records' },
  { field: 'partType', title: 'Part Type', role: 'code', hiddenByDefault: true, note: 'Empty in 55% of records' },
  { field: 'abc', title: 'ABC', role: 'code', hiddenByDefault: true, note: 'Empty in 100% of records — hidden until it is populated' },
];
