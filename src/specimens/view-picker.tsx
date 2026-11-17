import { useState } from 'react';
import { ViewPicker } from '../ui/ViewPicker';
import { PickerDemo } from './fixtures/grid-satellites';
import type { SavedView } from '../ui/views';
import type { Example } from './types';

/* TWO VIEWS WITH ONE NAME, which is legal: a view name is user-typed and
   nothing checks it for uniqueness. This is the case the component is keyed
   for, and the one a label-keyed picker gets wrong — pick the second and the
   first would come back. */
const CLASHING: SavedView[] = [
  { id: 'v1', name: 'My view', isDefault: true,  values: {}, columns: [], sort: [] },
  { id: 'v2', name: 'My view', isDefault: false, values: {}, columns: [], sort: [] },
  { id: 'v3', name: 'Overdue', isDefault: false, values: {}, columns: [], sort: [] },
];

function Clash() {
  const [id, setId] = useState('v2');
  return (
    <div className="vy-specimen-stack">
      <ViewPicker views={CLASHING} activeId={id} onChange={setId} />
      <p className="vy-field-hint">Chosen id: <code>{id}</code></p>
    </div>
  );
}

export const examples: Example[] = [
  {
    title: 'Saved views',
    note: 'Keyed by id, never by name.',
    render: () => <PickerDemo />,
  },
  {
    title: 'Two views that share a name',
    note: 'Legal, because a view name is user-typed and nothing checks it. Pick the second "My view" and watch the id: a picker keyed on the label would hand back the first one and make the second unreachable. This is the bug the plain <select> it replaced did not have.',
    render: () => <Clash />,
  },
];
