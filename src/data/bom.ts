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
import { fmtMoney } from '../ui/regional';

import {
  MASTER_GROUP, SUPPLIERS,
  type SupplierId, type SupplierSetup,
} from './suppliers';

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

/**
 * One supplier's terms for one part.
 *
 * `pkg` matters as much as price here: the Material Package Type setting asks
 * for reels or cut tape, and a supplier offering the wrong one is a worse
 * answer at any price — which is why the sort puts it ahead of cost.
 */
export type Offer = {
  supplier: SupplierId;
  unitPrice: number;
  stock: number;
  moq: number;
  pkg: string;
  /** Lead time in days. */
  lt: number;
};

/**
 * What the marketplace returned for one manufacturer part number.
 *
 * ASKED FOR by the customer's Quoting BoM mockup of 16 Oct, whose note on the
 * BoM data is the clearest statement of this rule anywhere in their material:
 *
 *   "nx: per AML, the list Nexar returned for the MPN in the BoM file (shown
 *    with '*'). Each candidate = official MPN + MFG (MPN_MST). m = index the
 *    system matched, or null when it could not match (user must pick). The BoM
 *    value is never changed; the pick is kept as an alias for this customer
 *    (MPN_MAPPING -> MPN_MST)."
 *
 * THE LAST SENTENCE IS THE WHOLE DESIGN. A customer's BoM says
 * `PCA9517ATP`; the catalogue says `PCA9517ATP,118` and `PCA9517ATPZ`, which
 * are different orderable parts. Overwriting the customer's value would lose
 * what they actually asked for and make the next revision of their BoM look
 * like a change. So the file keeps its value, the quote carries the official
 * one, and the pair is remembered for this customer.
 */
