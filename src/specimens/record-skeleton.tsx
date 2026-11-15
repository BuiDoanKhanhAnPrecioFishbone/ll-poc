import { RecordSkeleton } from '../ui/RecordSkeleton';
import { HEADER_GROUPS } from '../components/quotation/requirementFields';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'The record while it loads',
    note: 'Labels and grouping are real, because the field declarations are already in hand. Only the values are bars.',
    render: () => <RecordSkeleton groups={HEADER_GROUPS} />,
  },
  {
    title: 'One group',
    note: 'Built from the same declarations as the form, so a field added there appears here. Bar length follows the field kind.',
    render: () => <RecordSkeleton groups={HEADER_GROUPS.slice(2)} />,
  },
];
