import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Dialog, RadioGroup, Select } from '../../ui/Overlays';
import { useToast } from '../../ui/Toast';

/**
 * BoM Comparison.
 *
 * SOURCE. `chunk-CQr-c-QW.js` (compare + Excel export) and `chunk-CeuR-5ZG.js`
 * (column mapping), decoded from the shipped production bundle. See
 * docs/bundle-evidence.md.
 *
 * WHAT WAS MISSING. The earlier version of this file was a form with a Compare
 * button that did nothing — the entire RESULT was absent, which is the feature.
 * It also paraphrased all three mode labels, put New BoM before Old BoM, accepted
 * .csv (live takes .xlsx and .xls only), and invented a "show a summary only"
 * checkbox that does not exist. The live product always produces both: a grouped
 * result on screen and an exportable SUMMARY REPORT sheet.
 */

/* Verbatim, including the numerals. */
const ACTIONS = [
  { value: 'COMPARE_FILES',       label: 'Compare 2 uploaded files' },
  { value: 'COMPARE_ASSEMBLY',    label: 'Compare with existing assembly' },
  { value: 'COMPARE_2_ASSEMBLIES', label: 'Compare 2 existing assemblies' },
];

/** The columns the live comparison walks, in its own order. */
const COMPARED = ['PART_NUMBER', 'PART_REV', 'QTY', 'REF_DESIG', 'MANUFACTURER',
                  'MANUFACTURER_PN', 'ROCKET_PN', 'ITEM_NO'];

type Status = 'Added' | 'Removed' | 'Changed';
type Diff = { columnName: string; bom1: string; bom2: string; status: Status };
type PartDiff = { partId: string; differences: Diff[] };

/* Shaped exactly as the live comparison returns it: flat rows of
   { partId, columnName, bom1, bom2, change, status } grouped by partId. */
const RESULT: PartDiff[] = [
  { partId: 'RES-0603-10K', differences: [
    { columnName: 'QTY', bom1: '1200', bom2: '1236', status: 'Changed' },
    { columnName: 'REF_DESIG', bom1: 'R1,R2,R3', bom2: 'R1,R2,R3,R44', status: 'Changed' },
  ]},
  { partId: 'IC-PWR-BUCK-3A', differences: [
    { columnName: 'PART_REV', bom1: 'A', bom2: 'B', status: 'Changed' },
    { columnName: 'MANUFACTURER_PN', bom1: 'TPS62130RGTR', bom2: 'TPS62130ARGTR', status: 'Changed' },
  ]},
  { partId: 'LED-GRN-0805', differences: [
    { columnName: 'PART_NUMBER', bom1: '-', bom2: 'LED-GRN-0805', status: 'Added' },
    { columnName: 'QTY', bom1: '-', bom2: '100', status: 'Added' },
  ]},
  { partId: 'FER-0805-600R', differences: [
    { columnName: 'PART_NUMBER', bom1: 'FER-0805-600R', bom2: '-', status: 'Removed' },
    { columnName: 'QTY', bom1: '24', bom2: '-', status: 'Removed' },
  ]},
  { partId: 'CONN-HDR-2X10', differences: [
    { columnName: 'ROCKET_PN', bom1: '-', bom2: 'RKT-104882', status: 'Added' },
  ]},
];

/* The six categories the live export counts on its SUMMARY REPORT sheet. */
const SUMMARY_CATEGORIES: { label: string; count: (r: PartDiff[]) => number }[] = [
  { label: 'Part Number Changes', count: r => countCol(r, 'PART_NUMBER') },
  { label: 'Quantity Changes', count: r => countCol(r, 'QTY') },
  { label: 'Revision Changes', count: r => countCol(r, 'PART_REV') },
  { label: 'Reference Designator Changes', count: r => countCol(r, 'REF_DESIG') },
  { label: 'Rocket PN# Adds', count: r => countCol(r, 'ROCKET_PN', 'Added') },
  { label: 'Rocket PN# Removes', count: r => countCol(r, 'ROCKET_PN', 'Removed') },
];

