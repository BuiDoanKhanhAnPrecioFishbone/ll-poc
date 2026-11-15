import { useState } from 'react';
import { Loader, BusyOverlay } from '../ui/Loader';
import { Button } from '../ui/Button';
import type { Example } from './types';

function Refresh() {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <Button variant="outlined" size="sm" onClick={() => setBusy(b => !b)}>
        {busy ? 'Stop' : 'Re-price'}
      </Button>
      <BusyOverlay busy={busy} label="Re-pricing 24 lines">
        <ul>
          <li>Bracket, steel, 40 pcs</li>
          <li>Bolt M8, 200 pcs</li>
          <li>Gasket, 12 pcs</li>
        </ul>
      </BusyOverlay>
    </div>
  );
}

export const examples: Example[] = [
  {
    title: 'Types',
    note: 'Pulsing holds still, for inside a button or cell. Converging spins, for a page or blocking overlay.',
    render: () => (
      <>
        <Loader type="pulsing" label="Saving" />
        <Loader type="converging-spinner" label="Loading quotations" />
        <Loader type="infinite-spinner" label="Loading" />
      </>
    ),
  },
  {
    title: 'Sizes',
    render: () => (
      <>
        <Loader size="small" label="Loading" />
        <Loader size="medium" label="Loading" />
        <Loader size="large" label="Loading" />
      </>
    ),
  },
  {
    title: 'Over content that stays',
    note: 'Once rows have been seen, dim them and put the indicator over them rather than swapping in a skeleton.',
    render: () => <Refresh />,
  },
];
