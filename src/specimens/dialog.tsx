import { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Overlays';
import type { Example } from './types';

function Trigger({ label, size, title, subtitle, body, confirm }: {
  label: string; size?: 'md' | 'lg'; title: string; subtitle?: string; body: string; confirm: string;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>{label}</Button>
      <Dialog
        open={open} onClose={close} size={size} title={title} subtitle={subtitle}
        actions={(
          <>
            <Button variant="text" onClick={close}>Cancel</Button>
            <Button variant="filled" onClick={close}>{confirm}</Button>
          </>
        )}
      >
        <p>{body}</p>
      </Dialog>
    </>
  );
}

export const examples: Example[] = [
  {
    title: 'A question (md)',
    note: 'Opens at its own size. The default for a confirmation or a short form.',
    render: () => (
      <Trigger label="Open a question" title="Cancel this RFQ?"
               body="The suppliers who have already replied will be told it was withdrawn."
               confirm="Cancel RFQ" />
    ),
  },
  {
    title: 'With a subtitle',
    note: 'The subtitle says which record the dialog is about.',
    render: () => (
      <Trigger label="Open with subtitle" title="Update quantity" subtitle="RFQ-2026-0142"
               body="Enter the new quantity for this line."
               confirm="Update" />
    ),
  },
  {
    title: 'A work surface (lg)',
    note: 'lg and xl open maximised, with Restore down offered. Press Escape to close.',
    render: () => (
      <Trigger label="Open a work surface" size="lg" title="BoM comparison" subtitle="Revision B against revision C"
               body="A dialog this size holds a table or a grid, not a question."
               confirm="Done" />
    ),
  },
];
