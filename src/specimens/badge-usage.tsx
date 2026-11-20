import { StatusBadge } from '../ui/Badge';
import type { Example } from './types';

/**
 * The Badge page's USAGE tab, drawn.
 *
 * Three rules off `docs/components/badge.md`. The middle one is the argument
 * that produced the seventh token, and it is the clearest case in this system
 * for why a card beats a sentence: two amber badges side by side show the
 * defect in less time than it takes to read the word "collapsed".
 */
export const examples: Example[] = [
  {
    title: 'A state, not a label',
    note: 'A badge carries the status vocabulary — where a record is in its life. Anything else is a pill.',
    compare: [
      {
        verdict: 'do',
        caption: 'The lifecycle word, in its family colour.',
        render: () => (
          <>
            <StatusBadge value="In-Progress" />
            <StatusBadge value="Completed" />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A count or a tag in badge clothing teaches the reader that the colours mean nothing in particular.',
        render: () => (
          <>
            {/* Hand-drawn: `StatusBadge` takes a lifecycle word and maps it, so
                it cannot produce this. A pill is what these should be. */}
            <span className="vy-badge" data-token="done">4 lines</span>
            <span className="vy-badge" data-token="progress">Consigned</span>
          </>
        ),
      },
    ],
  },
  {
    title: 'Two states, two colours',
    note: 'What a family encodes is WHO IS BLOCKED, not what stage the record has reached.',
    compare: [
      {
        verdict: 'do',
        caption: 'New needs someone today; Quoted is waiting on the customer. Opposite states, and they must not read alike.',
        render: () => (
          <>
            <StatusBadge value="New" />
            <StatusBadge value="Quoted" />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'One amber for both — the defect the production Part Master has, where every status is green and the column stops being worth reading.',
        render: () => (
          <>
            <span className="vy-badge" data-token="open">New</span>
            <span className="vy-badge" data-token="open">Quoted</span>
          </>
        ),
      },
    ],
  },
  {
    title: 'The word is always there',
    note: 'Colour never carries meaning on its own. Turn the screen greyscale and nothing should be lost.',
    compare: [
      {
        verdict: 'do',
        caption: 'Word and colour together, which is the one rule the accessibility section lists first.',
        render: () => <StatusBadge value="Obsolete" />,
      },
      {
        verdict: 'dont',
        caption: 'A colour alone has to be learned, and cannot be learned at all by a reader who does not separate red from green.',
        render: () => (
          <span className="vy-badge" data-token="blocked" style={{ minWidth: 0, padding: '0 var(--vy-space-4)' }}>
            &nbsp;
          </span>
        ),
      },
    ],
  },
];
