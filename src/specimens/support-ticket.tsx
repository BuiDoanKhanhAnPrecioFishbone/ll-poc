import { useState } from 'react';
import { Button } from '../ui/Button';
import { SupportTicketDialog, browserName, newErrorId } from '../ui/SupportTicket';
import type { Example } from './types';

function Live() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [errorId] = useState(newErrorId);
  return (
    <>
      <Button variant="outlined" onClick={() => { setSent(null); setOpen(true); }}>
        Send a Support Ticket
      </Button>
      {sent && <span className="vy-field-hint">Ticket {sent} — nothing was sent; this prototype has nowhere to send it.</span>}
      <SupportTicketDialog
        open={open} errorId={errorId} screen="Quotation list"
        onClose={() => setOpen(false)}
        onSent={no => { setSent(no); setOpen(false); }}
      />
    </>
  );
}

export const examples: Example[] = [
  {
    title: 'The dialog',
    note: 'The subject is prefilled with the screen that failed, because a ticket whose subject is "Error" costs support a round trip before they can start.',
    render: () => <Live />,
  },
  {
    title: 'What it collects without asking',
    note: 'An error id and the browser, gathered rather than typed — the two facts a user is least able to supply accurately and support most needs.',
    render: () => (
      <p className="vy-icon-inks">
        <span>Error id: <code>{newErrorId()}</code></span>
        <span>Browser: <code>{browserName()}</code></span>
      </p>
    ),
  },
];
