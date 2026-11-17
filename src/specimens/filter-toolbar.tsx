import { ToolbarDemo } from './fixtures/grid-satellites';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'Filtering',
    note: 'One field per condition, and no operators — this is the shape the live screen has, not a query builder.',
    render: () => <ToolbarDemo />,
  },
  {
    title: 'With the way out',
    note: 'A user who wants a field that is not here has no way to guess the answer lives behind a button called "Setup View Template". The link goes from where the problem is noticed to where it is fixed.',
    render: () => <ToolbarDemo withLink />,
  },
];