const countCol = (rows: PartDiff[], col: string, status?: Status) =>
  rows.reduce((n, p) => n + p.differences.filter(
    d => d.columnName === col && (!status || d.status === status)).length, 0);

/** Live builds the change text as `ADDED: x`, `REMOVED: x`, `CHANGED: a -> b`. */
const changeText = (d: Diff) =>
  d.status === 'Added' ? `ADDED: ${d.bom2}`
  : d.status === 'Removed' ? `REMOVED: ${d.bom1}`
  : `CHANGED: ${d.bom1} -> ${d.bom2}`;

export function BomComparisonDialog({ onClose }: { onClose: () => void }) {
  const [action, setAction] = useState('COMPARE_FILES');
  const [compared, setCompared] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toast = useToast();

  const oldUpload = action === 'COMPARE_FILES';
  const newUpload = action === 'COMPARE_FILES' || action === 'COMPARE_ASSEMBLY';

  const allOpen = expanded.size === RESULT.length;
  const toggleAll = () =>
    setExpanded(allOpen ? new Set() : new Set(RESULT.map(r => r.partId)));
  const toggle = (id: string) =>
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const totalDiffs = RESULT.reduce((n, p) => n + p.differences.length, 0);

  return (
    <Dialog
      open size="xl" title="BoM Comparison"
      subtitle={compared
        ? `${RESULT.length} parts differ across ${totalDiffs} columns`
        : 'Compare two bills of materials and list what was added, removed or changed.'}
      onClose={onClose}
      actions={compared ? <>
        <Button onClick={() => setCompared(false)}>Change selection</Button>
        <Button onClick={() => toast.notImplemented('export the comparison as BOMCompare-<file>.xlsx')}>
          Export
        </Button>
        <Button variant="filled" onClick={onClose}>Done</Button>
      </> : <>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="filled" onClick={() => setCompared(true)}>Compare</Button>
      </>}
    >
      {compared ? (
        <ComparisonResult
          rows={RESULT} expanded={expanded} onToggle={toggle}
          allOpen={allOpen} onToggleAll={toggleAll}
        />
      ) : (
        <div className="vy-bom-compare">
          <section>
            <h3 className="vy-field-group-title">Select Action</h3>
            <RadioGroup label="Select Action" options={ACTIONS} value={action} onChange={setAction} />
          </section>

          {/* Old on the left, New on the right — the live pane order (bom-1,
              bom-2), and the order the change text reads in: old -> new. */}
          <div className="vy-bom-panes">
            <BomPane title="Old BoM" upload={oldUpload} />
            <BomPane title="New BoM" upload={newUpload} />
          </div>

          <p className="vy-hint">
            Compares {COMPARED.map(c => c.replace(/_/g, ' ').toLowerCase()).join(', ')}.
            Quantity columns are summed across duplicate lines; for everything else the
            first occurrence is used.
          </p>
        </div>
      )}
    </Dialog>
  );
}

