import { useMemo, useState } from 'react';
import { Dialog, Select } from '../../ui/Overlays';
import { Button } from '../../ui/Button';
import { MiniTable } from '../../ui/MiniTable';
import { useColumnChoice } from '../../ui/useColumnChoice';
import { ColumnChooser } from '../../ui/ColumnChooser';
import { useToast } from '../../ui/Toast';
import { useExcelExport } from '../../ui/useExcelExport';
import { fmtDateTime } from '../../ui/regional';
import type { ColumnSpec } from '../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './run/QuoteContext';
import { rowTone } from './run/StepQuoting';
import { resultSetup, resultLines } from '../../data/quoteRun';
import { quoteReportWorkbook } from '../../data/quoteReport';
import { masterSuppliers } from '../../data/suppliers';
import { totalQtyOf, money, money3, packageBomLine, type BomLine } from '../../data/bom';
import { bomVersionOf, type AssemblyRuns } from '../../data/resultVersions';
import type { Quotation, QuoteResult } from '../../data/quotations';
import { AddPackageDialog } from './run/dialogs';
import { PricingDetailDialog } from './PricingDetailDialog';
import { SmartIcon } from './SmartButtons';

/**
 * One saved quotation version, read-only — the customer's "Quote result
 * (view mode)".
 *
 * IT IS THE SCREEN THAT WAS MISSING. Her 16 Oct prototype carries a button
 * that leaves the wizard and shows a finished run: the setup it used, the cost
 * matrix, and every priced line. Our Result tab listed the versions and had
 * nowhere to go — clicking one raised "not implemented" — which made the one
 * question a reader of that table actually has, "what is in version 3", the
 * one thing the table could not answer.
 *
 * WHY A DIALOG AND NOT A ROUTE. The versions are a property of the RFQ and are
 * compared against each other; sending the user to another address to read one
 * means coming back to compare. Run Quotation is a dialog over this same
 * record for the same reason.
 *
 * READ-ONLY THROUGHOUT, and that is the difference from step 4 of the wizard.
 * Step 4 still lets a status be changed because the quote is not finished; a
 * saved version is a historical fact. Nothing here edits anything, so nothing
 * here is a control that looks like it might.
 */
