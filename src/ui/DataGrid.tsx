import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchField } from './Field';
import { ColumnChooser } from './ColumnChooser';
import { Pager } from './Pager';
import { usePrefs } from './prefs';
import { Button } from './Button';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { GridSkeleton } from './GridSkeleton';
import { renderCell, fmtDate } from './renderCell';

export type Density = 'compact' | 'comfortable' | 'relaxed';
const ROW_H: Record<Density, number> = { compact: 28, comfortable: 36, relaxed: 44 };


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
  searchPlaceholder = 'Search', rowHref, onOpenRow, emptyHint, loading, kpis,
}: {
  data: T[];
  columns: ColumnSpec<T>[];
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  /** Clickable summary tiles, shown in place of a count in the page title. */
  kpis?: ReactNode;
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
  /* Density is a USER PREFERENCE, not a per-screen control (25 Aug review):
     "do not show settings in the list view, move this into User Preference...
     the UI elements you want to show should be configured here for consistency".
     Set once, applies to every grid. */
  const { density } = usePrefs();
  const [search, setSearch] = useState('');
  /**
   * Which columns are on.
   *
   * Was a single "Show N more columns" toggle, which the 25 Aug review called a
   * confusing label and asked to become a Columns checklist. The toggle also
   * only had two states — the shipped set, or the shipped set plus everything —
   * so a user who wanted one extra column had to take all of them, and could
   * not turn off a column they never use.
   *
   * Hidden-by-default columns start off; everything else starts on.
   */
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter(c => c.hiddenByDefault).map(c => String(c.field))),
  );
  const toggleColumn = (field: string) =>
    setHidden(h => { const n = new Set(h); n.has(field) ? n.delete(field) : n.add(field); return n; });
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => columns.filter(c => !hidden.has(String(c.field))),
    [columns, hidden]
  );
  const hiddenCount = hidden.size;
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

  const allRows = table.getRowModel().rows;

  /* Paging replaces infinite scroll (25 Aug review). Virtualisation stays
     underneath, so a 100-row page is still cheap; what the pager adds is a
     POSITION — where you are, and a way back to it. */
  const [page, setPage] = useState(0);
  /* 20 is the live default. */
  const [pageSize, setPageSize] = useState(20);
  const pageCount = Math.max(1, Math.ceil(allRows.length / pageSize));
  /* Clamp during render, not in an effect. An effect loses the race with the
     first paint and shows a blank page for one frame — the exact bug the old
     pager had when a filter narrowed the set while you were on page 7. */
  const safePage = Math.min(page, pageCount - 1);
  const rows = allRows.slice(safePage * pageSize, safePage * pageSize + pageSize);

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
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [filtered, safePage, pageSize]);
  /* A narrower result set starts at page one. Staying on page 7 of a set that
     now has two pages is how a grid ends up looking empty for no reason. */
  useEffect(() => { setPage(0); }, [filtered]);

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
          {/* The count is NOT here. The review: "displaying it right in the
              module name doesn't have much meaning" — it belongs at the foot,
              beside the control that moves through it. What is worth
              highlighting goes in the KPI row below, where it can be clicked. */}
          {subtitle && <p className="vy-page-sub">{subtitle}</p>}
        </div>
        {actions && <div className="vy-page-actions">{actions}</div>}
      </div>

      {kpis && <div className="vy-kpi-row">{kpis}</div>}

      {filters && <div className="vy-filter-bar">{filters}</div>}

      <div className="vy-grid-shell">
        <div className="vy-grid-toolbar">
          <SearchField value={search} placeholder={searchPlaceholder} aria-label={searchPlaceholder}
                       onChange={e => setSearch(e.target.value)} />
          <span className="vy-toolbar-spacer" />
          {/* "Columns", not "Show 2 more columns". The old label described the
              action's effect on one particular state rather than naming the
              thing it opens, so it read differently depending on what was
              already on. */}
          <ColumnChooser
            columns={columns.map(c => ({
              field: String(c.field), title: c.title,
              on: !hidden.has(String(c.field)),
              note: c.note,
            }))}
            hiddenCount={hiddenCount}
            onToggle={toggleColumn}
            onReset={() => setHidden(new Set(columns.filter(c => c.hiddenByDefault).map(c => String(c.field))))}
          />
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

        <Pager page={safePage} pageSize={pageSize} total={allRows.length}
               onPage={setPage} onPageSize={setPageSize} />
      </div>
    </div>
  );
}

/* Re-exported so existing imports of fmtDate from DataGrid keep working. */
export { fmtDate };
