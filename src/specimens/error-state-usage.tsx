import { ErrorState } from '../ui/ErrorState';
import type { Example } from './types';

/**
 * The Error state page's USAGE tab, drawn.
 *
 * One pair, on the distinction the audit found the live system missing from
 * one side and this prototype from the other: *empty* and *broken* are
 * different answers, and a screen that gives the wrong one sends the user to
 * support about a list that simply has nothing in it yet.
 *
 * Both cards render the real component. The "Don't" is not a broken build —
 * it is this component used for a question it does not answer, which is the
 * only way that mistake ever reaches a screen.
 */
export const examples: Example[] = [
  {
    title: 'Broken, not empty',
    note: 'The error state is for a screen that cannot show what the user came for. A list with nothing in it is working perfectly.',
    compare: [
      {
        verdict: 'do',
        caption: 'Something failed, it has an id, and there is a way out and a way to report it.',
        render: () => (
          <ErrorState
            title="This screen stopped loading"
            body="Nothing you typed has been lost. The record is still there; this screen could not fetch it."
            errorId="VIQ-7F2A10"
            screen="Project Requirements"
            onRetry={() => {}}
          />
        ),
      },
      {
        verdict: 'dont',
        caption: 'An empty list dressed as a failure. The user raises a ticket about a screen that is doing exactly what it should.',
        render: () => (
          <ErrorState
            title="No quotations to show"
            body="This list has no records yet."
            errorId="VIQ-7F2A11"
            screen="Project Requirements"
            onRetry={() => {}}
          />
        ),
      },
    ],
  },
];
