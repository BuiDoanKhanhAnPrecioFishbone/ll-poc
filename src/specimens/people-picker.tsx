import { useState } from 'react';
import { PeoplePicker } from '../ui/PeoplePicker';
import type { Example } from './types';

function One() {
  const [v, setV] = useState<string[]>([]);
  return <PeoplePicker label="Assigned to" value={v} onChange={setV} />;
}

function Several() {
  const [v, setV] = useState<string[]>(['Adam Smith']);
  return <PeoplePicker label="Reviewers" value={v} onChange={setV} />;
}

export const examples: Example[] = [
  {
    title: 'Unassigned',
    note: 'Open it and type: the filter runs over the name AND the address, because someone who knows the email but not the spelling should not have to guess.',
    render: () => <One />,
  },
  {
    title: 'With someone chosen',
    note: 'Each person is a chip you can remove. Empty means unassigned — there is no "nobody" entry to pick.',
    render: () => <Several />,
  },
  {
    title: 'Invalid',
    render: () => <PeoplePicker label="Assigned to" value={[]} onChange={() => {}} invalid />,
  },
];
