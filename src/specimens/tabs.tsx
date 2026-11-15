import { useState } from 'react';
import { Tabs } from '../ui/Overlays';
import type { Example } from './types';

const tabs = [
  { value: 'requirements', label: 'Specific Requirements', content: <p>Requirements for this record.</p> },
  { value: 'checklists', label: 'Checklists', count: 3, content: <p>Three checklists are open.</p> },
  { value: 'activity', label: 'Activity Logs', content: <p>Everything that changed, newest first.</p> },
];

function Controlled({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return <Tabs tabs={tabs} value={value} onValueChange={setValue} />;
}

export const examples: Example[] = [
  {
    title: 'Sections of one record',
    note: 'Peers the user switches between without leaving the record. Use the arrow keys.',
    render: () => <Controlled initial="requirements" />,
  },
  {
    title: 'With a count',
    note: 'A count badge appears on a tab only when there is something in it.',
    render: () => <Controlled initial="checklists" />,
  },
];