function BomPane({ title, upload }: { title: string; upload: boolean }) {
  const [sheet, setSheet] = useState('');
  const [template, setTemplate] = useState('');
  const [assembly, setAssembly] = useState('');
  const toast = useToast();
  return (
    <section className="vy-bom-pane">
      <h3 className="vy-field-group-title">{title}</h3>
      {upload ? (
        <>
          <div className="vy-dropzone">
            <strong>Drop a BoM file here</strong>
            <span>or</span>
            <Button onClick={() => toast.notImplemented('open a file picker for the BoM spreadsheet')}>
              Upload File
            </Button>
            <p className="vy-hint">.xlsx or .xls</p>
          </div>
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Select sheet</span>
            <Select label="Select sheet" value={sheet} onChange={setSheet}
                    options={['', 'Sheet1', 'BOM', 'Consolidated']} />
            <p className="vy-hint">Read from the workbook once a file is chosen.</p>
          </label>
          <label className="vy-inline-field vy-inline-field--stack">
            <span>Select Template</span>
            <Select label="Select Template" value={template} onChange={setTemplate}
                    options={['', 'Cerelogic standard', 'Meridian ADS-B', 'Default']} />
            <p className="vy-hint">Which columns hold the part number, revision and quantity.</p>
          </label>
        </>
      ) : (
        <label className="vy-inline-field vy-inline-field--stack">
          <span>Select Assembly</span>
          <Select label="Select Existing Assembly - Assembly Rev - BoM version"
                  value={assembly} onChange={setAssembly}
                  options={['',
                            '00455 - bom version: 3 - rev: C',
                            '00455 - bom version: 2 - rev: B',
                            '01204 - bom version: 1 - rev: A']} />
          <p className="vy-hint">Existing assembly, revision and BoM version.</p>
        </label>
      )}
    </section>
  );
}

/**
 * The result. Grouped by part, because a part with four changed columns is one
 * thing that changed, not four — a flat list of every column difference makes a
 * ten-line edit look like a forty-line rewrite.
 */
function ComparisonResult({ rows, expanded, onToggle, allOpen, onToggleAll }: {
  rows: PartDiff[]; expanded: Set<string>; onToggle: (id: string) => void;
  allOpen: boolean; onToggleAll: () => void;
}) {
  if (!rows.length) {
    return (
      <div className="vy-empty-state">
        <strong>Contents are identical</strong>
        <p>Every compared column matches across both bills of materials.</p>
      </div>
    );
  }

  return (
    <div className="vy-bom-result">
      <div className="vy-bom-result-head">
        <h3 className="vy-field-group-title">BOM Comparison Summary</h3>
        <Button size="sm" variant="tonal" onClick={onToggleAll}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      {/* The counts the live Excel export writes to its SUMMARY REPORT sheet,
          shown on screen too — the numbers a reviewer wants first, rather than
          only inside a downloaded file. */}
      <dl className="vy-bom-summary">
        {SUMMARY_CATEGORIES.map(c => {
          const n = c.count(rows);
          return (
            <div className="vy-bom-summary-item" key={c.label} data-zero={n === 0 || undefined}>
              <dt>{c.label}</dt><dd>{n}</dd>
            </div>
          );
        })}
      </dl>

      <ul className="vy-bom-parts">
        {rows.map(p => {
          const open = expanded.has(p.partId);
          /* One part can carry differences of more than one status. The badge
             shows the strongest claim: removed beats added beats changed. */
          const status: Status =
            p.differences.some(d => d.status === 'Removed') ? 'Removed'
            : p.differences.some(d => d.status === 'Added') ? 'Added'
            : 'Changed';
          return (
            <li key={p.partId} data-status={status}>
              <button type="button" className="vy-bom-part-head"
                      aria-expanded={open} onClick={() => onToggle(p.partId)}>
                <span className="vy-bom-chevron" aria-hidden>{open ? '⌄' : '›'}</span>
                <span className="vy-ident">{p.partId}</span>
                <span className="vy-bom-status" data-status={status}>{status}</span>
                <span className="vy-bom-count">
                  {p.differences.length} {p.differences.length === 1 ? 'column' : 'columns'}
                </span>
              </button>
              {open && (
                <table className="vy-bom-diff">
                  <thead>
                    <tr><th>Column Name</th><th>Old BoM</th><th>New BoM</th><th>what changed</th></tr>
                  </thead>
                  <tbody>
                    {p.differences.map(d => (
                      <tr key={d.columnName} data-status={d.status}>
                        <td className="vy-code">{d.columnName}</td>
                        <td>{d.bom1 === '-' ? <span className="vy-empty">—</span> : d.bom1}</td>
                        <td>{d.bom2 === '-' ? <span className="vy-empty">—</span> : d.bom2}</td>
                        <td>{changeText(d)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
