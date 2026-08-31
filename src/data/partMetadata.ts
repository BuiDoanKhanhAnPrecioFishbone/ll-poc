/* =============================================================================
   PART MASTER VOCABULARIES — for Create New Part
   -----------------------------------------------------------------------------
   Every list below records WHERE IT CAME FROM, because they came from three
   different places and one of them settled a contradiction the written sources
   could not.
   ========================================================================== */

/**
 * Part Source.
 *
 * THE WRITTEN SOURCES CONTRADICT EACH OTHER, AND THE LIVE SYSTEM SETTLES IT.
 *
 * The Testing Guideline enumerates this dropdown twice and the two lists differ:
 *
 *   Create New Part (§2.3)  BUY, CONSG, FLSTK,  MAKE, MAKE/BUY, MAKE/PHAN
 *   Quick Quote step 2      BUY, MAKE, MAKE/PHAN, FLRSTK, MAKE/BUY, PACKAGING
 *
 * So: FLSTK or FLRSTK; CONSG or PACKAGING as the sixth value. `data/bom.ts`
 * had already picked MAKE/PHANT for the auto-exclusion rule (r81) while the
 * vocabulary line (r102) says MAKE/PHAN, and `open-questions.md` carried the
 * whole thing as unresolved.
 *
 * The live bundle answers it. `chunk-AeZ_bNMa.js` exports the enumeration
 * itself — decoded 31 Aug 2026, and the decoding is self-validating because the
 * same pass returns "MAKE" for MAKE and "BUY" for BUY:
 *
 *   SERVICE "SERVICE"   MAKE "MAKE"          BUY "BUY"
 *   CONSG   "CONSG"     MAKE_PHAN "MAKE/PHAN"  MAKE_PHANT "MAKE/PHANT"
 *   FLOORSTOCK "FLRSTK" MAKE_BUY "MAKE/BUY"  PROGRAM "PROG"
 *
 * Three things follow, and none of them were guessable from the sheets:
 *
 *  1. FLRSTK is right and FLSTK is a typo on the Create New Part sheet.
 *  2. MAKE/PHAN and MAKE/PHANT are BOTH REAL, as separate values. Neither sheet
 *     is wrong; each names a different one. `bom.ts` is right to auto-exclude
 *     MAKE/PHANT, and this dropdown is right to offer MAKE/PHAN — see the open
 *     question about whether the exclusion rule should cover both.
 *  3. PACKAGING does not exist in the live system at all, and SERVICE and PROG
 *     exist without appearing on either sheet.
 *
 * WHAT THIS LIST OFFERS is the Create New Part sheet's six, with FLSTK
 * corrected to FLRSTK. The sheet is tier 1 and enumerates this control
 * explicitly; the live enum is tier 2 and is used only to resolve the
 * customer's document against itself, which is exactly what tier 2 is for.
 * Adding SERVICE, MAKE/PHANT and PROG would be offering values the customer did
 * not ask this form to create — recorded as an open question instead.
 */
export const PART_SOURCE = [
  'BUY', 'CONSG', 'FLRSTK', 'MAKE', 'MAKE/BUY', 'MAKE/PHAN',
] as const;
export type PartSourceValue = (typeof PART_SOURCE)[number];

/**
 * What each Part Source means. The sheet gives these verbatim, and they are the
 * difference between picking the right one and picking the first one.
 */
export const PART_SOURCE_MEANINGS: Record<string, string> = {
  BUY: 'Purchased from supplier',
  CONSG: 'Customer-owned (consignment) material',
  FLRSTK: 'Common stock items (e.g. screws, small components)',
  MAKE: 'Internally manufactured part',
  'MAKE/BUY': 'Can be manufactured or purchased (BoM optional)',
  'MAKE/PHAN': 'Phantom/logical assembly for component grouping (not physically stocked)',
};

