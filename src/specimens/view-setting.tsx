import { useState } from 'react';
import { ViewSetting } from '../ui/ViewSetting';
import { Button } from '../ui/Button';
import type { ColumnSpec } from '../components/column-model';
import type { SavedView } from '../ui/views';
import { FIELDS } from './fixtures/grid-satellites';
import type { Example } from './types';

type Row = { id: number; part: string; desc: string; status: string };

const ALL_COLUMNS: ColumnSpec<Row>[] = [
  { field: 'part',   title: 'Part Number', role: 'ident' },
  { field: 'desc',   title: 'Description', role: 'text' },
  { field: 'status', title: 'Status',      role: 'status' },
];

const BASE: SavedView = {
  id: 'mine', name: 'My open RFQs', isDefault: false,
  values: { status: 'In Progress' },
  columns: [{ field: 'part' }, { field: 'desc' }, { field: 'status' }],
  sort: [{ field: 'part', dir: 'asc' }],
};

function Live({ view, canDelete }: { view: SavedView; canDelete: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>Setup View Template</Button>
      {open && (
        <ViewSetting
          view={view} screen="Request For Quotation"
          allColumns={ALL_COLUMNS} allFields={FIELDS}
          canDelete={canDelete}
          onSave={() => setOpen(false)}
          onDiscard={() => setOpen(false)}
          onDelete={() => setOpen(false)}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export const examples: Example[] = [
  {
    title: 'A view the user owns',
    note: 'Three tabs. Filter holds VALUES, not a list of controls — a view is a saved question, and the answer to a question is values.',
    render: () => <Live view={BASE} canDelete />,
  },
  {
    title: 'A built-in view',
    note: 'Save can only create here, so "save as new" is ticked from the start and Delete is gone — you cannot overwrite a view the system ships.',
    render: () => <Live view={{ ...BASE, id: 'all', name: 'All Quotations', system: true, isDefault: true }} canDelete={false} />,
  },
];
