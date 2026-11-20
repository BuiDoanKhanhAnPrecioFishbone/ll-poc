import { useState } from 'react';
import { RichText } from '../ui/RichText';
import { TextArea } from '../ui/Field';
import type { Example } from './types';

function Editor() {
  const [v, setV] = useState('<p>Customer confirmed the <b>12 day</b> lead time by email.</p>');
  return <RichText value={v} onChange={setV} ariaLabel="Comment" />;
}

/**
 * The Rich text page's USAGE tab, drawn.
 *
 * One pair. The page's argument is that formatting nobody can see elsewhere
 * is formatting lost, and the cost of getting it wrong is a toolbar the user
 * has to ignore on every note they ever write.
 */
export const examples: Example[] = [
  {
    title: 'Only where formatting survives',
    note: 'A comment written in the real system can arrive formatted — that is the Conversations tab, and nowhere else yet.',
    compare: [
      {
        verdict: 'do',
        caption: 'A thread that can receive bold, lists and a paste from Word, and a Clean formatting button to undo one.',
        render: () => <Editor />,
      },
      {
        verdict: 'dont',
        caption: 'A note field nothing else renders. Fourteen controls over a value that will be shown as plain text everywhere it is read.',
        render: () => <TextArea label="Notes" rows={4} defaultValue="Check the connector lead time before quoting." />,
      },
    ],
  },
];
