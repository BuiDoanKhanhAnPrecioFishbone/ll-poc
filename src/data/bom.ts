/* =============================================================================
   BILL OF MATERIALS — the lines a quote is run against
   -----------------------------------------------------------------------------
   Field names, column order, colour rules, auto-exclusion rules and the total
   quantity formula are taken from the customer's Testing Guideline, sheet
   "PR - EC - Quick Quote", steps 2 to 4. Where the guideline and the shipped
   bundle disagree the guideline wins (docs/precedence.md).

   Part numbers, manufacturers and prices are synthetic. The distribution is
   not: a real BoM is mostly passives that come in reels far larger than the
   build needs, which is where excess cost comes from, plus a handful of
   expensive actives and a few lines that will not price at all. A BoM where
   every line resolves cleanly would make the four filters on step 3 look like
   decoration.
   ========================================================================== */

/**
 * How a part is supplied. Verbatim from the guideline, step 2 r102:
 * "MAKE, BUY, MAKE/PHAN, FLRSTK, MAKE/BUY, and PACKAGING".
 *
 * The guideline writes MAKE/PHAN in one place and MAKE/PHANT in another; the
 * auto-exclusion rule (r81) uses MAKE/PHANT, so that is the spelling kept.
 */
import { CUSTOMER_MASTER } from './quotations';

export type PartSource = 'MAKE' | 'BUY' | 'MAKE/PHANT' | 'FLRSTK' | 'MAKE/BUY' | 'PACKAGING';

/**
 * A line's quotation state.
 *
 *   N/A     no supplier found — red
 *   NO      a supplier exists but cannot cover the quantity — yellow
 *   COVER   priced and covered — green
 *   NO BID  excluded from the quote, or unselected when leaving step 3 — grey
 */
export type LineStatus = 'N/A' | 'NO' | 'COVER' | 'NO BID';

export type BomLine = {
  id: number;
  /** Sequential, ascending, as displayed in the NUMBER column. */
  number: number;
  /** ROCKET_PN — the part number in Part Master terms. */
  part: string;
  revision: string;
  description: string;
  partSource: PartSource;
  /** Qty per board, before build quantity and attrition. */
  qty: number;
  /** Position in the parent-child hierarchy. */
  level: number;
  mfg: string;
  mpn: string;

  /* ---- Quoting ---------------------------------------------------------- */
  attrition: number;
  supplier: string;
  orderQty: number;
  stock: number;
  /** Quantity the supplier cannot cover. Step 4 shows this as "Out Stock". */
  outStock: number;
  /** Lead time in days. */
  lt: number;
  pkg: string;
  moq: number;
  excessQty: number;
  unitPrice: number;
  amount: number;
  excessAmt: number;
  status: LineStatus;
  notes: string;

  /* ---- Line state ------------------------------------------------------- */
  /**
   * Excluded from the quotation.
   *
   * Set automatically for MAKE and MAKE/PHANT parts and for zero-quantity
   * lines, and by the user unticking a line. The guideline is careful about
   * the direction: excluded lines "are not included in the quotation process
   * unless the user manually re-checks them", so this is a default rather than
   * a lock.
   */
  excluded: boolean;
  /** True when this line was added on step 4 through Add Package. */
  isPackage?: boolean;
};

/**
 * Manufacturers already in Manufacturer Management.
 *
 * The guideline colours a known manufacturer's cell yellow (step 2, r107). The
 * point is not decoration: an unknown manufacturer is one that has to be
 * created before the quote can resolve its parts.
 */
export const KNOWN_MANUFACTURERS = new Set([
  'Vishay', 'Murata', 'Texas Instruments', 'Samtec', 'Abracon',
  'Lite-On', 'Yageo', 'Bourns', 'TDK', 'Nexperia', 'Wurth Elektronik',
]);

/**
 * Parts that exist in Part Master.
 *
 * Green background when present, red when not — and the guideline attaches a
 * consequence to red: "the user cannot confirm Project Requirement until all
 * missing part numbers have been created in Part Master".
 */
