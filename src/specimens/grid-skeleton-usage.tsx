import { GridSkeleton } from '../ui/GridSkeleton';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Row = { id: number; part: string; desc: string; due: string; price: number; status: string };

const REAL: ColumnSpec<Row>[] = [
  { field: 'part', title: 'Part Number', role: 'ident' },
  { field: 'desc', title: 'Description', role: 'text' },
  { field: 'due', title: 'Due', role: 'date' },
  { field: 'price', title: 'Unit Price', role: 'money' },
  { field: 'status', title: 'Status', role: 'status' },
];

/**
 * The Grid skeleton page's USAGE tab, drawn.
 *
 * One pair, on the thing that separates this component from a row of grey
 * bars: it takes the REAL `ColumnSpec[]` and proportions each cell by the
 * column's role, so the placeholder is the same shape of table that is
 * coming. The claim is impossible to assess in prose and obvious in a
 * picture.
 *
 * Its other rules — not over rows already on screen, not for an empty list,
 * not for a failed load — are drawn on the [loader](loader-usage.tsx) and
 * [error state](error-state-usage.tsx) cards, from the side where the right
 * answer lives.
 */
export const examples: Example[] = [
  {
    title: 'The shape of the table that is coming',
    note: 'It is built from the grid’s own columns, so an ident cell is wide and a money cell is narrow before any data exists.',
    compare: [
      {
        verdict: 'do',
        caption: 'Five columns in their real proportions. When the rows land, nothing moves.',
        render: () => <GridSkeleton columns={REAL} rows={5} />,
      },
      {
        verdict: 'dont',
        caption: 'Equal bars promise a table that is not coming, and the page jumps the moment it does. Drawn by hand — the component reads the columns and cannot do this.',
        render: () => (
          <div className="vy-skeleton" aria-hidden style={{ width: '100%' }}>
            {Array.from({ length: 5 }, (_, r) => (
              <div className="vy-skeleton-row" key={r}>
                {Array.from({ length: 5 }, (_, c) => (
                  <span className="vy-skeleton-cell" key={c} style={{ flex: '1 1 0' }} />
                ))}
              </div>
            ))}
          </div>
        ),
      },
    ],
  },
];
