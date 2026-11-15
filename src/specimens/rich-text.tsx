import { useState } from 'react';
import { RichText } from '../ui/RichText';
import type { Example } from './types';

function Editor({ initial, placeholder }: { initial: string; placeholder?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <RichText
      value={value}
      onChange={setValue}
      placeholder={placeholder}
      ariaLabel="Example rich text editor"
    />
  );
}

export const examples: Example[] = [
  {
    title: 'With content',
    note: 'Type into it. The toolbar acts on the selection, and the value is HTML the caller owns.',
    render: () => (
      <Editor initial="<p>Customer asked for <strong>two week</strong> lead time on the connectors.</p>" />
    ),
  },
  {
    title: 'Empty',
    note: 'A placeholder rather than a blank box, so the field says what belongs in it.',
    render: () => <Editor initial="" placeholder="Notes for this requirement…" />,
  },
];
