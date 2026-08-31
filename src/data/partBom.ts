import { buildBomLines, type BomLine } from './bom';
import type { Part } from './parts';

/**
 * The BoM header a part's BoM popup shows, and the assemblies that consume it.
 *
 * Both are derived deterministically from the part number, so the same part
 * shows the same BoM and the same parents on every reload — the rule the rest of
 * the mock data follows.
 *
 * The COMPONENT LINES are not generated here. `buildBomLines()` already returns
 * the seeded BoM used by Run Quotation, and it carries exactly the six columns
 * this popup needs — Component Part, Revision, Part Source, Quantity,
 * Manufacturer, MPN. A second, near-identical component list would be two
 * places to correct when the BoM changes.
 */
export type PartBom = {
  customer: string;
  partNumber: string;
  revision: string;
  /** The one field the guideline does NOT mark read-only. */
  version: number;
  itar: boolean;
  quantity: number;
  bomType: string;
  runBy: string;
  createdDate: Date;
  lastUpdated: Date;
  components: BomLine[];
};

const BOM_TYPES = ['Production', 'Engineering', 'Prototype', 'Service'];
const RUNNERS = ['Toan Dinh', 'Huyen NTN', 'Leona Truong', 'System Administrator'];

/** Same tiny PRNG as the other generators, seeded off the part number. */
function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h |= 0; h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function bomFor(part: Part): PartBom {
  const rnd = seeded(part.partNumber);
  const created = new Date(2026, 0, 1 + Math.floor(rnd() * 200));
  return {
    customer: part.customer,
    partNumber: part.partNumber,
    revision: part.rev || '—',
    /* Starts at 0 and counts up, as the guideline's own example does: "from 0 to
       1, 1 to 2". */
    version: Math.floor(rnd() * 4),
    itar: rnd() > 0.75,
    quantity: [1, 10, 25, 50, 100][Math.floor(rnd() * 5)],
    bomType: BOM_TYPES[Math.floor(rnd() * BOM_TYPES.length)],
    runBy: RUNNERS[Math.floor(rnd() * RUNNERS.length)],
    createdDate: created,
    lastUpdated: new Date(created.getTime() + Math.floor(rnd() * 120) * 86400000),
    components: buildBomLines(),
  };
}

/**
 * A parent assembly consuming this part — the Where Part Number Used rows.
 *
 * The guideline's seven columns: View, Top Assembly, Revision, Description,
 * Index, Quantity, BoM Status.
 */
export type WhereUsedRow = {
  id: string;
  topAssembly: string;
  revision: string;
  description: string;
  /** Line position within the parent's BoM. */
  index: number;
  quantity: number;
  bomStatus: 'Released' | 'Draft' | 'Obsolete';
};

const ASSEMBLY_DESCRIPTIONS = [
  'PCB ASSY MAIN CONTROLLER REV C', 'PCA sm5_zermatt_v4',
  'KT Panel Interface — top level', 'Flight Data Concentrator assembly',
  'ADS-B Transponder carrier board', 'RF Front-end module',
];
const STATUSES: WhereUsedRow['bomStatus'][] = ['Released', 'Released', 'Released', 'Draft', 'Obsolete'];

export function whereUsed(part: Part): WhereUsedRow[] {
  const rnd = seeded(part.partNumber + 'where');
  /* Between one and six parents. A component used by NOTHING is a real and
     useful answer — it means an engineering change to it is contained — so zero
     is deliberately possible rather than being padded away. */
  const count = Math.floor(rnd() * 7);
  return Array.from({ length: count }, (_, i) => {
    const prefix = part.customer.split(' - ')[0];
    return {
      id: `wu-${part.partNumber}-${i}`,
      topAssembly: `${prefix}-1AB${100000 + Math.floor(rnd() * 899999)}`,
      revision: String.fromCharCode(65 + Math.floor(rnd() * 4)),
      description: ASSEMBLY_DESCRIPTIONS[Math.floor(rnd() * ASSEMBLY_DESCRIPTIONS.length)],
      index: i + 1,
      quantity: 1 + Math.floor(rnd() * 12),
      bomStatus: STATUSES[Math.floor(rnd() * STATUSES.length)],
    };
  });
}
