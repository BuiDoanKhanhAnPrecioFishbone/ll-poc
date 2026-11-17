import { PickerDemo } from './fixtures/grid-satellites';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'Saved views',
    note: 'Keyed by id, never by name: two views may legitimately share a name, and keying on the label would make one of them unreachable.',
    render: () => <PickerDemo />,
  },
];
