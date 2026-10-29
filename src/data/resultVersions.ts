import { hash } from './idHash';
import type { QuoteResult } from './quotations';

/**
 * Runs, versions and assemblies on the Quotation Result tab.
 *
 * ONE ROW PER ASSEMBLY, NOT PER RUN — the customer's answer of 29 Oct, with her
 * own example: a part quoted SIX times shows as one row whose Last Run Version
 * reads 6. Ours listed every run, so an assembly re-quoted three times filled
 * three rows that differed in two columns and repeated the other nine. The
 * earlier versions are not noise — they are what you compare against — but they
 * belong behind a version picker on the result view, which is the other half of
 * the same answer.
 *
 * WHY THE FOLDING IS A POST-PROCESS. The generator draws every value from one
 * seeded stream and each of its results drew its own part number, so no two
 * runs of an RFQ shared an assembly and nothing would have grouped. Giving them
 * a shared identity inside the loop means changing how many times `rnd()` is
 * called, which re-rolls every record after it — see `idHash.ts`. `foldRuns`
 * runs AFTER the draws instead and only rewrites values already drawn: it
 * consumes no randomness, so the dataset does not move.
 */

/** An assembly and every run of it, newest first. */
export type AssemblyRuns = {
  key: string;
  partNumber: string;
  partRev: string;
  description: string;
  /** Newest first, so `runs[0]` is `latest`. */
  runs: QuoteResult[];
  latest: QuoteResult;
};

/**
 * Fold an RFQ's generated runs into one or two assemblies and renumber them.
 *
 * An RFQ quotes one assembly or a couple, each re-run as the BoM or the volume
 * changes; three runs of three unrelated part numbers — which is what the draws
 * produce — is the one shape the live system never has. The count comes from
 * the RFQ's id so it is stable, and run `j` takes the identity of the run that
 * opened its assembly. Versions are then numbered within the assembly, which is
 * what `Last Run Version` counts.
 */
export function foldRuns(runs: QuoteResult[], rfqId: string): QuoteResult[] {
  if (runs.length < 2) return runs;
  const assemblies = 1 + (hash(rfqId + 'asm') % Math.min(2, runs.length));
  const nth = new Map<number, number>();
  return runs.map((r, j) => {
    const home = j % assemblies;
    const identity = runs[home];
    const n = (nth.get(home) ?? 0) + 1;
    nth.set(home, n);
    return {
      ...r,
      partNumber: identity.partNumber,
      partRev: identity.partRev,
      description: identity.description,
      lastRunVersion: `v${n}`,
    };
  });
}

/** Group saved runs by the assembly they priced, newest run first. */
export function assemblyRuns(results: QuoteResult[]): AssemblyRuns[] {
  const groups = new Map<string, AssemblyRuns>();
  for (const r of results) {
    const key = `${r.partNumber}\u0000${r.partRev}`;
    const g = groups.get(key);
    if (g) {
      g.runs.push(r);
      /* By date, not by version string: `v10` sorts before `v2` as text, and
         the run the row reports is the one that ran last. */
      if (r.lastRunDate > g.latest.lastRunDate) g.latest = r;
    } else {
      groups.set(key, {
        key, partNumber: r.partNumber, partRev: r.partRev,
        description: r.description, runs: [r], latest: r,
      });
    }
  }
  for (const g of groups.values()) {
    g.runs.sort((a, b) => b.lastRunDate.getTime() - a.lastRunDate.getTime());
  }
  return [...groups.values()];
}

/**
 * The BoM version a run priced, which guideline 2.1 §4.3 lists in the version
 * picker and we never stored.
 *
 * It is already in `bomFile` — `BOM-ACME-v2.xlsx` — and a blank file means the
 * run used the BoM already on the RFQ, which is a fact about the run rather
 * than a missing value. Parsed rather than stored for the usual reason: a
 * second field would have cost a draw.
 *
 * IT IS NOT THE RUN VERSION, and the picker shows both for that reason: run v2
 * of an assembly may have priced BoM v3, or the same BoM twice at two
 * volumes. §4.3 lists them as two columns because they are two facts.
 */
export function bomVersionOf(r: QuoteResult): string | null {
  const m = /-v(\d+)\.[a-z]+$/i.exec(r.bomFile);
  return m ? `v${m[1]}` : null;
}
