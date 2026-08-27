import { useState } from 'react';
import { Dialog } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { Stepper } from '../../ui/Stepper';
import { useToast } from '../../ui/Toast';
import type { Quotation } from '../../data/quotations';
import { ME } from '../../data/queues';
import {
  buildBomLines, runQuote, totalQtyOf, type BomLine, type LineStatus,
} from '../../data/bom';
import { StepConfigBom } from './run/StepConfigBom';
import { StepReviewBom } from './run/StepReviewBom';
import { StepQuoting } from './run/StepQuoting';
import { StepSummary } from './run/StepSummary';
import {
  ExcludedPartsDialog, AddAttritionDialog, ConfirmQuoteDialog, AddPackageDialog,
} from './run/dialogs';
import { step1Error, type RunConfig } from './run/state';

/**
 * Run Quotation — Quick Quote.
 *
 * SOURCES, in the order they outrank one another (docs/precedence.md):
 *
 *   1. The customer's Testing Guideline, sheet "PR - EC - Quick Quote", 265
 *      rows across the four steps. It is the specification: column order,
 *      colour meanings, filter order, formulas, validation messages, which
 *      fields are editable and which dialogs appear on which button.
 *   2. The shipped production bundle — `chunk-BAkpvJLm.js` for the wizard,
 *      `chunk-DtT2PYYA.js` for the summary — decoded from its obfuscated string
 *      tables. It supplied the four step names and the three BoM sources, two
 *      of which the guideline does not document because Quick Quote only uses
 *      the third.
 *
 * Nothing was executed against the live system: a real quote run costs money
 * and writes records.
 *
 * WHAT THIS FILE GOT WRONG TWICE, because both mistakes are instructive.
 *
 * First, it claimed the live flow "is not a linear stepper" and that the four
 * steps were this mockup's own proposal. The reducer is in the bundle with four
 * named steps and a validity guard. Believing otherwise led to inventing a step
 * order and dropping the BoM source choice, Save Draft and Assembly Details.
 *
 * Second — corrected here — the steps were right but nearly empty. Step 2 had
 * no BoM grid at all, step 3 had eleven columns where the guideline specifies
 * twenty-one, none of the four colour states existed, and none of the six
 * search-and-filter controls or the four dialogs were built. A wizard whose
 * shape is right and whose content is absent still cannot be reviewed.
 */

const STEPS = [
  { label: '1 - Config BoM', text: 'Choose the BoM and the assembly to quote' },
  { label: '2 - Review BoM', text: 'Check the parsed lines and what is excluded' },
  { label: '3 - Quoting',    text: 'Run the quote and choose suppliers' },
  { label: '4 - Summary',    text: 'Cost estimation and submission' },
];

