import { useState } from 'react';
import { DataGrid } from '../ui/DataGrid';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Line = {
  id: number; part: string; desc: string; qty: number; price: number; status: string;
};

const LINES: Line[] = [
  { id: 1, part: '0455-300-0017-11', desc: 'PCA iovrm_v11',    qty: 120, price: 1.24,   status: 'Quoted' },
  { id: 2, part: '0455-300-0017-12', desc: 'PCA iovrm_v12',    qty: 80,  price: 1.31,   status: 'In Progress' },
  { id: 3, part: '0455-118-2240-02', desc: 'Harness, 2.4m',    qty: 240, price: 0.4712, status: 'New' },
  { id: 4, part: '0455-300-0019-04', desc: 'PCA sensor board', qty: 36,  price: 8.9,    status: 'On Hold' },
  { id: 5, part: '0455-882-1100-01', desc: 'Enclosure, ABS',   qty: 12,  price: 14.2,   status: 'Completed' },
];

const COLUMNS: ColumnSpec<Line>[] = [
  { field: 'part',   title: 'Part Number', role: 'ident' },
  { field: 'desc',   title: 'Description', role: 'text' },
  { field: 'qty',    title: 'Qty',         role: 'number' },
  { field: 'price',  title: 'Unit Price',  role: 'money' },
  { field: 'status', title: 'Status',      role: 'status' },
];

/* The same five columns, now saying what each cell is. One `cellState` per
   column, read off the row — which is the whole API. */
const STATEFUL: ColumnSpec<Line>[] = [
  { field: 'part',  title: 'Part Number', role: 'ident', valueRequired: true,
    cellState: r => (r.id === 3 ? 'match' : r.id === 5 ? 'error' : undefined) },
  { field: 'desc',  title: 'Description', role: 'text',
    cellState: r => (r.id === 4 ? 'warning' : undefined) },
  { field: 'qty',   title: 'Qty', role: 'number', valueRequired: true,
    cellState: r => (r.id === 2 ? 'changed' : undefined) },
  { field: 'price', title: 'Unit Price', role: 'money',
    cellState: r => (r.id === 1 ? 'warning' : r.id === 5 ? 'loading' : undefined) },
  { field: 'status', title: 'Status', role: 'status' },
];

function Live() {
  /* A Set, not an array: `selected` is `ReadonlySet` and the grid calls
     `.has()` on it per row. An array type-checks nowhere near here — it fails
     at `selected.has is not a function` on first paint. */
  const [selected, setSelected] = useState<Set<string | number>>(() => new Set());
  return (
    <DataGrid
      title="Quotation Lines" data={LINES} columns={COLUMNS}
      subtitle="Five rows, enough to see a column role do its job"
      selected={selected} onSelectedChange={setSelected}
    />
  );
}

export const examples: Example[] = [
  {
    title: 'A grid',
    note: 'Every column takes its width from its ROLE, not from a number typed per screen: ident 240, text 280, number 104, money 124, status 128. Tick a row — selection is the caller’s state.',
    render: () => <Live />,
  },
  {
    title: 'Loading',
    note: 'The skeleton draws the same columns, so the page does not reflow when the data lands.',
    render: () => (
      <DataGrid title="Quotation Lines" data={[]} columns={COLUMNS} loading />
    ),
  },
  {
    title: 'Empty',
    note: 'The hint matters: "no records yet" over a filtered list is the misleading empty state this grid is built to avoid.',
    render: () => (
      <DataGrid title="Quotation Lines" data={[]} columns={COLUMNS}
                emptyHint="No lines on this quotation yet." />
    ),
  },
  {
    title: 'What a cell can say about itself',
    note: 'Her six cell states. The mark is not decoration — a yellow fill and a yellow ink are both lost to greyscale, and the triangle and the octagon are what survive. Which edge it sits on follows the alignment, so it never lands between the eye and a number.',
    render: () => (
      <DataGrid title="Quotation Lines" data={LINES} columns={STATEFUL}
                subtitle="Changed · warning · error · system match · loading, and two required columns" />
    ),
  },
  {
    title: 'A focused line',
    note: 'Tab into the grid. The tint alone would be 1.12:1 against the hover fill — the 3px bar down the left is what makes it a focus indicator rather than a second hover.',
    render: () => (
      <DataGrid title="Quotation Lines" data={LINES} columns={COLUMNS} />
    ),
  },
];