export type NexarLookup = {
  candidates: { mpn: string; mfg: string }[];
  /** What the system matched on its own, or null when it could not. */
  matched: number | null;
  /** What the user chose instead. `undefined` means they have not. */
  picked?: number;
};

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
  /**
   * The ALTERNATE manufacturer/part pairs, after the primary `mfg`/`mpn`.
   *
   * Read off the live Review BoM on 15 Oct 2026, which carries six fixed pairs
   * as twelve columns — MFG1, MFGPN1 ... MFG6, MFGPN6. On the record we read,
   * MFG3 through MFGPN6 were empty on every one of the thirteen rows and
   * MFG2/MFGPN2 on twelve of thirteen: 1,200px of horizontal scrolling for
   * columns no row used. The pairs live on the ROW here, and the grid renders
   * as many as a row actually has.
   */
  alternates: { mfg: string; mpn: string }[];

  /**
   * One entry per AML — the primary pair first, then the alternates — holding
   * what the provider returned for that manufacturer part number, or `null`
   * where it returned nothing to choose between.
   */
  nexar: (NexarLookup | null)[];

  /**
   * Stock the quote does not have to buy.
   *
   * ASKED FOR by the Net Consigned and Rocket Consigned settings, which have
   * been on the RFQ record since August and until today changed nothing: a
   * quote that says "the customer supplies 150 of these" priced all of them
   * anyway. The customer's Quoting BoM mockup spells out the arithmetic —
   * consigned quantity comes off the total BEFORE a supplier is asked for a
   * price, and Rocket's own consigned stock may still be charged for.
   *
   * `netConsigned` is the customer's material, free by definition — it is
   * theirs. `rocketConsigned` is ours, and the setting decides whether this
   * quote charges for it.
   */
  netConsigned?: number;
  rocketConsigned?: number;
  /** What Rocket charges per piece when the setting says Yes-Charge. */
  rocketPrice?: number;

  /* ---- Quoting ---------------------------------------------------------- */
  /**
   * What each supplier will sell this part for, and on what terms.
   *
   * ONE PRICE PER PART was the model until 20 Oct, and it made the screen's
   * central decision undecidable: Quote Focus could not prefer availability
   * over cost when there was one of each. The customer's Quoting BoM mockup
   * carries a price list per line and an algorithm that walks it, so the line
   * carries one too. `runQuote` chooses from these; the Supplier dropdown
   * offers them; the price, stock, MOQ and lead time below are a copy of
   * whichever offer won, kept flat because every column in step 3 reads them.
   */
  offers: Offer[];
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
  /** Second-source AMLs. Most lines have none, which is the point. */
  alternates?: { mfg: string; mpn: string }[];
  /** What the quote run will find. '' means no supplier — the line stays N/A. */
  supplier: string; unitPrice: number; moq: number; pkg: string; lt: number; stock: number;
  attrition: number;
  /** Consigned stock, where there is any. Most lines have none. */
  netConsigned?: number;
  rocketConsigned?: number;
  rocketPrice?: number;
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
  { part: 'RES-0603-10K', revision: 'A', description: 'Resistor 10k 1% 0603', partSource: 'BUY', qty: 24, level: 1, mfg: 'Vishay', mpn: 'CRCW060310K0FKEA', supplier: 'Digi-Key', unitPrice: 0.012, moq: 5000, pkg: 'Reel', lt: 3, stock: 480000, attrition: 3, alternates: [{ mfg: 'Yageo', mpn: 'RC0603FR-0710KL' }, { mfg: 'KOA', mpn: 'RK73H1JTTD1002F' }] },
  { part: 'RES-0603-1K', revision: 'A', description: 'Resistor 1k 1% 0603', partSource: 'BUY', qty: 12, level: 1, mfg: 'Yageo', mpn: 'RC0603FR-071KL', supplier: 'Mouser', unitPrice: 0.009, moq: 5000, pkg: 'Reel', lt: 4, stock: 920000, attrition: 3 },
  /* The customer supplies these, so the quote should not be buying them. */
  { part: 'RES-0805-100R', revision: 'A', description: 'Resistor 100R 1% 0805', partSource: 'BUY', qty: 6, level: 1, mfg: 'Yageo', mpn: 'RC0805FR-07100RL', supplier: 'Digi-Key', unitPrice: 0.011, moq: 5000, pkg: 'Reel', lt: 3, stock: 310000, attrition: 0, netConsigned: 2000 },
  { part: 'CAP-0402-100N', revision: 'A', description: 'Cap 100nF 16V X7R 0402', partSource: 'BUY', qty: 48, level: 1, mfg: 'Murata', mpn: 'GRM155R71C104KA88D', supplier: 'Mouser', unitPrice: 0.008, moq: 10000, pkg: 'Reel', lt: 5, stock: 1200000, attrition: 5, alternates: [{ mfg: 'Samsung Electro-Mechanics', mpn: 'CL05B104KO5NNNC' }] },
  { part: 'CAP-0603-10U', revision: 'A', description: 'Cap 10uF 25V X5R 0603', partSource: 'BUY', qty: 14, level: 1, mfg: 'TDK', mpn: 'C1608X5R1E106M080AC', supplier: 'Arrow', unitPrice: 0.041, moq: 4000, pkg: 'Reel', lt: 9, stock: 88000, attrition: 4, alternates: [{ mfg: 'Taiyo Yuden', mpn: 'EMK107ABJ106MA-T' }] },
  { part: 'CAP-1206-22U', revision: 'B', description: 'Cap 22uF 16V X7R 1206', partSource: 'BUY', qty: 4, level: 1, mfg: 'Murata', mpn: 'GRM31CR71C226KE15L', supplier: '', unitPrice: 0, moq: 2000, pkg: 'Reel', lt: 0, stock: 0, attrition: 0 },
  { part: 'IC-PWR-BUCK-3A', revision: 'B', description: 'Buck converter 3A 17V', partSource: 'BUY', qty: 1, level: 1, mfg: 'Texas Instruments', mpn: 'TPS62130ARGTR', supplier: 'Arrow', unitPrice: 2.41, moq: 1, pkg: 'Cut Tape', lt: 12, stock: 8200, attrition: 0 },
  { part: 'IC-MCU-M4-256K', revision: 'C', description: 'MCU Cortex-M4 256K LQFP64', partSource: 'BUY', qty: 1, level: 1, mfg: 'STMicroelectronics', mpn: 'STM32F411RET6', supplier: 'Avnet', unitPrice: 5.87, moq: 1, pkg: 'Tray', lt: 26, stock: 140, attrition: 0 },
  /* Partly from Rocket's own floor stock, which Yes-Charge prices and
     Yes-No Charge does not — the one line where the two options differ. */
  { part: 'REG-LDO-3V3', revision: 'A', description: 'LDO regulator 3.3V 500mA', partSource: 'BUY', qty: 2, level: 1, mfg: 'Texas Instruments', mpn: 'TLV1117LV33DCYR', supplier: 'Digi-Key', unitPrice: 0.38, moq: 1, pkg: 'Cut Tape', lt: 7, stock: 24000, attrition: 0, rocketConsigned: 400, rocketPrice: 0.21 },
  { part: 'MOSFET-N-30V', revision: 'A', description: 'MOSFET N-ch 30V 5A SOT-23', partSource: 'BUY', qty: 3, level: 1, mfg: 'Nexperia', mpn: 'PMV45EN,215', supplier: 'Mouser', unitPrice: 0.14, moq: 3000, pkg: 'Reel', lt: 6, stock: 61000, attrition: 2 },
  { part: 'DIO-SCH-40V', revision: 'A', description: 'Schottky diode 40V 1A', partSource: 'BUY', qty: 5, level: 1, mfg: 'Nexperia', mpn: 'PMEG4010CEJ', supplier: 'Digi-Key', unitPrice: 0.09, moq: 3000, pkg: 'Reel', lt: 5, stock: 74000, attrition: 2, alternates: [{ mfg: 'Onsemi', mpn: 'NRVTS540ESFT1G' }] },
  { part: 'IND-4R7-1210', revision: 'A', description: 'Inductor 4.7uH 1210', partSource: 'BUY', qty: 2, level: 1, mfg: 'Bourns', mpn: 'SRN6045TA-4R7M', supplier: 'Arrow', unitPrice: 0.22, moq: 2000, pkg: 'Reel', lt: 11, stock: 15000, attrition: 0 },
  { part: 'CONN-HDR-2X10', revision: 'A', description: 'Header 2x10 2.54mm', partSource: 'BUY', qty: 1, level: 1, mfg: 'Samtec', mpn: 'TSW-110-07-G-D', supplier: '', unitPrice: 0, moq: 1, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'XTAL-16MHZ', revision: 'A', description: 'Crystal 16MHz 20ppm', partSource: 'BUY', qty: 1, level: 1, mfg: 'Abracon', mpn: 'ABM8G-16.000MHZ', supplier: '', unitPrice: 0, moq: 100, pkg: '', lt: 0, stock: 0, attrition: 0 },
  { part: 'LED-GRN-0805', revision: 'A', description: 'LED green 0805', partSource: 'BUY', qty: 2, level: 1, mfg: 'Lite-On', mpn: 'LTST-C170KGKT', supplier: 'Digi-Key', unitPrice: 0.09, moq: 3000, pkg: 'Reel', lt: 8, stock: 640, attrition: 2 },
  { part: 'FUSE-2A-1206', revision: 'A', description: 'Fuse 2A 1206 fast', partSource: 'BUY', qty: 1, level: 1, mfg: 'Bel Fuse', mpn: '0678L2000-01', supplier: 'Mouser', unitPrice: 0.31, moq: 1000, pkg: 'Reel', lt: 14, stock: 300, attrition: 0 },
  { part: 'SW-TACT-6MM', revision: 'A', description: 'Tactile switch 6mm SMD', partSource: 'BUY', qty: 2, level: 1, mfg: 'C&K Components', mpn: 'PTS645SM43SMTR92', supplier: 'Digi-Key', unitPrice: 0.17, moq: 1500, pkg: 'Reel', lt: 10, stock: 22000, attrition: 0 },
  { part: 'FER-BEAD-600R', revision: 'A', description: 'Ferrite bead 600R 0603', partSource: 'BUY', qty: 4, level: 1, mfg: 'Wurth Elektronik', mpn: '742792040', supplier: 'Mouser', unitPrice: 0.06, moq: 4000, pkg: 'Reel', lt: 6, stock: 130000, attrition: 2, netConsigned: 500, rocketConsigned: 1000, rocketPrice: 0.04 },
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
/* Display name back to id, so a seed written in the customer's own vocabulary
   ("Digi-Key") lands on the supplier the setup is keyed by. */