export const PART_MASTER = new Set([
  'RES-0603-10K', 'RES-0603-1K', 'RES-0805-100R', 'CAP-0402-100N', 'CAP-0603-10U',
  'CAP-1206-22U', 'IC-PWR-BUCK-3A', 'IC-MCU-M4-256K', 'CONN-HDR-2X10', 'XTAL-16MHZ',
  'LED-GRN-0805', 'IND-4R7-1210', 'DIO-SCH-40V', 'FUSE-2A-1206', 'PCB-4L-FR4',
  'TP-DNI-01', 'MOSFET-N-30V', 'REG-LDO-3V3',
]);

export const PRIMARY_PROVIDERS = ['Nexar', 'Z2data'] as const;
export type PrimaryProvider = (typeof PRIMARY_PROVIDERS)[number];

/**
 * The column the system uses to tell one quote line from another.
 *
 * Guideline step 1, r30 — and it carries a warning worth keeping visible: if
 * the chosen column is empty in the uploaded file, "the system may incorrectly
 * merge multiple quote lines into a single line".
 */
export const COLUMN_DETECTION = [
  'part number', 'rev', 'part source', 'qty per', 'mfg', 'mfgpn', 'level', 'description',
] as const;

/** BoM templates configured in Inventory Management. */
export const BOM_TEMPLATES = [
  'Indented BoM (default)',
  'Cerelogic flat BoM',
  'Nokia multi-level',
  'Meridian avionics BoM',
] as const;

/* =============================================================================
   THE FORMULA
   ========================================================================== */

/**
 * Total Qty = (Qty × Build Qty) + (Attrition × Attrition Set)
 *
 * Guideline step 3, r136, stated identically at r111 and r171. It is written
 * once here because four places display it and two recalculate it, and a
 * second copy is a second chance to get it wrong.
 */
export function totalQtyOf(line: BomLine, buildQty: number, attritionSet: number): number {
  return line.qty * buildQty + line.attrition * attritionSet;
}

/**
 * Whether a line is excluded before the user has touched anything.
 *
 * "BOM lines with Part Source = MAKE or MAKE/PHANT are automatically marked as
 * Is Exclude ... because these parts are internally manufactured rather than
 * externally purchased" and "BOM lines with Qty = 0 are automatically marked as
 * Is Exclude". The guideline adds a third rule stated as a negative — "If Part
 * Source has no value, the system does not auto-exclude the BOM line based on
 * Part Source alone" — which falls out of testing the two named values rather
 * than testing for "not BUY".
 */
export function autoExcluded(line: Pick<BomLine, 'partSource' | 'qty'>): boolean {
  return line.partSource === 'MAKE' || line.partSource === 'MAKE/PHANT' || line.qty === 0;
}

/* =============================================================================
   THE LINES
   ========================================================================== */

type Seed = {
  part: string; revision: string; description: string; partSource: PartSource;
  qty: number; level: number; mfg: string; mpn: string;
  /** What the quote run will find. '' means no supplier — the line stays N/A. */
  supplier: string; unitPrice: number; moq: number; pkg: string; lt: number; stock: number;
  attrition: number;
};

/**
 * One assembly's worth of parts.
 *
 * Chosen to exercise every rule the guideline states rather than to look tidy:
 *
 *   - MAKE and MAKE/PHANT lines, and one zero-quantity line, so auto-exclusion
 *     has something to do
 *   - parts absent from Part Master, so the red ROCKET_PN colour appears
 *   - a manufacturer absent from Manufacturer Management, so Missing
 *     Manufacturer filters to something
 *   - lines that will not price at all, and lines whose supplier cannot cover
 *     the quantity, so the three step-3 filters each return rows
 *   - reels whose MOQ dwarfs the build, which is where excess cost comes from
 */
