import { useMemo, useState } from 'react';
import { MiniTable } from '../../../ui/MiniTable';
import { Checkbox } from '../../../ui/Overlays';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import { KNOWN_MANUFACTURERS, PART_MASTER, totalQtyOf, type BomLine } from '../../../data/bom';
import type { RunConfig } from './state';

/**
 * Step 2 — Review BoM.
 *
 * The grid is the step. Everything else on screen exists to narrow it, and the
 * three colours in it are the only place the user learns that a part is missing
 * from Part Master before the quote refuses to confirm.
 */
export function StepReviewBom({ cfg, set, lines, setLines }: {
  cfg: RunConfig; set: (patch: Partial<RunConfig>) => void;
  lines: BomLine[]; setLines: (fn: (l: BomLine[]) => BomLine[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [isExclude, setIsExclude] = useState(false);
  const [missingMfg, setMissingMfg] = useState(false);

  const missingFromMaster = lines.filter(l => !PART_MASTER.has(l.part)).length;

  /* How many AML slots this BoM actually uses. At least one, so a BoM with no
     manufacturers at all still shows the pair of columns the user expects to
     fill; never more than the live screen's six. */
  const amlDepth = useMemo(
    () => Math.min(6, Math.max(1, ...lines.map(l => amlPairs(l).length))),
    [lines],
  );

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return lines.filter(l => {
      /* "Search by Part / Description / MPN / MFG" — those four and no others,
         so a keyword that happens to match a part source does not surface a row
         the user cannot explain. */
      if (k && !amlPairs(l).concat({ mfg: l.description, mpn: l.part })
        .some(v => `${v.mfg} ${v.mpn}`.toLowerCase().includes(k))) return false;
      if (isExclude && !l.excluded) return false;
      /* "MISSING MANUFACTURER" MEANS UNRECOGNISED, NOT BLANK. This filter used
         to test `mfg === ''`, which on the live screen would have matched
         nothing: of the thirteen rows we read on 15 Oct, MFG1 was filled on all
         thirteen, yet four were painted red. Their red marks a manufacturer
         that is not in Manufacturer Management, and their filter is named for
         it — so the filter and the colour now answer the same question. */
      if (missingMfg && !unknownMfg(l)) return false;
      return true;
    });
  }, [lines, search, isExclude, missingMfg]);

  const selectable = lines;
  const allOn = selectable.length > 0 && selectable.every(l => !l.excluded);

  const toggle = (id: number, on: boolean) =>
    setLines(ls => ls.map(l => (l.id === id ? { ...l, excluded: !on } : l)));

  /* "Clicking the header checkbox selects all rows. Clicking the header
     checkbox again deselects all rows." All rows, not the filtered ones — a
     select-all that only reached what a filter left visible would silently
     leave the rest excluded. */
  const toggleAll = (on: boolean) => setLines(ls => ls.map(l => ({ ...l, excluded: !on })));

  const columns: ColumnSpec<BomLine>[] = [
    {
      field: 'excluded', title: '', role: 'priority', width: 52,
      widthNote: 'A checkbox, nothing else.',
      headerRender: () => (
        <Checkbox checked={allOn} onCheckedChange={toggleAll}
                  label={<span className="vy-sr-only">Select all BoM lines</span>} />
      ),
      render: l => (
        <Checkbox checked={!l.excluded} onCheckedChange={on => toggle(l.id, on)}
                  label={<span className="vy-sr-only">Include {l.part} in the quotation</span>} />
      ),
    },
    /* WIDTHS ARE TUNED TO FIT, and that is the whole point of them.
       The guideline freezes six columns here plus the checkbox. At the role
       default widths that froze 988px of a 1302px track — 76% — and left the
       MFG | MPN column, the one this step exists to check, in a 314px scroll
       window. We had made the live screen's own mistake worse: theirs freezes
       53%. A frozen column costs nothing when nothing scrolls, so the columns
       are sized to the content they actually hold and the grid fits. */
    { field: 'number', title: 'NUMBER', role: 'code', width: 72,
      widthNote: 'A line number, at most three digits.' },
    {
      field: 'part', title: 'ROCKET_PN', role: 'ident', width: 170,
      widthNote: 'Longest part in the set is "IC-MCU-M4-256K", 14 characters.',
      /* Green when the part exists in Part Master, red when it does not — and
         red is not decorative: "The user cannot confirm Project Requirement
         until all missing part numbers have been created in Part Master." */
      tone: l => (PART_MASTER.has(l.part) ? 'known' : 'missing'),
      render: l => (
        <span className="vy-ident" title={PART_MASTER.has(l.part)
          ? 'In Part Master'
          : 'Not in Part Master — create it before confirming this RFQ'}>
          {l.part}
        </span>
      ),
    },
    { field: 'revision', title: 'REVISION', role: 'code', width: 84,
      widthNote: 'A single letter in every row of the set.' },
    { field: 'description', title: 'PART DESCRIPTION', role: 'text', width: 230,
      widthNote: 'Descriptions run past any width; the cell title carries the rest.' },
    { field: 'partSource', title: 'PART SOURCE', role: 'code', width: 116,
      widthNote: 'Longest value is "MAKE/PHANT".' },
    { field: 'qty', title: 'QUANTITY', role: 'number', width: 92,
      widthNote: 'A per-board count, three digits at most.',
      render: l => l.qty.toLocaleString() },
    { field: 'level', title: 'LEVEL', role: 'number', width: 72,
      widthNote: 'A single digit.' },
    /* ONE COLUMN PER AML SLOT, as the live screen has them — MFG1, MFGPN1,
       MFG2, MFGPN2 and so on. This replaced a single stacked "MFG | MPN" cell
       of mine, and the reversal is the customer's, with their screen as the
       evidence: on the BoM they showed, MFG2/MFGPN2 carry real second sources
       (TREND_TE, ONSEMI), so the alternates are not the dead weight the first
       BoM I measured suggested.

       The argument I had missed is scanning. Separate columns let an estimator
       read DOWN MFG2 to see which lines have a second source at all, which is
       the question this step exists to answer. Stacked pairs can only be read
       row by row.

       WHAT WE DO NOT COPY: the live grid renders all six slots always, and on
       the record we measured MFG3 through MFGPN6 were empty on 13 of 13 rows —
       1,200px of horizontal scroll for columns no row used. The slots here are
       generated to the depth the DATA has, so a BoM with one AML per line gets
       two columns and a BoM with three gets six. */
    ...Array.from({ length: amlDepth }).flatMap((_, i) => ([
      {
        field: 'mfg' as const, id: `mfg${i + 1}`, title: `MFG${i + 1}`,
        role: 'text' as const, width: 150,
        widthNote: 'A manufacturer name, as the live column is sized.',
        /* "The background color is displayed in yellow because the
           manufacturer value already exists in Manufacturer Management" —
           and red where it does not, which is what their Missing Manufacturer
           filter is named for. A slot the line does not have stays plain. */
        tone: (l: BomLine) => {
          const pr = amlPairs(l)[i];
          if (!pr || !pr.mfg) return undefined;
          return KNOWN_MANUFACTURERS.has(pr.mfg) ? 'known-mfg' : 'missing';
        },
        render: (l: BomLine) => {
          const pr = amlPairs(l)[i];
          if (!pr || !pr.mfg) return <span className="vy-empty">—</span>;
          return (
            <span title={KNOWN_MANUFACTURERS.has(pr.mfg)
              ? `${pr.mfg} is in Manufacturer Management`
              : `${pr.mfg} is not in Manufacturer Management`}>{pr.mfg}</span>
          );
        },
      },
      {
        field: 'mpn' as const, id: `mfgpn${i + 1}`, title: `MFGPN${i + 1}`,
        role: 'ident' as const, width: 170,
        widthNote: 'Manufacturer part numbers are long and must not truncate.',
        render: (l: BomLine) => {
          const pr = amlPairs(l)[i];
          return pr && pr.mpn
            ? <span className="vy-code">{pr.mpn}</span>
            : <span className="vy-empty">—</span>;
        },
      },
    ])),
    { field: 'attrition', title: 'TOTAL QTY', role: 'number', width: 108,
      widthNote: 'Holds a computed total, which is larger than a per-board qty.',
      /* Not in the guideline's column list for this step, but the formula runs
         here and Build Qty and Attrition Set are editable on this screen. A
         user changing Build Qty with no visible consequence has no way to tell
         whether it took. */
      render: l => totalQtyOf(l, cfg.buildQty, cfg.attritionSet).toLocaleString() },
  ];

  return (
    <div className="vy-run-step">
      <QuoteContextBar
        assembly={`${cfg.assemblyPartNumber} - ${cfg.partRev}`}
        description={cfg.partDesc}
        quoteFocus={cfg.quoteFocus}
        materialPackageType={cfg.materialPackageType}
        markup={cfg.markup}
        buildQty={cfg.buildQty}
        attritionSet={cfg.attritionSet}
        onBuildQty={n => set({ buildQty: n })}
        onAttritionSet={n => set({ attritionSet: n })}
      />

      {missingFromMaster > 0 && (
        <div className="vy-run-banner" data-tone="warn">
          <strong>{missingFromMaster} {missingFromMaster === 1 ? 'part is' : 'parts are'} not in
          Part Master</strong> — shown in red below. They must be created there before this
          Project Requirement can be confirmed.
        </div>
      )}

      <QuoteToolbar
        search={search} onSearch={setSearch}
        placeholder="Search by Part / Description / MPN / MFG"
        filters={[
          { key: 'exclude', label: 'Is Exclude?', on: isExclude, onToggle: setIsExclude },
          { key: 'mfg', label: 'Missing Manufacturer', on: missingMfg, onToggle: setMissingMfg },
        ]}
      />

      {/* THE COLOURS, SAID IN WORDS.
          The live screen paints three states into this grid — a part missing
          from Part Master, a manufacturer that is known, one that is not — and
          explains none of them: no key, no icon, no text, on either of the two
          steps that use the colours, and two different reds between them. That
          makes colour the only channel carrying the meaning, which WCAG 1.4.1
          rules out and which a colour-blind estimator simply cannot read.

          A legend is the cheap half of the fix. The other half is already
          here: every coloured cell and chip carries a `title` saying what it
          means in words. */}
      <ul className="vy-tone-legend">
        <li><span className="vy-tone-key" data-tone="known" aria-hidden />
          Part is in Part Master</li>
        <li><span className="vy-tone-key" data-tone="known-mfg" aria-hidden />
          Manufacturer is in Manufacturer Management</li>
        <li><span className="vy-tone-key" data-tone="missing" aria-hidden />
          Not on file — create it before confirming this RFQ</li>
      </ul>

      {/* Six frozen columns, as the guideline names them: Number, ROCKET_PN,
          Revision, Part Description, Part Source, Quantity — plus the checkbox
          in front of them, which would be useless scrolled out of view. */}
      <MiniTable
        data={shown}
        /* NO PER-COLUMN FILTER ROW. The step already carries a search box and
           the filters that matter for it, so the grid's own row filtered the
           same rows a second way and cost 48px of a grid the customer told us
           was too short. The guideline asks for filter cells on the Part
           record's BoM Components tab; it does not ask for them here. */
        filterable={false}
        columns={columns}
        freeze={7}
        rowTone={l => (l.excluded ? 'excluded' : undefined)}
        empty={<NoRecords title="No lines match these filters."
                          hint="Clear the search or a filter above to see the rest of the BoM." />}
      />

      {/* ONE LINE. Two lines of explanation under a table is two rows of the
          table, and this sentence is read once and then never again. */}
      <p className="vy-hint vy-hint--wide">
        MAKE, MAKE/PHANT and zero-quantity lines are excluded automatically — tick one to quote it anyway.
      </p>
    </div>
  );
}

/**
 * Every AML on a line: the primary manufacturer first, then its alternates.
 *
 * A line with no manufacturer at all returns nothing rather than a blank pair —
 * the cell then says so once, instead of rendering an empty chip that looks
 * like a value that failed to load.
 */
export function amlPairs(l: BomLine): { mfg: string; mpn: string }[] {
  return [{ mfg: l.mfg, mpn: l.mpn }, ...l.alternates].filter(p => p.mfg.trim() || p.mpn.trim());
}

/** No recognised manufacturer anywhere on the line — including none at all. */
export function unknownMfg(l: BomLine): boolean {
  return !amlPairs(l).some(p => KNOWN_MANUFACTURERS.has(p.mfg));
}
