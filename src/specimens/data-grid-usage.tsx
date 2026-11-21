import { useState } from 'react';
import { DataGrid } from '../ui/DataGrid';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Line = { id: number; part: string; qty: number; price: number };

const LINES: Line[] = [
  { id: 1, part: '0455-300-0017-11', qty: 120, price: 1.24 },
  { id: 2, part: '0455-300-0017-12', qty: 80, price: 1.31 },
  { id: 3, part: '0455-118-2240-02', qty: 240, price: 0.4712 },
  { id: 4, part: '0455-300-0019-04', qty: 36, price: 8.9 },
];

/* TWO COLUMNS, not three. A card is about 430px wide on the published page
   and this grid's roles are 240 + 104 + 124, so the money column sat outside
   the card and a caption that pointed at it was pointing off-screen. The
   states moved onto the columns that fit. Measured 21 Nov. */
const PLAIN: ColumnSpec<Line>[] = [
  { field: 'part', title: 'Part Number', role: 'ident' },
  { field: 'qty', title: 'Qty', role: 'number' },
];

/* The same three columns, now saying what each cell is. One `cellState` per
   column, read off the row — which is the whole API. */
const STATEFUL: ColumnSpec<Line>[] = [
  { field: 'part', title: 'Part Number', role: 'ident', valueRequired: true,
    cellState: r => (r.id === 4 ? 'error' : r.id === 1 ? 'warning' : undefined) },
  { field: 'qty', title: 'Qty', role: 'number', valueRequired: true,
    cellState: r => (r.id === 2 ? 'changed' : undefined) },
];

const REQUIRED_ONLY: ColumnSpec<Line>[] = PLAIN.map(c => ({ ...c, valueRequired: true }));

function Grid({ columns }: { columns: ColumnSpec<Line>[] }) {
  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  return (
    <DataGrid title="Quotation Lines" data={LINES} columns={columns}
              selected={selected} onSelectedChange={setSelected} />
  );
}

/**
 * The Data grid page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/data-grid.md`, both of them things a COLUMN
 * declares. Drawing them is the only way to show what declaring them buys,
 * because the grid that says nothing about its cells is a perfectly ordinary
 * grid — which is exactly the problem.
 *
 * The page's "when not to use" rules are drawn on the
 * [mini table](mini-table-usage.tsx) cards instead of again here: a fact
 * sheet in a grid's clothes is one mistake, and one pair of cards is enough
 * for it.
 */
export const examples: Example[] = [
  {
    title: 'A column says what its cells are',
    note: 'The column declares how to read a state off a row — `cellState: row => "warning"` — and the stylesheet draws it, mark and all.',
    compare: [
      {
        verdict: 'do',
        caption: 'The changed quantity, the line to check and the one in error are all visible without reading a single number.',
        render: () => <Grid columns={STATEFUL} />,
      },
      {
        verdict: 'dont',
        caption: 'The same four rows with nothing declared. The row in error looks exactly like the three that are fine, and the only way to find it is to know already.',
        render: () => <Grid columns={PLAIN} />,
      },
    ],
  },
  {
    title: 'A required column is marked',
    note: '`valueRequired` draws her red * after the header name. Not `required`, which already means the Column tab refuses to hide it.',
    compare: [
      {
        verdict: 'do',
        caption: 'Part Number and Qty must be filled, and the header says so before anyone types.',
        render: () => <Grid columns={REQUIRED_ONLY} />,
      },
      {
        verdict: 'dont',
        caption: 'Nothing marked. The user finds out which columns were compulsory when the save fails.',
        render: () => <Grid columns={PLAIN} />,
      },
    ],
  },
];
