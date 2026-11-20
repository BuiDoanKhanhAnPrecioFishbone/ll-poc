import { useState } from 'react';
import { RadioGroup, Select } from '../ui/Overlays';
import type { Example } from './types';

const THREE = ['Consigned', 'Turnkey', 'Partial Turnkey'];

function Drop({ options, label }: { options: string[]; label: string }) {
  const [v, setV] = useState(options[0]);
  return <Select label={label} options={options} value={v} onChange={setV} />;
}

function Radios({ label }: { label: string }) {
  const [v, setV] = useState(THREE[0]);
  return (
    <RadioGroup label={label} value={v} onChange={setV}
                options={THREE.map(o => ({ value: o, label: o }))} />
  );
}

/**
 * The Select page's USAGE tab, drawn.
 *
 * One pair, because one of this page's four rules is about appearance and
 * three are about behaviour — a select holding a value that may not exist yet
 * looks exactly like one holding a value that does, and a card showing two
 * identical dropdowns teaches nothing.
 */
export const examples: Example[] = [
  {
    title: 'Three options are not a dropdown',
    note: 'A dropdown hides the choice until it is opened. Two or three options the user should see at once belong in a radio group.',
    compare: [
      {
        verdict: 'do',
        caption: 'All three readable before anything is pressed, which is what the extra height buys.',
        render: () => <Radios label="Customer Type" />,
      },
      {
        verdict: 'dont',
        caption: 'One line that hides three, and the reader has to open it to find out the choice was small.',
        render: () => <Drop label="Customer Type" options={THREE} />,
      },
    ],
  },
];
