import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchField } from './Field';
import { Button } from './Button';
import { SegmentedControl } from './Overlays';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { GridSkeleton } from './GridSkeleton';
import { renderCell, fmtDate } from './renderCell';

export type Density = 'compact' | 'comfortable' | 'relaxed';
const ROW_H: Record<Density, number> = { compact: 28, comfortable: 36, relaxed: 44 };

const DENSITY_OPTIONS = [
  { value: 'compact' as const, label: 'Compact' },
  { value: 'comfortable' as const, label: 'Comfortable' },
  { value: 'relaxed' as const, label: 'Relaxed' },
];

/**
 * THE STANDARD LIST PATTERN — headless build.
 *
 * Same rules as before; the rules were never Kendo's. Column width still
 * follows from column role, sparse columns still hide with a stated reason,
 * density is still a user setting, the row is still the affordance.
 *
 * What changes by dropping the component library:
 *
 *   - ROW VIRTUALISATION. Every row used to be in the DOM, so the Part Master
 *     paged at 50. This renders only what fits the viewport plus a small
 *     overscan, so all 21,941 rows can be one scroll with no pager at all.
 *   - No 28px floor fight. A Rating used to force 36px rows (GAP-02) because
 *     the library's internals set their own padding. Our cells inherit density.
 *   - Sticky header for free, rather than depending on a library's internal
 *     wrapper class.
 */
