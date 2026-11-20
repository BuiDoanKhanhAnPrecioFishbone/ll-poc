import { useState } from 'react';
import { PeoplePicker } from '../ui/PeoplePicker';
import { Select } from '../ui/Overlays';
import { PEOPLE_DIRECTORY } from '../data/quotations';
import type { Example } from './types';

function Picker({ start }: { start: string[] }) {
  const [v, setV] = useState<string[]>(start);
  return <PeoplePicker label="Assigned to" value={v} onChange={setV} />;
}

function Names() {
  const [v, setV] = useState(PEOPLE_DIRECTORY[0].name);
  return <Select label="Assigned to" options={PEOPLE_DIRECTORY.map(p => p.name)} value={v} onChange={setV} />;
}

/**
 * The People picker page's USAGE tab, drawn.
 *
 * One pair, on the thing this control replaced. Our Assigned To was a
 * single-value dropdown of bare names, which was wrong twice — one value
 * where the live system takes several, and a name where it shows a face and
 * an address. Both faults are in the "Don't" card, and the second one only
 * bites on a directory that holds *Linh 4 Tran*, *Linh Tran 5* and *Linh
 * Tran 1*, which the live one does.
 */
export const examples: Example[] = [
  {
    title: 'A face and an address',
    note: 'A directory of colleagues is precisely where names repeat, and the email is the line that tells two of them apart.',
    compare: [
      {
        verdict: 'do',
        caption: 'Open it: every row carries an avatar and an address, and the filter runs over both. Several people can hold the record at once.',
        render: () => <Picker start={['Adam Smith']} />,
      },
      {
        verdict: 'dont',
        caption: 'A dropdown of bare names takes one person and gives the reader nothing to tell two of the same name apart. This is what the control replaced.',
        render: () => <Names />,
      },
    ],
  },
];
