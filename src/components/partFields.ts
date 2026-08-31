import type { FieldDef } from './quotation/RecordField';
import type { Part } from '../data/parts';
import {
  PART_SOURCE, PART_CLASS, PART_CLASS_TYPES, ABC, PART_PACKAGE,
  PART_MATERIAL_TYPE, UNIT_OF_MEASURE, ORDER_POLICY, DAY_OF_WEEK,
} from '../data/partMetadata';
import { CUSTOMER_OPTIONS } from '../data/quotations';

/* One declaration per field, grouped as the Testing Guideline groups them —
   the same pattern as `requirementFields.ts`, and for the same reason: these
   drive the create form AND the record view, so the two cannot drift.

   THE GROUPING IS THE CUSTOMER'S, NOT MINE. Sub-steps 2.9 to 2.14 name six
   sections and say which tab each sits under. Thirty-odd fields in one modal is
   a wall; the sheet's own division into General Info and Quantity Info, each
   with three sections, is both the specification and the better screen.

   LABELS ARE THE SHEET'S, with two exceptions noted at the fields concerned. */

/**
 * Identification — above the tabs.
 *
 * The sheet orders the form this way: 2.1 to 2.7 come before the words "Under
 * tab GENERAL INFO". These seven are what make a part a part, and six of the
 * seven are required, so they are what the user must get past before anything
 * else is worth filling in.
 */
export const PART_IDENTITY: FieldDef<Part>[] = [
  /* "Part Number (Text, Required) — Unique identifier for the part". The
     uniqueness rule is over Part Number + Part Revision TOGETHER, which no
     single field can express, so it is checked in the dialog. */
  { name: 'partNumber', label: 'Part Number', kind: 'text', required: true,
    hint: 'With Part Revision, must be unique. Choosing a Customer adds its code as a prefix.' },
  { name: 'rev', label: 'Part Revision', kind: 'text',
    hint: 'Optional. Blank is a valid revision and is how most parts start.' },
  { name: 'description', label: 'Part Description', kind: 'text', required: true },
  /* Required, and placed here rather than in Sales & Purchase where the sheet
     puts it (2.8), because it REWRITES THE PART NUMBER. A field that changes
     another field cannot sit a tab away from it — the user would watch the
     identifier change with the cause off screen. Its section membership is
     recorded in the docs; its position follows its effect. */
  { name: 'customer', label: 'Customer', kind: 'select', required: true,
    options: CUSTOMER_OPTIONS,
    hint: 'Adds the Customer Code to the Part Number as a prefix, if not already there.' },
  { name: 'partSource', label: 'Part Source', kind: 'select', required: true,
    options: PART_SOURCE,
    hint: 'MAKE, MAKE/BUY and MAKE/PHAN parts carry a BoM.' },
];

/** Classification — Part Type depends on Part Class, which the dialog enforces. */
export const PART_CLASSIFICATION: FieldDef<Part>[] = [
  { name: 'partClass', label: 'Part Class', kind: 'select', required: true,
    options: PART_CLASS },
  /* Options are replaced per class by the dialog; this list is the full set so
     a part already holding a type still reads correctly. */
  { name: 'partType', label: 'Part Type', kind: 'select', required: true,
    options: Object.values(PART_CLASS_TYPES).flat(),
    hint: 'Only the types valid for the chosen Part Class.' },
  /* "ABC (Dropdown, Required)". Required on this form and EMPTY ON EVERY ONE OF
     THE 2,000 EXISTING RECORDS, which is measured, not assumed — see
     `data/parts.ts`. Both are true: the field is required going forward and the
     back catalogue never had it. Required here, and the column stays hidden by
     default on the list. */
  { name: 'abc', label: 'ABC', kind: 'select', required: true, options: ABC },
];

/** Handling — all three optional. */
export const PART_HANDLING: FieldDef<Part>[] = [
  { name: 'packageType', label: 'Package', kind: 'select', options: PART_PACKAGE },
  { name: 'materialType', label: 'Material Type', kind: 'select', options: PART_MATERIAL_TYPE },
];

/* ---- General Info tab ----------------------------------------------------- */

/**
 * Sales & Purchase (2.9).
 *
 * FOUR OF THESE SEVEN DESCRIBE THEMSELVES AS RUNNING TOTALS — "the actual
 * running highest cost of the part based on historical purchases", and the same
 * shape for Lowest, Last PO and Last Received. A part being created has no
 * purchase history, so on this form they are always empty.
 *
 * They are still editable, because both sources say so: the sheet lists them
 * under "Provide info for section Sales & Purchase", and the live form renders
 * Last PO cost as `disabled:!a` — enabled whenever the form is in edit mode,
 * not read-only. Making them read-only was my first instinct and would have
 * overridden tier 1 and tier 2 together on nothing but that instinct.
 */
export const PART_SALES_PURCHASE: FieldDef<Part>[] = [
  { name: 'customerSalesPrice', label: 'Customer Sales Price', kind: 'number', min: 0,
    hint: 'The price offered to the customer. Manual, or computed.' },
  { name: 'salesPriceTaxes', label: 'Sales Price Taxes', kind: 'number', min: 0, suffix: '%' },
  { name: 'materialPrice', label: 'Material Price', kind: 'number', min: 0,
    hint: 'The cost to acquire or produce the material.' },
  { name: 'highestCost', label: 'Highest Cost', kind: 'number', min: 0,
    hint: 'Running highest, from purchase and production history.' },
  { name: 'lowestCost', label: 'Lowest Cost', kind: 'number', min: 0,
    hint: 'Running lowest, from purchase and production history.' },
  { name: 'lastPoCost', label: 'Last PO Cost', kind: 'number', min: 0,
    hint: 'From the current open purchase order.' },
  { name: 'lastReceivedCost', label: 'Last Received Cost', kind: 'number', min: 0,
    hint: 'From the last receipt.' },
];

