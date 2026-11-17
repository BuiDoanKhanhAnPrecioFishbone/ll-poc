import { useState } from 'react';
import { Tabs } from '../ui/Overlays';
import type { Example } from './types';

const tabs = [
  { value: 'requirements', label: 'Specific Requirements', content: <p>Requirements for this record.</p> },
  { value: 'checklists', label: 'Checklists', count: 3, content: <p>Three checklists are open.</p> },
  { value: 'activity', label: 'Activity Logs', content: <p>Everything that changed, newest first.</p> },
];

function Controlled({ initial, set = tabs }: { initial: string; set?: typeof tabs }) {
  const [value, setValue] = useState(initial);
  return <Tabs tabs={set} value={value} onValueChange={setValue} />;
}

/* One tab holds a field the user must fix. Her marker, 16 Nov 2026. */
const withError = [
  tabs[0],
  { ...tabs[1], error: true },
  tabs[2],
];

const many = [
  ...tabs,
  { value: 'files', label: 'Files', count: 7, content: <p>Attachments.</p> },
  { value: 'costs', label: 'Cost Estimation', content: <p>Rolled-up cost.</p> },
  { value: 'audit', label: 'Audit', content: <p>Who changed what.</p> },
];

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
  {
    title: 'A tab with something to fix',
    note: 'The BA’s red * after the name, and the name KEEPS its colour. A whole red tab would say the tab is broken; what is true is that a field inside it is, and the reader still has to be able to tell which tab.',
    render: () => <Controlled initial="requirements" set={withError} />,
  },
  {
    title: 'The active tab is heavier, not just underlined',
    note: 'Her weights — 500 for a tab, 600 for the active one. Until 17 Nov 2026 both were 400 here and the only thing marking the active tab was a 3px line, which is the first thing a low-contrast screen loses.',
    render: () => <Controlled initial="activity" set={many} />,
  },
];