const SEEDS: Seed[] = [
  { part: 'RES-0603-10K', revision: 'A', description: 'Resistor 10k 1% 0603', partSource: 'BUY', qty: 24, level: 1, mfg: 'Vishay', mpn: 'CRCW060310K0FKEA', supplier: 'Digi-Key', unitPrice: 0.012, moq: 5000, pkg: 'Reel', lt: 3, stock: 480000, attrition: 3 },
  { part: 'RES-0603-1K', revision: 'A', description: 'Resistor 1k 1% 0603', partSource: 'BUY', qty: 12, level: 1, mfg: 'Yageo', mpn: 'RC0603FR-071KL', supplier: 'Mouser', unitPrice: 0.009, moq: 5000, pkg: 'Reel', lt: 4, stock: 920000, attrition: 3 },
  { part: 'RES-0805-100R', revision: 'A', description: 'Resistor 100R 1% 0805', partSource: 'BUY', qty: 6, level: 1, mfg: 'Yageo', mpn: 'RC0805FR-07100RL', supplier: 'Digi-Key', unitPrice: 0.011, moq: 5000, pkg: 'Reel', lt: 3, stock: 310000, attrition: 0 },
  { part: 'CAP-0402-100N', revision: 'A', description: 'Cap 100nF 16V X7R 0402', partSource: 'BUY', qty: 48, level: 1, mfg: 'Murata', mpn: 'GRM155R71C104KA88D', supplier: 'Mouser', unitPrice: 0.008, moq: 10000, pkg: 'Reel', lt: 5, stock: 1200000, attrition: 5 },
  { part: 'CAP-0603-10U', revision: 'A', description: 'Cap 10uF 25V X5R 0603', partSource: 'BUY', qty: 14, level: 1, mfg: 'TDK', mpn: 'C1608X5R1E106M080AC', supplier: 'Arrow', unitPrice: 0.041, moq: 4000, pkg: 'Reel', lt: 9, stock: 88000, attrition: 4 },
  { part: 'CAP-1206-22U', revision: 'B', description: 'Cap 22uF 16V X7R 1206', partSource: 'BUY', qty: 4, level: 1, mfg: 'Murata', mpn: 'GRM31CR71C226KE15L', supplier: '', unitPrice: 0, moq: 2000, pkg: 'Reel', lt: 0, stock: 0, attrition: 0 },
  { part: 'IC-PWR-BUCK-3A', revision: 'B', description: 'Buck converter 3A 17V', partSource: 'BUY', qty: 1, level: 1, mfg: 'Texas Instruments', mpn: 'TPS62130ARGTR', supplier: 'Arrow', unitPrice: 2.41, moq: 1, pkg: 'Cut Tape', lt: 12, stock: 8200, attrition: 0 },
  { part: 'IC-MCU-M4-256K', revision: 'C', description: 'MCU Cortex-M4 256K LQFP64', partSource: 'BUY', qty: 1, level: 1, mfg: 'STMicroelectronics', mpn: 'STM32F411RET6', supplier: 'Avnet', unitPrice: 5.87, moq: 1, pkg: 'Tray', lt: 26, stock: 140, attrition: 0 },
  { part: 'REG-LDO-3V3', revision: 'A', description: 'LDO regulator 3.3V 500mA', partSource: 'BUY', qty: 2, level: 1, mfg: 'Texas Instruments', mpn: 'TLV1117LV33DCYR', supplier: 'Digi-Key', unitPrice: 0.38, moq: 1, pkg: 'Cut Tape', lt: 7, stock: 24000, attrition: 0 },
  { part: 'MOSFET-N-30V', revision: 'A', description: 'MOSFET N-ch 30V 5A SOT-23', partSource: 'BUY', qty: 3, level: 1, mfg: 'Nexperia', mpn: 'PMV45EN,215', supplier: 'Mouser', unitPrice: 0.14, moq: 3000, pkg: 'Reel', lt: 6, stock: 61000, attrition: 2 },
  { part: 'DIO-SCH-40V', revision: 'A', description: 'Schottky diode 40V 1A', partSource: 'BUY', qty: 5, level: 1, mfg: 'Nexperia', mpn: 'PMEG4010CEJ', supplier: 'Digi-Key', unitPrice: 0.09, moq: 3000, pkg: 'Reel', lt: 5, stock: 74000, attrition: 2 },
  { part: 'IND-4R7-1210', revision: 'A', description: 'Inductor 4.7uH 1210', partSource: 'BUY', qty: 2, level: 1, mfg: 'Bourns', mpn: 'SRN6045TA-4R7M', supplier: 'Arrow', unitPrice: 0.22, moq: 2000, pkg: 'Reel', lt: 11, stock: 15000, attrition: 0 },
  { part: 'CONN-HDR-2X10', revision: 'A', description: 'Header 2x10 2.54mm', partSource: 'BUY', qty: 1, level: 1, mfg: 'Samtec', mpn: 'TSW-110-07-G-D', supplier: '', unitPrice: 0, moq: 1, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'XTAL-16MHZ', revision: 'A', description: 'Crystal 16MHz 20ppm', partSource: 'BUY', qty: 1, level: 1, mfg: 'Abracon', mpn: 'ABM8G-16.000MHZ', supplier: '', unitPrice: 0, moq: 100, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'LED-GRN-0805', revision: 'A', description: 'LED green 0805', partSource: 'BUY', qty: 2, level: 1, mfg: 'Lite-On', mpn: 'LTST-C170KGKT', supplier: 'Digi-Key', unitPrice: 0.09, moq: 3000, pkg: 'Reel', lt: 8, stock: 640, attrition: 2 },
  { part: 'FUSE-2A-1206', revision: 'A', description: 'Fuse 2A 1206 fast', partSource: 'BUY', qty: 1, level: 1, mfg: 'Bel Fuse', mpn: '0678L2000-01', supplier: 'Mouser', unitPrice: 0.31, moq: 1000, pkg: 'Reel', lt: 14, stock: 300, attrition: 0 },
  { part: 'SW-TACT-6MM', revision: 'A', description: 'Tactile switch 6mm SMD', partSource: 'BUY', qty: 2, level: 1, mfg: 'C&K Components', mpn: 'PTS645SM43SMTR92', supplier: 'Digi-Key', unitPrice: 0.17, moq: 1500, pkg: 'Reel', lt: 10, stock: 22000, attrition: 0 },
  { part: 'FER-BEAD-600R', revision: 'A', description: 'Ferrite bead 600R 0603', partSource: 'BUY', qty: 4, level: 1, mfg: 'Wurth Elektronik', mpn: '742792040', supplier: 'Mouser', unitPrice: 0.06, moq: 4000, pkg: 'Reel', lt: 6, stock: 130000, attrition: 2 },
  /* Internally manufactured — auto-excluded. */
  { part: 'PCB-4L-FR4', revision: 'D', description: 'PCB 4-layer FR4 1.6mm', partSource: 'MAKE', qty: 1, level: 0, mfg: '', mpn: '', supplier: '', unitPrice: 0, moq: 0, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'SUB-ASSY-RF', revision: 'A', description: 'RF sub-assembly (phantom)', partSource: 'MAKE/PHANT', qty: 1, level: 0, mfg: '', mpn: '', supplier: '', unitPrice: 0, moq: 0, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'BRKT-ALU-01', revision: 'A', description: 'Aluminium bracket', partSource: 'MAKE/BUY', qty: 2, level: 1, mfg: 'Protolabs', mpn: 'BRKT-ALU-01', supplier: 'Protolabs', unitPrice: 4.2, moq: 25, pkg: 'Box', lt: 21, stock: 90, attrition: 0 },
  /* Zero quantity — auto-excluded. */
  { part: 'TP-DNI-01', revision: 'A', description: 'Test point — do not install', partSource: 'BUY', qty: 0, level: 1, mfg: '', mpn: '', supplier: '', unitPrice: 0, moq: 0, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'STK-THERM-PAD', revision: 'A', description: 'Thermal pad 20x20mm', partSource: 'FLRSTK', qty: 1, level: 1, mfg: '', mpn: 'TP-2020-1MM', supplier: 'Digi-Key', unitPrice: 0.65, moq: 500, pkg: 'Bag', lt: 9, stock: 4300, attrition: 0 },
];

