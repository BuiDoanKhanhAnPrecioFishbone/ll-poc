import { useState } from 'react';
import { Button } from '../ui/Button';
import { MoreMenu, type MoreItem } from '../ui/MoreMenu';
import { Select } from '../ui/Overlays';
import type { Example } from './types';

function PriorityValue() {
  const [v, setV] = useState('Medium');
  return <Select label="Priority" options={['High', 'Medium', 'Low']} value={v} onChange={setV} />;
}

const RARE: MoreItem[] = [
  { label: 'Confirm RFQ', note: 'Commits the quote to the customer.', onSelect: () => {} },
  { label: 'Cancel RFQ', note: 'Asks first. The RFQ stops being worked.', danger: true, onSelect: () => {} },
];

const EVERYTHING: MoreItem[] = [
  { label: 'Run Quotation', onSelect: () => {} },
  { label: 'Edit', onSelect: () => {} },
  { label: 'BoM Comparison', onSelect: () => {} },
  ...RARE,
];

const VALUES: MoreItem[] = [
  { label: 'Priority: High', onSelect: () => {} },
  { label: 'Priority: Medium', onSelect: () => {} },
  { label: 'Priority: Low', onSelect: () => {} },
];

/**
 * The More menu page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/more-menu.md`. The dividing line this
 * component exists to draw — frequency and consequence, not category — only
 * shows when both halves of the bar are on screen at once.
 */
export const examples: Example[] = [
  {
    title: 'Rare, heavy or destructive',
    note: 'A menu is a second press, and the work of the day should not cost one.',
    compare: [
      {
        verdict: 'do',
        caption: 'The three things an estimator does all day are on the bar. Confirm and Cancel are behind the menu, where a mis-aimed click cannot reach them.',
        render: () => (
          <>
            <Button variant="filled">Run Quotation</Button>
            <Button>Edit</Button>
            <Button>BoM Comparison</Button>
            <MoreMenu items={RARE} />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Everything behind one word. The bar is tidy and every action now costs two presses, including the one pressed forty times a day.',
        render: () => <MoreMenu items={EVERYTHING} />,
      },
    ],
  },
  {
    title: 'A menu item does something',
    note: 'It does not set something. A choice that changes a value is a select or a chip.',
    compare: [
      {
        verdict: 'do',
        caption: 'A value the user can read without pressing anything, and change in one press.',
        render: () => <PriorityValue />,
      },
      {
        verdict: 'dont',
        /* The FIRST version of this card put a plain More menu on both sides,
           and both sides were a closed button reading "More" — the same card
           twice, which `dodont:check` caught on its first run. The label is
           what makes the mistake visible: a menu named after a field, holding
           that field's values. */
        caption: 'A menu named after a field, holding its values. It cannot show which is current, so the user opens it to find out and has to choose something to get out.',
        render: () => <MoreMenu items={VALUES} label="Priority" />,
      },
    ],
  },
];
