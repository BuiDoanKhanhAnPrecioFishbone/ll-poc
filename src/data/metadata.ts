/* =============================================================================
   OPTION LISTS — FROM THE LIVE SYSTEM
   -----------------------------------------------------------------------------
   Pulled from GET /api/MetadataType on 24 Aug 2026. That endpoint is the
   system's own configuration: the "Metadata Type Set up" screen edits it.

   This file exists because the previous option lists were INVENTED. They were
   inferred from the handful of values visible in the list grid, which produced
   plausible-looking sets that were mostly wrong — of four Quote Focus options,
   one was real; of four Material Packaging options, one was real; Project Type
   had one of four. A dropdown that offers values the system does not accept is
   worse than no dropdown, because it reads as authoritative.

   The metadata CODE is kept beside each list so anyone can re-check it against
   the same endpoint rather than trusting this file.
   ========================================================================== */

/** PROJECT_TYPE */
export const PROJECT_TYPE = [
  'NPI - Validation Production', 'Production', 'Box Build', 'One Time Build',
  'Reference Design', 'Test Development - Low Vol', 'Test Development - High Vol',
] as const;

/** ORDER_TYPE — note "Rev Change", which this mockup was missing. */
export const ORDER_TYPE = ['New', 'Repeat', 'Rev Change'] as const;

/** QUOTATION_TYPE — the field labelled "RFQ Type" on the list grid. */
export const RFQ_TYPE = ['Consigned', 'Managed Consigned', 'Mixed', 'Turnkey'] as const;

/**
 * CUST_TYPE — the field labelled "Customer Type" in the record header.
 * A DIFFERENT list from QUOTATION_TYPE: "Consign" not "Consigned", plus TBD and
 * Hybrid, and no "Managed Consigned". They are two distinct fields, which
 * settles the question of whether one was a duplicate of the other.
 */
export const CUSTOMER_TYPE = ['TBD', 'Consign', 'Turnkey', 'Hybrid'] as const;

/** APPLICATION */
export const APPLICATION = [
  'System', 'PCBA', 'PCBA+System', 'Sub-assy Box Build', 'Sub-assy PCBA',
] as const;

/** QUOTE_FOCUS */
export const QUOTE_FOCUS = [
  'Production-Competitive Cost', 'Stock-High cost', 'Stock-Low cost', 'OTHER',
] as const;

/** MATERIAL_PACKAGE_TYPE — the reel options carry a price, which is why they
 *  read oddly as labels. Left exactly as the system has them. */
export const MATERIAL_PACKAGE_TYPE = ['Cut Tape', 'Reels', '$50 Reels', '$25 Reels'] as const;

/** TEST_REQUIREMENTS — a fixed list, not free text as this mockup had it. */
export const TEST_REQUIREMENTS = ['Burn-in', 'Functional', 'Flying Probe', 'ICT/ESS', 'NA'] as const;

/** EXCESS_AND_MOQ */
export const EXCESS_AND_MOQ = ['None', 'Low', 'OK'] as const;

/** NET_CONSIGNED_INVENTORY — two options, not three. */
export const NET_CONSIGNED_INVENTORY = ['No', 'Yes-No Charge'] as const;

/**
 * What each option MEANS, quoted from the customer's Testing Guideline.
 *
 * These are not decoration. "Low" and "OK" are indistinguishable without them —
 * both sound like acceptance, and the difference (how much excess is tolerable)
 * decides what the sourcing engine is allowed to buy.
 */
export const OPTION_MEANINGS: Record<string, string> = {
  /* Excess and MOQ */
  'None': 'No special consideration for excess quantity or MOQ.',
  'Low': 'Low excess quantity or MOQ is acceptable.',
  'OK': 'Excess quantity or MOQ is acceptable.',
  /* Net / Rocket Consigned Inventory */
  'No': 'No consigned inventory is provided.',
  'Yes-No Charge': 'Consigned inventory is provided at no additional charge.',
  'Yes-Charge': 'Consigned inventory is provided with an additional charge.',
};

/**
 * NET_ROCKET_INVENTORY — the field labelled "Rocket Consigned Inventory".
 * "Rocket" is a real concept in this system with its own metadata code,
 * parallel to NET_CONSIGNED_INVENTORY. It is not a typo. What it refers to in
 * the business is still worth asking, but the field and its values are genuine.
 */
/**
 * DISCREPANCY — flagged for the customer, not resolved here.
 *
 * The live system renders  No · Yes-No Charge · Yes-Charge
 * The Testing Guideline says None · Yes - No Charge · Yes - Charge
 *
 * Two differences: the first option is "No" live and "None" in the guideline,
 * and the guideline spaces the hyphens. The guideline's own entry for the
 * PARALLEL field, Net Consigned Inventory, uses "No" and "Yes-No Charge" with
 * no spaces — so the guideline contradicts itself between two fields that are
 * otherwise identical in shape.
 *
 * Kept as the LIVE values, because those are what the API accepts and a
 * mismatch here is the same class of defect as the invented option lists this
 * project already had to correct: wrong values make the built system reject
 * valid input. Raised with the customer rather than decided quietly.
 */
export const ROCKET_CONSIGNED_INVENTORY = ['No', 'Yes-No Charge', 'Yes-Charge'] as const;

/** RFQ_STATUS. The list grid also displays "Quoted", which is not in this
 *  list — so it is either derived or comes from elsewhere. Flagged, not guessed. */
export const RFQ_STATUS = ['New', 'In-Progress', 'Completed', 'Cancelled'] as const;
