import { BusyOverlay, Loader } from '../ui/Loader';
import { GridSkeleton } from '../ui/GridSkeleton';
import { MiniTable } from '../ui/MiniTable';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Line = { id: number; part: string; qty: number; price: number };

const COLS: ColumnSpec<Line>[] = [
  { field: 'part', title: 'Part', role: 'ident' },
  { field: 'qty', title: 'Qty', role: 'number' },
  { field: 'price', title: 'Unit Price', role: 'money' },
];

const LINES: Line[] = [
  { id: 1, part: '0455-300-0017-11', qty: 120, price: 1.24 },
  { id: 2, part: '0455-118-2240-02', qty: 240, price: 0.4712 },
  { id: 3, part: '0455-882-1100-01', qty: 12, price: 14.2 },
];

/**
 * The Loader page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/loader.md`, and the first is the one this
 * system keeps having to re-argue: a skeleton answers *"what will this look
 * like?"*, and once the user has seen rows, that question is answered.
 */
export const examples: Example[] = [
  {
    title: 'First load is a skeleton',
    note: 'Nothing is on screen yet, so the shape of what is coming is the useful thing to show.',
    compare: [
      {
        verdict: 'do',
        caption: 'The columns are already in place, so the page does not jump when the rows land.',
        render: () => <GridSkeleton columns={COLS} rows={4} />,
      },
      {
        verdict: 'dont',
        caption: 'A spinner in an empty box says only that something is happening, and the layout arrives all at once underneath it.',
        render: () => (
          <div style={{ display: 'grid', placeItems: 'center', minHeight: 160, width: '100%' }}>
            <Loader type="converging-spinner" label="Loading quotations" />
          </div>
        ),
      },
    ],
  },
  {
    title: 'A reload keeps the data',
    note: 'Work over data already on screen dims it and puts an indicator on top. Never swap back to a skeleton.',
    compare: [
      {
        verdict: 'do',
        caption: 'The rows stay readable underneath. The user can see what is being re-priced while it happens.',
        render: () => (
          <BusyOverlay busy label="Re-pricing 3 lines">
            <MiniTable columns={COLS} data={LINES} filterable={false} />
          </BusyOverlay>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Back to a skeleton and the answer the user already had is taken away — they watch grey bars where their numbers were.',
        render: () => <GridSkeleton columns={COLS} rows={3} />,
      },
    ],
  },
];
