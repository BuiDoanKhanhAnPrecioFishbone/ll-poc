import { useMemo, useState } from 'react';
import { Dialog, Tabs } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { MiniTable } from '../ui/MiniTable';
import { SearchField } from '../ui/Field';
import { useToast } from '../ui/Toast';
import { fmtDate } from '../ui/renderCell';
import type { ColumnSpec } from './column-model';
import { bomFor, whereUsed, type WhereUsedRow } from '../data/partBom';
import type { BomLine } from '../data/bom';
import type { Part } from '../data/parts';

/**
 * BoM detail — the popup behind the BoM link on a MAKE part.
 *
 * The guideline names nine header fields and then says of them: "All fields
 * (except BoM Version) below are displayed as read-only in this pop-up to
 * preserve data integrity and prevent unauthorized modifications to the core BoM
 * metadata." So the header is a read-only block, and the one thing that moves —
 * the version — moves only through Update BOM, which "automatically creates a
 * new iteration and increments the BoM Version".
 *
 * That is why there is no version input. The sheet exempts the version from
 * read-only, but it does not make it typeable: the increment is a CONSEQUENCE of
 * uploading, and a box you can type "7" into would let someone renumber history
 * without producing the iteration the number is supposed to describe.
 */
function componentColumns(): ColumnSpec<BomLine>[] { return [
  { field: 'part', title: 'Component Part', role: 'ident' },
  { field: 'revision', title: 'Revision', role: 'code',
    render: l => <span className="vy-code">{l.revision}</span> },
  { field: 'partSource', title: 'Part Source', role: 'code' },
  { field: 'qty', title: 'Quantity', role: 'number', render: l => l.qty.toLocaleString() },
  { field: 'mfg', title: 'Manufacturer', role: 'text' },
  { field: 'mpn', title: 'MPN', role: 'ident' },
]; }

export function PartBomDialog({ part, onClose }: { part: Part; onClose: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState('components');
  const bom = useMemo(() => bomFor(part), [part]);

  return (
    <Dialog
      open
      size="xl"
      onClose={onClose}
      title={`BoM — ${bom.partNumber}${bom.revision !== '—' ? ` - ${bom.revision}` : ''}`}
      subtitle={`Version ${bom.version} · ${bom.bomType}`}
      actions={<>
        <Button onClick={onClose}>Close</Button>
        {/* The sheet's own description of what this does, said before it is
            pressed rather than discovered after: a new iteration, and the
            version goes up. */}
        <Button variant="filled"
                onClick={() => toast.notImplemented(
                  `upload a new BoM file, creating version ${bom.version + 1} of ${bom.partNumber}`)}>
          Update BOM
        </Button>
      </>}
    >
      <div className="vy-datarec">
        <dl className="vy-bomhead">
          <Fact label="Customer" value={bom.customer} />
          <Fact label="Part Number – Revision" value={`${bom.partNumber} – ${bom.revision}`} />
          <Fact label="BoM Version" value={String(bom.version)} />
          {/* ITAR is a compliance flag, so it states BOTH answers in words. A
              blank where "No" belongs is the one reading an export-control field
              must never allow. */}
          <Fact label="ITAR" value={bom.itar ? 'Yes — export controlled' : 'No'} />
          <Fact label="Quantity" value={bom.quantity.toLocaleString()} />
          <Fact label="BoM Type" value={bom.bomType} />
          <Fact label="Run By" value={bom.runBy} />
          <Fact label="Created Date" value={fmtDate(bom.createdDate)} />
          <Fact label="Last Updated Date" value={fmtDate(bom.lastUpdated)} />
        </dl>

        <Tabs
          value={tab}
          onValueChange={setTab}
          tabs={[
            {
              value: 'components', label: 'Components Part', count: bom.components.length,
              content: <MiniTable data={bom.components} columns={componentColumns()} freeze={1} />,
            },
            {
              value: 'other', label: 'Other Information',
              /* The guideline's entry for this tab is, in full: `Under Tab
                 "Other Information": .....` — five dots. It names the tab and
                 not one field in it. Inventing a plausible set would be exactly
                 the failure docs/precedence.md was written to prevent, so the
                 tab exists, because the sheet says it does, and says what is
                 missing instead of guessing. */
              content: (
                <div className="vy-empty-inline">
                  <strong>Not specified yet.</strong> The Testing Guideline names this tab and
                  lists no fields for it — its entry reads <code>Under Tab "Other Information":
                  .....</code> — so nothing is invented here. Tell us what belongs and it will
                  be built.
                </div>
              ),
            },
          ]}
        />
      </div>
    </Dialog>
  );
}

/**
 * Where Part Number Used — the popup behind the Where used link on a BUY part.
 *
 * The guideline's purpose for it is worth keeping in view: it "instantly
 * identifies all parent assemblies consuming this component, helping assess the
 * impact of shortages or engineering changes". So the useful answer is not only
 * the list but its size, including when the size is zero.
 */
function whereUsedColumns(onView: (r: WhereUsedRow) => void): ColumnSpec<WhereUsedRow>[] { return [
  { field: 'id', title: 'View', role: 'code', width: 72,
    widthNote: 'Holds one icon-sized control, narrower than a code cell assumes.',
    render: r => (
      <button type="button" className="vy-cell-link" onClick={() => onView(r)}
              aria-label={`Open ${r.topAssembly}`} title={`Open ${r.topAssembly}`}>
        View
      </button>
    ) },
  { field: 'topAssembly', title: 'Top Assembly', role: 'ident' },
  { field: 'revision', title: 'Revision', role: 'code',
    render: r => <span className="vy-code">{r.revision}</span> },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'index', title: 'Index', role: 'number' },
  { field: 'quantity', title: 'Quantity', role: 'number', render: r => r.quantity.toLocaleString() },
  { field: 'bomStatus', title: 'BoM Status', role: 'code' },
]; }

