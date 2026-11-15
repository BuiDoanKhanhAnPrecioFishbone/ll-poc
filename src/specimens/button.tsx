import { Button } from '../ui/Button';
import type { Example } from './types';

export const examples: Example[] = [
    {
      title: 'Variants',
      note: 'The emphasis ladder. One filled button per view; everything else steps down.',
      render: () => (
        <>
          <Button variant="filled">Filled</Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="danger">Danger</Button>
        </>
      ),
    },
    {
      title: 'Sizes',
      note: 'xs sits in a grid row, sm in a toolbar, md is the default.',
      render: () => (
        <>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
        </>
      ),
    },
    {
      title: 'States',
      note: 'Press, focus and tab through these — the point of a live example.',
      render: () => (
        <>
          <Button variant="filled">Resting</Button>
          <Button variant="filled" disabled>Disabled</Button>
          <Button variant="filled" busy>Busy</Button>
          <Button variant="outlined" disabled>Disabled outline</Button>
        </>
      ),
    },
  ];
