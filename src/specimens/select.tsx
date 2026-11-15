import { useState } from 'react';
import { Select, type SelectOption } from '../ui/Overlays';
import type { Example } from './types';

const customers = ['Acme Aerospace', 'Birchwood Controls', 'Cobalt Instruments', 'Delta Marine', 'Eastgate Robotics'];

const views: SelectOption[] = [
  { value: 'v1', label: 'My view' },
  { value: 'v2', label: 'My view' },
  { value: 'v3', label: 'Open quotations' },
];

function Lookup() {
  const [v, setV] = useState('');
  return <Select label="Customer" options={customers} value={v} onChange={setV} />;
}

function Pairs() {
  const [v, setV] = useState('v2');
  return <Select label="Saved view" options={views} value={v} onChange={setV} />;
}

function Footer() {
  const [v, setV] = useState('');
  return (
    <Select label="Supplier" options={['Arrow', 'Avnet', 'Mouser']} value={v} onChange={setV}
            footer={<button type="button" className="vy-link">Load more suppliers</button>} />
  );
}

function Invalid() {
  const [v, setV] = useState('');
  return <Select label="Customer" required invalid={!v} options={customers} value={v} onChange={setV} />;
}

export const examples: Example[] = [
  {
    title: 'Type to narrow, then choose',
    note: 'Text outside the list is never accepted; clicking away keeps the last real choice.',
    render: () => <Lookup />,
  },
  {
    title: 'Value distinct from label',
    note: 'Two views share a name and stay separately reachable, because the value is the id.',
    render: () => <Pairs />,
  },
  {
    title: 'Required and invalid',
    render: () => <Invalid />,
  },
  {
    title: 'Footer under the list',
    note: 'For a list that is deliberately short.',
    render: () => <Footer />,
  },
];
