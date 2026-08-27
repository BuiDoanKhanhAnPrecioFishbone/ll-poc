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
  /** Which BoM this run is against. `upload` is the guideline's Import New BoM. */
  action: 'upload' | 'existing' | 'current';

  /* ---- BoM Options ------------------------------------------------------ */
  attachment: string;
  template: string;
  detection: string;
  /** Only for `action: 'existing'`. */
  version: string;

  /* ---- Assembly Details ------------------------------------------------- */
  assemblyPartNumber: string;
  partRev: string;
  partDesc: string;

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
 * The three fields Next validates on step 1.
 *
 * "Please input information for assemblyPartNumber, partRev, partDesc" — the
 * message is the live system's, camel-case field names and all. It is quoted
 * rather than rewritten because a tester matching this sheet against the build
 * is looking for that string.
 */
export const STEP1_REQUIRED = ['assemblyPartNumber', 'partRev', 'partDesc'] as const;

export function step1Missing(cfg: RunConfig): string[] {
  return STEP1_REQUIRED.filter(k => !String(cfg[k]).trim());
}
