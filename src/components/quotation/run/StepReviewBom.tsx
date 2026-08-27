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

  const shown = useMemo(() => {
    const k = search.trim().toLowerCase();
    return lines.filter(l => {
      /* "Search by Part / Description / MPN / MFG" — those four and no others,
         so a keyword that happens to match a part source does not surface a row
         the user cannot explain. */
      if (k && ![l.part, l.description, l.mpn, l.mfg].some(v => v.toLowerCase().includes(k))) return false;
      if (isExclude && !l.excluded) return false;
      if (missingMfg && l.mfg.trim() !== '') return false;
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
    { field: 'number', title: 'NUMBER', role: 'code', width: 84,
      widthNote: 'A line number, at most three digits.' },
    {
      field: 'part', title: 'ROCKET_PN', role: 'ident',
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
    { field: 'revision', title: 'REVISION', role: 'code', width: 96 },
    { field: 'description', title: 'PART DESCRIPTION', role: 'text' },
    { field: 'partSource', title: 'PART SOURCE', role: 'code', width: 128,
      widthNote: 'Longest value is "MAKE/PHANT".' },
    { field: 'qty', title: 'QUANTITY', role: 'number', width: 108,
      render: l => l.qty.toLocaleString() },
    { field: 'level', title: 'LEVEL', role: 'number', width: 84 },
    {
      field: 'mfg', title: 'MFG', role: 'text', width: 190,
      widthNote: 'Manufacturer names run long — "STMicroelectronics".',
      /* "The background color is displayed in yellow because the manufacturer
         value already exists in Manufacturer Management." */
      tone: l => (l.mfg && KNOWN_MANUFACTURERS.has(l.mfg) ? 'known-mfg' : undefined),
      render: l => l.mfg
        ? <span title={KNOWN_MANUFACTURERS.has(l.mfg)
            ? 'Already in Manufacturer Management'
            : 'Not in Manufacturer Management yet'}>{l.mfg}</span>
        : <span className="vy-empty">—</span>,
    },
    { field: 'mpn', title: 'MPN', role: 'ident', width: 200,
      widthNote: 'Manufacturer part numbers are long and must not truncate.',
      render: l => l.mpn ? <span className="vy-code">{l.mpn}</span> : <span className="vy-empty">—</span> },
    { field: 'attrition', title: 'TOTAL QTY', role: 'number', width: 120,
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
          { key: 'exclude', label: 'Is Exclude?', on: isExclude, onToggle: setIsExclude,
            count: lines.filter(l => l.excluded).length },
          { key: 'mfg', label: 'Missing Manufacturer', on: missingMfg, onToggle: setMissingMfg,
            count: lines.filter(l => !l.mfg.trim()).length },
        ]}
      />

      {/* Six frozen columns, as the guideline names them: Number, ROCKET_PN,
          Revision, Part Description, Part Source, Quantity — plus the checkbox
          in front of them, which would be useless scrolled out of view. */}
      <MiniTable
        data={shown}
        columns={columns}
        freeze={7}
        rowTone={l => (l.excluded ? 'excluded' : undefined)}
        empty={<NoRecords />}
      />

      <p className="vy-hint">
        Lines with Part Source MAKE or MAKE/PHANT, and lines with no quantity, are excluded
        automatically — they are made in-house, not bought. Tick one to quote it anyway.
      </p>
    </div>
  );
}