const SUPPLIER_ID = Object.fromEntries(
  Object.entries(SUPPLIERS).map(([id, name]) => [name, id]),
) as Record<string, SupplierId>;

const GROUP1 = Object.keys(MASTER_GROUP).filter(id => MASTER_GROUP[id] === 1);
const GROUP2 = Object.keys(MASTER_GROUP).filter(id => MASTER_GROUP[id] === 2);

/**
 * The price list for one part.
 *
 * DERIVED FROM THE SEED, not invented beside it: the seed's own supplier keeps
 * the seed's exact numbers, so the figures this prototype has shown since
 * September are still in the list. The other two are the shapes the algorithm
 * exists to choose between, and between them they make every setting on the
 * setup strip change the answer:
 *
 *   a cut-tape source    MOQ 1, dearer per piece, thin stock. The only offer
 *                        that survives Excess and MOQ = None or Low, because a
 *                        5,000-piece reel against a 2,400-piece build is excess
 *                        by any reading of the word.
 *   a group-2 source     cheaper per piece, four times the MOQ. Wins under OK
 *                        with Stock-Low cost, loses under Production.
 *
 * A SUPPLIER WITH NO PRIORITY GROUP GETS THE LINE TO ITSELF. The aluminium
 * bracket comes from a machine shop, not a distributor, and there is no second
 * source for it — so that line carries one offer from a supplier auto-pick is
 * not allowed to reach. It arrives red, and a quoter chooses it by hand out of
 * the dropdown's second list. That is the preferred/approved distinction doing
 * its job rather than being described.
 *
 * A seed with no supplier gets no offers at all. Those three lines are the ones
 * the guideline wants arriving as "No Bid", and a price list would take that
 * away.
 */
