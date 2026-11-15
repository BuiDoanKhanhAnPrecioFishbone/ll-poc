import { ErrorState } from '../ui/ErrorState';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'A screen that stopped',
    note: 'A title that names what failed, a body that says what to do, and one way forward. The error id is what support asks for first.',
    render: () => (
      <ErrorState
        title="This quotation could not be loaded"
        body="The record exists, but the pricing service did not answer. Nothing has been changed."
        errorId="VY-7F3A21"
        screen="Quotation detail"
        onRetry={() => {}}
      />
    ),
  },
  {
    title: 'Without a retry',
    note: 'When trying again cannot help, the button is left out rather than offered and ignored.',
    render: () => (
      <ErrorState
        title="You do not have access to this record"
        body="Ask the owner of the quotation, or your administrator, to grant you the Sales role."
        screen="Quotation detail"
      />
    ),
  },
];
