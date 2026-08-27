import type { PrimaryProvider } from '../../../data/bom';

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
   *
   * The two sheets treat these as separate flows; the product treats them as one
   * wizard with two entry points, which is what the Action radio on step 1 is.
   * Steps 2, 3 and 4 are identical for both — verified row by row.
   */
  action: 'import-new' | 'load-existing';

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
};

/**
 * The three fields Next validates on step 1 of the IMPORT NEW BOM flow.
 *
 * "Please input information for assemblyPartNumber, partRev, partDesc" — the
 * message is the live system's, camel-case field names and all. It is quoted
 * rather than rewritten because a tester matching this sheet against the build
 * is looking for that string.
 */
export const STEP1_REQUIRED = ['assemblyPartNumber', 'partRev', 'partDesc'] as const;

/**
 * What stops Next, and what to say about it.
 *
 * The two flows fail differently and the guideline gives each its own message.
 * Load Existing Assembly has one thing to get wrong — "Select assembly first!"
 * — because everything else about the assembly comes with it.
 */
export function step1Error(cfg: RunConfig): string | null {
  if (cfg.action === 'load-existing') {
    return cfg.assembly ? null : 'Select assembly first!';
  }
  const missing = STEP1_REQUIRED.filter(k => !String(cfg[k]).trim());
  return missing.length ? `Please input information for ${missing.join(', ')}` : null;
}