function offersFor(s: Seed, i: number): Offer[] {
  const own = SUPPLIER_ID[s.supplier];
  if (!own) return [];
  const round = (n: number) => Number(n.toFixed(6));
  const mine: Offer = {
    supplier: own, unitPrice: s.unitPrice, stock: s.stock, moq: s.moq, pkg: s.pkg, lt: s.lt,
  };
  if (!MASTER_GROUP[own]) return [mine];

  const pick = (pool: string[]) => {
    const others = pool.filter(id => id !== own);
    return others[i % others.length];
  };
  return [
    mine,
    /* CUT TAPE IS STOCKED IN THE LOW THOUSANDS, whatever the reel count says —
       a distributor cuts from a reel it has opened. The cap is what makes
       Excess and MOQ a real setting rather than a decorative one: below it the
       quote takes cut tape and carries no excess, above it the only offer left
       is a reel, and under None or Low that offer is refused and the line comes
       back for a decision. Switching to OK buys the reel and shows the excess
       it costs, which is the trade the setting exists to put in front of
       somebody. */
    { supplier: pick(GROUP1), unitPrice: round(s.unitPrice * 1.35),
      stock: Math.min(s.stock, 2500), moq: 1, pkg: 'Cut Tape', lt: s.lt + 2 },
    { supplier: pick(GROUP2), unitPrice: round(s.unitPrice * 0.85),
      stock: s.stock * 2, moq: s.moq > 1 ? s.moq * 4 : 1, pkg: s.pkg, lt: s.lt + 5 },
  ];
}

/**
 * What the marketplace has to say about each manufacturer part number.
 *
 * NOT EVERY LINE, because that is not what a lookup looks like: most parts
 * match exactly and have nothing to decide. Three shapes are seeded, and every
 * one of them appears on this BoM:
 *
 *   nothing        the catalogue has one answer and it is the file's value.
 *                  No `*`, no popover, nothing to do. Most lines.
 *   matched        two orderable variants and the system picked one. The `*`
 *                  says a choice exists; the cell is not an error.
 *   unmatched      the file's value is close to several and identical to none,
 *                  so the system will not guess. Red, and the quote cannot be
 *                  finished until somebody says which.
 *
 * The packaging suffix is the real reason this exists. `,118` and `Z` are tape
 * and tray of the same die; an estimator who picks the wrong one quotes a part
 * the line cannot use.
 */
