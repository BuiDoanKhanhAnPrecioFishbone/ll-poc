import { Chip } from '../ui/Chip';
import { StatusBadge } from '../ui/Badge';
import type { Example } from './types';

/**
 * The Chip page's USAGE tab, drawn.
 *
 * Three rules off `docs/components/chip.md`. The first is the line the page
 * states most firmly — *"anything that is not operable must not look
 * operable"* — and it is only obvious beside its opposite.
 */
export const examples: Example[] = [
  {
    title: 'Operable, or output',
    note: 'A chip is a button: it takes a filter off. A state the user cannot change is a badge.',
    compare: [
      {
        verdict: 'do',
        caption: 'The chip is the filter that is on; the badge beside it is the record’s state.',
        render: () => (
          <>
            <Chip label="My queue · Overdue" selected onClick={() => {}} />
            <StatusBadge value="In-Progress" />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A status drawn as a chip invites a click that does nothing, and the user learns to distrust every chip on the screen.',
        render: () => <Chip label="In-Progress" selected onClick={() => {}} />,
      },
    ],
  },
  {
    title: 'The label is the filter',
    note: 'Not an instruction. The chip says what is on, so it can be read without being opened.',
    compare: [
      {
        verdict: 'do',
        caption: 'Two facts joined with a middle dot — the queue and its scope, which is the form the queue chip already uses.',
        render: () => (
          <>
            <Chip label="Due this week · Mine" selected onClick={() => {}} />
            <Chip label="Acme Corp" selected onClick={() => {}} />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'An instruction describes the control instead of the state, and the reader still has to go and look.',
        render: () => (
          <>
            <Chip label="Filter by due date" selected onClick={() => {}} />
            <Chip label="Filter by customer" selected onClick={() => {}} />
          </>
        ),
      },
    ],
  },
  {
    title: 'No count inside',
    note: 'A count belongs to the thing being filtered, not to the control that filters it.',
    compare: [
      {
        verdict: 'do',
        caption: 'The chip says what is on. The list underneath says how many are left.',
        render: () => <Chip label="Open only" selected onClick={() => {}} />,
      },
      {
        verdict: 'dont',
        caption: 'A number on the chip changes every time the data does, so the one control that should hold still moves.',
        render: () => <Chip label="Open only (66)" selected onClick={() => {}} />,
      },
    ],
  },
];
