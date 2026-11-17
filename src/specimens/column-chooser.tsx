import { ChooserDemo } from './fixtures/grid-satellites';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'The chooser',
    note: 'Open it and untick something. Two of these six columns are REQUIRED and cannot be turned off — on the real screen six of eleven are, which is why this reads closer to an inventory than to a choice.',
    render: () => <ChooserDemo />,
  },
];
