import { type ColumnSpec } from '../components/column-model';

/**
 * Loading state for the standard list pattern.
 *
 * Skeleton cells are proportioned by column ROLE, so the placeholder reads as
 * the same shape of table that is coming — a wide identifier, a flexible text
 * column, narrow codes. They approximate rather than match exactly: the real
 * widths are numbers in the token layer, and reproducing them here would mean
 * an inline style per cell.
 *
 * The live system renders "No records available" while its spinner is still
 * running (audit finding T5) — telling the user there is no data during the one
 * moment data is on its way.
 */
export function GridSkeleton<T>({ columns, rows = 12 }: { columns: ColumnSpec<T>[]; rows?: number }) {
  return (
    <div className="vy-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="vy-sr-only">Loading records</span>
      {Array.from({ length: rows }, (_, r) => (
        <div className="vy-skeleton-row" key={r}>
          {columns.map(c => (
            <span key={c.field} className="vy-skeleton-cell" data-role={c.role} />
          ))}
        </div>
      ))}
    </div>
  );
}
