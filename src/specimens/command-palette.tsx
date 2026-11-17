import { useState } from 'react';
import { CommandPalette } from '../components/CommandPalette';
import { Button } from '../ui/Button';
import type { Example } from './types';

function Live() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>Open the palette</Button>
      <span className="vy-field-hint">
        ⌘K opens it in the app. Choosing a destination navigates — inside this
        frame, so the example will go somewhere.
      </span>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export const examples: Example[] = [
  {
    title: 'The palette',
    note: 'Type a few letters. It matches on the name first, then the route, then the screen’s OLD name — a user who knows a screen as "Enquiry" finds it under whatever it is called now.',
    render: () => <Live />,
  },
];
