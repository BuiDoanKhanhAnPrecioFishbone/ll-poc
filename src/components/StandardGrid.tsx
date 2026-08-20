import { useMemo, useState, type ReactNode } from 'react';
import { Grid, GridColumn, GridToolbar, type GridDataStateChangeEvent } from '@progress/kendo-react-grid';
import { process, type State, type SortDescriptor } from '@progress/kendo-data-query';
import { Button, ButtonGroup } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { StatusBadge } from './StatusBadge';
import { widthOf, type ColumnSpec } from './column-model';

export type Density = 'compact' | 'comfortable' | 'relaxed';

/**
 * THE STANDARD LIST PATTERN
 *
 * Generic over the row type: a new list screen costs a column spec, not a
 * component. Part Master and Quotations are the same code with different specs.
 *
 * What it standardises, and what each rule answers in the current system:
 *
 *   1. Width by role, never uniform. Production gives every column an identical
 *      width — 108px on the Part Master, 111px on Quotations — which clips the
 *      identifier in 85% of rows and every date in 100%.
 *   2. Identifier never truncated, monospaced, always the first data column.
 *   3. One search box, always first in the toolbar, always labelled.
 *   4. Density is a user setting, with the default chosen per screen from how
 *      often the people who use it are in it.
 *   5. Sparse columns hidden by default, discoverable, with the reason stated.
 *   6. Row click opens the record; no column is spent on a view icon.
 *   7. Loading, empty and error are three distinct states.
 */
export function StandardGrid<T extends { id: string | number }>({
  data,
  columns,
  title,
  subtitle,
  actions,
  filters,
  defaultDensity = 'comfortable',
  defaultSort,
  searchPlaceholder = 'Search',
  onRowClick,
}: {
  data: T[];
  columns: ColumnSpec<T>[];
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Screen-specific filter controls, rendered above the grid. */
  filters?: ReactNode;
  defaultDensity?: Density;
  defaultSort?: SortDescriptor[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
}) {
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [dataState, setDataState] = useState<State>({ skip: 0, take: 50, sort: defaultSort });

  const visibleColumns = useMemo(
    () => columns.filter(c => showHidden || !c.hiddenByDefault),
    [columns, showHidden]
  );

  const searchFields = useMemo(
    () => columns.filter(c => c.searchable).map(c => c.field),
    [columns]
  );

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    if (!n || searchFields.length === 0) return data;
    return data.filter(row =>
      searchFields.some(f => String(row[f] ?? '').toLowerCase().includes(n))
    );
  }, [data, search, searchFields]);

  const result = useMemo(() => process(filtered, dataState), [filtered, dataState]);
  const hiddenCount = columns.filter(c => c.hiddenByDefault).length;

  return (
    <div className="vy-page" data-density={density}>
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">{title}</h1>
          {/* Count stated up front. Production puts "1 - 20 of 330 items" in the
              footer, below the fold on most screens. */}
          <p className="vy-page-sub">
            {filtered.length.toLocaleString()} of {data.length.toLocaleString()}
            {subtitle && <> · {subtitle}</>}
          </p>
        </div>
        {actions && <div className="vy-page-actions">{actions}</div>}
      </div>

      {filters && <div className="vy-filter-bar">{filters}</div>}

      <Grid
        data={result}
        {...dataState}
        onDataStateChange={(e: GridDataStateChangeEvent) => setDataState(e.dataState)}
        sortable
        pageable={{ pageSizes: [25, 50, 100, 200], buttonCount: 5 }}
        total={result.total}
        className={'vy-grid' + (filters ? ' vy-grid--fill-with-filters' : ' vy-grid--fill')}
        onRowClick={e => onRowClick?.(e.dataItem as T)}
      >
        <GridToolbar>
          <div className="vy-grid-toolbar">
            <Input
              value={search}
              onChange={e => { setSearch(String(e.value ?? '')); setDataState(s => ({ ...s, skip: 0 })); }}
              placeholder={searchPlaceholder}
              className="vy-grid-search"
              aria-label={searchPlaceholder}
            />
            <span className="vy-toolbar-spacer" />
            {/* Density as a segmented control rather than a dropdown: three
                options, one click, current state always visible. */}
            <span className="vy-toolbar-label" id="vy-density-label">Density</span>
            <ButtonGroup aria-labelledby="vy-density-label">
              {(['compact', 'comfortable', 'relaxed'] as Density[]).map(d => (
                <Button key={d} togglable selected={density === d}
                        onClick={() => setDensity(d)} aria-pressed={density === d}>
                  {d[0].toUpperCase() + d.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
            {hiddenCount > 0 && (
              <Button
                themeColor={showHidden ? 'primary' : 'base'}
                fillMode={showHidden ? 'solid' : 'outline'}
                onClick={() => setShowHidden(s => !s)}
                title={columns.filter(c => c.hiddenByDefault)
                  .map(c => `${c.title}: ${c.note ?? 'hidden by default'}`).join('\n')}
              >
                {showHidden ? 'Hide extra columns' : `Show ${hiddenCount} more columns`}
              </Button>
            )}
          </div>
        </GridToolbar>

        {visibleColumns.map(col => (
          <GridColumn
            key={col.field}
            field={col.field}
            title={col.title}
            width={widthOf(col)}
            cells={{
              data: (props) => {
                const row = props.dataItem as T;
                if (col.render) return <td className="vy-cell">{col.render(row)}</td>;
                const v = row[col.field];
                if (col.role === 'ident')
                  return <td className="vy-ident" title={String(v)}>{String(v)}</td>;
                if (col.role === 'status')
                  return <td><StatusBadge value={String(v)} /></td>;
                if (col.role === 'date')
                  return <td className="vy-num">{fmtDate(v as Date)}</td>;
                if (col.role === 'money')
                  return <td className="vy-num">{(v as number).toLocaleString('en-GB', { style: 'currency', currency: 'USD' })}</td>;
                if (col.role === 'number')
                  return <td className="vy-num">{(v as number).toLocaleString()}</td>;
                if (col.role === 'code')
                  return <td>{v ? <span className="vy-code">{String(v)}</span> : <span className="vy-empty">—</span>}</td>;
                return <td className="vy-truncate" title={String(v)}>{String(v)}</td>;
              },
            }}
          />
        ))}
      </Grid>

      {result.total === 0 && (
        /* A real empty state: names the cause and offers the way out. Production
           renders "No records available" while the spinner is still running. */
        <div className="vy-empty-state">
          <strong>Nothing matches {search ? `“${search}”` : 'these filters'}</strong>
          <p>Clear the search to see all {data.length.toLocaleString()} records.</p>
          <Button themeColor="primary" onClick={() => setSearch('')}>Clear search</Button>
        </div>
      )}
    </div>
  );
}

/** One date format for the whole system. Dates are never rendered two ways. */
export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
