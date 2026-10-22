import { useMemo, useState } from 'react';
import { useColumnChoice } from '../../../ui/useColumnChoice';
import { ColumnChooser } from '../../../ui/ColumnChooser';
import { MiniTable } from '../../../ui/MiniTable';
import { Checkbox } from '../../../ui/Overlays';
import type { ColumnSpec } from '../../column-model';
import { QuoteContextBar, QuoteToolbar, NoRecords } from './QuoteContext';
import {
  PART_MASTER, manufacturerStatus, totalQtyOf, type BomLine,
} from '../../../data/bom';

/** What each colour means, said in words on the cell itself (WCAG 1.4.1). */
const MFG_TITLE = {
  verified: 'Verified in Manufacturer Management',
  unverified: 'On file in Manufacturer Management, but not verified',
  missing: 'Not in Manufacturer Management — create it before confirming this RFQ',
};
import { setupOf, type RunConfig } from './state';
import { amlPairs, amlRows, type AmlRow } from './amlRows';

/**
 * Step 2 — Review BoM.
 *
 * The grid is the step. Everything else on screen exists to narrow it, and the
 * three colours in it are the only place the user learns that a part is missing
 * from Part Master before the quote refuses to confirm.
 */
export function StepReviewBom({ cfg, lines, setLines }: {
  cfg: RunConfig;
  lines: BomLine[]; setLines: (fn: (l: BomLine[]) => BomLine[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [isExclude, setIsExclude] = useState(false);
  const [missingMfg, setMissingMfg] = useState(false);

  const missingFromMaster = lines.filter(l => !PART_MASTER.has(l.part)).length;

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
      if (missingMfg && !unverifiedMfg(l)) return false;
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

  /* ONE ROW PER MANUFACTURER, and the line's own cells on the first of them.
     See `amlRows.ts` for why this replaced the generated MFG1..MFGPN6 columns.
     Every parent cell is written `r.first ? … : null`, which is the blank half
     of a merged cell; the rule under the group is drawn by `rowGroup`. */
  const parent = <V,>(r: AmlRow, value: () => V) => (r.first ? value() : null);

  const columns: ColumnSpec<AmlRow>[] = [
    {
      field: 'id', id: 'include', title: '', role: 'priority', width: 52,
      widthNote: 'A checkbox, nothing else.',
      sortable: false,
      headerRender: () => (
        <Checkbox checked={allOn} onCheckedChange={toggleAll}
                  label={<span className="vy-sr-only">Select all BoM lines</span>} />
      ),
      render: r => parent(r, () => (
        <Checkbox checked={!r.line.excluded} onCheckedChange={on => toggle(r.line.id, on)}
                  label={<span className="vy-sr-only">Include {r.line.part} in the quotation</span>} />
      )),
    },
    /* WIDTHS ARE TUNED TO FIT, and that is the whole point of them.
       The guideline freezes six columns here plus the checkbox. At the role
       default widths that froze 988px of a 1302px track — 76% — and left the
       MFG | MPN column, the one this step exists to check, in a 314px scroll
       window. We had made the live screen's own mistake worse: theirs freezes
       53%. A frozen column costs nothing when nothing scrolls, so the columns
       are sized to the content they actually hold and the grid fits. */
    { field: 'id', id: 'number', title: 'NUMBER', role: 'code', width: 72,
      widthNote: 'A line number, at most three digits.',
      render: r => parent(r, () => r.line.number) },
    {
      field: 'id', id: 'part', title: 'ROCKET_PN', role: 'ident', width: 170,
      widthNote: 'Longest part in the set is "IC-MCU-M4-256K", 14 characters.',
      /* Green when the part exists in Part Master, red when it does not — and
         red is not decorative: "The user cannot confirm Project Requirement
         until all missing part numbers have been created in Part Master."
         The tone is on the FIRST row only, because that is the cell that
         carries the part number; painting the blank continuation cell would
         colour a cell with nothing in it. */
      /* RED WHEN IT IS NOT ON FILE, AND NOTHING WHEN IT IS — 22 Oct. It was
         green for "in Part Master", which painted 13 of 13 rows on the live
         screen we measured: a colour every row carries tells the reader
         nothing. The customer's own answer settles it — "Trường hợp data đã đc
         verify thì để trắng" — and red keeps its meaning, which is that this
         part blocks confirming the RFQ. */
      tone: r => (r.first && !PART_MASTER.has(r.line.part) ? 'missing' : undefined),
      render: r => parent(r, () => (
        <span className="vy-ident" title={PART_MASTER.has(r.line.part)
          ? 'In Part Master'
          : 'Not in Part Master — create it before confirming this RFQ'}>
          {r.line.part}
        </span>
      )),
    },
    { field: 'id', id: 'revision', title: 'REVISION', role: 'code', width: 84,
      widthNote: 'A single letter in every row of the set.',
      render: r => parent(r, () => r.line.revision) },
    { field: 'id', id: 'description', title: 'PART DESCRIPTION', role: 'text', width: 230,
      widthNote: 'Descriptions run past any width; the cell title carries the rest.',
      render: r => parent(r, () => r.line.description) },
    { field: 'id', id: 'partSource', title: 'PART SOURCE', role: 'code', width: 116,
      widthNote: 'Longest value is "MAKE/PHANT".',
      render: r => parent(r, () => r.line.partSource) },
    { field: 'id', id: 'qty', title: 'QUANTITY', role: 'number', width: 92,
      widthNote: 'A per-board count, three digits at most.',
      render: r => parent(r, () => r.line.qty.toLocaleString()) },
    { field: 'id', id: 'level', title: 'LEVEL', role: 'number', width: 72,
      widthNote: 'A single digit.',
      render: r => parent(r, () => r.line.level) },
    {
      field: 'mfg', id: 'mfg', title: 'MFG', role: 'text', width: 170,
      widthNote: 'A manufacturer name, as the live column is sized.',
      /* "The background color is displayed in yellow because the manufacturer
         value already exists in Manufacturer Management" — and red where it
         does not, which is what their Manufacturer Not Verified filter is
         named for. */
      /* THREE STATES, the customer's own: verified is plain, a manufacturer in
         the system that nobody has verified is amber, one that is not in the
         system at all is red. */
      tone: r => (r.mfg && manufacturerStatus(r.mfg) !== 'verified'
        ? (manufacturerStatus(r.mfg) === 'unverified' ? 'known-mfg' : 'missing')
        : undefined),
      render: r => (r.mfg
        ? <span title={MFG_TITLE[manufacturerStatus(r.mfg)]}>{r.mfg}</span>
        : <span className="vy-empty">—</span>),
    },
    {
      field: 'mpn', id: 'mpn', title: 'MFGPN', role: 'ident', width: 190,
      widthNote: 'Manufacturer part numbers are long and must not truncate.',
      render: r => (r.mpn ? <span className="vy-code">{r.mpn}</span> : <span className="vy-empty">—</span>),
    },
    { field: 'id', id: 'total', title: 'TOTAL QTY', role: 'number', width: 108,
      widthNote: 'Holds a computed total, which is larger than a per-board qty.',
      /* Not in the guideline's column list for this step, but the formula runs
         here and the setup that feeds it is on the strip above. */
      render: r => parent(r, () =>
        totalQtyOf(r.line, cfg.buildQty, cfg.attritionSet).toLocaleString()) },
  ];

  const rows = useMemo(() => amlRows(shown), [shown]);

  /* The Columns chooser, and the frozen block as its locked set — see
     useColumnChoice. */
  const { shown: shownColumns, chooser } = useColumnChoice(columns, { locked: 7, storageKey: 'vy.cols.reviewBom' });

  return (
    <div className="vy-run-step">
      {/* READ-ONLY HERE, since 20 Oct. Build Qty and Attrition Set were
          editable on this step, and editing them changed the quantities a user
          would later price on step 3 with nothing to show it had happened. The
          customer's mockup marks this strip read-only and makes Quoting the one
          place the setup is changed, which is also the only place the change
          can be applied deliberately. */}
      <QuoteContextBar
        assembly={`${cfg.assemblyPartNumber} - ${cfg.partRev}`}
        description={cfg.partDesc}
        applied={setupOf(cfg)}
      />

      {missingFromMaster > 0 && (
        <div className="vy-run-banner" data-tone="warn">
          <strong>{missingFromMaster} {missingFromMaster === 1 ? 'part is' : 'parts are'} not in
          Part Master</strong> — shown in red below. They must be created there before this
          Project Requirement can be confirmed.
        </div>
      )}

      <QuoteToolbar
        trailing={<ColumnChooser {...chooser} />}
        search={search} onSearch={setSearch}
        placeholder="Search by Part / Description / MPN / MFG"
        filters={[
          { key: 'exclude', label: 'Excluded Only', on: isExclude, onToggle: setIsExclude },
          { key: 'mfg', label: 'Manufacturer Not Verified', on: missingMfg, onToggle: setMissingMfg },
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
      {/* Six frozen columns, as the guideline names them: Number, ROCKET_PN,
          Revision, Part Description, Part Source, Quantity — plus the checkbox
          in front of them, which would be useless scrolled out of view. */}
      <MiniTable
        data={rows}
        /* The rows of one BoM line are one record: they sort together and
           carry a single rule under the last of them. */
        rowGroup={{ key: r => String(r.line.id), end: r => r.last }}
        /* NO PER-COLUMN FILTER ROW. The step already carries a search box and
           the filters that matter for it, so the grid's own row filtered the
           same rows a second way and cost 48px of a grid the customer told us
           was too short. The guideline asks for filter cells on the Part
           record's BoM Components tab; it does not ask for them here. */
        filterable={false}
        columns={shownColumns}
        freeze={7}
        rowTone={r => (r.line.excluded ? 'excluded' : undefined)}
        empty={<NoRecords title="No lines match these filters."
                          hint="Clear the search or a filter above to see the rest of the BoM." />}
      />

      {/* THE LEGEND SITS UNDER THE GRID, since 20 Oct. It was above it, which
          put a key to the colours before the reader had seen one. The standard
          puts it in the grid's footer and the Quoting BoM mockup of 16 Oct
          renders it there too — after `</table>`, in a `gfoot` — so the
          question we had listed for her is answered and this follows it. */}
      <ul className="vy-tone-legend">
        <li><span className="vy-tone-key" data-tone="known-mfg" aria-hidden />
          Warning: manufacturer is on file but not verified</li>
        <li><span className="vy-tone-key" data-tone="missing" aria-hidden />
          Error: part or manufacturer is not in the system — create it before
          confirming this RFQ</li>
      </ul>

      {/* ONE LINE. Two lines of explanation under a table is two rows of the
          table, and this sentence is read once and then never again. */}
      <p className="vy-hint vy-hint--wide">
        MAKE, MAKE/PHANT and zero-quantity lines are excluded automatically — tick one to quote it anyway.
      </p>
    </div>
  );
}

/**
 * A line carrying a manufacturer that is not verified — amber or red.
 *
 * WAS "no recognised manufacturer anywhere", which matched only the red case.
 * The filter is named "Manufacturer Not Verified" and the customer's answer of
 * 22 Oct defines verified, so the filter now selects exactly what it says: any
 * AML on the line that is unverified or missing. A line with no manufacturer
 * at all is included — an absent one is certainly not verified.
 */
export function unverifiedMfg(l: BomLine): boolean {
  const pairs = amlPairs(l);
  return !pairs.length || pairs.some(p => manufacturerStatus(p.mfg) !== 'verified');
}
