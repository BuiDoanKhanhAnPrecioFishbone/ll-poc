import { useState } from 'react';
import { Stepper } from '../ui/Stepper';
import type { Example } from './types';

const RUN = [
  { label: 'Action', text: 'What this run should do.' },
  { label: 'Config BoM', text: 'Map the columns.' },
  { label: 'Quoting', text: 'Price every line.' },
  { label: 'Summary', text: 'Check before you commit.' },
];

function Run({ furthest, start = 1, steps = RUN }: { furthest: number; start?: number; steps?: typeof RUN }) {
  const [i, setI] = useState(start);
  return <Stepper steps={steps} value={i} furthest={furthest} onChange={setI} showText={false} />;
}

/**
 * The Stepper page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/stepper.md`. The first is the one that can
 * only be shown by pressing: both cards are live, and the "Don't" card really
 * does let you land on Summary before a BoM exists.
 */
export const examples: Example[] = [
  {
    title: 'Back, yes. Ahead, no.',
    note: 'Forward movement is bounded by `furthest`, the highest step reached. Free movement across work already done.',
    compare: [
      {
        verdict: 'do',
        caption: 'Press step 1: it goes straight back to the column you mis-mapped. Steps 3 and 4 are not offered, because their inputs do not exist yet.',
        render: () => <Run furthest={1} />,
      },
      {
        verdict: 'dont',
        caption: 'Press Summary. It lands, with no BoM uploaded — a stepper that offers a dead end teaches the user to distrust the whole row.',
        render: () => <Run furthest={3} />,
      },
    ],
  },
  {
    title: 'Not over two steps',
    note: 'A stepper is navigation. Over two steps there is nothing to navigate.',
    compare: [
      {
        verdict: 'do',
        caption: 'Four steps with a real order, and a place the user can be lost in without it.',
        render: () => <Run furthest={1} />,
      },
      {
        verdict: 'dont',
        caption: 'Two steps is a label that costs a row of the page. Two screens, or one, say the same thing.',
        render: () => <Run furthest={1} start={0} steps={RUN.slice(0, 2)} />,
      },
    ],
  },
];
