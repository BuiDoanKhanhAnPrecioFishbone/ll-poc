import { useMemo, useState, type ReactNode } from 'react';
import {
  Grid, GridColumn,
  type GridCustomCellProps, type GridCustomRowProps,
} from '@progress/kendo-react-grid';
import { process, type CompositeFilterDescriptor, type SortDescriptor } from '@progress/kendo-data-query';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { renderCell } from './renderCell';

/**
 * Non-virtualised table for the short lists inside a record — documents,
 * quotation results, wizard line items. Same column-role model and the same
 * visual language as the main DataGrid, without the virtualiser: these lists
 * are tens of rows, not tens of thousands, and paying for virtualisation would
 * add machinery with nothing to gain.
 *
 * ---------------------------------------------------------------------------
 * PHASE 5 OF THE KENDO MIGRATION — KendoReact Grid underneath, our API on top.
 *
 * Taken before phase 1 because phase 1 is blocked: KendoReact 16's Button loops
 * infinitely under React 19, while its Grid renders. See §9 of the scope. This
 * is also the phase that carries the actual capability win, so proving the
 * migration here proves it on the component that justifies it.
 *
 * ONE FILE, as phase 1 established. All eleven callers keep passing
 * `ColumnSpec` and know nothing about Kendo. What they gain, without changing:
 *
 *   PER-COLUMN FILTER CELLS — "Contains, Does not contain, Is [not] equal to,
 *   Starts/Ends with, Is null". The Testing Guideline asks for exactly this on
 *   the BoM Components tab, and `live-component-sweep.md` recorded it as **the
 *   one real gap** between the live system and this prototype. It arrives here
 *   as a prop rather than as a fortnight of work.
 *
 * WHAT WAS KEPT DELIBERATELY, because Kendo does not do it the same way:
 *
 *   - asc → desc → NONE. Kendo's default is a two-state toggle; `allowUnsort`
 *     restores the third click, which the guideline calls the "Clear" reset and
 *     which the main DataGrid already uses.
 *   - Row tones. The quoting grid colours whole rows by what happened to them,
 *     and each colour carries a meaning from the guideline rather than being
 *     emphasis. Kendo has no row-state concept, so the `rows.data` component
 *     puts our `data-tone` back on the <tr> and the stylesheet does the rest.
 *   - Column roles. `widthOf` and `data-role` still decide width and alignment,
 *     so a money column stays right-aligned and a code column stays monospaced
 *     — see `docs/table-patterns.md`.
 *   - Control columns opt out of BOTH sorting and filtering via
 *     `sortable: false`. A column of buttons has no order and nothing to match.
 * ---------------------------------------------------------------------------
 */
