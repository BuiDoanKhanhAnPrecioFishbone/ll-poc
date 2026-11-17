import { useState } from 'react';
import { ColumnChooser } from '../ui/ColumnChooser';
import { ChooserDemo, COLUMNS } from './fixtures/grid-satellites';
import type { Example } from './types';

/* The real Quotation list: 6 of 11 columns cannot be turned off. The point of
   showing it is that it changes what the control IS — a chooser where most
   rows are fixed reads closer to an inventory of the screen. */
const MOSTLY_FIXED = [
  { field: 'no',       title: 'Quotation No', on: true, required: true, note: 'Identifies the row' },
  { field: 'customer', title: 'Customer',     on: true, required: true },
  { field: 'status',   title: 'Status',       on: true, required: true },
  { field: 'owner',    title: 'Owner',        on: true, required: true },
  { field: 'due',      title: 'Due Date',     on: true, required: true },
  { field: 'total',    title: 'Total',        on: true, required: true },
  { field: 'terms',    title: 'Terms',        on: true },
  { field: 'incoterm', title: 'Incoterm',     on: false },
  { field: 'rev',      title: 'Rev',          on: false },
  { field: 'site',     title: 'Site',         on: false },
  { field: 'created',  title: 'Created',      on: true },
];

function MostlyFixed() {
  const [cols, setCols] = useState(MOSTLY_FIXED);
  return (
    <ColumnChooser
      columns={cols} hiddenCount={cols.filter(c => !c.on).length}
      onToggle={f => setCols(cs => cs.map(c => (c.field === f && !c.required ? { ...c, on: !c.on } : c)))}
      onReset={() => setCols(MOSTLY_FIXED)}
    />
  );
}

export const examples: Example[] = [
  {
    title: 'The chooser',
    note: `Open it and untick something. Two of these ${COLUMNS.length} are required and cannot be turned off.`,
    render: () => <ChooserDemo />,
  },
  {
    title: 'When most of it is fixed',
    note: 'The real Quotation list: 6 of 11 required. Worth seeing, because it changes what the control is — a chooser where most rows cannot move reads closer to an inventory of the screen than to a choice, and that is an argument for requiring fewer of them rather than for redrawing this.',
    render: () => <MostlyFixed />,
  },
];
