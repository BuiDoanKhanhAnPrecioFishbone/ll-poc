import { KNOWN_MANUFACTURERS, PART_MASTER } from './bom';

/* =============================================================================
   AN UPLOADED BoM FILE, PARSED
   -----------------------------------------------------------------------------
   Create the new BoM, step 2. The guideline's rules for this screen are about
   what the file CONTAINS versus what the system already knows, so the mock file
   is built to make each rule visible rather than to look tidy:

     - parts that exist in Part Master and parts that do not      (green / red)
     - manufacturers the system knows and manufacturers it does not (green / red)
     - rows with two MFG-MPN pairs, so normalising to
       MFG1 | MPN1 | MFG2 | MPN2 is something you can see happen
     - part numbers WITHOUT the customer code, so "automatically add Customer
       Code prefix if missing" has something to add it to
     - one part carrying the SAME MFG-MPN twice, because "{MFG-MPN} must be
       unique in every Part" is a rule with nothing to catch otherwise

   KEMETA is the guideline's own example — "Ex: Manufacturers don't exist:
   KEMETA" — so it is the unknown manufacturer here and the error message the
   screen produces is the error message the sheet predicts.
   ========================================================================== */

export type MfgMpn = { mfg: string; mpn: string };

export type ImportedRow = {
  id: number;
  /** As written in the file — may be missing the customer code. */
  part: string;
  revision: string;
  description: string;
  partSource: string;
  qty: number;
  level: number;
  pairs: MfgMpn[];
};

/**
 * How MFG-MPN pairs are laid out in the uploaded file.
 *
 * "Vertical BoM file: MFG–MPN pairs are arranged by columns" / "Horizontal BoM
 * file: MFG–MPN pairs are arranged by rows", and BOTH normalise to the same
 * display. The format therefore describes the FILE and not the result — which
 * is the point worth making on screen, because a user choosing between them
 * reasonably expects the choice to change something they can see.
 */
export const AML_FORMATS = ['Vertical', 'Horizontal'] as const;
export type AmlFormat = (typeof AML_FORMATS)[number];

/** The mock parse of an uploaded file. Part numbers deliberately un-prefixed. */
export const IMPORTED_ROWS: ImportedRow[] = [
  { id: 1, part: 'RES-0603-10K', revision: 'A', description: 'Resistor 10k 1% 0603',
    partSource: 'BUY', qty: 24, level: 1,
    pairs: [{ mfg: 'Vishay', mpn: 'CRCW060310K0FKEA' }, { mfg: 'Yageo', mpn: 'RC0603FR-0710KL' }] },
  { id: 2, part: 'CAP-0402-100N', revision: 'A', description: 'Cap 100nF 16V X7R 0402',
    partSource: 'BUY', qty: 48, level: 1,
    pairs: [{ mfg: 'Murata', mpn: 'GRM155R71C104KA88D' }] },
  /* Unknown manufacturer — the one the guideline names. */
  { id: 3, part: 'CAP-0603-4U7', revision: 'A', description: 'Cap 4.7uF 25V X5R 0603',
    partSource: 'BUY', qty: 18, level: 1,
    pairs: [{ mfg: 'KEMETA', mpn: 'C0603C475K8PAC' }] },
  /* Not in Part Master, and a second unknown manufacturer. */
  { id: 4, part: 'IC-SENSOR-TMP', revision: 'B', description: 'IC temp sensor I2C',
    partSource: 'BUY', qty: 2, level: 1,
    pairs: [{ mfg: 'Sensirion', mpn: 'SHT40-AD1B-R2' }] },
  { id: 5, part: 'CONN-HDR-2X10', revision: 'A', description: 'CONN-HDR 2.54MM 2X10 VERT THT',
    partSource: 'BUY', qty: 1, level: 1,
    pairs: [{ mfg: 'Samtec', mpn: 'TSW-110-07-G-D' }] },
  /* The same MFG-MPN twice on one part — the uniqueness rule's target. */
  { id: 6, part: 'IND-4R7-1210', revision: 'A', description: 'Inductor 4.7uH 1210',
    partSource: 'BUY', qty: 6, level: 1,
    pairs: [{ mfg: 'TDK', mpn: 'VLS252012HBX-4R7M' }, { mfg: 'TDK', mpn: 'VLS252012HBX-4R7M' }] },
  { id: 7, part: 'PCB-4L-FR4', revision: 'C', description: 'PCB 4 layer FR4 1.6mm',
    partSource: 'MAKE', qty: 1, level: 1,
    pairs: [{ mfg: 'Protolabs', mpn: 'PCB-4L-FR4-C' }] },
];

