import { useState } from 'react';
import { Stepper } from '../ui/Stepper';
import type { Example } from './types';

const STEPS = [
  { label: 'Upload', text: 'Choose the BoM file' },
  { label: 'Map columns', text: 'Match headers to fields' },
  { label: 'Review', text: 'Check the parsed lines' },
  { label: 'Summary', text: 'Confirm and run' },
];

function Wizard({ showText = true }: { showText?: boolean }) {
  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const go = (i: number) => { setStep(i); setFurthest(f => Math.max(f, i)); };
  return (
    <div>
      <Stepper steps={STEPS} value={step} furthest={furthest} onChange={setStep} showText={showText} />
      <button type="button" onClick={() => go(Math.min(step + 1, STEPS.length - 1))}>Next step</button>
    </div>
  );
}

export const examples: Example[] = [
  {
    title: 'Go back, not ahead',
    note: 'Click a finished step to return to it. Steps beyond the furthest reached stay disabled. Use Next step to advance.',
    render: () => <Wizard />,
  },
  {
    title: 'Labels only',
    note: 'showText off, for a dialog whose subtitle already says the sentence. It moves into the tooltip.',
    render: () => <Wizard showText={false} />,
  },
  {
    title: 'Read-only',
    note: 'No onChange: every step is inert, and the state is still stated to screen readers.',
    render: () => <Stepper steps={STEPS} value={2} />,
  },
];