export function DataGrid<T extends { id: string | number }>({
  data, columns, title, subtitle, actions, filters,
  defaultDensity = 'comfortable', searchPlaceholder = 'Search', rowHref, onOpenRow, emptyHint, loading,
}: {
  data: T[];
  columns: ColumnSpec<T>[];
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  defaultDensity?: Density;
  searchPlaceholder?: string;
  /**
   * Opening a record hangs off the IDENTIFIER, not the row.
   *
   * The row used to be the click target — it saved a column over the live
   * system's eye-icon button. But a drag to select text ends in mouseup on the
   * row, which fired the click and navigated away, so copying a part number or
   * a customer name out of the grid was effectively impossible. That is a daily
   * task for the people using this screen, and it outranks saving a pointer trip.
   *
   * The identifier is already the record's name, so making it the link needs no
   * extra column and reads as an affordance without explanation. `rowHref`
   * renders a real anchor — middle-click, open-in-new-tab and copy-link all
   * work. `onOpenRow` is for records that open in a dialog rather than a route.
   */
  rowHref?: (row: T) => string;
  onOpenRow?: (row: T) => void;
  emptyHint?: string;
  /** Loading, empty and error are three distinct states, not one. */
  loading?: boolean;
}) {
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => columns.filter(c => showHidden || !c.hiddenByDefault),
    [columns, showHidden]
  );
  const hiddenCount = columns.filter(c => c.hiddenByDefault).length;
  const searchFields = useMemo(() => columns.filter(c => c.searchable).map(c => c.field), [columns]);

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    if (!n || !searchFields.length) return data;
    return data.filter(r => searchFields.some(f => String(r[f] ?? '').toLowerCase().includes(n)));
  }, [data, search, searchFields]);

  /* The first ident column becomes the open affordance. Every other cell stays
     inert text so it can be selected and copied. */
  const identField = visible.find(c => c.role === 'ident')?.field;

  const tableColumns = useMemo<ColumnDef<T>[]>(() => visible.map(spec => ({
    id: spec.field,
    accessorKey: spec.field,
    header: spec.title,
    size: widthOf(spec),
    cell: ctx => {
      const row = ctx.row.original;
      if (spec.field === identField && !spec.render) {
        const label = String(row[spec.field]);
        if (rowHref) return <Link className="vy-cell-link vy-ident" to={rowHref(row)}>{label}</Link>;
        if (onOpenRow) return (
          <button type="button" className="vy-cell-link vy-ident" onClick={() => onOpenRow(row)}>
            {label}
          </button>
        );
      }
      return renderCell(spec, row);
    },
    sortingFn: spec.role === 'date' ? 'datetime' : 'auto',
  })), [visible]);

  const table = useReactTable({
    data: filtered,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const rowH = ROW_H[density];

  const virt = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowH,
    overscan: 12,
  });

  /* Density changes the row height, so previously-measured offsets are stale. */
  useEffect(() => { virt.measure(); }, [density]);

  /* A narrower result set should start at the top, not wherever the last scroll
     left you — the scroll equivalent of the pager bug this replaced. */
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [filtered]);

  const items = virt.getVirtualItems();

  /* One grid template, derived from the column roles, shared by the header and
     every row — so a cell can never drift out of alignment with its heading.
     The px values come from the token layer (COLUMN_WIDTH), not from here. */
  const template = visible.map(c => `${widthOf(c)}px`).join(' ');

  return (
    <div className="vy-page vy-page--grid" data-density={density}>
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">{title}</h1>
          <p className="vy-page-sub">
            {filtered.length.toLocaleString()} of {data.length.toLocaleString()}
            {subtitle && <> · {subtitle}</>}
          </p>
        </div>
        {actions && <div className="vy-page-actions">{actions}</div>}
      </div>

      {filters && <div className="vy-filter-bar">{filters}</div>}

      <div className="vy-grid-shell">
        <div className="vy-grid-toolbar">
          <SearchField value={search} placeholder={searchPlaceholder} aria-label={searchPlaceholder}
                       onChange={e => setSearch(e.target.value)} />
          <span className="vy-toolbar-spacer" />
          <span className="vy-toolbar-label" id="density-label">Density</span>
          <SegmentedControl label="Row density" options={DENSITY_OPTIONS}
                            value={density} onChange={setDensity} />
          {hiddenCount > 0 && (
            <Button variant={showHidden ? 'tonal' : 'outlined'} onClick={() => setShowHidden(s => !s)}
                    title={columns.filter(c => c.hiddenByDefault)
                      .map(c => `${c.title}: ${c.note ?? 'hidden by default'}`).join('\n')}>
              {showHidden ? 'Hide extra columns' : `Show ${hiddenCount} more columns`}
            </Button>
          )}
        </div>

        <div className="vy-grid-scroll" ref={scrollRef}>
          <div className="vy-grid-table">
            <div className="vy-grid-head" role="row" style={{ gridTemplateColumns: template }}>
              {table.getHeaderGroups()[0].headers.map(h => {
                const spec = visible.find(v => v.field === h.id)!;
                const sorted = h.column.getIsSorted();
                return (
                  <button key={h.id} type="button" role="columnheader" className="vy-th"
                          data-role={spec.role} data-sorted={sorted || undefined}
                          aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                          onClick={h.column.getToggleSortingHandler()}>
                    <span>{flexRender(h.column.columnDef.header, h.getContext())}</span>
                    {sorted && (
                      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden className="vy-sort">
                        <path d={sorted === 'asc' ? 'M6 3 9.5 8h-7z' : 'M6 9 2.5 4h7z'} fill="currentColor" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <GridSkeleton columns={visible} rows={14} />
            ) : rows.length === 0 ? (
              <div className="vy-empty-state">
                <strong>Nothing matches {search ? `“${search}”` : 'these filters'}</strong>
                <p>{emptyHint ?? `Clear the search to see all ${data.length.toLocaleString()} records.`}</p>
                {search && <Button variant="filled" onClick={() => setSearch('')}>Clear search</Button>}
              </div>
            ) : (
              /* Virtualiser geometry: computed layout, not design values.
                 See working-agreement.md section 4. */
              <div className="vy-grid-body" style={{ height: virt.getTotalSize() }}>
                {items.map(vi => {
                  const row = rows[vi.index];
                  return (
                    <div key={row.id} className="vy-tr" role="row"
                         style={{ transform: `translateY(${vi.start}px)`, height: rowH, gridTemplateColumns: template }}>
                      {row.getVisibleCells().map(cell => {
                        const spec = visible.find(v => v.field === cell.column.id)!;
                        return (
                          <div key={cell.id} className="vy-td" role="cell" data-role={spec.role}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* No pager. Virtualisation makes every row reachable by scrolling, so
            the count is a fact rather than a navigation control. */}
        <div className="vy-grid-foot">
          <span>{rows.length.toLocaleString()} {rows.length === 1 ? 'row' : 'rows'}</span>
          {rows.length > 0 && <span className="vy-grid-foot-hint">scroll for all — no paging</span>}
        </div>
      </div>
    </div>
  );
}

/* Re-exported so existing imports of fmtDate from DataGrid keep working. */
export { fmtDate };