export function WhereUsedDialog({ part, onClose }: { part: Part; onClose: () => void }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const rows = useMemo(() => whereUsed(part), [part]);

  /* The guideline's own placeholder names both fields it searches, so the search
     covers both rather than only the identifier. */
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.topAssembly.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <Dialog
      open
      /* xl, not lg. The seven columns come to 992px against lg's 918, so the
         last one — BoM Status, the column that answers whether the parent is
         even live — sat behind a horizontal scroll for the sake of 74px. */
      size="xl"
      onClose={onClose}
      title="Where Part Number Used"
      subtitle={`Parent assemblies consuming ${part.partNumber}`}
      actions={<Button onClick={onClose}>Close</Button>}
    >
      <div className="vy-whereused">
        <SearchField value={search} onChange={e => setSearch(e.target.value)}
                     placeholder="Search by top assembly or description"
                     aria-label="Search by top assembly or description" />

        <MiniTable
          data={shown}
          columns={whereUsedColumns(r => toast.notImplemented(`open ${r.topAssembly}`))}
          empty={
            search ? (
              <div className="vy-empty-inline">
                <strong>Nothing matches “{search}”.</strong> {rows.length}{' '}
                {rows.length === 1 ? 'assembly uses' : 'assemblies use'} this part.
              </div>
            ) : (
              /* Zero is an ANSWER here, not an absence. The sheet says this popup
                 exists to assess the impact of a shortage or an engineering
                 change, and "nothing else consumes this part" is the most
                 useful thing it can say — so it says it, rather than showing an
                 empty table and leaving the reader to infer it. */
              <div className="vy-empty-inline">
                <strong>No parent assembly uses this part.</strong> A change to it affects
                nothing else in the system.
              </div>
            )
          }
        />
      </div>
    </Dialog>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="vy-field">
      <dt>{label}</dt>
      <dd className={value ? undefined : 'is-empty'}>{value || 'Not set'}</dd>
    </div>
  );
}
