import { useState } from 'react';
import { Pager } from '../ui/Pager';
import type { Example } from './types';

function Live({ total, size, start = 0 }: { total: number; size: number; start?: number }) {
  const [page, setPage] = useState(start);
  const [n, setN] = useState(size);
  return <Pager page={page} pageSize={n} total={total} onPage={setPage} onPageSize={setN} />;
}

/**
 * The Pager page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/pager.md`. The second is the one the
 * component solves and the page can only describe with arithmetic — 330
 * records at 25 a page is 14 buttons — so the card does the arithmetic for
 * the reader by rendering both.
 */
export const examples: Example[] = [
  {
    title: 'Not over one page',
    note: 'A pager over a list that is always short is furniture: controls that cannot do anything.',
    compare: [
      {
        verdict: 'do',
        caption: 'Eighty-eight records over five pages. Every control on the row has somewhere to go.',
        render: () => <Live total={88} size={20} />,
      },
      {
        verdict: 'dont',
        caption: 'Six records, one page. Four arrows that do nothing and a page number that is always 1.',
        render: () => <Live total={6} size={20} />,
      },
    ],
  },
];

/* THE NUMBER WINDOW HAS NO CARD, and the reason is worth leaving here. It
   would have read "Do: first, a window of three, last — Don't: fourteen
   buttons in a row", and the Don't card could only be drawn by hand, because
   this component windows at eight pages and will not produce the row it is
   being blamed for. A Do/Don't pair whose Don't is a drawing of something the
   system cannot do is an argument with nobody. The window is on the Examples
   tab, at 330 records, where it can be seen doing its job. */