export function MiniTable<T extends { id: string | number }>({
  data, columns, empty, rowTone, freeze = 0, filterable = true,
}: {
  data: T[]; columns: ColumnSpec<T>[]; empty?: ReactNode;
  /**
   * A per-ROW state, rendered as `data-tone`.
   *
   * The quoting grid colours whole rows by what happened to them — grey for
   * excluded, red for no supplier, yellow for a shortfall, green for covered —
   * and each colour carries a specific meaning from the guideline rather than
   * being emphasis. Naming the state here and colouring it in the stylesheet
   * keeps that vocabulary in one place.
   */
  rowTone?: (row: T) => string | undefined;
  /**
   * How many leading columns stay put while the rest scroll horizontally.
   *
   * Step 2 of Run Quotation asks for exactly this: "The columns Number,
   * ROCKET_PN, Revision, Part Description, Part Source, and Quantity should be
   * frozen, allowing users to scroll horizontally and still view the remaining
   * columns." A 21-column grid without it means scrolling right until you can
   * no longer tell which part you are looking at.
   */
  freeze?: number;
  /**
   * The per-column filter row. Allowed by default — it is the reason this
   * component moved to Kendo — but see `showFilter` below: a short list does
   * not get one even when this is true.
   */
  filterable?: boolean;
}) {
  const [sort, setSort] = useState<SortDescriptor[]>([]);
  const [filter, setFilter] = useState<CompositeFilterDescriptor | undefined>(undefined);

  /* Kendo's own query engine, so sorting and filtering agree with the filter
     cells' own operators. The previous hand-written comparator sank blanks in
     both directions; `process` does not, which is a real behaviour change and
     is recorded in the scope rather than hidden. */
  const view = useMemo(() => process(data as object[], { sort, filter }), [data, sort, filter]);

  /* A filter row over three rows costs a row of chrome to search three things,
     and this component backs both a 23-line BoM and a 1-line Where-Used. The
     threshold is my judgement, not the guideline's — the guideline asks for
     filter cells on the BoM Components tab, which has 23 lines and gets them.
     Callers that want it either way still say so with `filterable`. */
  const showFilter = filterable && data.length >= 8;

  if (data.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="vy-minitable-k" data-frozen={freeze || undefined}>
      <Grid
        data={view.data}
        /* Without this the grid is MOUSE-ONLY for sorting. Kendo puts the sort
           handler on a <span class="k-link"> inside the <th>, which is not
           focusable, so the only tabbable things in the grid were the filter
           inputs — a keyboard user could filter but never sort. `navigatable`
           turns on Kendo's own grid keyboard model: Tab into the grid, then
           arrow keys between cells and headers, Enter to sort. Found by the
           accessibility pass. */
        navigatable
        sortable={{ mode: 'single', allowUnsort: true }}
        onSortChange={e => setSort(e.sort)}
        sort={sort}
        filterable={showFilter}
        filter={filter}
        onFilterChange={e => setFilter(e.filter)}
        /* v16 replaced `rowRender` with a `rows` settings object of components.
           This puts our row state back on the row Kendo renders. */
        rows={{
          data: ({ dataItem, trProps, children }: GridCustomRowProps) => (
            <tr {...trProps} data-tone={rowTone?.(dataItem as T)}>{children}</tr>
          ),
        }}
      >
        {columns.map((c, i) => (
          <GridColumn
            key={String(c.field)}
            field={String(c.field)}
            title={c.title}
            width={widthOf(c)}
            locked={i < freeze || undefined}
            sortable={c.sortable !== false}
            filterable={c.sortable !== false}
            /* Names the filter MENU. It does NOT rename the filter input,
               which Kendo labels from the FIELD — see the known defect in §11
               of docs/kendo-migration-scope.md. */
            filterTitle={c.title}
            /* Every cell still goes through `renderCell`, so the column roles,
               the money and date formatting and the empty-value em-dash are
               unchanged — Kendo supplies the table, not the rendering. v16 takes
               these as a `cells` object rather than a `cell` prop. */
            cells={{
              data: ({ dataItem, tdProps }: GridCustomCellProps) => (
                /* NOT `.vy-td`. That class is `display:flex; height:100%`,
                   written for the CSS-grid table this replaced, and on a real
                   <td> it destroys the table layout — columns stop aligning
                   with their headers entirely. The role rides on the data
                   attribute instead, and the stylesheet picks it up under
                   `.vy-minitable-k`. */
                <td {...tdProps} data-role={c.role}
                    data-tone={c.tone?.(dataItem as T)}>
                  {renderCell(c, dataItem as T)}
                </td>
              ),
              ...(c.headerRender
                ? { headerCell: () => <>{c.headerRender!()}</> }
                : {}),
              /* The filter box otherwise announces itself by the FIELD name —
                 "part Filter", "partSource Filter" — so a screen reader reads
                 camelCase identifiers aloud where a sighted user sees the column
                 heading. `filterTitle` does not change it; the label comes from
                 `ariaLabel` on the filter cell, so the cell is wrapped to supply
                 the title instead. Found by the accessibility pass. */

            }}
          />
        ))}
      </Grid>
    </div>
  );
}
