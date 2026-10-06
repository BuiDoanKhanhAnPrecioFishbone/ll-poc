import { useState } from 'react';
import { saveDraftQuote, type DraftQuote } from '../../data/draftQuotes';
import { Dialog } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { Stepper } from '../../ui/Stepper';
import { useToast } from '../../ui/Toast';
import type { Quotation } from '../../data/quotations';
import { ME } from '../../data/queues';
import {
  buildBomLines, runQuote, totalQtyOf, money, type BomLine, type LineStatus,
} from '../../data/bom';
import { StepConfigBom } from './run/StepConfigBom';
import { StepReviewBom } from './run/StepReviewBom';
import { StepQuoting } from './run/StepQuoting';
import { StepSummary } from './run/StepSummary';
import {
  AddAttritionDialog, AddPackageDialog,
} from './run/dialogs';
import { step1Error, missingStep1, type RunConfig } from './run/state';

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

export function RunQuotationDialog({ q, onClose, resume }: {
  q: Quotation; onClose: () => void;
  /**
   * A draft to open on, chosen on the record rather than in here.
   *
   * "Redirect to Step 3 - Quoting for the selected draft." Steps 1 and 2 are
   * skipped because the draft already holds their output — the BoM was
   * configured and reviewed in the sitting that saved it. `furthest` starts at
   * 2 as well, so stepping back to look at the parsed BoM is still allowed.
   */
  resume?: DraftQuote;
}) {
  const toast = useToast();
  const [step, setStep] = useState(resume ? 2 : 0);
  const [furthest, setFurthest] = useState(resume ? 2 : 0);

  const [cfg, setCfg] = useState<RunConfig>(() => resume ? resume.cfg : ({
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
  }) as RunConfig);
  const set = (patch: Partial<RunConfig>) => setCfg(c => ({ ...c, ...patch }));

  const [lines, setLinesState] = useState<BomLine[]>(() => resume ? resume.lines : buildBomLines());
  const setLines = (fn: (l: BomLine[]) => BomLine[]) => setLinesState(fn);

  const [hasRun, setHasRun] = useState(Boolean(resume?.hasRun));
  const [runVersion, setRunVersion] = useState(resume?.runVersion ?? 0);
  const [runDate, setRunDate] = useState(resume?.runDate ?? '');

  const [attritionOpen, setAttritionOpen] = useState(false);
  const [packageOpen, setPackageOpen] = useState(false);
  /* Which step-1 fields failed, so the fields themselves can say so. */
  const [invalid, setInvalid] = useState<readonly string[]>([]);

  const goTo = (i: number) => { setStep(i); setFurthest(f => Math.max(f, i)); };

  /* ---- Step 1 -> 2 ------------------------------------------------------- */
  function leaveStep1() {
    /* Each flow has its own message and the guideline gives both verbatim —
       "Please input information for assemblyPartNumber, partRev, partDesc" and
       "Select assembly first!". Quoted rather than rewritten, because a tester
       matching the sheet against the build is looking for those strings.

       THE MESSAGE IS THEIRS; WHERE IT POINTS IS OURS. Those three field names
       are camel-case internals, and the fields they name sat 648px below the
       fold — so the toast named three things the user had never seen, nothing
       was marked, and the dialog did not move. Now the fields carry the error
       and the first one takes focus; the toast still says their sentence. */
    const err = step1Error(cfg);
    if (err) {
      setInvalid(missingStep1(cfg));
      toast.error(err);
      /* After the render that marks them — the field does not exist as an
         invalid control until React has painted it. */
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>('.vy-run [data-invalid] input, .vy-run [data-invalid] textarea, .vy-run [data-invalid] .k-input-inner');
        first?.focus();
        first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }
    setInvalid([]);
    goTo(1);
  }

  /* ---- Step 2 -> 3 -------------------------------------------------------
     It used to open "Review Excluded Parts" — a modal on top of a modal, whose
     content was a count and a list the step behind it was already showing. The
     exclusions now live on step 2 as a filter you can press at any time, so the
     way forward is just forward. */
  function leaveStep2() { goTo(2); }

  /* ---- The run ----------------------------------------------------------- */
  function run() {
    setLines(ls => runQuote(ls, cfg.buildQty, cfg.attritionSet, cfg.provider, cfg.quoteFocus));
    setHasRun(true);
    setRunVersion(v => v + 1);
    setRunDate(new Date().toLocaleString('en-GB'));
    /* "Complete" would be a lie under Other — the run deliberately leaves every
       Supplier empty, and a success message that does not say so sends the user
       looking for the bug. */
    toast.success(cfg.quoteFocus === 'OTHER'
      ? `Quantities computed for RFQ${q.no}. Quote Focus is OTHER, so no suppliers were selected — choose them per line.`
      : `Quote run complete for RFQ${q.no} via ${cfg.provider}.`);
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
    setLines(ls => runQuote(ls, cfg.buildQty, cfg.attritionSet, cfg.provider, cfg.quoteFocus));
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

  /* Save draft used to show the guideline's success message and do nothing
     else, which made Resume Draft Quote unreachable: the flow named after
     resuming a draft had no draft to resume. It now writes one.

     The message itself is unchanged — "Save draft quotation successfully!" is
     quoted verbatim from the guideline, which specifies that exact string for
     this step, and a tester matching the sheet is looking for it. What follows
     the message is ours: where the draft went, and the same session-only
     caveat every other write in this prototype carries. */
  function saveDraft() {
    const assemblyName = cfg.assembly || cfg.assemblyPartNumber || q.projectName;
    const replaced = saveDraftQuote({
      id: `draft-${q.id}-${assemblyName}-${cfg.partRev}`,
      rfqId: q.id,
      customer: q.customer,
      assemblyName,
      revision: cfg.partRev || '—',
      description: cfg.partDesc || q.projectName,
      buildQty: cfg.buildQty,
      attritionSet: cfg.attritionSet,
      createdDate: new Date(),
      cfg, lines, hasRun, runVersion, runDate,
    });
    toast.success('Save draft quotation successfully!');
    toast.success(replaced
      ? `Draft for ${assemblyName} updated. Pick it up from Run Quotation → Resume draft on the record. Held in this browser session only.`
      : `Draft saved for ${assemblyName}. Pick it up from Run Quotation → Resume draft on the record. Held in this browser session only.`);
  }

  /* ---- Step 3 -> 4 -------------------------------------------------------
     ONE BUTTON, NO CONFIRMATION DIALOG. This was a modal that asked "are you
     sure" about a fact the footer can simply state: how many lines will be
     quoted, what they come to, and how many have no supplier. The rule the
     dialog existed to enforce is unchanged — "If the user continues, all
     unselected BOM lines are updated to Status = NO BID accordingly" — it just
     happens on the press, under a button that says what it does. */
  function generateQuotation() {
    setLines(ls => ls.map(l =>
      (!l.excluded && !l.supplier ? { ...l, status: 'NO BID' as LineStatus } : l)));
    goTo(3);
  }

  const quotable = lines.filter(l => !l.excluded);
  const noSupplier = quotable.filter(l => !l.supplier).length;
  const quotedTotal = quotable.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const canLeaveStep3 = hasRun;

  return (
    <>
      <Dialog
        open size="xl"
        /* MAXIMISED, with Restore down still there. The customer's reviewers
           called this dialog small beside their own window, and the measurement
           agreed: at 1920 it used 61% of the width and still asked for 625px of
           scrolling. Their users are cost estimators reading a 21-column grid —
           screen is the material this flow is made of. */
        startMaximised
        title={`Run Quotation — RFQ${q.no}`}
        /* The strip that used to sit under the stepper said RFQ number,
           customer, application and type. The number is in the title above it,
           and the other three are facts about the record rather than about this
           step — so they ride in the subtitle, and the 50px the strip cost goes
           to the grid, which is what a cost estimator is actually reading. */
        subtitle={`${STEPS[step].text} · ${q.customer} · ${q.application} · ${q.rfqType}`}
        onClose={onClose}
        actions={<>
          <Button onClick={onClose}>Cancel</Button>

          {/* WHAT THE CONFIRMATION DIALOG USED TO SAY, said in the footer beside
              the button that acts on it. A modal asking "are you sure" about
              three numbers is a modal that could have printed the numbers. */}
          {step === 2 && hasRun && (
            <span className="vy-run-footnote" aria-live="polite">
              <strong>{quotable.length}</strong> {quotable.length === 1 ? 'line' : 'lines'}
              {' · '}{money(quotedTotal)}
              {noSupplier > 0 && <> · <strong>{noSupplier}</strong> without a supplier → NO BID</>}
            </span>
          )}

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
                    onClick={generateQuotation}>
              Generate Quotation
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
          <Stepper steps={STEPS} value={step} furthest={furthest} onChange={goTo}
                   numbered={false} showText={false} />

          {step === 0 && <StepConfigBom q={q} cfg={cfg} set={set} invalid={invalid} />}
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

      <AddAttritionDialog
        open={attritionOpen} cfg={cfg} lines={lines}
        onClose={() => setAttritionOpen(false)}
        onSet={(id, attrition) =>
          setLines(ls => ls.map(l => (l.id === id ? { ...l, attrition } : l)))}
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
