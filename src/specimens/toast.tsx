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

export const examples: Example[] = [
  {
    title: 'The four verbs',
    note: 'Each button fires a real toast. Errors stay longer; Undo reverses the change.',
    render: () => <ToastProvider><Buttons /></ToastProvider>,
  },
];
