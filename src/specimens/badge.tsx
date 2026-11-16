import { StatusBadge } from '../ui/Badge';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'The vocabulary',
    note: 'Seven families, one per stage of a record\u2019s life. A word and a colour together, never a colour alone.',
    render: () => (
      <>
        <StatusBadge value="Draft" />
        <StatusBadge value="New" />
        <StatusBadge value="In-Progress" />
        <StatusBadge value="Quoted" />
        <StatusBadge value="Completed" />
        <StatusBadge value="Obsolete" />
        <StatusBadge value="Cancelled" />
      </>
    ),
  },
  {
    title: 'Different words, one token',
    note: 'Modules map their own lifecycle onto the shared families, so Active, Completed and Paid all read as done \u2014 while Released is committed, not finished.',
    render: () => (
      <>
        <StatusBadge value="Active" />
        <StatusBadge value="Released" />
        <StatusBadge value="Completed" />
        <StatusBadge value="Paid" />
      </>
    ),
  },
  {
    title: 'Who is blocked',
    note: 'They used to share one amber. The BA\u2019s principles of 16 Nov split them: New is not started, Quoted is committed, and amber is kept for Waiting for Approval alone.',
    render: () => (
      <>
        <StatusBadge value="New" />
        <StatusBadge value="Quoted" />
        <StatusBadge value="Awaiting Approval" />
      </>
    ),
  },
  {
    title: 'An unmapped word',
    note: 'Falls back to the neutral draft look rather than throwing. Deliberate-looking, and silent.',
    render: () => <StatusBadge value="Escalated" />,
  },
];