/**
 * Part Sources that carry a BoM.
 *
 * "The 'BoM' button (top right corner) should be displayed only when Part
 * Source = MAKE, MAKE/BUY or MAKE/PHAN." Written as a set rather than a
 * comparison so the rule lives in one place — `PartDetail` was gating on
 * `=== 'MAKE'` alone, which was correct only while MAKE and BUY were the only
 * two values the data held.
 */
export const BOM_SOURCES: readonly string[] = ['MAKE', 'MAKE/BUY', 'MAKE/PHAN'];

/**
 * Part Class, and the Part Types valid within each.
 *
 * MY JUDGEMENT, TIER 3 — the mapping, not the vocabulary.
 *
 * The classes and types are the ones `data/parts.ts` already generates, so the
 * form cannot create a part the list screen would render as unfamiliar. WHICH
 * TYPE BELONGS TO WHICH CLASS is nowhere in the customer's documents: the sheet
 * says only "Part Type (Dropdown, Required) — Sub-classification within Part
 * Class" with the example "(e.g., Assembly, PCBA,...)" for Class.
 *
 * The live form does not settle it either. It builds the class list from an API
 * dataset — `data: d.map(e => e.partClass)` in `chunk-CGLW0e1_.js` — so the
 * pairing is server-held and invisible to a bundle read.
 *
 * The mapping below is therefore a plausible reading of the two vocabularies,
 * and it is the FIRST thing to replace when a real one arrives. It exists at
 * all because the guideline requires the dependent behaviour — "Only valid Part
 * Type options mapped to the selected Part Class are displayed" — and that
 * behaviour cannot be demonstrated without some mapping.
 */
export const PART_CLASS_TYPES: Record<string, readonly string[]> = {
  ASSEMBLY: ['ELEC-PCB', 'MECH-FMA'],
  COMPONENT: ['ELEC-PAS', '0402', '0603'],
  RAW: ['MECH-MCH'],
  CONSUMABLE: ['MECH-MCH', 'ELEC-PAS'],
};

export const PART_CLASS = Object.keys(PART_CLASS_TYPES);

/** Every type any class allows — what the list screen may already hold. */
export const PART_TYPE = [...new Set(Object.values(PART_CLASS_TYPES).flat())];

/**
 * ABC — "Inventory priority classification (A = High, B = Medium, C = Low)",
 * the sheet's own gloss, kept as the option meanings so the letters are not a
 * quiz.
 */
export const ABC = ['A', 'B', 'C'] as const;
export const ABC_MEANINGS: Record<string, string> = {
  A: 'High priority',
  B: 'Medium priority',
  C: 'Low priority',
};

/** Package — the sheet's examples, matching what `parts.ts` generates. */
export const PART_PACKAGE = ['Cut Tape', 'Reels', 'Tray', 'Tube', 'Bulk'] as const;

/** Material Type — the sheet's examples, matching what `parts.ts` generates. */
export const PART_MATERIAL_TYPE = ['RoHS', 'Non-RoHS', 'Lead-Free'] as const;

/** Unit of Measure — the values `parts.ts` already generates. */
export const UNIT_OF_MEASURE = ['EACH', 'METRE', 'KG', 'ROLL'] as const;

/**
 * Order Policy — MY JUDGEMENT, TIER 3.
 *
 * The sheet defines the field but names no values: "Determines the lot-sizing
 * method MRP uses to calculate order quantities (e.g., exact demand vs. fixed
 * batch)". The live bundle has the field (`orderPolicy` in
 * `chunk-BGl75K6V.js`'s default form state) and not its vocabulary, which the
 * API supplies.
 *
 * These are the two the sheet's own example names, plus the third that always
 * accompanies them in MRP. Replace on sight of the real list.
 */
export const ORDER_POLICY = ['Lot for lot', 'Fixed order quantity', 'Min/Max'] as const;

/**
 * Day of week — "A specific day to consolidate and release orders, aligning
 * with supplier schedules." The vocabulary is the days; the sheet's phrasing
 * ("a specific day") implies exactly one, so this is a select and not a set of
 * checkboxes.
 */
export const DAY_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
] as const;
