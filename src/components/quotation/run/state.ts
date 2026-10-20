import type { PrimaryProvider } from '../../../data/bom';
import { sameSuppliers, type SupplierSetup } from '../../../data/suppliers';

/**
 * Everything the four steps share.
 *
 * Held in one object on the wizard rather than in each step, because the
 * guideline threads the same values through all of them — "System show quoting
 * BoM information get from previous step" opens steps 2, 3 and 4 — and a value
 * that lives in a step is a value that resets when you press Previous.
 */
export type RunConfig = {
  /**
   * Which of the two flows this run is.
   *
   *   import-new      Quick Quote — a BoM file arrives as an attachment and the
   *                   assembly is typed in.
   *   load-existing   Standard Quote — the BoM is already approved and loaded
   *                   through the ECO process, so the assembly is chosen from
   *                   the customer's own list.
   *   resume-draft    Resume Draft Quote — neither: the BoM was configured in
   *                   an earlier sitting and the user is picking that work back
   *                   up, so this entry point skips straight to step 3.
   *
   * The two sheets treat these as separate flows; the product treats them as one
   * wizard with two entry points, which is what the Action radio on step 1 is.
   * Steps 2, 3 and 4 are identical for both — verified row by row.
   */
  action: 'import-new' | 'load-existing' | 'resume-draft';

  /**
   * Only for `load-existing`: what to do with the BoM already on file.
   *
   *   current      "User current BoM (no changes)" — the template stays hidden,
   *                because the guideline says choosing one here is a way to get
   *                it wrong, not a way to get it right.
   *   new-version  "Upload BoM and create a new version" — template, upload and
   *                file name appear.
   */
  bomOption: 'current' | 'new-version';

  /* ---- BoM Options ------------------------------------------------------ */
  attachment: string;
  template: string;
  detection: string;
  /** The file chosen through "Import File from Voyager", for `new-version`. */
  uploadedFile: string;

  /* ---- Assembly Details ------------------------------------------------- */
  /** `import-new`: typed. */
  assemblyPartNumber: string;
  partRev: string;
  partDesc: string;
  /** `load-existing`: chosen, as "Code - Part Number - Rev - Version". */
  assembly: string;

  /* ---- Carried from the RFQ, editable on step 1 ------------------------- */
  quoteFocus: string;
  materialPackageType: string;
  markup: number;

  /* ---- The formula's two inputs ----------------------------------------- */
  buildQty: number;
  attritionSet: number;

  provider: PrimaryProvider;
  /** None / Low / OK — how much over-ordering an MOQ may force. */
  excessMoq: string;
  /** Whether this quote draws on the customer's consigned stock, and Rocket's. */
  netConsigned: string;
  rocketConsigned: string;
  /**
   * Which suppliers this quote will use, and in what priority.
   *
   * A copy of the master, taken when the run starts. It lives on the config
   * rather than in a store because it is part of what the results were computed
   * from — the same reason Build Qty is here — and a draft resumed next week
   * has to price the way it priced when it was saved.
   */
  suppliers: SupplierSetup;
};

/**
 * The three fields Next validates on step 1 of the IMPORT NEW BOM flow, with
 * the words the screen puts above each one.
 *
 * THE LIVE MESSAGE IS "Please input information for assemblyPartNumber,
 * partRev, partDesc" — camel-case field names, verbatim. It was quoted here
 * rather than rewritten so a tester matching the sheet against the build could
 * find the string, and that was the wrong trade: the string a tester greps for
 * is not worth showing a user the name of a variable. It is the same fault we
 * recorded against the live Activity Log, which prints `DtIssuedUtc:` at a
 * reader and expects them to work it out.
 *
 * The original is kept HERE, in the source, where the tester can still find
 * it; the screen says Assembly Part Number.
 */
export const STEP1_REQUIRED = [
  { field: 'assemblyPartNumber', label: 'Assembly Part Number' },
  { field: 'partRev', label: 'Revision' },
  { field: 'partDesc', label: 'Description' },
] as const;

/**
 * What stops Next, and what to say about it.
 *
 * The two flows fail differently and the guideline gives each its own message.
 * Load Existing Assembly has one thing to get wrong — "Select assembly first!"
 * — because everything else about the assembly comes with it.
 */
export function missingStep1(cfg: RunConfig): readonly string[] {
  if (cfg.action === 'load-existing') return cfg.assembly ? [] : ['assembly'];
  return STEP1_REQUIRED.filter(f => !String(cfg[f.field]).trim()).map(f => f.field);
}

export function step1Error(cfg: RunConfig): string | null {
  const missing = missingStep1(cfg);
  if (!missing.length) return null;
  if (cfg.action === 'load-existing') return 'Select assembly first!';
  /* Named in the order the fields appear on the screen, and joined with "and"
     before the last, because a reader scanning a toast should not have to
     parse a comma list to find out how many things are wrong. */
  const labels = STEP1_REQUIRED.filter(f => missing.includes(f.field)).map(f => f.label);
  const named = labels.length > 1
    ? `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
    : labels[0];
  return `Please fill in ${named}`;
}

/* ===========================================================================
   THE QUOTE SETUP — the fields the results were computed from
   ---------------------------------------------------------------------------
   ASKED FOR by the Quoting BoM mockup of 16 Oct, which separates two things
   this wizard had kept as one: `stg`, "setup the current result uses", and
   `pend`, "setup shown in Quoting; applied only by Get Prices / Update Results
   / Refresh Prices". Its rule, written twice in that file:

     "Quantities and prices follow the applied setup only. Editing the setup
      never recalculates anything."

   Our own guideline said the same thing about two of these fields in August —
   "If the user changes these values but does not click Apply, the changes are
   not saved or carried to the next steps" — and step 3's comment claimed we
   held pending values apart. We did not: Build Qty wrote straight into the
   config and the grid's Total Qty moved under the reader's hands, which is the
   one thing a priced grid must not do. A number that changes without being
   asked to is a number nobody can quote from.

   SIX FIELDS, not the whole config. The rest of `RunConfig` — which BoM, which
   template, the assembly — is settled on step 1 and cannot be edited later, so
   there is nothing to hold back.
   ======================================================================== */
export const SETUP_KEYS = [
  'buildQty', 'attritionSet', 'quoteFocus', 'markup', 'materialPackageType',
  'excessMoq', 'netConsigned', 'rocketConsigned', 'provider',
] as const;

/** The scalar fields, plus the supplier list — which is a setting too, and the
 *  one that changes the answer most. */
export type QuoteSetup = Pick<RunConfig, (typeof SETUP_KEYS)[number]> & {
  suppliers: SupplierSetup;
};

export function setupOf(cfg: RunConfig): QuoteSetup {
  return {
    buildQty: cfg.buildQty, attritionSet: cfg.attritionSet,
    quoteFocus: cfg.quoteFocus, markup: cfg.markup,
    materialPackageType: cfg.materialPackageType, excessMoq: cfg.excessMoq,
    netConsigned: cfg.netConsigned, rocketConsigned: cfg.rocketConsigned,
    provider: cfg.provider, suppliers: cfg.suppliers,
  };
}

/** Compared as strings: `markup` arrives from a number field as either. The
 *  supplier list is compared field by field — see `sameSuppliers`. */
export function setupChanged(a: QuoteSetup, b: QuoteSetup): boolean {
  return SETUP_KEYS.some(k => String(a[k]) !== String(b[k]))
    || !sameSuppliers(a.suppliers, b.suppliers);
}