/**
 * Requests & Controls (2.10).
 *
 * Six independent yes/no controls, so six checkboxes rather than one multi-select:
 * the sheet defines each separately and any combination is valid. Each hint is
 * the sheet's own definition, because "NCNR" and "First Article" are terms a new
 * planner will not know and the consequence of ticking NCNR by mistake is an
 * order that cannot be cancelled.
 */
export const PART_REQUESTS: FieldDef<Part>[] = [
  { name: 'inspRequest', label: 'Insp Request', kind: 'flag',
    hint: 'Inspection required before the part is received.' },
  { name: 'snRequest', label: 'SN Request', kind: 'flag',
    hint: 'A unique Serial Number must be assigned and tracked.' },
  { name: 'ncnr', label: 'NCNR', kind: 'flag',
    hint: 'Non-Cancellable / Non-Returnable — once ordered, it cannot be cancelled or returned.' },
  { name: 'firstArticle', label: 'First Article', kind: 'flag',
    hint: 'First Article Inspection required for initial production approval.' },
  { name: 'lotCodeRequest', label: 'Lot Code Request', kind: 'flag',
    hint: 'A Lot Code must be recorded, for lot-level traceability.' },
  { name: 'certRequest', label: 'Cert Request', kind: 'flag',
    hint: 'A certification document (material cert, CoC) is required from the supplier.' },
];

/** Dimensions & Packages (2.11). */
export const PART_DIMENSIONS: FieldDef<Part>[] = [
  { name: 'uom', label: 'Unit of Measure', kind: 'select', options: UNIT_OF_MEASURE },
  { name: 'length', label: 'Length', kind: 'number', min: 0 },
  { name: 'width', label: 'Width', kind: 'number', min: 0 },
  { name: 'depth', label: 'Depth', kind: 'number', min: 0 },
];

/* ---- Quantity Info tab ---------------------------------------------------- */

/** Reordering rule (2.12). */
export const PART_REORDERING: FieldDef<Part>[] = [
  { name: 'orderPolicy', label: 'Order Policy', kind: 'select', options: ORDER_POLICY,
    hint: 'The lot-sizing method MRP uses to calculate order quantities.' },
  { name: 'dayOfWeek', label: 'Day of week', kind: 'select', options: DAY_OF_WEEK,
    hint: 'The day orders are consolidated and released, to match supplier schedules.' },
  { name: 'minOrderQty', label: 'Min Order Qty', kind: 'number', min: 0,
    hint: 'MRP rounds smaller demands up to this.' },
  { name: 'orderMultiple', label: 'Order Multiple', kind: 'number', min: 0,
    hint: 'The batch increment — a box of 50. MRP rounds up to the nearest multiple.' },
];

/**
 * Demand & forecast planning (2.13).
 *
 * "EAU (Estimated Annual Usage)" on the sheet; the live form labels the same
 * field "Estimated Annual Usage" in full. Labelled in full here with the
 * abbreviation in the hint, so the term a planner already says out loud is on
 * screen and the term they will meet in a report is one line below.
 */
export const PART_DEMAND: FieldDef<Part>[] = [
  { name: 'eau', label: 'Estimated Annual Usage', kind: 'number', min: 0,
    hint: 'EAU — projected yearly consumption, used for forecasting and volume discounts.' },
  { name: 'attrition', label: 'Attrition', kind: 'number', min: 0, max: 100, suffix: '%',
    hint: 'Expected loss during production. MRP adds this buffer so the output meets demand.' },
  { name: 'mrpRequest', label: 'MRP Request', kind: 'number', min: 0,
    hint: 'The quantity needed for upcoming demand, which triggers purchase or production.' },
];

/**
 * Lead time & Policies (2.14).
 *
 * PURCHASE LEAD TIME IS IN DAYS HERE AND IN WEEKS ON THE LIVE FORM. The sheet
 * says "Purchase Lead Time (Days)"; the live label reads "Purchase lead time
 * (weeks)". The sheet is tier 1 so days is what this builds, but a units
 * mismatch on a lead time is a seven-fold planning error, so it is an open
 * question rather than a silent choice.
 */
export const PART_LEAD_TIME: FieldDef<Part>[] = [
  { name: 'pullIn', label: 'Pull in', kind: 'number', min: 0, suffix: 'days',
    hint: 'How far an existing order may be advanced to meet earlier demand, instead of raising a new one.' },
  { name: 'pushOut', label: 'Push Out', kind: 'number', min: 0, suffix: 'days',
    hint: 'How far an existing order may be delayed when demand drops, to prevent excess stock.' },
  { name: 'purchaseLeadTime', label: 'Purchase Lead Time', kind: 'number', min: 0, suffix: 'days',
    hint: 'Order placed to parts received and ready to use.' },
  { name: 'kittingLeadTime', label: 'Kitting Lead Time', kind: 'number', min: 0, suffix: 'days',
    hint: 'Time to pick and group components into a kit for production.' },
  { name: 'productionLeadTime', label: 'Production Lead Time', kind: 'number', min: 0, suffix: 'days',
    hint: 'Time to physically manufacture or assemble the item.' },
];

/** Every required field, for the dialog's validation and its summary. */
export const PART_REQUIRED: FieldDef<Part>[] =
  [...PART_IDENTITY, ...PART_CLASSIFICATION].filter(f => f.required);
