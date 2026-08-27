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
  filterPanel, filterActive = 0, views, viewSetting,
  allColumns, onToggleColumn, onResetColumns,
}: {
  data: T[];
  columns: ColumnSpec<T>[];
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  filters?: ReactNode;
  /** Clickable summary tiles, shown in place of a count in the page title. */
  kpis?: ReactNode;
  /**
   * The filter fields, revealed by the funnel. Hidden by default, as the live
   * screen has it — "clicking the button again collapses the filter area".
   */
  filterPanel?: ReactNode;
  /** How many fields are filtering, for the badge on the funnel. */
  filterActive?: number;
  /** The Select View control. */
  views?: ReactNode;
  /** The gear that opens View Setting. */
  viewSetting?: ReactNode;
  /**
   * Every column this screen HAS, as distinct from the ones currently shown.
   * The checklist needs both to render an unticked row.
   */
  allColumns?: ColumnSpec<T>[];
  onToggleColumn?: (field: string) => void;
  onResetColumns?: () => void;
  /**
   * The screen's primary action, rendered at the LEFT beside the title.
   * Separate from `actions` so the frequent one is met first and the rare ones
   * keep the far corner.
   */
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
   * Column visibility is NOT held here.
   *
   * It was, and that was a bug: this grid kept its own `hidden` set while the
   * View Setting panel kept the view's column list, so the two disagreed. You
   * could hide a column in the Columns checklist, open View Setting, and find it
   * still listed — and saving the view would put it back without saying so.
   *
   * Both controls now edit the same list, owned by the page. The checklist is
   * the quick path (on/off), View Setting is the full one (order, name, width).
   * Two doors into one room, rather than two rooms.
   */
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => columns,
    [columns]
  );
  const hiddenCount = (allColumns?.length ?? columns.length) - columns.length;
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
  /* Collapsed on arrival. The badge on the funnel is what stops a hidden
     filter looking like missing data. */
  const [filterOpen, setFilterOpen] = useState(false);

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
      </div>

      {kpis && <div className="vy-kpi-row">{kpis}</div>}

      {filters && <div className="vy-filter-bar">{filters}</div>}

      <div className="vy-grid-shell">
        <div className="vy-grid-toolbar">
          {/* ONE action bar, split by what the controls act on. The guideline
              (PR List, r7): "The action buttons are displayed in the following
              order from left to right: Left corner: Add New. Right corner:
              Select View, Filter Toolbar, Setup View Template."

              So the record actions occupy the left corner and the view controls
              the right corner of the SAME row. Add New spent two versions
              elsewhere — first in the page-actions group beside Export, then on
              its own under the page heading — and the second was worse: it read
              as a third action area on a screen that already had two. */}
          {actions && <div className="vy-toolbar-actions">{actions}</div>}

          <SearchField value={search} placeholder={searchPlaceholder} aria-label={searchPlaceholder}
                       onChange={e => setSearch(e.target.value)} />
          <span className="vy-toolbar-spacer" />

          {views}

          {filterPanel && (
            /* The funnel. Carries a count when filters are on, because the
               panel it opens is closed by default and a grid silently showing
               a third of its rows is indistinguishable from missing data. */
            <button type="button"
                    className="vy-funnel"
                    aria-expanded={filterOpen}
                    aria-label={filterOpen ? 'Hide filter toolbar' : 'Show filter toolbar'}
                    title={filterOpen ? 'Hide filter toolbar' : 'Show filter toolbar'}
                    data-on={filterActive > 0 || undefined}
                    onClick={() => setFilterOpen(o => !o)}>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
                   strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M3 4h14l-5.5 6.5v5L8.5 17v-6.5z" />
              </svg>
              {filterActive > 0 && <span className="vy-count-badge">{filterActive}</span>}
            </button>
          )}

          {viewSetting}
          {/* "Columns", not "Show 2 more columns". The old label described the
              action's effect on one particular state rather than naming the
              thing it opens, so it read differently depending on what was
              already on. */}
          {allColumns && onToggleColumn && (
            <ColumnChooser
              columns={allColumns.map(c => ({
                field: String(c.field), title: c.title,
                on: columns.some(v => String(v.field) === String(c.field)),
                note: c.note,
                required: c.required,
              }))}
              hiddenCount={hiddenCount}
              onToggle={onToggleColumn}
              onReset={onResetColumns ?? (() => {})}
            />
          )}
        </div>

        {filterOpen && filterPanel}

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
              /* An empty grid has to say WHICH of the two things emptied it,
                 and offer the matching way out. It previously always blamed the
                 search — offering to "clear the search to see all 0 records"
                 when the search was empty, the filters were doing the work, and
                 the count it quoted was the filtered one. Three wrong things in
                 one sentence. */
              <div className="vy-empty-state">
                <strong>
                  {search
                    ? <>Nothing matches “{search}”</>
                    : filterActive > 0
                      ? <>Nothing matches these filters</>
                      : <>Nothing to show</>}
                </strong>
                <p>
                  {emptyHint ?? (
                    search && filterActive > 0
                      ? 'Both a search and a filter are narrowing this list.'
                      : search
                        ? 'No record contains that text.'
                        : filterActive > 0
                          ? `${filterActive} ${filterActive === 1 ? 'filter is' : 'filters are'} applied. Clear them to see every record.`
                          : 'There are no records here yet.'
                  )}
                </p>
                {search && <Button variant="filled" onClick={() => setSearch('')}>Clear search</Button>}
                {!search && filterActive > 0 && (
                  <Button variant="filled" onClick={() => setFilterOpen(true)}>Show filters</Button>
                )}
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
