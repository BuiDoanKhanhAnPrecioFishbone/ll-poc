import { Priority } from '../ui/Priority';
import type { Example } from './types';

export const examples: Example[] = [
  {
    title: 'Three levels',
    note: 'A dot and a word. The record stores 1 to 3, and three is most urgent.',
    render: () => (
      <>
        <Priority value={3} />
        <Priority value={2} />
        <Priority value={1} />
      </>
    ),
  },
  {
    title: 'Down a column, which is how it is read',
    note: 'The dots are three steps of ONE ink — solid, half, hollow — so the ranking survives greyscale, a poor screen and a colour-blind reader. Turn this page greyscale and the order is still there.',
    render: () => (
      <ul className="vy-specimen-stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {[3, 1, 2, 3, 1].map((v, i) => (
          <li key={i} style={{ padding: '6px 0' }}><Priority value={v} /></li>
        ))}
      </ul>
    ),
  },
  {
    title: 'Why not red and amber — open with the BA',
    note: 'Her principles of 16 Nov 2026 give High red #C62D26 and Medium amber #C27A12. This draws one ink instead, because those two colours are already spent on "something is wrong": a high-priority RFQ is not an error, an overdue one is, and on a list showing Priority and Status together a reader had no way to tell two reds apart. Her document now does specify it, so the premise has changed and the collision has not — it is a question for her, not a decision taken here.',
    render: () => (
      <>
        <Priority value={3} />
        <span className="vy-badge" data-status="blocked">Blocked</span>
      </>
    ),
  },
];
