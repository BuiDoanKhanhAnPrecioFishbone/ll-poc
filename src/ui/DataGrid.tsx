import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, GridColumn,
  type GridCustomCellProps, type GridCustomRowProps, type GridCustomHeaderCellProps,
} from '@progress/kendo-react-grid';
import { orderBy, type SortDescriptor } from '@progress/kendo-data-query';
import { SearchField } from './Field';
import { ColumnChooser } from './ColumnChooser';
import { Pager } from './Pager';
import { usePrefs } from './prefs';
import { Button } from './Button';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { GridSkeleton } from './GridSkeleton';
import { kendoDomProps, kendoHeaderProps } from './kendoDomProps';
import { renderCell, fmtDate } from './renderCell';

export type Density = 'compact' | 'comfortable' | 'relaxed';
/* The density scale, kept here because it is the app's row-height vocabulary
   and `GridSkeleton` sizes its placeholder rows from it. The GRID itself gets
   density from `[data-density]` in the stylesheet — see the note on `rowHeight`
   below for why it is not passed to Kendo. */
export const ROW_H: Record<Density, number> = { compact: 28, comfortable: 36, relaxed: 44 };
/* The checkbox track is fixed and narrow — it holds one control whose size never
   changes, so a role width would only make it wider than its content. */
const SELECT_COL_W = 40;


/**
 * THE STANDARD LIST PATTERN — KendoReact Grid underneath, our chrome on top.
 *
 * PHASE 6 of docs/kendo-migration-scope.md, and the one it called high risk:
 * twenty-one props, each of them a requirement somebody signed off. The rules
 * are unchanged and none of them were ever Kendo's — column width still follows
 * from column role, sparse columns still hide with a stated reason, density is
 * still a user preference, the identifier is still the affordance.
 *
 * WHAT KENDO TOOK OVER: the table itself — header, rows, cells, sort controls.
 *
 * WHAT IT DID NOT: everything around it. The title, KPIs, actions, search,
 * filter panel, view picker, column chooser, empty state, loading skeleton and
 * pager are ours and untouched. Kendo's own pager, filter row and column menu
 * are all switched off, because each already exists here answering a written
 * requirement, and two of a thing is worse than either.
 *
 * VIRTUALISATION IS GONE, AND THAT IS NOT A LOSS. It existed to make 21,941
 * rows one scroll — then the 25 Aug review replaced infinite scroll with a
 * pager, and `Pager` offers 20, 50 or 100. Virtualising 100 rows is machinery
 * with nothing to do, and it cost a `useEffect` to re-measure on every density
 * change. The page slice goes straight to the Grid.
 *
 * SELECTION STAYS OURS. Kendo has its own selection model, but the guideline's
 * is specific — select-all covers THIS PAGE, because across 2,000 rows a bare
 * "all" selects records the user has never seen and is about to export. It is a
 * normal column here, with our checkbox in it.
 */
