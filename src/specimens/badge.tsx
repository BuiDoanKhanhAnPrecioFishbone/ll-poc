import { StatusBadge } from '../ui/Badge';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'The vocabulary',
    note: 'Seven reachable tokens, one real lifecycle word each. A word and a colour together, never a colour alone.',
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
    note: 'Modules map their own lifecycle onto the shared tokens, so Active, Released, Completed and Paid all read as done.',
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
    note: 'New needs you today; Quoted is waiting on the customer. They used to share one amber.',
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
