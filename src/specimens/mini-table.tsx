import { MiniTable } from '../ui/MiniTable';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Row = { id: number; part: string; description: string; status: string; qty: number; price: number };

const columns: ColumnSpec<Row>[] = [
  { field: 'part', title: 'Part', role: 'ident' },
  { field: 'description', title: 'Description', role: 'text' },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'qty', title: 'Qty', role: 'number' },
  { field: 'price', title: 'Unit price', role: 'money' },
];

const four: Row[] = [
  { id: 1, part: 'SAMPLE-0001', description: 'Sample bracket', status: 'Active', qty: 120, price: 4.5 },
  { id: 2, part: 'SAMPLE-0002', description: 'Sample housing', status: 'Draft', qty: 40, price: 18.25 },
  { id: 3, part: 'SAMPLE-0003', description: 'Sample cable assembly', status: 'Released', qty: 300, price: 1.2 },
  { id: 4, part: 'SAMPLE-0004', description: 'Sample fastener', status: 'Obsolete', qty: 0, price: 0.05 },
];

const nine: Row[] = [
  ...four,
  ...Array.from({ length: 5 }, (_, i): Row => ({
    id: 5 + i, part: `SAMPLE-000${5 + i}`, description: `Sample item ${5 + i}`,
    status: i % 2 ? 'Draft' : 'Active', qty: 10 * (i + 1), price: 2.5 * (i + 1),
  })),
];

type Line = { id: number; line: string; mfg: string; mpn: string };
const lineColumns: ColumnSpec<Line>[] = [
  { field: 'line', title: 'Line', role: 'ident' },
  { field: 'mfg', title: 'Manufacturer', role: 'text' },
  { field: 'mpn', title: 'MPN', role: 'code' },
];
const lines: Line[] = [
  { id: 1, line: 'LINE-A', mfg: 'Maker One', mpn: 'M1-100' },
  { id: 2, line: '', mfg: 'Maker Two', mpn: 'M2-200' },
  { id: 3, line: 'LINE-B', mfg: 'Maker One', mpn: 'M1-300' },
];

export const examples: Example[] = [
  {
    title: 'A short list inside a record',
    note: 'Click a heading to sort: ascending, descending, then back to the original order. Four rows get no filter row.',
    render: () => <MiniTable data={four} columns={columns} />,
  },
  {
    title: 'Eight rows or more',
    note: 'Past eight rows the per-column filter cells appear, since there is now something to search.',
    render: () => <MiniTable data={nine} columns={columns} />,
  },
  {
    title: 'Child rows grouped under their record',
    note: 'One line with two manufacturers is two rows; sorting keeps the pair together.',
    render: () => (
      <MiniTable data={lines} columns={lineColumns}
                 rowGroup={{ key: r => (r.id === 2 ? 'LINE-A' : r.line), end: r => r.id !== 1 }} />
    ),
  },
  {
    title: 'Nothing to show',
    note: 'With no rows, the caller’s own empty state replaces the table.',
    render: () => <MiniTable data={[] as Row[]} columns={columns} empty={<p>No documents on this record yet.</p>} />,
  },
];
