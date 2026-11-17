import { useState } from 'react';
import { YesNoField } from '../ui/Inputs';
import type { Example } from './types';

function Live() {
  const [itar, setItar] = useState(false);
  const [rohs, setRohs] = useState(true);
  return (
    <>
      <YesNoField label="ITAR" words={{ on: 'Required', off: 'Not required' }}
                  value={itar} onChange={setItar} />
      <YesNoField label="RoHS" words={{ on: 'Compliant', off: 'Not compliant' }}
                  value={rohs} onChange={setRohs} />
    </>
  );
}

function Changed() {
  const saved = false;
  const [v, setV] = useState(true);
  return <YesNoField label="ITAR" words={{ on: 'Required', off: 'Not required' }}
                     value={v} onChange={setV} changed={v !== saved} />;
}

export const examples: Example[] = [
  {
    title: 'Two fields, four words',
    note: 'The words belong to the field, never to the control — ITAR is Required or Not required, and nothing here ever says "yes".',
    render: () => <Live />,
  },
  {
    title: 'View mode',
    note: 'The grey value box, carrying the same box and the same word, so the two states of the field read as one thing.',
    render: () => (
      <YesNoField label="ITAR" words={{ on: 'Required', off: 'Not required' }}
                  value readOnly onChange={() => {}} />
    ),
  },
  {
    title: 'Changed',
    note: 'The brand border, like any changed field. Click it back and it goes.',
    render: () => <Changed />,
  },
  {
    title: 'Disabled',
    render: () => (
      <YesNoField label="ITAR" words={{ on: 'Required', off: 'Not required' }}
                  value disabled onChange={() => {}} />
    ),
  },
];
