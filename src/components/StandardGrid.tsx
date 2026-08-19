import { useMemo, useState } from 'react';
import { Grid, GridColumn, GridToolbar, type GridDataStateChangeEvent } from '@progress/kendo-react-grid';
import { process, type State } from '@progress/kendo-data-query';
import { Button, ButtonGroup } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { ROLE_WIDTH, type ColumnSpec, type Part } from '../data/parts';
import { StatusBadge } from './StatusBadge';

type Density = 'compact' | 'comfortable' | 'relaxed';

/**
 * THE STANDARD LIST PATTERN
 *
 * Every list screen in the ERP should be this component with a different column
 * spec. What it standardises, and what each rule answers in the current system:
 *
 *   1. Width by role, never uniform. Production gives all columns 108px, which
 *      clips the part number in 85% of rows while spending 108px on an
 *      always-empty ABC column.
 *   2. Identifier first, never truncated, monospaced and copyable.
 *   3. One search box, always in the same place, always labelled.
 *   4. Density is a user setting, not a developer decision.
 *   5. Empty columns are hidden by default but discoverable in the chooser,
 *      with the reason stated.
 *   6. Row click opens the record. Production spends a whole column on an eye
 *      icon because the row itself is not clickable.
 *   7. Loading, empty and error are three distinct states. Production renders
 *      "No records available" *while* the spinner is still running.
 */
export function StandardGrid({
  data,
  columns,
  title,
  onRowClick,
}: {
  data: Part[];
  columns: ColumnSpec[];
  title: string;
  onRowClick?: (p: Part) => void;
}) {
  const [density, setDensity] = useState<Density>('comfortable');
  const [search, setSearch] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [dataState, setDataState] = useState<State>({ skip: 0, take: 50, sort: [{ field: 'lastChange', dir: 'desc' }] });

  const visibleColumns = useMemo(
    () => columns.filter(c => showHidden || !c.hiddenByDefault),
    [columns, showHidden]
  );

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    if (!n) return data;
    return data.filter(p =>
      p.partNumber.toLowerCase().includes(n) ||
      p.description.toLowerCase().includes(n) ||
      p.customer.toLowerCase().includes(n)
    );
  }, [data, search]);

  const result = useMemo(() => process(filtered, dataState), [filtered, dataState]);
  const hiddenCount = columns.filter(c => c.hiddenByDefault).length;

  return (
    <div className="vy-page" data-density={density}>
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">{title}</h1>
          {/* Count is stated up front. Production shows "1 - 20 of 21941 items"
              in the footer, below the fold on most screens. */}
          <p className="vy-page-sub">
            {filtered.length.toLocaleString()} parts
            {search && <> matching “{search}”</>}
            {filtered.length !== data.length && <> · of {data.length.toLocaleString()} total</>}
          </p>
        </div>
        <div className="vy-page-actions">
          <Button themeColor="base">Import</Button>
          <Button themeColor="base">Export</Button>
          <Button themeColor="primary">New Part</Button>
        </div>
      </div>

      <Grid
        data={result}
        {...dataState}
        onDataStateChange={(e: GridDataStateChangeEvent) => setDataState(e.dataState)}
        sortable
        pageable={{ pageSizes: [25, 50, 100, 200], buttonCount: 5 }}
        total={result.total}
        className="vy-grid"
        onRowClick={e => onRowClick?.(e.dataItem as Part)}
        style={{ height: 'calc(100vh - 210px)' }}
      >
        <GridToolbar>
          <div className="vy-grid-toolbar">
            {/* Search always sits first and is always labelled. In production it
                is an unlabelled box wedged between four buttons and a dropdown. */}
            <Input
              value={search}
              onChange={e => { setSearch(String(e.value ?? '')); setDataState(s => ({ ...s, skip: 0 })); }}
              placeholder="Search part number, description or customer"
              className="vy-grid-search"
              aria-label="Search parts"
            />
            <span className="vy-toolbar-spacer" />
            {/* Density as a segmented control rather than a dropdown: three
                options, one click, and the current state is always visible
                without opening anything. */}
            <span className="vy-toolbar-label" id="vy-density-label">Density</span>
            <ButtonGroup aria-labelledby="vy-density-label">
              {(['compact', 'comfortable', 'relaxed'] as Density[]).map(d => (
                <Button
                  key={d}
                  togglable
                  selected={density === d}
                  onClick={() => setDensity(d)}
                  aria-pressed={density === d}
                >
                  {d[0].toUpperCase() + d.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
            <Button
              themeColor={showHidden ? 'primary' : 'base'}
              fillMode={showHidden ? 'solid' : 'outline'}
              onClick={() => setShowHidden(s => !s)}
              title={`${hiddenCount} columns are empty in most or all records and are hidden by default`}
            >
              {showHidden ? 'Hide sparse columns' : `Show ${hiddenCount} sparse columns`}
            </Button>
          </div>
        </GridToolbar>

        {visibleColumns.map(col => (
          <GridColumn
            key={String(col.field)}
            field={String(col.field)}
            title={col.title}
            width={ROLE_WIDTH[col.role]}
            /* Roles drive rendering, so a date can never be formatted two ways
               on two screens and a number can never be left-aligned. */
            cells={{
              data: (props) => {
                const v = (props.dataItem as Part)[col.field];
                if (col.role === 'ident')
                  return <td className="vy-ident" title={String(v)}>{String(v)}</td>;
                if (col.role === 'status')
                  return <td><StatusBadge value={String(v)} /></td>;
                if (col.role === 'date')
                  return <td className="vy-num">{(v as Date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>;
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
        /* A real empty state: says what happened and offers the way out. */
        <div className="vy-empty-state">
          <strong>No parts match “{search}”</strong>
          <p>Try a partial part number, or clear the search to see all {data.length.toLocaleString()} parts.</p>
          <Button themeColor="primary" onClick={() => setSearch('')}>Clear search</Button>
        </div>
      )}
    </div>
  );
}