export function RunQuotationDialog({ q, onClose }: { q: Quotation; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);

  const [cfg, setCfg] = useState<RunConfig>(() => ({
    action: 'import-new',
    bomOption: 'current',
    attachment: 'BOM_RevC_2026-08-12.xlsx',
    template: '',
    detection: 'part number',
    uploadedFile: '',
    assemblyPartNumber: '',
    partRev: '',
    partDesc: '',
    assembly: '',
    quoteFocus: q.quoteFocus,
    materialPackageType: q.materialPackageType,
    markup: q.markup,
    /* Both default to 1, stated for each on step 1. */
    buildQty: 1,
    attritionSet: 1,
    provider: 'Nexar',
  }));
  const set = (patch: Partial<RunConfig>) => setCfg(c => ({ ...c, ...patch }));

  const [lines, setLinesState] = useState<BomLine[]>(() => buildBomLines());
  const setLines = (fn: (l: BomLine[]) => BomLine[]) => setLinesState(fn);

  const [hasRun, setHasRun] = useState(false);
  const [runVersion, setRunVersion] = useState(0);
  const [runDate, setRunDate] = useState('');

  const [excludedOpen, setExcludedOpen] = useState(false);
  const [attritionOpen, setAttritionOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);

  const goTo = (i: number) => { setStep(i); setFurthest(f => Math.max(f, i)); };

  /* ---- Step 1 -> 2 ------------------------------------------------------- */
  function leaveStep1() {
    /* Each flow has its own message and the guideline gives both verbatim —
       "Please input information for assemblyPartNumber, partRev, partDesc" and
       "Select assembly first!". Quoted rather than rewritten, because a tester
       matching the sheet against the build is looking for those strings. */
    const err = step1Error(cfg);
    if (err) { toast.success(err); return; }
    goTo(1);
  }

  /* ---- Step 2 -> 3 ------------------------------------------------------- */
  function leaveStep2() { setExcludedOpen(true); }

  /* ---- The run ----------------------------------------------------------- */
  function run() {
    setLines(ls => runQuote(ls, cfg.buildQty, cfg.attritionSet, cfg.provider));
    setHasRun(true);
    setRunVersion(v => v + 1);
    setRunDate(new Date().toLocaleString('en-GB'));
    toast.success(`Quote run complete for RFQ${q.no} via ${cfg.provider}.`);
  }

  /**
   * Apply — recalculates Total Qty, and re-prices if a run has happened.
   *
   * "Recalculates the Total Qty for each part based on the updated Build Qty and
   * Attrition Set values when the user clicks this button." Total Qty is
   * computed rather than stored, so the recalculation is already visible; what
   * Apply genuinely changes is the ORDER quantities and therefore the excess,
   * which is why it re-runs the pricing arithmetic without re-calling the
   * provider — "they no need to re-run, just click APPLY".
   */
  function apply() {
    if (!hasRun) { toast.success('Total Qty updated.'); return; }
    setLines(ls => runQuote(ls, cfg.buildQty, cfg.attritionSet, cfg.provider));
    toast.success('Total Qty and supplier quantities recalculated.');
  }

  /**
   * Apply Price Range — the configured Attrition Info bands.
   *
   * "the system evaluates each BOM line against the configured Attrition Info
   * conditions. If a BOM line matches a configured Price Range, the system
   * applies the corresponding Attrition Qty." The bands themselves live in
   * configuration this prototype does not cover, so a plain, stated rule stands
   * in for them: bigger quantities carry proportionally more attrition.
   */
  function applyPriceRange() {
    let changed = 0;
    setLines(ls => ls.map(l => {
      if (l.excluded) return l;
      const total = totalQtyOf(l, cfg.buildQty, cfg.attritionSet);
      const band = total >= 10000 ? 10 : total >= 1000 ? 5 : total >= 100 ? 2 : 0;
      if (band === l.attrition) return l;
      changed++;
      return { ...l, attrition: band };
    }));
    toast.success(changed
      ? `Price ranges applied — attrition changed on ${changed} ${changed === 1 ? 'line' : 'lines'}.`
      : 'No line matched a different price range.');
  }

  function saveDraft() {
    toast.success('Save draft quotation successfully!');
  }

  /* ---- Step 3 -> 4 ------------------------------------------------------- */
  function acceptAndContinue() {
    /* "If the user continues, all unselected BOM lines are updated to
       Status = NO BID accordingly." */
    setLines(ls => ls.map(l =>
      (!l.excluded && !l.supplier ? { ...l, status: 'NO BID' as LineStatus } : l)));
    setConfirmOpen(false);
    goTo(3);
  }

  const excluded = lines.filter(l => l.excluded);
  const canLeaveStep3 = hasRun;

  return (
    <>
      <Dialog
        open size="xl"
        title={`Run Quotation — RFQ${q.no}`}
        subtitle={STEPS[step].text}
        onClose={onClose}
        actions={<>
          <Button onClick={onClose}>Cancel</Button>

          {/* Save draft appears on steps 3 and 4 only, which is where the
              guideline puts it — those are the steps holding work worth losing. */}
          {(step === 2 || step === 3) && <Button onClick={saveDraft}>Save draft</Button>}

          <Button onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0}>
            Previous
          </Button>

          {step === 0 && <Button variant="filled" onClick={leaveStep1}>Next</Button>}
          {step === 1 && <Button variant="filled" onClick={leaveStep2}>Next</Button>}
          {step === 2 && (
            <Button variant="filled" disabled={!canLeaveStep3}
                    title={canLeaveStep3 ? undefined : 'Run the quote before continuing'}
                    onClick={() => setConfirmOpen(true)}>
              Next
            </Button>
          )}
          {step === 3 && (
            <Button variant="filled" onClick={() => {
              toast.success('Add Quotation Result');
              onClose();
            }}>
              Submit
            </Button>
          )}
        </>}
      >
        <div className="vy-run">
          <Stepper steps={STEPS} value={step} furthest={furthest} onChange={goTo} numbered={false} />

          <div className="vy-run-context">
            <span className="vy-ident">RFQ{q.no}</span>
            <span>{q.customer}</span>
            <span className="vy-code">{q.application}</span>
            <span className="vy-code">{q.rfqType}</span>
          </div>

          {step === 0 && <StepConfigBom q={q} cfg={cfg} set={set} />}
          {step === 1 && <StepReviewBom cfg={cfg} set={set} lines={lines} setLines={setLines} />}
          {step === 2 && (
            <StepQuoting
              cfg={cfg} set={set} lines={lines} setLines={setLines}
              hasRun={hasRun}
              onRun={run}
              onApply={apply}
              onAddAttrition={() => setAttritionOpen(true)}
              onApplyPriceRange={applyPriceRange}
            />
          )}
          {step === 3 && (
            <StepSummary
              cfg={cfg} lines={lines} setLines={setLines}
              run={{ by: ME, date: runDate, version: runVersion }}
              onAddPackage={() => setPackageOpen(true)}
            />
          )}
        </div>
      </Dialog>

      <ExcludedPartsDialog
        open={excludedOpen} lines={excluded}
        onClose={() => setExcludedOpen(false)}
        onConfirm={() => { setExcludedOpen(false); goTo(2); }}
      />

      <AddAttritionDialog
        open={attritionOpen} cfg={cfg} lines={lines}
        onClose={() => setAttritionOpen(false)}
        onSet={(id, attrition) =>
          setLines(ls => ls.map(l => (l.id === id ? { ...l, attrition } : l)))}
      />

      <ConfirmQuoteDialog
        open={confirmOpen} lines={lines}
        onClose={() => setConfirmOpen(false)}
        onAccept={acceptAndContinue}
      />

      <AddPackageDialog
        open={packageOpen}
        buildQty={cfg.buildQty}
        onClose={() => setPackageOpen(false)}
        onAdd={p => setLines(ls => [...ls, {
          id: Math.max(0, ...ls.map(l => l.id)) + 1,
          number: ls.length + 1,
          part: p.part, revision: '—', description: p.description,
          /* `qty` is PER BOARD everywhere in this model, so the package's total
             comes out of the same formula as every other line rather than
             being stored separately. */
          partSource: 'PACKAGING', qty: p.qty, level: 1,
          mfg: p.mfg, mpn: p.mpn,
          attrition: 0, supplier: '—',
          orderQty: p.qty * cfg.buildQty, stock: 0, outStock: 0, lt: 0, pkg: '', moq: 0,
          excessQty: 0, unitPrice: p.unitPrice,
          amount: p.unitPrice * p.qty * cfg.buildQty,
          excessAmt: 0, status: 'COVER', notes: p.notes,
          excluded: false, isPackage: true,
        }])}
      />
    </>
  );
}
