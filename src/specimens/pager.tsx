import { useState } from 'react';
import { Pager } from '../ui/Pager';
import type { Example } from './types';

function Live({ total, startPage = 0 }: { total: number; startPage?: number }) {
  const [page, setPage] = useState(startPage);
  const [size, setSize] = useState(20);
  return <Pager page={page} pageSize={size} total={total} onPage={setPage} onPageSize={setSize} />;
}

export const examples: Example[] = [
  {
    title: 'A long list',
    note: 'First, previous, next and last, each disabled at its own end. Changing the page size returns to page one.',
    render: () => <Live total={336} />,
  },
  {
    title: 'Deep in the list',
    note: 'First and last stay visible, with a window around the current page.',
    render: () => <Live total={336} startPage={8} />,
  },
  {
    title: 'Few pages',
    note: 'Up to seven pages, every number is shown.',
    render: () => <Live total={95} />,
  },
  {
    title: 'No records',
    render: () => <Live total={0} />,
  },
];
