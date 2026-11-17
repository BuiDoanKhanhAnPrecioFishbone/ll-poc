import type { ReactNode } from 'react';

/**
 * An inline notice, in the flow of the page, above the thing it is about.
 *
 * Two kinds and no more, which is the BA's division of 16 Nov 2026:
 * information says something worth knowing that changes nothing, warning says
 * something to check that does not block. An error that DOES block belongs
 * where the block is — on the field — and not in a band the reader has
 * already scrolled past.
 *
 * No icon, unlike `Toast`. A toast arrives unbidden and may be read in a
 * glance, so it needs a shape; a banner is read in place, in a sentence, by
 * someone already looking at the record. That puts the whole weight on the
 * words: write them so the meaning survives in greyscale.
 */
export function Banner({ kind = 'info', block, children }: {
  kind?: 'info' | 'warning';
  /**
   * Takes a line of its own. The default sits inline, beside the words it
   * qualifies; a banner carrying a whole sentence wants the line.
   */
  block?: boolean;
  children: ReactNode;
}) {
  const props = {
    className: 'vy-note-inline',
    'data-kind': kind === 'info' ? undefined : kind,
  };
  return block ? <div {...props}>{children}</div> : <span {...props}>{children}</span>;
}
