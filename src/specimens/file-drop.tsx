import { useState } from 'react';
import { FileDrop } from '../ui/FileDrop';
import type { Example } from './types';

function Picked({ multiple, accept, hint }: { multiple?: boolean; accept?: string; hint?: string }) {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div>
      <FileDrop onPick={setNames} multiple={multiple} accept={accept} hint={hint} />
      <p>{names.length === 0 ? 'Nothing chosen.' : `Chosen: ${names.join(', ')}`}</p>
    </div>
  );
}

export const examples: Example[] = [
  {
    title: 'One file',
    note: 'Choose or drop a spreadsheet. Nothing is uploaded; the caller receives only the file name.',
    render: () => <Picked />,
  },
  {
    title: 'Several files, other types',
    note: 'Attachments on a part: several at once, with the accepted extensions and a hint of its own.',
    render: () => <Picked multiple accept=".pdf,.png" hint=".pdf or .png." />,
  },
];
