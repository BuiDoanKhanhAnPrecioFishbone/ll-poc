import { useState } from 'react';
import { RadioGroup, type RadioOption } from '../ui/Overlays';
import type { Example } from './types';

function Group({ options, label, start }: { options: RadioOption[]; label: string; start: string }) {
  const [v, setV] = useState(start);
  return <RadioGroup label={label} options={options} value={v} onChange={setV} />;
}

const FEW: RadioOption[] = [
  { value: 'consigned', label: 'Consigned' },
  { value: 'turnkey', label: 'Turnkey' },
  { value: 'partial', label: 'Partial Turnkey' },
];

const MANY: RadioOption[] = [
  'Consigned', 'Turnkey', 'Partial Turnkey', 'Buy-Sell', 'Drop Ship',
  'Kitted', 'Customer Supplied', 'Vendor Managed', 'Bonded',
].map(label => ({ value: label, label }));

/**
 * The Radio group page's USAGE tab, drawn.
 *
 * Three rules off `docs/components/radio-group.md`. The third is the one this
 * project argued about and settled — a disabled option stays on screen with
 * its reason — and it is drawn because absence is the hardest thing to show
 * in prose: the "Don't" card has to be a group with something missing.
 */
export const examples: Example[] = [
  {
    title: 'Two to four',
    note: 'A radio group is for options the user should see at once. Past about four it stops being a choice and becomes a wall.',
    compare: [
      {
        verdict: 'do',
        caption: 'Three, read in one go. Seeing them all is what the group is paying for.',
        render: () => <Group label="Customer Type" options={FEW} start="consigned" />,
      },
      {
        verdict: 'dont',
        caption: 'Nine down the page. Nobody reads to the bottom, and a select would have cost one line.',
        render: () => <Group label="Customer Type" options={MANY} start="Consigned" />,
      },
    ],
  },
  {
    title: 'A hint per option',
    note: 'Not one sentence under the group — a hint that follows the selection can never explain the option nobody can select.',
    compare: [
      {
        verdict: 'do',
        caption: 'Each option carries its own sentence, so all three are explained before any is chosen.',
        render: () => (
          <Group label="Action" start="quote" options={[
            { value: 'quote', label: 'Run a new quotation', hint: 'Prices every line against the marketplace.' },
            { value: 'reprice', label: 'Reprice this quotation', hint: 'Keeps the BoM and asks for fresh prices only.' },
            { value: 'import', label: 'Import a completed quote', hint: 'Reads prices from a file the customer sent.' },
          ]} />
        ),
      },
      {
        verdict: 'dont',
        caption: 'One sentence under the group can only describe the option already chosen, which is the one the reader needs explaining least.',
        render: () => (
          <div>
            <Group label="Action" start="quote" options={[
              { value: 'quote', label: 'Run a new quotation' },
              { value: 'reprice', label: 'Reprice this quotation' },
              { value: 'import', label: 'Import a completed quote' },
            ]} />
            <p className="vy-field-hint">Prices every line against the marketplace.</p>
          </div>
        ),
      },
    ],
  },
  {
    title: 'A refusal says why',
    note: 'An option this moment cannot offer stays on screen, disabled, with its reason. Taking it out answers a different question.',
    compare: [
      {
        verdict: 'do',
        caption: 'Shown and not selectable reads as “not from here”. The reason is not optional for one of these.',
        render: () => (
          <Group label="Action" start="quote" options={[
            { value: 'quote', label: 'Run a new quotation' },
            { value: 'import', label: 'Import a completed quote', disabled: true,
              hint: 'Needs a file from the customer. Upload it on the Documents tab first.' },
          ]} />
        ),
      },
      {
        verdict: 'dont',
        caption: 'Left out, it reads as “the system cannot do this” — and the user goes looking for a feature that is already there.',
        render: () => (
          <Group label="Action" start="quote" options={[
            { value: 'quote', label: 'Run a new quotation' },
          ]} />
        ),
      },
    ],
  },
];
