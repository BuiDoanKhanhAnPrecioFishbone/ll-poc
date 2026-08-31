import { KNOWN_MANUFACTURERS } from './bom';

/* =============================================================================
   MFG–MPN (AML — Approved Manufacturer List)
   -----------------------------------------------------------------------------
   "Manages the list of valid Manufacturer and MPN combinations associated with
   each Part, serving as the foundation for identifying supply sources,
   supporting quotation and pricing, and tracking inventory and cost data."

   COLUMN NAMES ARE THE LIVE SYSTEM'S, read from its own resource bundle
   (`chunk-CqZKuw2K.js`, plaintext) on 31 Aug 2026:

     MPN · Order Preference · Rocket OH · Customer OH · Total On Hand ·
     Safety Stock · AVG Cost · Last Purchased Cost · Manufacturer · Description

   One differs from the guideline by a hyphen — the sheet writes "Total On-Hand",
   the live system "Total On Hand". Decision D2 puts the live wording on screen.
   ========================================================================== */

export const ORDER_PREFERENCE = ['Primary', 'Alternate'] as const;
export type OrderPreference = (typeof ORDER_PREFERENCE)[number];

export type MpnMapping = {
  id: string;
  /** The part this mapping belongs to. Read-only once created. */
  partNumber: string;
  manufacturer: string;
  mpn: string;
  /** Read-only in the detail popup, with Part Number. */
  description: string;
  orderPreference: OrderPreference;
  /** Company-owned inventory, available for any project. */
  rocketOh: number;
  /** Consigned inventory, restricted to that customer's orders. */
  customerOh: number;
  safetyStock: number;
  avgCost: number;
  lastPurchasedCost: number;
};

/**
 * Total On Hand = Rocket OH + Customer OH.
 *
 * The sheet defines it as the sum, so it is computed rather than stored. A
 * stored total is a third number that can disagree with the two it comes from,
 * and this one is displayed beside both of them.
 */
export function totalOnHand(m: Pick<MpnMapping, 'rocketOh' | 'customerOh'>): number {
  return m.rocketOh + m.customerOh;
}

/** Below the buffer that exists to prevent a shortage. */
export function belowSafetyStock(m: MpnMapping): boolean {
  return m.safetyStock > 0 && totalOnHand(m) < m.safetyStock;
}

/* ---- Stock Report --------------------------------------------------------- */

/**
 * One inventory line behind an MPN.
 *
 * Columns are the live Stock Report's: Date, Location, Manufacturer, MPN,
 * Owner, Quantity, Available Qty, Unit — plus Allocate Qty and Owner Type,
 * which the live Update Quantity popup adds.
 */
export type StockLine = {
  id: string;
  date: Date;
  location: string;
  manufacturer: string;
  mpn: string;
  /** Rocket, or the customer the consigned stock belongs to. */
  owner: string;
  ownerType: 'Rocket' | 'Customer';
  quantity: number;
  allocatedQty: number;
  unit: string;
};

/** Available Qty = Quantity − Allocate Qty, and never below zero. */
export function availableQty(l: Pick<StockLine, 'quantity' | 'allocatedQty'>): number {
  return Math.max(0, l.quantity - l.allocatedQty);
}

/* =============================================================================
   GENERATED DATA
   ========================================================================== */

/** Deterministic per part, so the same part shows the same AML every time. */
function seededRandom(seedText: string) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) | 0;
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MFGS = [...KNOWN_MANUFACTURERS];
const LOCATIONS = ['A-01-03', 'A-02-11', 'B-04-07', 'C-01-02', 'RECEIVING'];
const UNITS = ['EACH', 'REEL', 'TRAY'];

/** An MPN that looks like one — manufacturer-flavoured, not a random string. */
function makeMpn(rnd: () => number, mfg: string): string {
  const stem = mfg.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const n = Math.floor(rnd() * 900000) + 100000;
  const suffix = ['KEA', 'TR', 'G-D', 'M080AC', '08W'][Math.floor(rnd() * 5)];
  return `${stem}${n}-${suffix}`;
}

/**
 * The mappings a part starts with.
 *
 * ONE PRIMARY AND THE REST ALTERNATE, because that is what "Purchasing priority
 * (Primary/Alternate) guiding buyers" is for — a priority where everything is
 * primary guides nobody. The sheet does not state the rule, so it is a shape
 * the generated data takes rather than a constraint the form enforces; see the
 * open question.
 *
 * Some parts get NONE. An AML that every part already has would hide the empty
 * state, which is the state that makes "Add a line" mean anything.
 */
