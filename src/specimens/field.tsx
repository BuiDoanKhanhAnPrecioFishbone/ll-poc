import { useState } from 'react';
import { SearchField, TextArea, TextField } from '../ui/Field';
import type { Example } from './types';

function Text() {
  const [v, setV] = useState('');
  return (
    <>
      <TextField label="Part Number" placeholder="00455-" value={v}
                 onChange={e => setV(e.target.value)} hint="Prefixed by the customer." />
      <TextField label="Description" required defaultValue="Resistor, 10k" />
    </>
  );
}

function Prose() {
  const [v, setV] = useState('');
  return <TextArea label="Notes" rows={3} value={v} onChange={e => setV(e.target.value)} />;
}

function Search() {
  const [v, setV] = useState('');
  return <SearchField aria-label="Search parts" placeholder="Search parts" value={v}
                      onChange={e => setV(e.target.value)} />;
}

export const examples: Example[] = [
  {
    title: 'TextField',
    note: 'One line of typed text. The label sits above and the hint below.',
    render: () => <Text />,
  },
  {
    title: 'TextArea',
    note: 'Prose the user writes.',
    render: () => <Prose />,
  },
  {
    title: 'SearchField',
    note: 'No label: the icon and placeholder carry it.',
    render: () => <Search />,
  },
  {
    title: 'Disabled',
    render: () => <TextField label="Part Number" value="00455-387-9552" disabled readOnly />,
  },
];