function nexarFor(s: Seed, i: number): (NexarLookup | null)[] {
  const pairs = [{ mfg: s.mfg, mpn: s.mpn }, ...(s.alternates ?? [])];
  return pairs.map((pair, j) => {
    if (!pair.mpn) return null;
    /* Deterministic, and spread across the BoM rather than clustered: every
       third AML carries a lookup, and every second of those is one the system
       could not resolve. */
    if ((i + j) % 3 !== 0) return null;
    /* The second variant is sold by the manufacturer's US entity, which is how
       the catalogue spells it and not how the BoM does. That difference is the
       reason the MFG column follows the pick at all — "NXP" in the file,
       "NXP USA Inc." in the quote — so one of the two candidates carries it. */
    const candidates = [
      { mpn: `${pair.mpn},118`, mfg: pair.mfg },
      { mpn: `${pair.mpn}Z`, mfg: `${pair.mfg} USA Inc.` },
    ];
    const resolvable = (i + j) % 6 === 0;
    return resolvable
      /* The file's own value is orderable, and it is first in the list. */
      ? { candidates: [{ mpn: pair.mpn, mfg: pair.mfg }, ...candidates], matched: 0 }
      /* Close to both, identical to neither. */
      : { candidates, matched: null };
  });
}

export function buildBomLines(): BomLine[] {
  return SEEDS.map((s, i) => ({
    offers: offersFor(s, i),
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
    alternates: s.alternates ?? [],
    nexar: nexarFor(s, i),
    netConsigned: s.netConsigned,
    rocketConsigned: s.rocketConsigned,
    rocketPrice: s.rocketPrice,
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
/** Everything the run needs to decide. Named rather than positional: there are
 *  seven of them now and two are objects. */
export type QuoteRules = {
  buildQty: number;
  attritionSet: number;
  provider: PrimaryProvider;
  quoteFocus: string;
  materialPackageType: string;
  /** How much over-ordering the MOQ is allowed to force. */
  excessMoq: string;
  /** Whether this quote uses the customer's consigned stock, and Rocket's. */
  netConsigned: string;
  rocketConsigned: string;
  suppliers: SupplierSetup;
};

/** A supplier's offer, measured against what this line actually needs. */
type Candidate = {
  offer: Offer;
  group: number;
  orderQty: number;
  excess: number;
  stockOk: boolean;
  pkgOk: boolean;
};

/* "Reels", "$50 Reels" and "$25 Reels" all ask for a reel; the price in the
   label is the reel charge, not a different packaging. */
const wantsReel = (setting: string) => /reel/i.test(setting);

/**
 * How much of this line the quote does not have to buy, and what that costs.
 *
 * THE ORDER MATTERS. The customer's material goes first because it is free by
 * definition, and Rocket's floor stock covers whatever is left — charged or
 * not, as the setting says. Taking them the other way round would bill for
 * Rocket stock while the customer's own parts sat unused.
 */
function consignedFor(line: BomLine, total: number, rules: QuoteRules) {
  let consigned = 0;
  let consignedCost = 0;
  if (rules.netConsigned !== 'No' && line.netConsigned) {
    consigned += Math.min(line.netConsigned, total);
  }
  if (rules.rocketConsigned !== 'No' && line.rocketConsigned) {
    const q = Math.min(line.rocketConsigned, total - consigned);
    consigned += q;
    if (rules.rocketConsigned === 'Yes-Charge') consignedCost += q * (line.rocketPrice ?? 0);
  }
  return { consigned, consignedCost };
}

/** What a line draws from consigned stock, for the grid's own column. */
export function consignedQty(line: BomLine, total: number,
                             net: string, rocket: string): number {
  return consignedFor(line, total, { netConsigned: net, rocketConsigned: rocket } as QuoteRules).consigned;
}

/**
 * Which offer the quote takes, and why.
 *
 * STRAIGHT FROM THE CUSTOMER'S MOCKUP of 16 Oct, which is the first document
 * that states the rule rather than describing the screen:
 *
 *   "Walk priority groups: the first group that has a supplier with enough
 *    stock wins" — then, inside that group, Quote Focus decides.
 *
 * The order matters and is not arbitrary. A franchised distributor who can
 * cover the build beats a cheaper one who cannot, because a shortfall is a
 * schedule problem and a few cents is not. Only when NO group can cover does
 * price lead, and the line is flagged NO so the shortfall is visible.
 */
function chooseOffer(line: BomLine, total: number, rules: QuoteRules): Candidate | null {
  const setup = rules.suppliers;
  const evaluate = (offer: Offer): Candidate => {
    const orderQty = Math.max(total, offer.moq);
    return {
      offer,
      /* 9, not 3: a supplier with no priority group is approved rather than
         preferred, and sorting it after both groups is how "auto-pick never
         reaches it, you may still choose it by hand" is expressed. */
      group: setup[offer.supplier]?.group ?? 9,
      orderQty,
      excess: orderQty - total,
      stockOk: offer.stock >= orderQty,
      pkgOk: wantsReel(rules.materialPackageType) === /reel/i.test(offer.pkg),
    };
  };

  const byName = (a: Candidate, b: Candidate) =>
    SUPPLIERS[a.offer.supplier].localeCompare(SUPPLIERS[b.offer.supplier]);

  /* EXCESS AND MOQ, the customer's own three settings. "None" takes only an
     offer whose MOQ it can use exactly; "Low" tolerates a quarter over; "OK"
     does not care. A reel of 5,000 against a build of 500 is the single
     biggest source of quoted cost in this product, which is why it is a
     setting and not a constant. */
  const withinExcess = (c: Candidate) =>
    rules.excessMoq === 'OK' ? true
      : rules.excessMoq === 'Low' ? c.excess <= Math.ceil(total * 0.25)
        : c.excess === 0;

  const usable = line.offers
    .filter(o => setup[o.supplier]?.on)
    .map(evaluate)
    .filter(withinExcess);
  if (!usable.length) return null;

  const sort: Record<string, (a: Candidate, b: Candidate) => number> = {
    /* Availability first, then the shortest wait, then price. */
    'Production-Competitive Cost': (a, b) =>
      Number(b.stockOk) - Number(a.stockOk) || a.offer.lt - b.offer.lt
      || a.offer.unitPrice - b.offer.unitPrice || byName(a, b),
    /* Stock on the shelf in the packaging asked for, cost accepted. */
    'Stock-High cost': (a, b) =>
      Number(b.pkgOk) - Number(a.pkgOk) || b.offer.unitPrice - a.offer.unitPrice || byName(a, b),
    /* Same, but the cheapest ORDER rather than the cheapest piece — a low unit
       price on a reel four times too big is not the cheaper answer. */
    'Stock-Low cost': (a, b) =>
      Number(b.pkgOk) - Number(a.pkgOk)
      || a.orderQty * a.offer.unitPrice - b.orderQty * b.offer.unitPrice || byName(a, b),
  };
  const within = sort[rules.quoteFocus] ?? sort['Production-Competitive Cost'];

  for (const g of [...new Set(usable.map(c => c.group))].sort((a, b) => a - b)) {
    const covered = usable.filter(c => c.group === g && c.stockOk).sort(within);
    if (covered.length) return covered[0];
  }
  /* Nobody can cover it. Still choose — the quote needs a price and the line
     needs to say what is wrong — and let the shortfall mark it NO. */
  return [...usable].sort((a, b) => a.group - b.group || within(a, b))[0];
}

/** The terms of one offer, written onto the line's flat quoting fields. */
function priceFrom(line: BomLine, c: Candidate, total: number, consignedCost = 0): BomLine {
  const excessQty = Math.max(0, c.orderQty - total);
  const outStock = Math.max(0, c.orderQty - c.offer.stock);
  return {
    ...line,
    supplier: SUPPLIERS[c.offer.supplier],
    unitPrice: c.offer.unitPrice,
    stock: c.offer.stock,
    outStock,
    lt: c.offer.lt,
    pkg: c.offer.pkg,
    moq: c.offer.moq,
    orderQty: c.orderQty,
    excessQty,
    /* Rocket's consigned stock is charged for under Yes-Charge, so the line's
       amount is what is bought PLUS what is drawn from the floor. */
    amount: c.offer.unitPrice * c.orderQty + consignedCost,
    excessAmt: c.offer.unitPrice * excessQty,
    /* A shortfall is what makes a line NO; everything else that priced is
       COVER. */
    status: (outStock > 0 ? 'NO' : 'COVER') as LineStatus,
  };
}

/** Re-price one line against an offer the user picked by hand. */
export function pickSupplier(line: BomLine, supplier: SupplierId,
                             buildQty: number, attritionSet: number): BomLine {
  const offer = line.offers.find(o => o.supplier === supplier);
  if (!offer) return line;
  const total = totalQtyOf(line, buildQty, attritionSet);
  const orderQty = Math.max(total, offer.moq);
  return priceFrom(line, {
    offer, group: MASTER_GROUP[supplier] ?? 9, orderQty,
    excess: orderQty - total, stockOk: offer.stock >= orderQty, pkgOk: true,
  }, total);
}

export function runQuote(lines: BomLine[], rules: QuoteRules): BomLine[] {
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

     A supplier already chosen SURVIVES this. Update Results re-runs the
     pricing, and wiping the manual selections it exists to support would make
     the button destroy the work of the mode. */
  const manual = rules.quoteFocus === 'OTHER';

  return lines.map(line => {
    if (line.excluded) {
      /* "Excluded BOM lines have Status = NO BID" and carry no pricing. */
      return { ...line, status: 'NO BID' as LineStatus, supplier: '', unitPrice: 0, amount: 0 };
    }
    const total = totalQtyOf(line, rules.buildQty, rules.attritionSet);
    const { consigned, consignedCost } = consignedFor(line, total, rules);
    const toBuy = total - consigned;

    /* NOTHING LEFT TO BUY. Consigned stock covers the line, so no supplier is
       asked and none is shown — "Consigned" is the answer to "where is this
       coming from", and it is not a gap to be filled. */
    if (toBuy <= 0) {
      return { ...line, supplier: 'Consigned', status: 'COVER' as LineStatus,
               orderQty: 0, moq: 0, excessQty: 0, excessAmt: 0, stock: 0, lt: 0, pkg: '',
               unitPrice: 0, amount: consignedCost };
    }

    /* Z2data finds the 22uF cap that Nexar does not — the one line in this set
       where the provider changes what comes back, kept because it is the only
       thing on screen that makes the Primary Provider setting observable. */
    const offers = line.offers.length === 0
      && rules.provider === 'Z2data' && line.part === 'CAP-1206-22U'
      ? [{ supplier: 'arrow', unitPrice: 0.31, stock: 14000, moq: 2000, pkg: 'Reel', lt: 9 }]
      : line.offers;

    if (manual) {
      /* Keep whatever the user picked; price it if it is a real offer. */
      const held = offers.find(o => SUPPLIERS[o.supplier] === line.supplier);
      if (!held) {
        return { ...line, status: 'N/A' as LineStatus, supplier: '', orderQty: 0, moq: 0,
                 excessQty: 0, excessAmt: 0, stock: 0, lt: 0, pkg: '', unitPrice: 0, amount: 0 };
      }
      const orderQty = Math.max(toBuy, held.moq);
      return priceFrom({ ...line, offers }, {
        offer: held, group: rules.suppliers[held.supplier]?.group ?? 9, orderQty,
        excess: orderQty - toBuy, stockOk: held.stock >= orderQty, pkgOk: true,
      }, toBuy, consignedCost);
    }

    const chosen = chooseOffer({ ...line, offers }, toBuy, rules);
    if (!chosen) {
      /* No offer survived the supplier list and the excess policy. Both are
         the user's own settings, so this is a result rather than a failure —
         and the red row with Status = N/A is where they see it. */
      return { ...line, offers, status: 'N/A' as LineStatus, supplier: '', orderQty: 0, moq: 0,
               excessQty: 0, excessAmt: 0, stock: 0, lt: 0, pkg: '', unitPrice: 0, amount: 0 };
    }
    return priceFrom({ ...line, offers }, chosen, toBuy, consignedCost);
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
  fmtMoney(n);
export const money3 = (n: number) =>
  fmtMoney(n, { decimals: 3 });
