import { useState } from 'react';
import { MoreMenu } from '../ui/MoreMenu';
import type { Example } from './types';

function Demo({ withNotes }: { withNotes?: boolean }) {
  const [last, setLast] = useState('Nothing chosen yet.');
  return (
    <>
      <MoreMenu items={[
        { label: 'Confirm RFQ', onSelect: () => setLast('Confirm RFQ chosen.'),
          note: withNotes ? 'Sends it to the suppliers' : undefined },
        { label: 'Reprint', onSelect: () => setLast('Reprint chosen.'), disabled: true,
          title: 'Nothing has been printed yet' },
        { label: 'Cancel RFQ', danger: true, onSelect: () => setLast('Cancel RFQ chosen.'),
          note: withNotes ? 'Cannot be undone' : undefined },
      ]} />
      <span role="status">{last}</span>
    </>
  );
}

export const examples: Example[] = [
  {
    title: 'Rare and destructive actions',
    note: 'The danger item sits last. A disabled item says why on hover.',
    render: () => <Demo />,
  },
  {
    title: 'With notes',
    note: 'A rare action can afford the sentence a frequent one cannot.',
    render: () => <Demo withNotes />,
  },
];