export function generateMappings(partNumber: string, description: string): MpnMapping[] {
  const rnd = seededRandom(partNumber);
  if (rnd() < 0.18) return [];

  const count = 1 + Math.floor(rnd() * 3);
  const used = new Set<string>();
  const out: MpnMapping[] = [];

  for (let i = 0; i < count; i++) {
    let mfg = MFGS[Math.floor(rnd() * MFGS.length)];
    /* One manufacturer per mapping — the same MFG twice on one part is the
       duplicate that Create BoM blocks, so it must not be generated here. */
    let guard = 0;
    while (used.has(mfg) && guard++ < 10) mfg = MFGS[Math.floor(rnd() * MFGS.length)];
    if (used.has(mfg)) continue;
    used.add(mfg);

    const rocketOh = Math.floor(rnd() * 5000);
    const customerOh = rnd() > 0.6 ? Math.floor(rnd() * 2000) : 0;
    const avgCost = Math.round(rnd() * 4000) / 100;

    out.push({
      id: `${partNumber}-${i}`,
      partNumber,
      manufacturer: mfg,
      mpn: makeMpn(rnd, mfg),
      description,
      orderPreference: i === 0 ? 'Primary' : 'Alternate',
      rocketOh,
      customerOh,
      safetyStock: rnd() > 0.35 ? Math.floor(rnd() * 1500) : 0,
      avgCost,
      /* Within a quarter of the average either way — a last price far from the
         running average would read as a data error rather than a market move. */
      lastPurchasedCost: Math.round(avgCost * (0.75 + rnd() * 0.5) * 100) / 100,
    });
  }
  return out;
}

/** The stock lines behind one mapping. */
export function generateStock(m: MpnMapping, customer: string): StockLine[] {
  const rnd = seededRandom(`${m.id}-stock`);
  const out: StockLine[] = [];

  /* Rocket-owned stock accounts for Rocket OH, consigned stock for Customer OH,
     so the Stock Report adds up to the row that opened it. A report that
     disagreed with its own summary would be worse than no report. */
  if (m.rocketOh > 0) {
    let left = m.rocketOh;
    const lines = 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < lines; i++) {
      const qty = i === lines - 1 ? left : Math.floor(left * (0.3 + rnd() * 0.4));
      left -= qty;
      if (qty <= 0) continue;
      out.push({
        id: `${m.id}-r${i}`,
        date: new Date(2026, 7, 1 + Math.floor(rnd() * 30)),
        location: LOCATIONS[Math.floor(rnd() * LOCATIONS.length)],
        manufacturer: m.manufacturer, mpn: m.mpn,
        owner: 'Rocket EMS', ownerType: 'Rocket',
        quantity: qty,
        allocatedQty: Math.floor(qty * rnd() * 0.4),
        unit: UNITS[Math.floor(rnd() * UNITS.length)],
      });
    }
  }
  if (m.customerOh > 0) {
    out.push({
      id: `${m.id}-c0`,
      date: new Date(2026, 7, 1 + Math.floor(rnd() * 30)),
      location: LOCATIONS[Math.floor(rnd() * LOCATIONS.length)],
      manufacturer: m.manufacturer, mpn: m.mpn,
      owner: customer || 'Customer', ownerType: 'Customer',
      quantity: m.customerOh,
      allocatedQty: Math.floor(m.customerOh * rnd() * 0.5),
      unit: UNITS[Math.floor(rnd() * UNITS.length)],
    });
  }
  return out;
}

/* =============================================================================
   SESSION STORE
   -----------------------------------------------------------------------------
   The same reasoning as `createdParts.ts`: the catalogue is generated from a
   seed so it is identical every time, and an edit the user just made has no
   seed to come from. Held per part number, so closing the record and opening it
   again shows the change — an edit that vanished on close would read as a
   failed save rather than as a prototype's limit. Not persisted across a
   reload, for the reason recorded there.
   ========================================================================== */

const edited = new Map<string, MpnMapping[]>();

export function mappingsFor(partNumber: string, description: string): MpnMapping[] {
  const held = edited.get(partNumber);
  if (held) return held;
  return generateMappings(partNumber, description);
}

export function setMappings(partNumber: string, rows: MpnMapping[]) {
  edited.set(partNumber, rows);
}
