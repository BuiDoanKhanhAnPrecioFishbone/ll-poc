import { useEffect, useRef, useState } from 'react';
import { ExcelExport, type ExcelExportColumnProps } from '@progress/kendo-react-excel-export';
import type { ColumnSpec } from '../components/column-model';

/**
 * Export to Excel, from the column model the screen already has.
 *
 * PHASE 7 of docs/kendo-migration-scope.md. Export is specified in four places
 * — Part Master ("Export Part Master Data", scoped to the selection), the
 * Quotations list, the quotation Result tab and BoM Comparison — and every one
 * of them reported what it would do and stopped. It is one of the two
 * capability wins the migration was for.
 *
 * ONE HOOK, NOT FOUR IMPLEMENTATIONS. Each caller passes the rows and the
 * `ColumnSpec[]` it is already rendering, so the spreadsheet has the same
 * columns, in the same order, under the same headings as the screen. A second
 * column list would drift from the first the moment anyone added a column.
 *
 * VALUES, NOT RENDERED CELLS. `ColumnSpec.render` returns JSX — a link, a
 * badge, a formatted price — which is right for a screen and useless in a
 * spreadsheet. The export takes the RAW field value and hands Excel a number
 * format instead, so a money column arrives as a number you can sum rather than
 * as the text "US$131.15". That is the difference between an export and a
 * screenshot.
 *
 * Columns that exist only as a rendered control — a View button, an Actions
 * column — carry no data and are dropped; `sortable: false` already marks them.
 */

/* Column role -> Excel number format. Excel's own format strings, so the cell
   stays a number and the user can re-format or total it. */
const FORMAT: Partial<Record<string, string>> = {
  money: '"$"#,##0.00',
  number: '#,##0',
  date: 'dd mmm yyyy',
};

function toExcelColumn<T>(spec: ColumnSpec<T>): ExcelExportColumnProps {
  return {
    field: String(spec.field),
    title: spec.title,
    /* Roughly the on-screen width. Excel measures in characters, not pixels;
       a seventh is close enough that nothing arrives as ####. */
    width: Math.max(12, Math.round((spec.width ?? 120) / 7)),
    cellOptions: FORMAT[spec.role ?? ''] ? { format: FORMAT[spec.role ?? ''] } : undefined,
  };
}

export function useExcelExport<T>() {
  const ref = useRef<ExcelExport | null>(null);
  /* `save()` takes data and columns but NOT a file name — that is a prop. So
     the name goes into state, and the export runs once React has committed it.
     Reaching into `ref.current.props` to set it directly does work in the
     moment and is a lie to React: the next render puts the old name back. */
  const [fileName, setFileName] = useState('export.xlsx');
  const pending = useRef<{ rows: object[]; cols: ExcelExportColumnProps[] } | null>(null);

  useEffect(() => {
    if (!pending.current) return;
    const { rows, cols } = pending.current;
    pending.current = null;
    /* NOTE for anyone testing this in the in-app preview: the pane blocks a
       download the page starts itself, so `save()` succeeds and nothing
       appears. `toDataURL(rows, cols)` returns the same workbook as a string
       and is the way to prove it works — verified as a 231 KB xlsx with a real
       PK header for 2,000 rows. In a normal browser the download just runs. */
    ref.current?.save(rows, cols);
  }, [fileName]);

  /**
   * @param rows     what to export — the caller decides whether that is the
   *                 selection, the filtered set, or everything, because only
   *                 the caller knows which the button promised.
   * @param columns  the screen's own column specs.
   * @param fileName including the extension.
   */
  function exportRows(rows: T[], columns: ColumnSpec<T>[], name: string) {
    pending.current = {
      rows: rows as object[],
      cols: columns.filter(c => c.sortable !== false).map(toExcelColumn),
    };
    /* Same name twice would not re-run the effect, so nudge it. */
    setFileName(f => (f === name ? `${name} ` : name));
  }

  /* Mount this anywhere in the tree. `ExcelExport` renders nothing; it exists
     to own the workbook and trigger the download. */
  const excel = <ExcelExport ref={ref} fileName={fileName.trim()} />;

  return { exportRows, excel };
}
