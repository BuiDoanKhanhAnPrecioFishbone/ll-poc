import type { ReactNode } from 'react';
import { widthOf, type ColumnSpec } from '../components/column-model';
import { renderCell } from './renderCell';

/**
 * Non-virtualised table for the short lists inside a record — documents,
 * quotation results, wizard line items. Same column-role model and the same
 * visual language as the main DataGrid, without the virtualiser: these lists
 * are tens of rows, not tens of thousands, and paying for virtualisation would
 * add machinery with nothing to gain.
 */
export function MiniTable<T extends { id: string | number }>({ data, columns, empty }: {
  data: T[]; columns: ColumnSpec<T>[]; empty?: ReactNode;
}) {
  if (data.length === 0 && empty) return <>{empty}</>;
  const template = columns.map(c => `${widthOf(c)}px`).join(' ');
  return (
    <div className="vy-minitable" role="table">
      <div className="vy-minitable-head" role="row" style={{ gridTemplateColumns: template }}>
        {columns.map(c => (
          <div key={c.field} role="columnheader" className="vy-th" data-role={c.role}>{c.title}</div>
        ))}
      </div>
      <div role="rowgroup">
        {data.map(row => (
          <div key={row.id} className="vy-minitable-row" role="row" style={{ gridTemplateColumns: template }}>
            {columns.map(c => (
              <div key={c.field} role="cell" className="vy-td" data-role={c.role}>
                {renderCell(c, row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
