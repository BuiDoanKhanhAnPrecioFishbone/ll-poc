/* Fixtures for the grid toolbar's four controls — not a specimen.
   It lives under `fixtures/` because the registry globs `./*.tsx` and
   `ds-site.mjs` reads the same directory: a file here with no `examples`
   export is a slug that looks real and renders nothing. One directory down,
   neither can see it. */
import { useState } from 'react';
import { ColumnChooser } from '../../ui/ColumnChooser';
import { FilterToolbar } from '../../ui/FilterToolbar';
import { ViewPicker } from '../../ui/ViewPicker';
import type { FilterValues, SavedView, ViewField } from '../../ui/views';

export const COLUMNS = [
  { field: 'part',   title: 'Part Number', on: true,  required: true, note: 'Identifies the row' },
  { field: 'desc',   title: 'Description', on: true },
  { field: 'qty',    title: 'Qty',         on: true },
  { field: 'price',  title: 'Unit Price',  on: false },
  { field: 'status', title: 'Status',      on: true,  required: true },
  { field: 'buyer',  title: 'Buyer',       on: false },
];

export const VIEWS: SavedView[] = [
  { id: 'all',     name: 'All Quotations', isDefault: true,  system: true, values: {}, columns: [], sort: [] },
  { id: 'mine',    name: 'My open RFQs',   isDefault: false, values: {}, columns: [], sort: [] },
  { id: 'overdue', name: 'Overdue',        isDefault: false, values: {}, columns: [], sort: [] },
];

export const FIELDS: ViewField<Record<string, unknown>>[] = [
  { field: 'status',   label: 'Status',   kind: 'select', options: ['New', 'In Progress', 'Quoted', 'On Hold'], value: r => String(r.status ?? '') },
  { field: 'customer', label: 'Customer', kind: 'select', options: ['Cerelogic', 'Apple', 'Nordic AB'], value: r => String(r.customer ?? '') },
  { field: 'due',      label: 'Due Date', kind: 'date-range', value: () => null },
];

export function ChooserDemo({ hidden = 2 }: { hidden?: number }) {
  const [cols, setCols] = useState(COLUMNS);
  const off = cols.filter(c => !c.on).length;
  return (
    <ColumnChooser
      columns={cols} hiddenCount={hidden ? off : off}
      onToggle={f => setCols(cs => cs.map(c => (c.field === f && !c.required ? { ...c, on: !c.on } : c)))}
      onReset={() => setCols(COLUMNS)}
    />
  );
}

export function PickerDemo() {
  const [id, setId] = useState('all');
  return <ViewPicker views={VIEWS} activeId={id} onChange={setId} />;
}

export function ToolbarDemo({ withLink }: { withLink?: boolean }) {
  const [values, setValues] = useState<FilterValues>({ status: 'In Progress' });
  const active = Object.values(values).filter(Boolean).length;
  return (
    <FilterToolbar
      fields={FIELDS} values={values} onChange={setValues}
      onClear={() => setValues({})} activeCount={active}
      onEditFields={withLink ? () => {} : undefined}
    />
  );
}
