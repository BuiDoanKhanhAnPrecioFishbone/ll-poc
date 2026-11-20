import { Priority } from '../ui/Priority';
import { StatusBadge } from '../ui/Badge';
import type { Example } from './types';

/**
 * The Priority page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/priority.md`. The second is the change this
 * component was made for — three stars became a dot and a word on 25 August
 * — and the argument for it is entirely visual, so it belongs on a card.
 */
export const examples: Example[] = [
  {
    title: 'How urgent, not where it is',
    note: 'Priority is somebody’s judgement about a record. Status is the record’s own state. They are different columns and different vocabularies.',
    compare: [
      {
        verdict: 'do',
        caption: 'The two side by side, each in its own idiom — a ranked ink for priority, a family colour for status.',
        render: () => (
          <>
            <Priority value={3} />
            <StatusBadge value="In-Progress" />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Priority drawn as a status badge borrows the lifecycle colours, and a reader scanning the column cannot tell which question it answers.',
        render: () => (
          <>
            <span className="vy-badge" data-token="blocked">High</span>
            <span className="vy-badge" data-token="done">Low</span>
          </>
        ),
      },
    ],
  },
  {
    title: 'A word, not a count',
    note: 'It encodes by ink, not by hue: High is near-black, Medium mid-grey, Low an outline — so the three rank themselves photocopied.',
    compare: [
      {
        verdict: 'do',
        caption: 'Medium needs no scale and no counting. The dot keeps the rank for a reader scanning the column.',
        render: () => (
          <>
            <Priority value={3} />
            <Priority value={2} />
            <Priority value={1} />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Stars are an input idiom — they say rate this — and two filled out of three is a fraction the eye has to resolve before it means anything.',
        render: () => (
          <>
            {/* Hand-drawn: this is what the component replaced on 25 Aug. */}
            <span aria-hidden>★★★</span>
            <span aria-hidden>★★☆</span>
            <span aria-hidden>★☆☆</span>
          </>
        ),
      },
    ],
  },
];
