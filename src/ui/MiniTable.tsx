import { useMemo, useState, type ReactNode } from 'react';
import {
  Grid, GridColumn, GridFilterCell,
  type GridCustomCellProps, type GridCustomRowProps, type GridCustomHeaderCellProps,
  type GridCustomFilterCellProps,
} from '@progress/kendo-react-grid';
import { process, type CompositeFilterDescriptor, type SortDescriptor } from '@progress/kendo-data-query';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { kendoDomProps, kendoHeaderProps } from './kendoDomProps';
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
  data, columns, empty, rowTone, freeze = 0, filterable = true, rowGroup,
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
  /**
   * Rows that are not records but PARTS of one.
   *
   * ASKED FOR by the VIQ UI Standard — "Child lists as rows: one AML pair per
   * row, parent cells merged" — and shown working in the customer's Quoting
   * BoM mockup of 16 Oct. A BoM line with two manufacturers is two rows: the
   * line's own cells on the first, blank on the second, and one rule under the
   * pair rather than between them.
   *
   * WHY THE GRID HAS TO KNOW. Sorting. Kendo's `process` reorders a flat array,
   * and a flat array of child rows sorted by Part scatters the children away
   * from the parent they belong to — the group is only a group because the rows
   * are adjacent. Given this, the sort is applied to one row per group and the
   * rest follow their own, so a sorted grid still reads as records.
   */
  rowGroup?: {
    /** Rows sharing a key are one record. */
    key: (row: T) => string;
    /** True on the last row of a group: the rule is drawn under it. */
    end: (row: T) => boolean;
  };
}) {
  const [sort, setSort] = useState<SortDescriptor[]>([]);
  const [filter, setFilter] = useState<CompositeFilterDescriptor | undefined>(undefined);

  /* Kendo's own query engine, so sorting and filtering agree with the filter
     cells' own operators. The previous hand-written comparator sank blanks in
     both directions; `process` does not, which is a real behaviour change and
     is recorded in the scope rather than hidden. */
  const view = useMemo(() => {
    if (!rowGroup) return process(data as object[], { sort, filter });
    /* One entry per group, in the order the data arrived. */
    const groups = new Map<string, T[]>();
    for (const row of data) {
      const k = rowGroup.key(row);
      (groups.get(k) ?? groups.set(k, []).get(k)!).push(row);
    }
    /* Sort and filter the HEADS — the row carrying the record's own values —
       then put each group back together behind the head that survived. A
       filter matching a child row keeps the whole record, which is the only
       reading that makes sense: the record is what the user is looking for. */
    const heads = [...groups.values()].map(g => g[0]);
    const kept = process(heads as object[], { sort, filter }).data as T[];
    return { data: kept.flatMap(h => groups.get(rowGroup.key(h))!) as object[], total: data.length };
  }, [data, sort, filter, rowGroup]);

  /* A filter row over three rows costs a row of chrome to search three things,
     and this component backs both a 23-line BoM and a 1-line Where-Used. The
     threshold is my judgement, not the guideline's — the guideline asks for
     filter cells on the BoM Components tab, which has 23 lines and gets them.
     Callers that want it either way still say so with `filterable`. */
  const showFilter = filterable && data.length >= 8;

  if (data.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="vy-minitable-k" data-frozen={freeze || undefined}
         data-grouped={rowGroup ? '' : undefined}>
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
            <tr {...kendoDomProps(trProps)} data-tone={rowTone?.(dataItem as T)}
                /* The rule goes under the LAST row of a record, so the rows of
                   one BoM line read as one block rather than as three lines
                   that happen to share a part number. */
                data-group-end={rowGroup ? (rowGroup.end(dataItem as T) || undefined) : undefined}>
              {children}
            </tr>
          ),
        }}
      >
        {columns.map((c, i) => (
          <GridColumn
            key={c.id ?? String(c.field)}
            field={String(c.field)}
            title={c.title}
            width={widthOf(c)}
            locked={i < freeze || undefined}
            sortable={c.sortable !== false}
            filterable={c.sortable !== false}
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
                <td {...kendoDomProps(tdProps)} data-role={c.role}
                    data-tone={c.tone?.(dataItem as T)}>
                  {renderCell(c, dataItem as T)}
                </td>
              ),
              /* Kendo labels the filter input from the FIELD — "part Filter",
                 "partSource Filter" — so a screen reader reads camelCase
                 identifiers aloud where a sighted user sees the column heading.
                 `filterTitle` names the MENU, not the input; the label comes
                 from `ariaLabel` on the filter cell.

                 §11 found this and reverted the fix, because wrapping the cell
                 leaked Kendo's internal props onto the DOM as React warnings.
                 `kendoDomProps` is what that attempt was missing. */
              filterCell: ({ tdProps, ...fp }: GridCustomFilterCellProps) => (
                <td {...kendoDomProps(tdProps)}>
                  <GridFilterCell {...fp} ariaLabel={`${c.title} filter`} />
                </td>
              ),
              /* The <th> is OURS whenever we supply a header cell: a custom
                 one replaces Kendo's wrapper too, so a bare fragment would
                 leave its contents directly inside the <tr>.

                 A control column also gets a header here for a second reason —
                 to drop the `aria-sort` Kendo puts on every column, including
                 ones it marks unsortable. "none" means sortable-and-unsorted,
                 which is a claim about a column of buttons. §11 recorded losing
                 that behaviour as a regression against the hand-written table. */
              ...(c.headerRender || c.sortable === false
                ? { headerCell: ({ thProps }: GridCustomHeaderCellProps) => (
                      <th {...kendoHeaderProps(thProps)}>
                        {c.headerRender ? c.headerRender() : c.title}
                      </th>
                    ) }
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
