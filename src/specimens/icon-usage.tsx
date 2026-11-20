import { Icon } from '../ui/icons';
import type { Example } from './types';

/**
 * The Icon page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/icon.md`. The first draws a BUG rather than
 * a bad design — an unknown name renders an empty box — and that is worth a
 * card precisely because the failure is silent on the screen it happens on.
 */
export const examples: Example[] = [
  {
    title: 'A name in the set',
    note: 'An unknown name renders an empty, aria-hidden <svg> carrying data-unknown-icon. It is a bug, not a case to style for.',
    compare: [
      {
        verdict: 'do',
        caption: 'Names from ICONS. A glyph the set does not have is added to the set, where every screen gets it at once.',
        render: () => (
          <>
            <Icon name="trash" size={20} />
            <Icon name="download" size={20} />
            <Icon name="eye" size={20} />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Three names that are not in the set. Nothing is drawn, nothing throws, and the row of gaps is the only evidence.',
        render: () => (
          <>
            <Icon name="rubbish" size={20} />
            <Icon name="save-disk" size={20} />
            <Icon name="eyeball" size={20} />
          </>
        ),
      },
    ],
  },
  {
    title: 'One weight, one shape',
    note: 'Stroked at 1.5 on a 20×20 box, round caps and joins, in whatever text colour surrounds it. `size` is the only prop.',
    compare: [
      {
        verdict: 'do',
        caption: 'The set reads as one hand, at any size, in any ink.',
        render: () => (
          <>
            <Icon name="quote" size={24} />
            <Icon name="customer" size={24} />
            <Icon name="supplier" size={24} />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'One filled glyph among stroked ones, drawn inline in a screen. It is heavier than everything beside it and no amount of care elsewhere hides that.',
        render: () => (
          <>
            <Icon name="quote" size={24} />
            {/* Hand-drawn, which is the point: a glyph invented in a screen. */}
            <svg viewBox="0 0 20 20" width="24" height="24" aria-hidden>
              <path d="M4 4h12v12H4z" fill="currentColor" />
            </svg>
            <Icon name="supplier" size={24} />
          </>
        ),
      },
    ],
  },
];
