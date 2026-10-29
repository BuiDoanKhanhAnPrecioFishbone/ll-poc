import {
  buildBomLines, runQuote, PRIMARY_PROVIDERS,
  type BomLine, type PrimaryProvider, type QuoteRules,
} from './bom';
import { masterSuppliers } from './suppliers';
import type { QuoteResult } from './quotations';
import { hash, pickBy } from './idHash';

/**
 * The setup and the priced lines behind a saved quote result.
 *
 * WHY THIS IS NOT IN THE GENERATOR. A saved result needs nine more facts than
 * it stores (which focus, what package type, which provider…), and asking the
 * generator for them would have cost nine draws from its one seeded stream and
 * shifted the whole dataset. They are derived from the result's own id
 * instead — see `idHash.ts`, which explains the rule and holds the hash.
 */

const pick = pickBy;

const QUOTE_FOCUS = ['Stock - High cost', 'Lead time - Low cost', 'OTHER'] as const;
const EXCESS_MOQ = ['Low', 'High'] as const;
const PACKAGE_TYPE = ['Reels', 'Cut tape', 'Tube', 'Tray'] as const;

export type ResultSetup = {
  quoteFocus: string;
  markup: number;
  excessMoq: string;
  packageType: string;
  netConsigned: string;
  rocketConsigned: string;
  provider: PrimaryProvider;
  buildQty: number;
  attritionSet: number;
};

/** The nine settings the run used, as the result view prints them. */
export function resultSetup(r: QuoteResult): ResultSetup {
  return {
    quoteFocus: pick(r.id, 'focus', QUOTE_FOCUS),
    /* The one value that is stored rather than derived — see QuoteResult. */
    markup: r.markupPct,
    excessMoq: pick(r.id, 'excess', EXCESS_MOQ),
    packageType: pick(r.id, 'pkg', PACKAGE_TYPE),
    netConsigned: pick(r.id, 'net', ['No', 'Yes'] as const),
    rocketConsigned: pick(r.id, 'rocket', ['No', 'Yes'] as const),
    provider: pick(r.id, 'provider', PRIMARY_PROVIDERS),
    buildQty: r.buildQty,
    /* Attrition is a small whole number on every quote we have been shown. */
    attritionSet: 1 + (hash(r.id + 'attr') % 4),
  };
}

/**
 * The BoM as this run priced it.
 *
 * `buildBomLines` reads a hardcoded seed table and `runQuote` is a pure
 * function of its rules, so this is the same engine step 3 runs — not a second
 * implementation that could price the same BoM differently from the wizard
 * that produced it.
 */
export function resultLines(r: QuoteResult): BomLine[] {
  const s = resultSetup(r);
  /* NO `as QuoteRules` HERE, and it mattered. The first version cast the
     object, tsc stayed quiet, and two fields were wrong underneath: the
     consigned flags are STRINGS on QuoteRules, not booleans, and `suppliers`
     is the full master map rather than `{}`. A cast tells the compiler to stop
     checking exactly where the checking was the point. */
  const rules: QuoteRules = {
    buildQty: s.buildQty,
    attritionSet: s.attritionSet,
    quoteFocus: s.quoteFocus,
    excessMoq: s.excessMoq,
    materialPackageType: s.packageType,
    netConsigned: s.netConsigned,
    rocketConsigned: s.rocketConsigned,
    provider: s.provider,
    /* Every quote starts from the master list; a saved run that had suppliers
       switched off would have stored them, and none of ours did. */
    suppliers: masterSuppliers(),
  };
  return runQuote(buildBomLines(), rules);
}
