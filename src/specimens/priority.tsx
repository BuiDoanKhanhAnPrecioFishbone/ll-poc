import { Priority } from '../ui/Priority';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'Three levels',
    note: 'A dot and a word. The record stores 1 to 3, and three is most urgent.',
    render: () => (
      <>
        <Priority value={3} />
        <Priority value={2} />
        <Priority value={1} />
      </>
    ),
  },
  {
    title: 'Why a word and not stars',
    note: 'Medium needs no scale and no counting; the dot keeps the colour for scanning a column.',
    render: () => (
      <>
        <Priority value={2} />
        <Priority value={3} />
      </>
    ),
  },
];