/**
 * Put the customer code on the front of anything missing it.
 *
 * "Automatically add Customer Code prefix if missing (Assembly + Component)."
 * BOTH is the part worth honouring: the assembly gets it on step 1 as the user
 * types, and every component gets it here, on parse. A file that names
 * `RES-0603-10K` and a system that stores `00848-RES-0603-10K` are describing
 * the same part, and the prefix is what makes the Part Master lookup below
 * agree with that.
 */
export function withCustomerCode(partNumber: string, code: string): string {
  if (!code) return partNumber;
  return partNumber.startsWith(`${code}-`) ? partNumber : `${code}-${partNumber}`;
}

/** Manufacturers in the file that Manufacturer Management does not hold. */
export function unknownManufacturers(rows: ImportedRow[]): string[] {
  const out = new Set<string>();
  rows.forEach(r => r.pairs.forEach(p => {
    if (p.mfg && !KNOWN_MANUFACTURERS.has(p.mfg)) out.add(p.mfg);
  }));
  return [...out];
}

/**
 * Parts carrying the same manufacturer and part number twice.
 *
 * "{MFG-MPN} must be unique in every Part" — within a part, not across the
 * file. Two different parts may legitimately list the same manufacturer part;
 * one part listing it twice is a duplicated row in the spreadsheet.
 */
export function duplicatePairs(rows: ImportedRow[]): { part: string; pair: string }[] {
  const out: { part: string; pair: string }[] = [];
  rows.forEach(r => {
    const seen = new Set<string>();
    r.pairs.forEach(p => {
      const key = `${p.mfg} ${p.mpn}`;
      if (seen.has(key)) out.push({ part: r.part, pair: key });
      seen.add(key);
    });
  });
  return out;
}

/** Whether a component is already in Part Master, once prefixed. */
export function partIsKnown(part: string, code: string): boolean {
  return PART_MASTER.has(part) || PART_MASTER.has(withCustomerCode(part, code));
}

/**
 * What Submit would do, per the guideline's four cases.
 *
 * "If Part existed: {MFG-MPN} existed -> skip; {MFG-MPN} doesn't exist ->
 * create new mapping. If Part doesn't: {MFG-MPN} existed -> create new part;
 * {MFG-MPN} doesn't exist -> create new {MFG-MPN}", with the note "Didn't
 * create the part that exists. Didn't create {MFG-MPN} that exists."
 *
 * Counted rather than performed — this prototype has no Part Master to write
 * to — so Submit reports the outcome the rules produce instead of claiming an
 * effect it cannot have.
 */
export type SubmitPlan = {
  partsCreated: string[];
  partsSkipped: string[];
  mappingsCreated: string[];
  mappingsSkipped: string[];
};

export function planSubmit(rows: ImportedRow[], code: string,
                           knownPairs: Set<string>): SubmitPlan {
  const plan: SubmitPlan = {
    partsCreated: [], partsSkipped: [], mappingsCreated: [], mappingsSkipped: [],
  };
  rows.forEach(r => {
    const part = withCustomerCode(r.part, code);
    (partIsKnown(r.part, code) ? plan.partsSkipped : plan.partsCreated).push(part);
    /* One mapping per DISTINCT pair — a pair repeated inside a part is the
       duplicate the validation already blocks, and counting it twice here
       would report work that will never happen. */
    const seen = new Set<string>();
    r.pairs.forEach(p => {
      const key = `${p.mfg} ${p.mpn}`;
      if (seen.has(key)) return;
      seen.add(key);
      (knownPairs.has(key) ? plan.mappingsSkipped : plan.mappingsCreated).push(`${part} · ${key}`);
    });
  });
  return plan;
}

/**
 * MFG-MPN pairs the system already holds.
 *
 * Drawn from the seeded BoM so "existed -> skip" has something to skip. Without
 * it every pair in the file would read as new and the skip half of the rules
 * would never be exercised.
 */
export const EXISTING_PAIRS = new Set<string>([
  'Vishay CRCW060310K0FKEA',
  'Murata GRM155R71C104KA88D',
  'Samtec TSW-110-07-G-D',
]);
