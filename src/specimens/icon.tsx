import { ICONS, Icon } from '../ui/icons';
import type { Example } from './types';

/* Read off the set rather than listed by hand, so a new icon appears here the
   moment it is drawn and nobody has to remember this file exists. */
const NAMES = Object.keys(ICONS);

export const examples: Example[] = [
  {
    title: `The whole set — ${NAMES.length}`,
    note: 'One box, 20 × 20, strokes only, no fill, one stroke width at 1.5px, round ends. Icons take the colour of the text around them.',
    render: () => (
      <ul className="vy-icon-grid">
        {NAMES.map(name => (
          <li key={name}><Icon name={name} size={20} /><span>{name}</span></li>
        ))}
      </ul>
    ),
  },
  {
    title: 'They take the text colour',
    note: 'No icon in this set carries a colour of its own. That is what lets one glyph sit in a link, a danger button and a muted hint without three versions of it.',
    render: () => (
      <p className="vy-icon-inks">
        <span><Icon name="download" /> default</span>
        <span className="vy-ink-brand"><Icon name="download" /> brand</span>
        <span className="vy-ink-danger"><Icon name="download" /> danger</span>
        <span className="vy-ink-muted"><Icon name="download" /> muted</span>
      </p>
    ),
  },
  {
    title: 'An unknown name draws nothing',
    note: 'Deliberate: rendering a fallback glyph is what hid the last wrong name. Nothing appears, and the name is left in the DOM for whoever is looking.',
    render: () => (
      <p className="vy-icon-inks">
        <span><Icon name="check" /> check — real</span>
        <span><Icon name="sprocket" /> sprocket — not in the set</span>
      </p>
    ),
  },
];
