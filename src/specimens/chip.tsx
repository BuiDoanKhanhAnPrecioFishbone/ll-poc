import { useState } from 'react';
import { Chip } from '../ui/Chip';
import type { Example } from './types';

function Toggle({ label, start = false }: { label: string; start?: boolean }) {
  const [on, setOn] = useState(start);
  return <Chip label={label} selected={on} onClick={() => setOn(v => !v)} />;
}

export const examples: Example[] = [
  {
    title: 'Selected and unselected',
    note: 'Selected is a tonal fill, a blue border and a leading check together, so it survives greyscale.',
    render: () => (
      <>
        <Chip label="My queue" selected />
        <Chip label="All quotations" />
      </>
    ),
  },
  {
    title: 'Toggle it',
    note: 'A chip you cannot select is a picture. Click or press Space; the check appears and aria-pressed follows.',
    render: () => (
      <>
        <Toggle label="My queue" start />
        <Toggle label="Acme Corp" start />
        <Toggle label="Overdue" />
      </>
    ),
  },
];
