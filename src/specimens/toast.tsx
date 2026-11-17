import { Button } from '../ui/Button';
import { ToastProvider, useToast } from '../ui/Toast';
import type { Example } from './types';

/* The specimen route renders outside the app shell, so the provider that
   normally lives there is wrapped locally. */
function Buttons() {
  const toast = useToast();
  return (
    <>
      <Button variant="outlined" onClick={() => toast.success('Quotation saved.')}>Success</Button>
      <Button variant="outlined" onClick={() => toast.error('Select an assembly first.')}>Error</Button>
      <Button variant="outlined" onClick={() => toast.undoable('Quantity changed to 12.', () => toast.success('Change undone.'))}>
        Undoable
      </Button>
      <Button variant="outlined" onClick={() => toast.notImplemented('export this list')}>Not implemented</Button>
    </>
  );
}

function All() {
  const toast = useToast();
  return (
    <Button variant="outlined" onClick={() => {
      toast.success('NET30 saved.');
      toast.notImplemented('export this list to Excel');
      toast.error('2 required fields are missing.');
    }}>
      Fire all three at once
    </Button>
  );
}

function Undo() {
  const toast = useToast();
  return (
    <Button variant="outlined" onClick={() =>
      toast.undoable('Line 4 removed.', () => toast.success('Line 4 is back.'))}>
      Remove a line
    </Button>
  );
}

export const examples: Example[] = [
  {
    title: 'The four verbs',
    note: 'Each button fires a real toast. The method is not a style — it decides duration, announcement and whether a way back is offered: an error stays 9 seconds and is announced assertively, against 4.5 and polite for the rest.',
    render: () => <ToastProvider><Buttons /></ToastProvider>,
  },
  {
    title: 'The three kinds together',
    note: 'A tint of the meaning colour with that meaning’s own text, and a mark per kind — a circle for success and information, an octagon for an error. The mark is what makes the pale tint safe.',
    render: () => <ToastProvider><All /></ToastProvider>,
  },
  {
    title: 'Undo, and why it is a Radix Action',
    note: 'It keeps the toast alive while focus is inside it, so tabbing to Undo cannot race the timeout. Press it and the change comes back.',
    render: () => <ToastProvider><Undo /></ToastProvider>,
  },
];
