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
  {
    title: 'During a launch',
    note: '`step` says how far the start-up got before it stopped. A failure at step 3 of 5 is a different message from one at step 0, and the reader can tell support which.',
    render: () => (
      <ErrorState
        title="Voyager IQ could not finish starting"
        body="Your settings loaded; the part catalogue did not. Nothing is lost — this is a start-up problem, not your data."
        step={3}
        errorId="VY-0C91B4"
        screen="Start-up"
        onRetry={() => {}}
        retryLabel="Start again"
      />
    ),
  },
  {
    title: 'With something of its own to say',
    note: 'Anything passed as children sits under the body — a list of what did load, a link, a second way out.',
    render: () => (
      <ErrorState
        title="This BoM could not be read"
        body="The file opened, but no column looked like a part number."
        screen="Import BoM"
        onRetry={() => {}}
        retryLabel="Choose another file"
      >
        <p>Columns found: <code>Item</code>, <code>Qty</code>, <code>Notes</code>.</p>
      </ErrorState>
    ),
  },
];