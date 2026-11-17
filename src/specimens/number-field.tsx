import { useState } from 'react';
import { NumberField } from '../ui/Inputs';
import type { Example } from './types';

function Four() {
  const [days, setDays] = useState<number | null>(30);
  const [qty, setQty] = useState<number | null>(2134);
  const [price, setPrice] = useState<number | null>(1.24);
  const [markup, setMarkup] = useState<number | null>(12);
  return (
    <>
      <NumberField kind="integer"  label="Due in (Days)"     value={days}   onChange={setDays} />
      <NumberField kind="decimal"  label="Build Qty"         value={qty}    onChange={setQty} />
      <NumberField kind="currency" label="Unit Price (USD)"  value={price}  onChange={setPrice} />
      <NumberField kind="percent"  label="Markup (%)"        value={markup} onChange={setMarkup} />
    </>
  );
}

function Editing() {
  const [v, setV] = useState<number | null>(1234.5);
  return (
    <NumberField kind="decimal" label="Build Qty" value={v} onChange={setV}
                 hint="Click in: the separators go. Click away: they come back." />
  );
}

function Empty() {
  const [v, setV] = useState<number | null>(null);
  return (
    <NumberField kind="currency" label="Unit Price (USD)" value={v} onChange={setV}
                 hint="Clear the box to empty the value — that is the only way to reach null." />
  );
}

export const examples: Example[] = [
  {
    title: 'The four kinds',
    note: 'They differ by decimals alone. The unit lives in the label, never in the box — a suffix inside the field is something the user has to type around.',
    render: () => <Four />,
  },
  {
    title: 'Formatted at rest, raw while editing',
    note: 'A formatter that runs on every keystroke fights the person typing. Click into this one and the grouping disappears until you leave.',
    render: () => <Editing />,
  },
  {
    title: 'Empty, and how to get back there',
    render: () => <Empty />,
  },
];