/**
 * Build the working line set for a quote run.
 *
 * Everything downstream of Qty is left at its "before Run Quote" value — the
 * guideline is explicit that supplier, pricing and availability are blank
 * until the run happens, and seeding them would make step 3 look as if the
 * quote had already been run.
 */
export function buildBomLines(): BomLine[] {
  return SEEDS.map((s, i) => ({
    id: i + 1,
    number: i + 1,
    part: s.part,
    revision: s.revision,
    description: s.description,
    partSource: s.partSource,
    qty: s.qty,
    level: s.level,
    mfg: s.mfg,
    mpn: s.mpn,
    attrition: s.attrition,
    supplier: '',
    orderQty: 0,
    stock: 0,
    outStock: 0,
    lt: 0,
    pkg: '',
    moq: 0,
    excessQty: 0,
    unitPrice: 0,
    amount: 0,
    excessAmt: 0,
    status: 'N/A' as LineStatus,
    notes: '',
    excluded: autoExcluded(s),
  }));
}

/**
 * What the provider comes back with.
 *
 * "If Nexar is selected as the Primary Provider, the system sends MPN values to
 * the Nexar API first. If an MPN is not found in Nexar, the system falls back to
 * Z2Data" — so the provider changes which lines resolve, not merely a label.
 * Here, Z2data resolves one part Nexar does not, which is the only observable
 * difference a mockup can honestly offer.
 */
