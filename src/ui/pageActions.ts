import type { FocusEvent } from 'react';

/**
 * The props for a page-actions row.
 *
 * WHY THIS IS NOT JUST A CLASS NAME. Below 820px `.vy-page-actions` becomes a
 * single horizontally scrolling row — four buttons on Part Master measure 438px
 * of labels against 347px of screen, so one row showing every label is
 * impossible and two rows cost 96px above the list.
 *
 * A SCROLLING ROW BREAKS KEYBOARD FOCUS, and it does so silently. Tab from
 * "New Part" to "Export Part Master Data" and the browser moves focus without
 * bringing the button into view: measured in a rendering headless Chrome,
 * `scrollLeft` stayed at 0 and the focused button stayed entirely off screen.
 * That is WCAG 2.4.11 Focus Not Obscured (Minimum) — a focus ring nobody can
 * see is the same as no focus ring.
 *
 * It is not scroll-snap: removing `scroll-snap-type` and `scroll-snap-align`
 * changed nothing. Chrome simply does not scroll this sub-scroller on a focus
 * move, so the row has to do it itself.
 *
 * React's `onFocus` is `focusin`, which bubbles, so one handler on the
 * container covers every child — including buttons added later by a caller that
 * knows nothing about this.
 *
 * `inline: 'nearest'` scrolls the row only as far as it must, and
 * `block: 'nearest'` means a button already vertically in view does not drag
 * the page up or down with it.
 */
export const pageActionsProps = {
  className: 'vy-page-actions',
  onFocus: (e: FocusEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).scrollIntoView({ inline: 'nearest', block: 'nearest' });
  },
};
