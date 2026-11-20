import { useState } from 'react';
import { FilterToolbar } from '../ui/FilterToolbar';
import { Select } from '../ui/Overlays';
import { TextField } from '../ui/Field';
import { Button } from '../ui/Button';
import { FIELDS, ToolbarDemo } from './fixtures/grid-satellites';
import type { FilterValues } from '../ui/views';
import type { Example } from './types';

function OneField() {
  const [values, setValues] = useState<FilterValues>({ status: 'In Progress' });
  return (
    <FilterToolbar
      fields={FIELDS.slice(0, 1)} values={values} onChange={setValues}
      onClear={() => setValues({})}
      activeCount={Object.values(values).filter(Boolean).length}
    />
  );
}

/* The condition builder that was here before the live bundle was read. It is
   drawn by hand because the component cannot produce it — which is the point:
   it was never a variant of this control, it was a different control that got
   built on an assumption. */
function Builder() {
  const [field, setField] = useState('Status');
  const [op, setOp] = useState('is not');
  return (
    <div style={{ display: 'flex', gap: 'var(--vy-space-4)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <Select label="Field" options={['Status', 'Customer', 'Due Date']} value={field} onChange={setField} />
      <Select label="Operator" options={['is', 'is not', 'contains', 'between']} value={op} onChange={setOp} />
      <TextField label="Value" defaultValue="In Progress" />
      <Button size="sm">+ Add condition</Button>
    </div>
  );
}

/**
 * The Filter toolbar page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/filter-toolbar.md`, and both of them are
 * things this control deliberately does NOT do. A missing feature is the
 * hardest thing to argue for in prose, because the reader has to imagine the
 * version that has it; here they can look at it.
 */
export const examples: Example[] = [
  {
    title: 'No operators',
    note: 'A field takes a value; a date takes an explicit From and To. The live screen has no operators at all.',
    compare: [
      {
        verdict: 'do',
        caption: 'Three fields, three values. A user who can read the screen can read the filter.',
        render: () => <ToolbarDemo />,
      },
      {
        verdict: 'dont',
        caption: 'The condition builder that was here before the live bundle was read. It was invented outright, and it asks the user to learn a query language to narrow a list.',
        render: () => <Builder />,
      },
    ],
  },
  {
    title: 'The way out is on the toolbar',
    note: 'The fields here are a property of the saved View. A user who wants one that is missing has no way to guess that the answer lives behind a button called Setup View Template.',
    compare: [
      {
        verdict: 'do',
        caption: 'Edit fields goes from where the problem is noticed to where it is fixed.',
        render: () => <ToolbarDemo withLink />,
      },
      {
        verdict: 'dont',
        caption: 'One field and no way on. The user filters by the only thing offered, or leaves.',
        render: () => <OneField />,
      },
    ],
  },
];
