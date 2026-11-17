import { AppShell } from '../components/AppShell';
import type { Example } from './types';

/**
 * The shell, at the width this frame actually is.
 *
 * A SCALED COPY WAS TRIED AND DOES NOT WORK, which is worth writing down
 * because it looks like it should. Rendering the shell in a 1280px box and
 * scaling it down puts the right pixels on screen and leaves the rail
 * off-canvas anyway: the shell's breakpoints are `@media` queries, and those
 * read the VIEWPORT, not the size of the box the element happens to be in.
 * A transform cannot change what a media query sees. Measured, not assumed —
 * the scale applied at 0.39 and the sidebar stayed translated -248px.
 *
 * So this frame shows the narrow shell honestly rather than an illusion of a
 * wide one. The full-width rail is in the product itself, one origin over;
 * the page says where.
 */
export const examples: Example[] = [
  {
    title: 'The frame',
    note: 'A dark top bar over the page. This frame is about 560px, and below 820px the rail goes off-canvas — press the hamburger and it comes back over the page.',
    render: () => (
      <div className="vy-specimen-shell" style={{ blockSize: 420 }}>
        <AppShell />
      </div>
    ),
  },
];
