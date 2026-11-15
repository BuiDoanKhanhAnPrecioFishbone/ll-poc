import { useState } from 'react';
import { RadioGroup, type RadioOption } from '../ui/Overlays';
import type { Example } from './types';

const sizes: RadioOption[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'express', label: 'Express' },
  { value: 'pickup', label: 'Pickup' },
];

const actions: RadioOption[] = [
  { value: 'new', label: 'New Assembly', hint: 'Start from an empty bill of materials.' },
  { value: 'existing', label: 'Existing Assembly', hint: 'Re-run a quotation against a BoM you already have.' },
  { value: 'import', label: 'Import Completed Quote', hint: 'Not from here: the quote must come from an RFQ.', disabled: true },
];

function ListDemo() {
  const [v, setV] = useState('standard');
  return <RadioGroup label="Delivery" options={sizes} value={v} onChange={setV} />;
}

function TilesDemo() {
  const [v, setV] = useState('new');
  return <RadioGroup label="Action" tiles options={actions} value={v} onChange={setV} />;
}

function HintsDemo() {
  const [v, setV] = useState('new');
  return <RadioGroup label="Action" options={actions} value={v} onChange={setV} />;
}

export const examples: Example[] = [
  {
    title: 'List',
    note: 'An ordinary choice inside a form. Arrow keys move between options.',
    render: () => <ListDemo />,
  },
  {
    title: 'Tiles',
    note: 'For the first question on a screen: the whole card is the target.',
    render: () => <TilesDemo />,
  },
  {
    title: 'A hint per option, one disabled',
    note: 'The disabled option stays on screen and says why.',
    render: () => <HintsDemo />,
  },
];
