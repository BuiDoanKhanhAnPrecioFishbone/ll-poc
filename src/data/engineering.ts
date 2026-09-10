/* =============================================================================
   MANUFACTURERS, MPNs AND PACKING LISTS
   -----------------------------------------------------------------------------
   Three list screens the live system has and this prototype did not, found in
   the 10 Sep re-check (docs/live-recheck-10sep.md, gaps M4–M6).

   EVERY COLUMN HERE WAS READ OFF THE LIVE GRID. Nothing is invented, and where
   the live screen shows a field whose VALUES we have never seen, the generator
   says so rather than guessing a vocabulary — see `LIFECYCLE` below.

   The seed is deterministic for the same reason the other generators are: a
   part number must read the same on every screen and on every reload, or two
   screens quietly disagree in a demo.
   ========================================================================== */
import type { ColumnSpec } from '../components/column-model';

/* One tiny PRNG, seeded per row index, so nothing depends on call order. */
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
};

const pick = <T,>(r: () => number, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

/* ---------------------------------------------------------------- Manufacturers */

export type Manufacturer = {
  id: string;
  name: string;
  website: string;
  country: string;
  aliases: string;
  status: string;
  lastSync: Date;
};

/* Real manufacturers, because the screen is about identity and "Manufacturer 7"
   would make the ALIASES column meaningless — aliases only read as aliases
   against a name you recognise. */
const MFG = [
  ['Murata Manufacturing', 'murata.com', 'Japan', 'Murata Electronics; Murata Mfg Co'],
  ['Texas Instruments', 'ti.com', 'United States', 'TI; Texas Instr'],
  ['Vishay Intertechnology', 'vishay.com', 'United States', 'Vishay Dale; Vishay Sprague'],
  ['Samsung Electro-Mechanics', 'samsungsem.com', 'South Korea', 'SEMCO; Samsung EM'],
  ['TDK Corporation', 'tdk.com', 'Japan', 'TDK-EPC; EPCOS'],
  ['Yageo', 'yageo.com', 'Taiwan', 'Yageo Phycomp; Phycomp'],
  ['KEMET', 'kemet.com', 'United States', 'KEMET Electronics'],
  ['Nichicon', 'nichicon.co.jp', 'Japan', ''],
  ['STMicroelectronics', 'st.com', 'Switzerland', 'ST; SGS-Thomson'],
  ['Analog Devices', 'analog.com', 'United States', 'ADI; Linear Technology; Maxim Integrated'],
  ['Panasonic', 'panasonic.com', 'Japan', 'Matsushita'],
  ['Würth Elektronik', 'we-online.com', 'Germany', 'Wurth; WE'],
  ['Bourns', 'bourns.com', 'United States', ''],
  ['Littelfuse', 'littelfuse.com', 'United States', 'IXYS'],
  ['Amphenol', 'amphenol.com', 'United States', 'Amphenol ICC; FCI'],
  ['TE Connectivity', 'te.com', 'Switzerland', 'Tyco Electronics; AMP'],
  ['Molex', 'molex.com', 'United States', ''],
  ['ON Semiconductor', 'onsemi.com', 'United States', 'onsemi; Fairchild'],
] as const;

export function generateManufacturers(): Manufacturer[] {
  return MFG.map(([name, website, country, aliases], i) => {
    const r = rng(i * 7919 + 11);
    return {
      id: `MFG-${String(i + 1).padStart(4, '0')}`,
      name, website, country, aliases,
      /* Live shows a STATUS column on this screen. Two values are all the
         screen can support without inventing a workflow we have not seen. */
      status: r() > 0.12 ? 'Active' : 'Inactive',
      /* Seconds vary. A `datetime` column whose every row ends `:00` claims a
         precision the data does not have — the same fault this project fixed on
         Part Master. */
      lastSync: new Date(2026, 8, 1 + Math.floor(r() * 9), 8 + Math.floor(r() * 9), Math.floor(r() * 60), Math.floor(r() * 60)),
    };
  });
}

export const MANUFACTURER_COLUMNS: ColumnSpec<Manufacturer>[] = [
  { field: 'name',     title: 'Name',     role: 'text', searchable: true },
  { field: 'website',  title: 'Website',  role: 'text', searchable: true },
  { field: 'country',  title: 'Country',  role: 'text' },
  /* Semicolon-separated on the live screen, and long. It stays a text column
     rather than becoming chips: chips would wrap and break the row height the
     density preference promises. */
  { field: 'aliases',  title: 'Aliases',  role: 'text', searchable: true },
  { field: 'status',   title: 'Status',   role: 'status' },
  { field: 'lastSync', title: 'Last Sync', role: 'datetime' },
];

/* ------------------------------------------------------------------------ MPN */

export type Mpn = {
  id: string;
  mpnNumber: string;
  manufacturer: string;
  description: string;
  lifecycleStatus: string;
  mslLevel: string;
  packageType: string;
  countryOfOrigin: string;
  pcnAlert: string;
  lastSyncedAt: Date;
};

/* IPC/JEDEC J-STD-020 moisture sensitivity levels — a real, fixed vocabulary,
   so these are not invented. */
const MSL = ['1', '2', '2a', '3', '4', '5', '5a', '6'] as const;

/* Industry-standard lifecycle vocabulary. The live column's own values were NOT
   observed — the grid was read on a screen whose rows had not loaded — so this
   is the standard set and is flagged in the gap list as needing confirmation
   against theirs before anything depends on the exact words. */
const LIFECYCLE = ['Active', 'NRND', 'Obsolete', 'End of Life', 'Preliminary'] as const;

const PKG = ['0402', '0603', '0805', '1206', 'SOT-23', 'SOIC-8', 'QFN-32',
             'TQFP-64', 'BGA-256', 'DO-214AA', 'TO-252'] as const;

const ORIGIN = ['Japan', 'China', 'Taiwan', 'Malaysia', 'Philippines',
                'United States', 'Germany', 'South Korea', 'Thailand'] as const;

export function generateMpns(n = 600): Mpn[] {
  const mfg = generateManufacturers();
  return Array.from({ length: n }, (_, i) => {
    const r = rng(i * 6151 + 29);
    const m = pick(r, mfg);
    const pkg = pick(r, PKG);
    return {
      id: `MPN-${String(i + 1).padStart(5, '0')}`,
      mpnNumber: `${m.name.slice(0, 2).toUpperCase()}${Math.floor(r() * 900000 + 100000)}-${pkg}`,
      manufacturer: m.name,
      description: `${pick(r, ['CAP CER', 'RES SMD', 'IND MULTI', 'DIODE SCHOTTKY', 'MOSFET N-CH', 'CONN HDR', 'LDO REG'])} ${pkg}`,
      lifecycleStatus: pick(r, LIFECYCLE),
      mslLevel: pick(r, MSL),
      packageType: pkg,
      countryOfOrigin: pick(r, ORIGIN),
      /* A PCN is a Product Change Notice. The live column is called PCN ALERT,
         so it reports whether one is outstanding, not how many exist. */
      pcnAlert: r() > 0.86 ? 'Yes' : 'No',
      lastSyncedAt: new Date(2026, 8, 1 + Math.floor(r() * 9), 6 + Math.floor(r() * 12), Math.floor(r() * 60), Math.floor(r() * 60)),
    };
  });
}

export const MPN_COLUMNS: ColumnSpec<Mpn>[] = [
  { field: 'mpnNumber',       title: 'MPN Number',        role: 'ident', searchable: true },
  { field: 'manufacturer',    title: 'Manufacturer',      role: 'text',  searchable: true },
  { field: 'description',     title: 'Description',       role: 'text',  searchable: true },
  { field: 'lifecycleStatus', title: 'Lifecycle Status',  role: 'status' },
  { field: 'mslLevel',        title: 'MSL Level',         role: 'code' },
  { field: 'packageType',     title: 'Package Type',      role: 'code' },
  { field: 'countryOfOrigin', title: 'Country of Origin', role: 'text' },
  { field: 'pcnAlert',        title: 'PCN Alert',         role: 'code' },
  /* Live calls it LAST SYNCED AT and renders a moment, not a day — the same
     reason Part Master's LAST CHANGE carries a time. */
  { field: 'lastSyncedAt',    title: 'Last Synced At',    role: 'datetime' },
];

/* --------------------------------------------------------------- Packing lists */

export type PackingListRow = {
  id: string;
  packingList: string;
  salesOrder: string;
  customer: string;
  fulfillment: string;
  billing: string;
  totalQty: number;
  shipDate: Date;
};

/* FULFILLMENT and BILLING are the live column names. The bundle gives the one
   state transition this screen has — `Packing_List.Confirm_Ship_Title`,
   `Packing_List.Ship_Confirm`, and the message "Mark this packing list as
   SHIPPED? This stamps the ship date and updates shipped quantities." — so
   SHIPPED is a real value on the fulfillment axis. The rest of each vocabulary
   was not observed and is flagged. */
const FULFILLMENT = ['Pending', 'Picked', 'Packed', 'Shipped'] as const;
const BILLING = ['Not Invoiced', 'Invoiced', 'Paid'] as const;

const CUSTOMERS = ['00455 - Cerebras Systems. Inc.', '00848 - KT Controls Ltd',
                   '01455 - Brightpath Medical', '00378 - Nokia Networks Oy',
                   '01204 - Meridian Avionics', '00472 - Cadence Design Systems'] as const;

export function generatePackingLists(n = 180): PackingListRow[] {
  return Array.from({ length: n }, (_, i) => {
    const r = rng(i * 4093 + 53);
    return {
      id: `PL-${String(i + 1).padStart(5, '0')}`,
      packingList: `PL${String(24000 + i)}`,
      salesOrder: `SO${String(58000 + Math.floor(r() * 900))}`,
      customer: pick(r, CUSTOMERS),
      fulfillment: pick(r, FULFILLMENT),
      billing: pick(r, BILLING),
      totalQty: Math.floor(r() * 4800) + 12,
      shipDate: new Date(2026, 7 + Math.floor(r() * 2), 1 + Math.floor(r() * 28)),
    };
  });
}

export const PACKING_LIST_COLUMNS: ColumnSpec<PackingListRow>[] = [
  { field: 'packingList', title: 'Packing List', role: 'ident', searchable: true },
  { field: 'salesOrder',  title: 'Sales Order',  role: 'ident', searchable: true },
  { field: 'customer',    title: 'Customer',     role: 'text',  searchable: true },
  { field: 'fulfillment', title: 'Fulfillment',  role: 'status' },
  { field: 'billing',     title: 'Billing',      role: 'status' },
  { field: 'totalQty',    title: 'Total Qty',    role: 'number' },
  { field: 'shipDate',    title: 'Ship Date',    role: 'date' },
];
