import { useMemo, useState, type ReactNode } from 'react';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { renderCell } from './renderCell';

/**
 * Non-virtualised table for the short lists inside a record — documents,
 * quotation results, wizard line items. Same column-role model and the same
 * visual language as the main DataGrid, without the virtualiser: these lists
 * are tens of rows, not tens of thousands, and paying for virtualisation would
 * add machinery with nothing to gain.
 */
export function MiniTable<T extends { id: string | number }>({
  data, columns, empty, rowTone, freeze = 0,
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
}) {
  /* "Each column is fully interactive, supporting bidirectional sorting, a
     'Clear' reset function" — the guideline, of the BoM Components tab. This
     table had none at all, and it backs five lists: BoM components, Where-Used,
     quotation results, checklist tasks and saved drafts.

     A third click clears, which IS the reset — the same asc → desc → none cycle
     the main DataGrid already uses, so the two tables in this app do not sort by
     different rules. A separate Clear control would be a second way to do one
     thing. */
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' } | null>(null);

  const rows = useMemo(() => {
    if (!sort) return data;
    const col = columns.find(c => String(c.field) === sort.field);
    if (!col) return data;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const x = a[col.field] as unknown, y = b[col.field] as unknown;
      /* Blanks sink to the bottom in BOTH directions. A column sorted to bring
         the largest to the top should not open with a screen of empties. */
      const xe = x === null || x === undefined || x === '';
      const ye = y === null || y === undefined || y === '';
      if (xe || ye) return xe && ye ? 0 : xe ? 1 : -1;
      if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * dir;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x).localeCompare(String(y), undefined, { numeric: true }) * dir;
    });
  }, [data, columns, sort]);

  const toggle = (field: string) => setSort(s =>
    s?.field !== field ? { field, dir: 'asc' }
    : s.dir === 'asc' ? { field, dir: 'desc' }
    : null);

  if (data.length === 0 && empty) return <>{empty}</>;
  const widths = columns.map(widthOf);
  const template = widths.map(w => `${w}px`).join(' ');
  /* Each frozen column sticks at the sum of the widths before it. */
  const offsets = widths.reduce<number[]>((acc, _w, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + widths[i - 1]);
    return acc;
  }, []);
  const stick = (i: number) =>
    i < freeze ? { left: offsets[i], zIndex: freeze - i } : undefined;

  return (
    <div className="vy-minitable" role="table" data-frozen={freeze || undefined}>
      <div className="vy-minitable-head" role="row" style={{ gridTemplateColumns: template }}>
        {columns.map((c, i) => (
          <div key={c.field} role="columnheader" className="vy-th" data-role={c.role}
               data-stick={i < freeze || undefined} style={stick(i)}
               /* Only on a column that CAN sort. `aria-sort="none"` does not mean
                  "not sortable" — it means sortable and currently unsorted, which
                  would announce the control columns as something they are not. */
               aria-sort={c.sortable === false ? undefined
                 : sort?.field === String(c.field)
                   ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            {c.headerRender ? c.headerRender() : c.sortable === false ? c.title : (
              <button type="button" className="vy-minitable-sort"
                      data-sorted={sort?.field === String(c.field) ? sort.dir : undefined}
                      onClick={() => toggle(String(c.field))}>
                <span>{c.title}</span>
                {sort?.field === String(c.field) && (
                  <span aria-hidden>{sort.dir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <div role="rowgroup">
        {rows.map(row => (
          <div key={row.id} className="vy-minitable-row" role="row"
               data-tone={rowTone?.(row)} style={{ gridTemplateColumns: template }}>
            {columns.map((c, i) => (
              <div key={c.field} role="cell" className="vy-td" data-role={c.role}
                   data-tone={c.tone?.(row)} data-stick={i < freeze || undefined} style={stick(i)}>
                {renderCell(c, row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