export function QuoteResultDialog({ q, group, onClose }: {
  q: Quotation;
  /** The assembly and every run of it — the picker's list. */
  group: AssemblyRuns;
  onClose: () => void;
}) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [noBid, setNoBid] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [excess, setExcess] = useState(false);
  /* Opens on the run that ran last, which is what the row reported. */
  const [picked, setPicked] = useState(group.latest.id);
  const [packageOpen, setPackageOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  /**
   * What this session has added to the version on screen.
   *
   * THE CUSTOMER'S ANSWER OF 29 OCT settled a question this screen had been
   * carrying a comment about: a saved version is NOT history. A package is
   * something Rocket sells when the customer asks for it, and adding one
   * re-prices the quote in front of you. So both controls write — and neither
   * persists, because the prototype has no store; the cost card says so where
   * the changed total appears rather than letting it look saved.
   */
  const [added, setAdded] = useState<BomLine[]>([]);
  const [otherCost, setOtherCost] = useState(0);

  const result = group.runs.find(r => r.id === picked) ?? group.latest;
  const setup = useMemo(() => resultSetup(result), [result]);
  const priced = useMemo(() => resultLines(result), [result]);
  const lines = useMemo(() => [...priced, ...added], [priced, added]);
  const { exportWorkbook, excel, busy: exporting } = useExcelExport<BomLine>();
  const packagesAmount = added.reduce((n, l) => n + l.amount, 0);
  const adjusted = packagesAmount > 0 || otherCost > 0;

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return lines.filter(l => {
      if (k && ![l.part, l.description, l.mpn, l.mfg, l.supplier]
        .some(v => v.toLowerCase().includes(k))) return false;
      if (noBid && l.supplier !== '') return false;
      if (notEnough && l.status !== 'NO') return false;
      if (excess && !(l.excessAmt > 0)) return false;
      return true;
    });
  }, [lines, search, noBid, notEnough, excess]);

  const columns = resultColumns(setup.buildQty, setup.attritionSet);
  /* COLUMNS, WHICH HER OWN RESULT VIEW HAS and this one did not. Fourteen
     columns, two of them frozen; the standard's rule is "every list or grid
     with 3+ columns". Locked = frozen, as on every other grid here. */
  const { shown: shownColumns, chooser } =
    useColumnChoice(columns, { locked: 2, storageKey: 'vy.cols.quoteResult' });

  return (
    <Dialog
      open size="xl"
      title="Quotation Result"
      subtitle={`${result.partNumber} · Rev ${result.partRev} · ${result.description}`}
      onClose={onClose}
    >
      {excel}

      <div className="vy-run-step">
        {/* TOP LEFT, NOT A FOOTER — the same row the wizard uses, and for the
            same reason the standard gives: "Top-left toolbar = page navigation
            only". This screen is a RECORD, not a step: nothing here commits
            anything, so there is no sequence for the eye to finish at the
            bottom of, and the actions apply to the whole version at any
            moment. In a footer they also sat below a 23-row grid, which is a
            long way from the thing they act on. Her own prototype puts Export
            to Excel and Export to PDF at the top left.

            DONE FIRST, because the way out goes on the left wherever the bar
            sits (modal-patterns, rule 3) — and none of the three is `filled`:
            a primary button promises a commit, and a saved version cannot be
            changed from here. */}
        <div className="vy-run-nav">
          <div className="vy-run-nav-actions">
            <Button onClick={onClose}>Done</Button>
            {/* THREE SHEETS, NOT THE GRID — guideline 2.1 §5 specifies the
                quoting report as Summary, Detail and Supporting, and this is
                the button it describes. It exports EVERY line, not the
                filtered set: a filter is how someone reads the screen, and
                the file goes to a customer. */}
            <Button busy={exporting}
                    onClick={() => exportWorkbook(
                      quoteReportWorkbook({
                        rfqNo: q.no, assembly: `${result.partNumber} · Rev ${result.partRev}`,
                        result, setup, lines,
                      }),
                      `QuotingReport-RFQ${q.no}-${result.lastRunVersion}.xlsx`)}>
              {exporting ? 'Building the file…' : 'Export to Excel'}
            </Button>
            {/* Hers, and not built — said plainly rather than wired to a
                silent no-op. */}
            <Button onClick={() => toast.notImplemented('export this quotation as PDF')}>
              Export to PDF
            </Button>
          </div>

          {/* SELECT QUOTATION VERSION — guideline 2.1 §4.3, and the customer's
              answer of 29 Oct: yes, there is a picker, and the Result tab folds
              the runs of one assembly into a single row. Without it the
              earlier versions were unreachable from the screen built to read
              one, and comparing two meant closing this dialog to open the
              other.

              ON THE RIGHT OF THE NAVIGATION ROW, not inside the setup strip.
              It does not describe this run, it CHOOSES which run the whole
              screen is about, and `.vy-run-nav-actions` is `flex: 1 1 auto`,
              so a sibling after it lands at the end of the row the way the
              wizard's stepper does.

              ONE ASSEMBLY, NOT THE RFQ. §4.3 lists Assembly and Rev in each
              option because the live picker spans everything the RFQ quoted;
              this one is opened from an assembly's row and the strip below
              names it, so the option text carries what actually differs
              between the runs. */}
          {group.runs.length > 1 && (
            <div className="vy-version-pick">
              {/* A VISIBLE CAPTION, because `Select`'s `label` is its
                  aria-label and nothing else. Without one the row ends in a
                  dropdown reading "v3 · BoM v3 · 250 boards · $41,655.00",
                  which is a value with no name on it. */}
              <span className="vy-version-pick-label">Version</span>
              {/* MEDIUM, NOT SMALL — it stands in a row of 34px buttons, and
                  at `small` it was 32px: two control heights on one line, which
                  is the first thing an eye notices on a toolbar. */}
              <Select
                label="Quotation version" value={picked}
                options={group.runs.map(r => ({
                  value: r.id,
                  label: versionOption(r),
                }))}
                onChange={id => {
                  setPicked(id);
                  /* The adjustments belong to the version they were made on —
                     carrying a package added to v3 over to v1 would show a
                     total no run ever produced. */
                  setAdded([]);
                  setOtherCost(0);
                }}
              />
            </div>
          )}
        </div>

        {/* THE COST BESIDE THE SETUP, as her mockup has it. Stacked, the cost
            card took a full-width band to show a 340px table — the right two
            thirds were empty, and the band cost the grid a row and a half of
            the only thing anyone opens this screen to read. Side by side it
            costs nothing: the setup strip has width to spare and simply wraps
            onto one more line. */}
        <div className="vy-result-head">
        <QuoteContextBar
          heading={`Quote Run · Version ${result.lastRunVersion.replace(/^v/, '')}`}
          assembly={`${result.partNumber} - ${result.partRev}`}
          description={result.description}
          applied={{
            buildQty: setup.buildQty,
            attritionSet: setup.attritionSet,
            quoteFocus: setup.quoteFocus,
            markup: setup.markup,
            materialPackageType: setup.packageType,
            excessMoq: setup.excessMoq,
            netConsigned: setup.netConsigned,
            rocketConsigned: setup.rocketConsigned,
            provider: setup.provider,
            /* `QuoteSetup` carries the supplier list because the wizard's
               strip reports how many are switched on. A saved version has the
               master list by construction — see resultLines. */
            suppliers: masterSuppliers(),
          }}
          extra={[
            { label: 'Prices From', value: fmtDateTime(result.lastRunDate) },
            { label: 'Run by', value: result.lastRunBy },
            { label: 'Run Date', value: fmtDateTime(result.lastRunDate) },
          ]}
        />

        <section className="vy-cost-card vy-cost-card--side">
          <h3 className="vy-field-group-title">
            <SmartIcon name="finance" />Cost Estimation
          </h3>
          {/* THE STORED TOTALS, NOT RECOMPUTED ONES. The lines below are priced
              by the same engine the run used, but a saved version's totals are
              what was quoted to the customer — if the two ever disagree, the
              number that went out is the true one and the table should say so
              rather than quietly correct it. */}
          <table className="vy-cost-table">
            <thead>
              <tr>
                <th scope="col"><span className="vy-sr-only">Measure</span></th>
                <th scope="col">Without Markup</th>
                <th scope="col">With Markup ({result.markupPct}%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Per Board</th>
                <td>{money3(result.costPerBoard)}</td>
                <td>{money3(result.costPerBoard * (1 + result.markupPct / 100))}</td>
              </tr>
              <tr>
                <th scope="row">Total</th>
                <td>{money(result.totalAmount)}</td>
                <td data-emphasis>{money(result.totalWithMarkup)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Excess Amount</th>
                <td />
                <td>{money(lines.reduce((n, l) => n + l.excessAmt, 0))}</td>
              </tr>
              {/* ONLY ONCE SOMETHING HAS BEEN ADDED. Three rows reading $0.00
                  would describe a quote nobody has touched as one that has
                  been adjusted to nothing. */}
              {adjusted && <>
                {packagesAmount > 0 && (
                  <tr>
                    <th scope="row">
                      Packages added
                      <span className="vy-pill vy-pill--sm">{added.length}</span>
                    </th>
                    <td />
                    <td>{money(packagesAmount)}</td>
                  </tr>
                )}
                {otherCost > 0 && (
                  <tr>
                    <th scope="row">Other quoted cost</th>
                    <td />
                    <td>{money(otherCost)}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row">Total Quoted</th>
                  <td />
                  <td data-emphasis>
                    {money(result.totalWithMarkup
                           + (packagesAmount + otherCost) * (1 + result.markupPct / 100))}
                  </td>
                </tr>
              </>}
            </tfoot>
          </table>
          {/* A PROTOTYPE CANNOT SAVE THIS, so it says which number is which
              rather than letting a changed total look like a stored one. */}
          {adjusted && (
            <p className="vy-field-hint">
              Added in this session. The run's own totals above are what was
              quoted; nothing here is saved.
            </p>
          )}
          {/* BOTH BUTTONS ARE HERS, and both were a comment here until 29 Oct.

              ADD PACKAGE was left off on the reasoning that a saved version is
              history and a read-only screen should carry no control that edits
              it. The customer answered that directly: a package is what Rocket
              sells when the customer asks for it, and adding one re-prices the
              quotation being looked at. The reasoning was sound and the premise
              was wrong, which is why it was asked rather than assumed.

              PRICING DETAIL opened nothing in her prototype either, so what it
              led to was a question. It leads to Other Quoted Cost: the
              reference costs this assembly has been bought at, and the labour
              and consulting that go on top of material. */}
          <div className="vy-cost-actions">
            <Button onClick={() => setPackageOpen(true)}
                    title="Add a packaging part and re-price this quotation">
              Add Package
            </Button>
            <Button onClick={() => setPricingOpen(true)}
                    title="Reference costs, and the cost quoted beside material">
              Pricing Detail
            </Button>
          </div>
        </section>
        </div>

        <QuoteToolbar
          search={search} onSearch={setSearch}
          placeholder="Search by Part / Description / MPN / MFG / Supplier"
          filters={[
            { key: 'nobid', label: 'No Bid', on: noBid, onToggle: setNoBid,
              count: lines.filter(l => l.supplier === '').length },
            { key: 'qty', label: 'Not Enough Qty', on: notEnough, onToggle: setNotEnough,
              count: lines.filter(l => l.status === 'NO').length },
            { key: 'excess', label: 'Excess Qty', on: excess, onToggle: setExcess,
              count: lines.filter(l => l.excessAmt > 0).length },
          ]}
          actions={
            /* Her toolbar carries Import beside Export. Import belongs to the
               migration flow — "Import Completed Quote" on step 1, also not
               built — so it says so rather than pretending. */
            <Button size="sm" onClick={() => toast.notImplemented('import a completed quote')}>
              Import
            </Button>
          }
          trailing={<ColumnChooser {...chooser} />}
        />

        {/* The grid shows what the chooser leaves; the EXPORT keeps all
            fourteen. Putting a column away to read the screen should not
            quietly drop it from the file somebody quotes from. */}
        <MiniTable data={shown} columns={shownColumns} freeze={2} rowTone={rowTone}
                   filterable={false} empty={<NoRecords />} />

        {/* THREE TONES, BECAUSE THE GRID PAINTS THREE. This legend shipped
            with two entries, and neither of them worked: `data-tone` on the
            `li` itself drew no swatch — the colour belongs to `.vy-tone-key`,
            as step 3's legend has it — and "warn"/"bad" are not tone names
            this app uses, so even a correct element would have been
            transparent. Measured in the dialog: rows carry `covered`, `short`
            and `no-supplier`; the legend carried nothing at all and was silent
            about the green that covers most of the grid. */}
        <ul className="vy-tone-legend">
          <li><span className="vy-tone-key" data-tone="known" aria-hidden />
            Fully covered by the selected supplier</li>
          <li><span className="vy-tone-key" data-tone="short" aria-hidden />
            Out of stock quantity — the supplier cannot cover the full amount</li>
          <li><span className="vy-tone-key" data-tone="missing" aria-hidden />
            No bid — no supplier covered this line, so it is not in the total</li>
        </ul>
      </div>

      {/* THE WIZARD'S OWN DIALOG, not a second one that looks like it. Step 4
          adds packages through this same form, and the line it produces is
          built in one place — see packageBomLine. */}
      <AddPackageDialog
        open={packageOpen}
        buildQty={setup.buildQty}
        onClose={() => setPackageOpen(false)}
        onAdd={pkg => setAdded(ls => [...ls, packageBomLine(pkg, setup.buildQty, lines)])}
      />

      {/* KEYED ON THE RUN. Its cost lines are seeded from the result ONCE, in
          a `useState` initialiser, so without this the screen kept the lines
          of whichever version was open first: switch from v3 to v1, press
          Pricing Detail, and the material line still read v3's 100 boards.
          Caught by the arithmetic — the applied total did not match the
          subtotal the dialog had just shown. */}
      <PricingDetailDialog
        key={result.id}
        result={result} open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        onApply={cost => {
          setOtherCost(cost);
          toast.success(`Other quoted cost applied — ${money(cost)} on top of material.`);
        }}
      />
    </Dialog>
  );
}

/**
 * One line of the version picker.
 *
 * §4.3 asks for Assembly - Rev - Part Rev - BoM Version - Qty - Total amount.
 * The first three are the same on every option here, so they are not repeated
 * nine times in a dropdown — the strip under it names the assembly. What is
 * left is what tells two runs apart: which BoM they priced, at what volume, for
 * how much.
 */
function versionOption(r: QuoteResult): string {
  const bom = bomVersionOf(r);
  return [
    r.lastRunVersion,
    bom ? `BoM ${bom}` : 'existing BoM',
    `${r.buildQty.toLocaleString()} boards`,
    money(r.totalWithMarkup),
  ].join(' · ');
}

/**
 * Her columns, in her order and under her names.
 *
 * Fourteen, against step 4's twenty-one. The wizard's extra columns are the
 * ones you need while DECIDING — Revision, per-board Qty, Attrition, LT,
 * Status, Notes — and a saved version has no decisions left in it. `EXT.
 * PRICE` is her name for what the wizard calls Amount; this is her screen, so
 * it is her name.
 */
function resultColumns(buildQty: number, attritionSet: number): ColumnSpec<BomLine>[] {
  const dash = <span className="vy-empty">—</span>;
  return [
    { field: 'part', title: 'Part', role: 'ident', width: 180,
      widthNote: 'Frozen; part numbers must not truncate.' },
    { field: 'description', title: 'Description', role: 'text' },
    { field: 'number', title: 'Total Qty', role: 'number', width: 110,
      render: l => totalQtyOf(l, buildQty, attritionSet).toLocaleString() },
    { field: 'mfg', title: 'MFG', role: 'text', width: 150 },
    { field: 'mpn', title: 'MPN', role: 'ident', width: 190,
      render: l => l.mpn ? <span className="vy-code">{l.mpn}</span> : dash },
    { field: 'supplier', title: 'Supplier', role: 'text', width: 150,
      render: l => l.supplier || <span className="vy-pill">No Bid</span> },
    { field: 'orderQty', title: 'Order Qty', role: 'number', width: 110,
      render: l => l.supplier ? l.orderQty.toLocaleString() : dash },
    { field: 'stock', title: 'Stock', role: 'number', width: 110,
      render: l => l.stock ? l.stock.toLocaleString() : dash },
    { field: 'outStock', title: 'Out Stock', role: 'number', width: 110,
      render: l => l.outStock ? l.outStock.toLocaleString() : dash },
    { field: 'pkg', title: 'Pkg.', role: 'code', width: 110, render: l => l.pkg || dash },
    { field: 'moq', title: 'MOQ', role: 'number', width: 100,
      render: l => l.supplier ? l.moq.toLocaleString() : dash },
    { field: 'unitPrice', title: 'Unit Price', role: 'money', width: 116,
      render: l => l.unitPrice ? money3(l.unitPrice) : dash },
    { field: 'amount', title: 'Ext. Price', role: 'money', width: 120,
      widthNote: "The customer's name for the line total.",
      render: l => l.amount ? money(l.amount) : dash },
    { field: 'excessAmt', title: 'Excess AMT', role: 'money', width: 130,
      render: l => l.excessAmt ? money3(l.excessAmt) : dash },
  ];
}
