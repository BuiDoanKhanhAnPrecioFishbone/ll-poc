import { useState } from 'react';
import { ColumnChooser } from '../ui/ColumnChooser';
import { Button } from '../ui/Button';
import { COLUMNS } from './fixtures/grid-satellites';
import type { Example } from './types';

function Chooser() {
  const [cols, setCols] = useState(COLUMNS);
  return (
    <ColumnChooser
      columns={cols} hiddenCount={cols.filter(c => !c.on).length}
      onToggle={f => setCols(cs => cs.map(c => (c.field === f && !c.required ? { ...c, on: !c.on } : c)))}
      onReset={() => setCols(COLUMNS)}
    />
  );
}

/**
 * The Column chooser page's USAGE tab, drawn.
 *
 * One pair, and it is a BEFORE and AFTER rather than a right and wrong: the
 * control this replaced shipped, and the 25 August review asked for the
 * change. Three faults were named and only one of them was the wording, so
 * the two drawn side by side are worth more than the sentence that lists
 * them.
 *
 * The page's other rules — a chooser is one person's view, a View is shared;
 * order comes from the grid definition — are about ownership and cannot be
 * drawn: the two screens look the same and differ in who they belong to.
 */
export const examples: Example[] = [
  {
    title: 'A checklist, not a count',
    note: 'What it replaced was a button reading “Show 2 more columns”. The review asked for a checklist; three things were wrong and only one was the label.',
    compare: [
      {
        verdict: 'do',
        caption: 'Every column is listed, on or off, with the two that cannot be hidden saying why. Open it and you learn what the grid can show.',
        render: () => <Chooser />,
      },
      {
        verdict: 'dont',
        caption: 'The count names its effect on one state, so the control reads differently depending on what is already on — and it hides the existence of the columns behind a number. Drawn by hand: this is what shipped before 25 August.',
        render: () => <Button size="sm">Show 2 more columns</Button>,
      },
    ],
  },
];