export function DataGrid<T extends { id: string | number }>({
  data, columns, title, subtitle, actions, filters,
  searchPlaceholder = 'Search', rowHref, onOpenRow, emptyHint, loading, kpis,
  selected, onSelectedChange,
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
  /**
   * Row selection, opt-in.
   *
   * Passing `selected` turns on a leading checkbox column — "by checking on 1st
   * column on part's row", as the Part Master sheet puts it. Every grid that
   * does not pass it is untouched: no extra column, no extra width, and the
   * template it already had.
   */
  selected?: ReadonlySet<string | number>;
  onSelectedChange?: (next: Set<string | number>) => void;
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
  const [sort, setSort] = useState<SortDescriptor[]>([]);

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

  /* One cell renderer for every column. The identifier column becomes the open
     affordance; every other cell stays inert text so it can be selected and
     copied — the rule `docs/table-patterns.md` states and the reason row-wide
     click targets were rejected. */
  const cellFor = (spec: ColumnSpec<T>) => (row: T) => {
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
  };

  /* Search, then sort, then page — in that order, because sorting a page rather
     than the set would sort twenty rows out of two thousand. */
  const allRows = useMemo(
    () => (sort.length ? orderBy(filtered as object[], sort) as T[] : filtered),
    [filtered, sort]);

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
  /* A narrower result set starts at page one. Staying on page 7 of a set that
     now has two pages is how a grid ends up looking empty for no reason. */
  useEffect(() => { setPage(0); }, [filtered]);

  const selectable = !!selected && !!onSelectedChange;

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
        {/* Page-level actions live in the PAGE header, on the right, together.

            They spent a version in the grid toolbar below — an over-literal
            reading of the guideline's "Left corner: Add New. Right corner:
            Select View, Filter Toolbar, Setup View Template." That row is the
            TABLE's own control strip: search, saved view, filter, density,
            columns. Putting Add New and Export in it mixed two tiers of
            control, crowded the search field, and is not a pattern any
            comparable product uses.

            The guideline's left/right split still holds where it belongs —
            among the view controls in that toolbar. */}
        {actions && <div className="vy-page-actions">{actions}</div>}
      </div>

      {kpis && <div className="vy-kpi-row">{kpis}</div>}

      {filters && <div className="vy-filter-bar">{filters}</div>}

      <div className="vy-grid-shell">
        <div className="vy-grid-toolbar">
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

        <div className="vy-grid-k" data-density={density}>
          {loading ? (
            <GridSkeleton columns={visible} rows={14} />
          ) : rows.length === 0 ? (
            /* An empty grid has to say WHICH of the two things emptied it, and
               offer the matching way out. It previously always blamed the
               search — offering to "clear the search to see all 0 records" when
               the search was empty, the filters were doing the work, and the
               count it quoted was the filtered one. Three wrong things in one
               sentence. Kendo has a no-records template; this says more than it
               can, so it stays. */
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
            <Grid
              data={rows}
              sortable={{ mode: 'single', allowUnsort: true }}
              sort={sort}
              onSortChange={e => setSort(e.sort)}
              /* Kendo's own pager, filter row and column menu stay OFF: this
                 screen already has all three, each answering a written
                 requirement, and two of a thing is worse than either. */
              pageable={false}
              filterable={false}
              /* Keyboard: Kendo puts the sort handler on a span inside the th,
                 which is not focusable. Without this the grid is mouse-only for
                 sorting — the WCAG 2.1.1 failure the phase 5 audit found. */
              navigatable
              /* NO `rowHeight`. Setting it puts Kendo into its virtual-scroll
                 mode, which needs `skip`/`take`/`total` and an `onPageChange`
                 to feed it — none of which this grid supplies, because OUR
                 pager already did the slicing. The symptom was silent and ugly:
                 a 100-row page reserved 4,400px of scroll and rendered only the
                 first 20 rows, so eighty records were unreachable while the
                 scrollbar said they were there. Row height comes from the
                 density CSS instead. */
              style={{ height: '100%' }}
              rows={{
                data: ({ dataItem, trProps, children }: GridCustomRowProps) => (
                  <tr {...kendoDomProps(trProps)}
                      data-selected={(selectable && selected!.has((dataItem as T).id)) || undefined}>
                    {children}
                  </tr>
                ),
              }}
            >
              {selectable && (
                <GridColumn
                  field="__select"
                  width={SELECT_COL_W}
                  sortable={false}
                  title=" "
                  cells={{
                    /* Select-all covers THIS PAGE, and says so. Across 2,000
                       rows a bare "all" would select records the user has never
                       seen and cannot check before exporting them; the page is
                       the set they are actually looking at. */
                    headerCell: ({ thProps }: GridCustomHeaderCellProps) => (
                      /* The <th> is OURS to render. A custom header cell
                         replaces Kendo's wrapper as well as its contents, so
                         returning a bare <label> put one directly inside a
                         <tr>. Same lesson as the phase 5 filter cell. */
                      /* `kendoHeaderProps` drops the `aria-sort` Kendo puts on
                         every header: this column holds checkboxes and cannot
                         be ordered by, and "none" would claim it can. */
                      <th {...kendoHeaderProps(thProps)}>
                      <label className="vy-check" title={`Select all ${rows.length} on this page`}>
                        <input
                          type="checkbox"
                          aria-label={`Select all ${rows.length} rows on this page`}
                          checked={rows.length > 0 && rows.every(r => selected!.has(r.id))}
                          ref={el => { if (el) el.indeterminate =
                            rows.some(r => selected!.has(r.id)) &&
                            !rows.every(r => selected!.has(r.id)); }}
                          onChange={e => {
                            const next = new Set(selected!);
                            for (const r of rows) {
                              if (e.target.checked) next.add(r.id); else next.delete(r.id);
                            }
                            onSelectedChange!(next);
                          }}
                        />
                      </label>
                      </th>
                    ),
                    data: ({ dataItem, tdProps }: GridCustomCellProps) => {
                      const id = (dataItem as T).id;
                      const on = selected!.has(id);
                      return (
                        <td {...kendoDomProps(tdProps)} className="vy-td--select">
                          <label className="vy-check">
                            {/* Named by the row, not "Select row" — a screen
                                reader moving down 20 identical labels learns
                                nothing about which one it is on. */}
                            <input type="checkbox" checked={on}
                                   aria-label={`Select ${String(id)}`}
                                   onChange={() => {
                                     const next = new Set(selected!);
                                     if (on) next.delete(id); else next.add(id);
                                     onSelectedChange!(next);
                                   }} />
                          </label>
                        </td>
                      );
                    },
                  }}
                />
              )}
              {visible.map(spec => (
                <GridColumn
                  key={spec.field}
                  field={spec.field}
                  title={spec.title}
                  width={widthOf(spec)}
                  cells={{
                    data: ({ dataItem, tdProps }: GridCustomCellProps) => (
                      /* `data-role` carries the column role through, so width
                         and alignment still come from the role model rather
                         than from Kendo's defaults. */
                      <td {...kendoDomProps(tdProps)} data-role={spec.role}>
                        {cellFor(spec)(dataItem as T)}
                      </td>
                    ),
                  }}
                />
              ))}
            </Grid>
          )}
        </div>

        <Pager page={safePage} pageSize={pageSize} total={allRows.length}
               onPage={setPage} onPageSize={setPageSize} />
      </div>
    </div>
  );
}

/* Re-exported so existing imports of fmtDate from DataGrid keep working. */
export { fmtDate };
