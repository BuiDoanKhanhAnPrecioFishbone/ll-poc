import { useState } from 'react';
import { Checkbox } from '../ui/Overlays';
import type { Example } from './types';

function Live() {
  const [on, setOn] = useState(true);
  return <Checkbox checked={on} onCheckedChange={setOn} label="Save as default" />;
}

export const examples: Example[] = [
  {
    title: 'On and off',
    note: 'Kendo’s checkbox element with our classes, not KendoReact’s component — the whole label is the target, which is what carries the 24px minimum.',
    render: () => (
      <>
        <Checkbox checked onCheckedChange={() => {}} label="Include inactive" />
        <Checkbox checked={false} onCheckedChange={() => {}} label="Franchised only" />
      </>
    ),
  },
  {
    title: 'Click it',
    note: 'Press the words, not just the box: the label is the control’s target and the reason this stays usable on a touch screen.',
    render: () => <Live />,
  },
  {
    title: 'Read-only',
    note: 'The BA’s "view and read-only: muted, not clickable". Added 17 Nov 2026 — her spec named the state and this component had no way to draw it, so a read-only checkbox was an ordinary one that quietly ignored clicks.',
    render: () => (
      <>
        <Checkbox checked disabled onCheckedChange={() => {}} label="ITAR controlled" />
        <Checkbox checked={false} disabled onCheckedChange={() => {}} label="Obsolete" />
      </>
    ),
  },
  {
    title: 'Error',
    note: 'Her red border. The box carries it; the label does not change colour, because the label is not what is wrong.',
    render: () => <Checkbox checked={false} invalid onCheckedChange={() => {}} label="I have checked the drawing" />,
  },
];
