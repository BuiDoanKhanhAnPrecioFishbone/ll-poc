import { useState } from 'react';
import { FieldRow, ReadValue } from '../ui/FieldRow';
import { TextField } from '../ui/Field';
import { Checkbox, RadioGroup } from '../ui/Overlays';
import type { Example } from './types';

function Editable() {
  const [v, setV] = useState('');
  return (
    <dl>
      <FieldRow label="Part Number" htmlFor="specimen-part" required editing
                hint="Prefixed by the customer.">
        <TextField id="specimen-part" value={v} onChange={e => setV(e.target.value)} />
      </FieldRow>
    </dl>
  );
}

function Locked() {
  return (
    <dl>
      <FieldRow label="Customer" note="follows the RFQ" editing>
        <ReadValue>Acme Aerospace</ReadValue>
      </FieldRow>
      <FieldRow label="Quote Number" note="set by the system" editing>
        <ReadValue />
      </FieldRow>
    </dl>
  );
}

function Error() {
  const [v, setV] = useState('abc');
  return (
    <dl>
      <FieldRow label="Quantity" htmlFor="specimen-qty" required invalid editing
                hint="Whole units."
                error={<span className="vy-field-error">Enter a number.</span>}>
        <TextField id="specimen-qty" value={v} onChange={e => setV(e.target.value)} />
      </FieldRow>
    </dl>
  );
}

function Group() {
  const [action, setAction] = useState('new');
  const [coat, setCoat] = useState(false);
  return (
    <dl>
      <FieldRow label="Action" labelId="specimen-action" variant="radio" editing>
        <RadioGroup label="Action" value={action} onChange={setAction}
                    options={[{ value: 'new', label: 'New Assembly' }, { value: 'existing', label: 'Existing Assembly' }]} />
      </FieldRow>
      <FieldRow editing>
        <Checkbox checked={coat} onCheckedChange={setCoat} label="Conformal Coating" />
      </FieldRow>
    </dl>
  );
}

/* Her six field states, 16 Nov 2026 — this is the one the system could not
   draw until `--vy-changed-border` was wired to something. The comparison is
   current against SAVED: type the value back to 10k and the border goes. */
function Changed() {
  const saved = '10k';
  const [v, setV] = useState('22k');
  return (
    <dl>
      <FieldRow label="Resistance" htmlFor="specimen-chg" editing changed={v !== saved}
                hint={v !== saved ? `Saved value: ${saved}` : 'Matches the saved value.'}>
        <TextField id="specimen-chg" value={v} onChange={e => setV(e.target.value)} />
      </FieldRow>
    </dl>
  );
}

function ReadOnly() {
  return (
    <dl>
      <FieldRow label="Part Number"><ReadValue>00455-387-9552</ReadValue></FieldRow>
      <FieldRow label="Alternate" empty><ReadValue /></FieldRow>
    </dl>
  );
}

export const examples: Example[] = [
  {
    title: 'Label, required marker and hint',
    note: 'htmlFor points the label at one control.',
    render: () => <Editable />,
  },
  {
    title: 'Locked: the note is the lock',
    note: 'No locked prop. The reason being present is what marks the row.',
    render: () => <Locked />,
  },
  {
    title: 'Error replaces the hint',
    render: () => <Error />,
  },
  {
    title: 'Changed: current against saved',
    note: 'Edit the value and the brand border appears; type 10k back and it goes. Not a count, not an old-value tag — the border is the whole signal.',
    render: () => <Changed />,
  },
  {
    title: 'Read-only, and empty',
    note: 'The value box: a fill and a bottom line, which is what says it is not a control. An empty one reads "Not set" rather than nothing.',
    render: () => <ReadOnly />,
  },
  {
    title: 'A group, and a control that labels itself',
    note: 'A radio group is labelled by its heading; a checkbox omits the label.',
    render: () => <Group />,
  },
];