export function runQuote(lines: BomLine[], buildQty: number, attritionSet: number,
                         provider: PrimaryProvider, quoteFocus?: string): BomLine[] {
  /* "Other: Allows the user to manually select suppliers; the system will not
     auto-select suppliers in Step 3 - Run Quote."

     The other three Quote Focus values each tell the system how to CHOOSE —
     availability, cost, or the balance of the two. Other is the value that says
     don't choose; the quoter has a reason the system does not know. Running the
     quote still computes the quantities, and the Supplier column is left for
     them.

     Lines then come back with no supplier, which the guideline already covers:
     "BOM lines without a Supplier are displayed with a red background color and
     Status = N/A". Under Other the red grid is not a failure report — it is the
     to-do list, and the Unselected Supplier filter counts it down.

     A supplier already chosen SURVIVES this. Apply re-runs the pricing, and
     wiping the manual selections it exists to support would make the button
     destroy the work of the mode. */
  const manual = quoteFocus === 'OTHER';

  return lines.map(line => {
    if (line.excluded) {
      /* "Excluded BOM lines have Status = NO BID" and carry no pricing. */
      return { ...line, status: 'NO BID' as LineStatus, supplier: '', unitPrice: 0, amount: 0 };
    }
    const seed = SEEDS[line.id - 1];
    /* Z2data finds the 22uF cap that Nexar does not. */
    const auto = seed.supplier || (provider === 'Z2data' && line.part === 'CAP-1206-22U' ? 'Arrow' : '');
    /* Under Other the only supplier a line can have is one the user picked.
       The price is still the seed's: this mock holds one price per part, so
       choosing a different supplier changes WHO, not HOW MUCH. Prices that
       differ by supplier belong to the supplier dropdown — the control that
       carries UP, MOQ, Stock and LT per supplier — which is recorded as
       deliberately unbuilt in docs/testing/quick-quote-results.md. */
    const found = manual ? line.supplier : auto;
    if (!found) {
      return { ...line, status: 'N/A' as LineStatus, supplier: '', orderQty: 0, moq: 0,
               excessQty: 0, excessAmt: 0, stock: 0, lt: 0, pkg: '', unitPrice: 0, amount: 0 };
    }
    const unitPrice = seed.unitPrice || 0.052;
    const stock = seed.stock || 12000;
    const moq = seed.moq;
    const total = totalQtyOf(line, buildQty, attritionSet);

    /* Order at least the MOQ, and at least what is needed. What that overshoots
       by is the excess — the number the whole Excess column exists to show. */
    const orderQty = Math.max(total, moq);
    const excessQty = Math.max(0, orderQty - total);
    /* Stock the supplier cannot cover. A shortfall is what makes a line NO. */
    const outStock = Math.max(0, orderQty - stock);
    const status: LineStatus = outStock > 0 ? 'NO' : 'COVER';

    return {
      ...line,
      supplier: found,
      unitPrice,
      stock,
      outStock,
      lt: seed.lt || 15,
      pkg: seed.pkg || 'Cut Tape',
      moq,
      orderQty,
      excessQty,
      amount: unitPrice * orderQty,
      excessAmt: unitPrice * excessQty,
      status,
      notes: line.notes,
    };
  });
}

