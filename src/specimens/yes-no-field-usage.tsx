import { useState } from 'react';
import { YesNoField } from '../ui/Inputs';
import { Checkbox } from '../ui/Overlays';
import type { Example } from './types';

function YesNo({ label, words }: { label: string; words: { on: string; off: string } }) {
  const [v, setV] = useState(true);
  return <YesNoField label={label} words={words} value={v} onChange={setV} />;
}

/**
 * The Yes/no field page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/yes-no-field.md`. The first is the one the
 * component enforces by refusing a default for `words` — and the card is the
 * fastest way to see what that refusal is protecting.
 */
export const examples: Example[] = [
  {
    title: 'The value is a word for that field',
    note: 'Never “yes”, never “true”, and never a ticked box sitting on its own with the reader left to work out what a tick means here.',
    compare: [
      {
        verdict: 'do',
        caption: 'Label is the question, value is the answer — in the vocabulary the record already uses.',
        render: () => (
          <div>
            <YesNo label="ITAR" words={{ on: 'Required', off: 'Not required' }} />
            <YesNo label="RoHS" words={{ on: 'Compliant', off: 'Not compliant' }} />
          </div>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A tick beside ITAR says something is true about ITAR and leaves the reader to guess what. Required? Exempt? Already filed?',
        render: () => (
          <div>
            <Checkbox checked onCheckedChange={() => {}} label="ITAR" />
            <Checkbox checked={false} onCheckedChange={() => {}} label="RoHS" />
          </div>
        ),
      },
    ],
  },
  {
    title: 'A record attribute, not a dialog option',
    note: '“Save as default” is a checkbox. A yes/no field is for a property of the record, with two named states.',
    compare: [
      {
        verdict: 'do',
        caption: 'A part is Active or Inactive. That is a fact about the part, and it reads as one in a record form.',
        render: () => <YesNo label="Part status" words={{ on: 'Active', off: 'Inactive' }} />,
      },
      {
        verdict: 'dont',
        caption: 'An option the user is setting right now, dressed as a record attribute. It belongs beside the control it affects, as a checkbox.',
        render: () => <YesNo label="Save as default" words={{ on: 'Save', off: 'Do not save' }} />,
      },
    ],
  },
];
