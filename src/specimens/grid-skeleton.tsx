import { GridSkeleton } from '../ui/GridSkeleton';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Row = { id: number; number: string; name: string; status: string; owner: string; due: Date; total: number };

const columns: ColumnSpec<Row>[] = [
  { field: 'number', title: 'Number', role: 'ident' },
  { field: 'name', title: 'Name', role: 'text' },
  { field: 'status', title: 'Status', role: 'status' },
  { field: 'owner', title: 'Owner', role: 'text' },
  { field: 'due', title: 'Due', role: 'date' },
  { field: 'total', title: 'Total', role: 'money' },
];

export const examples: Example[] = [
  {
    title: 'The list while it loads',
    note: 'Cells are proportioned by column role, so the placeholder has the shape of the table that is coming.',
    render: () => <GridSkeleton columns={columns} rows={6} />,
  },
  {
    title: 'A narrower list',
    note: 'Fewer columns, fewer rows. The skeleton follows the column specs it is given.',
    render: () => <GridSkeleton columns={columns.slice(0, 3)} rows={4} />,
  },
];