/* =============================================================================
   COST SUMMARY — step 4
   ========================================================================== */

export type CostSummary = {
  costBoard: number; costBoardMarkup: number;
  totalCost: number; totalCostMarkup: number; excessAmount: number;
};

/**
 * The five figures on the summary panel, calculated as the guideline states
 * them (step 4, r214–r220) rather than as they look plausible:
 *
 *   Cost/Board  = Σ (Qty × Unit Price)          — per board, so the BoM qty
 *   Total Cost  = Σ line Amount                 — the whole order
 *
 * The two differ by more than a factor of Build Qty, because Amount is ordered
 * quantity — which includes attrition and any MOQ overshoot — while Cost/Board
 * is what one board actually consumes. Treating them as the same number scaled
 * is the mistake this comment exists to prevent.
 */
export function costSummary(lines: BomLine[], markupPct: number): CostSummary {
  const quoted = lines.filter(l => !l.excluded && l.status !== 'NO BID');
  const m = 1 + markupPct / 100;
  const costBoard = quoted.reduce((n, l) => n + l.qty * l.unitPrice, 0);
  const totalCost = quoted.reduce((n, l) => n + l.amount, 0);
  return {
    costBoard,
    costBoardMarkup: costBoard * m,
    totalCost,
    totalCostMarkup: totalCost * m,
    excessAmount: quoted.reduce((n, l) => n + l.excessAmt, 0),
  };
}

/** Parts that may be added on step 4 — Part Source = Packaging, same customer. */
export const PACKAGING_PARTS = [
  { part: 'PKG-ESD-BAG-M', description: 'ESD shielding bag 203x254mm', mfg: 'Desco', mpn: '13845' },
  { part: 'PKG-TRAY-JEDEC', description: 'JEDEC tray, 66 cavity', mfg: 'Peak International', mpn: 'PT-66-STD' },
  { part: 'PKG-BOX-RSC-12', description: 'RSC carton 12x9x6 in', mfg: 'Uline', mpn: 'S-4124' },
  { part: 'PKG-FOAM-INS', description: 'Anti-static foam insert', mfg: 'Desco', mpn: '26200' },
] as const;

/* =============================================================================
   ASSEMBLIES — Standard Quote's entry point
   -----------------------------------------------------------------------------
   "The assembly corresponding to the PR's customer will be fully listed. Each
   option also format: Customer Code - Part Number - Rev - Version."

   Standard Quote starts from a BoM that is already approved and loaded through
   the ECO process, so the assembly is CHOSEN rather than typed — which is the
   whole difference between the two flows at step 1.
   ========================================================================== */

export type Assembly = {
  /** The whole option label, in the guideline's format. */
  label: string;
  partNumber: string;
  rev: string;
  version: string;
  /** Auto-populated into Description, and not editable afterwards. */
  description: string;
};

/**
 * The assemblies on file for a customer.
 *
 * Derived from the customer's own project names and code so that the list
 * always belongs to the customer on the RFQ — the guideline's one constraint on
 * it. Two revisions of the first project, so "choose a different one" has
 * something to choose.
 */
export function assembliesFor(customerLabel: string): Assembly[] {
  const cust = CUSTOMER_MASTER.find(c => c.label === customerLabel);
  if (!cust) return [];
  const out: Assembly[] = [];
  cust.projectNames.forEach((name, i) => {
    const partNumber = `${cust.code}-${(184 + i * 37).toString().padStart(3, '0')}-${(6456 + i * 211)}`;
    const revs = i === 0 ? ['A', 'B'] : ['A'];
    revs.forEach((rev, j) => {
      const version = `v${revs.length - j}`;
      out.push({
        label: `${cust.code} - ${partNumber} - ${rev} - ${version}`,
        partNumber, rev, version, description: name,
      });
    });
  });
  return out;
}

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
export const money3 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 3 });
