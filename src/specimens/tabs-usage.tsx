import { useState, type ReactNode } from 'react';
import { Tabs } from '../ui/Overlays';
import { SectionHeading } from '../ui/Group';
import type { Example } from './types';

type Tab = { value: string; label: string; content: ReactNode };

function Strip({ set, initial }: { set: Tab[]; initial: string }) {
  const [v, setV] = useState(initial);
  return <Tabs tabs={set} value={v} onValueChange={setV} />;
}

const PEERS: Tab[] = [
  { value: 'req', label: 'Specific Requirements', content: <p>Requirements for this record.</p> },
  { value: 'check', label: 'Checklists', content: <p>Three checklists are open.</p> },
  { value: 'act', label: 'Activity Logs', content: <p>Everything that changed, newest first.</p> },
];

const ORDERED: Tab[] = [
  { value: '1', label: '1. Choose an action', content: <p>Pick what this run should do.</p> },
  { value: '2', label: '2. Configure the BoM', content: <p>Map the lines.</p> },
  { value: '3', label: '3. Review', content: <p>Check before running.</p> },
];

/**
 * The Tabs page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/tabs.md`. The first is the one this product
 * gets wrong most easily, because a wizard and a tab strip are the same row
 * of words until you read what the words say.
 */
export const examples: Example[] = [
  {
    title: 'Peers, not steps',
    note: 'A tab strip says “these are the same kind of thing, pick one”. A job with an order is a wizard.',
    compare: [
      {
        verdict: 'do',
        caption: 'Three views of one record. Any of them can be first, and leaving one unread costs nothing.',
        render: () => <Strip set={PEERS} initial="req" />,
      },
      {
        verdict: 'dont',
        caption: 'Numbered tabs let the user open step 3 before step 1, and the strip cannot say the third is not ready.',
        render: () => <Strip set={ORDERED} initial="1" />,
      },
    ],
  },
  {
    title: 'Not for two short sections',
    note: 'A tab that hides four lines costs a click to save nothing.',
    compare: [
      {
        verdict: 'do',
        caption: 'Both on the page, stacked. The reader sees everything there is without choosing.',
        render: () => (
          <div>
            <SectionHeading>Shipping</SectionHeading>
            <p>DDP · Hanoi warehouse</p>
            <SectionHeading>Terms</SectionHeading>
            <p>Net 30, from the invoice date.</p>
          </div>
        ),
      },
      {
        verdict: 'dont',
        caption: 'One line hidden behind a tab, and the reader has to press to find out it was one line.',
        render: () => (
          <Strip initial="ship" set={[
            { value: 'ship', label: 'Shipping', content: <p>DDP · Hanoi warehouse</p> },
            { value: 'terms', label: 'Terms', content: <p>Net 30, from the invoice date.</p> },
          ]} />
        ),
      },
    ],
  },
];
