import { TextField } from '../ui/Field';
import type { Example } from './types';

/**
 * The Field page's USAGE tab, drawn.
 *
 * Three rules off `docs/components/field.md`, all of them about where
 * something SITS or whether it is there at all — which is exactly the kind of
 * rule a sentence conveys badly and a pair of cards conveys instantly.
 *
 * The "Don't" cards are built from plain markup where the component cannot
 * produce the wrong shape, which is the point: `Field` has no way to put the
 * label beside the input, so the mistake has to be drawn by hand to be shown
 * at all. Each one says so in its caption.
 */
export const examples: Example[] = [
  {
    title: 'The label sits above',
    note: 'Above the value, never beside it — so the eye runs down one column instead of zig-zagging.',
    compare: [
      {
        verdict: 'do',
        caption: 'Label, then value. Every field on the screen starts at the same left edge.',
        render: () => <TextField label="Part Number" defaultValue="00455-156-5734-01-F" />,
      },
      {
        verdict: 'dont',
        caption: 'Beside it, the labels and the values make two ragged columns. The component cannot do this — it had to be drawn by hand.',
        render: () => (
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--vy-space-6)' }}>
            <span style={{ fontSize: 'var(--vy-text-sm)', fontWeight: 600 }}>Part Number</span>
            <input className="vy-input" defaultValue="00455-156-5734-01-F" />
          </label>
        ),
      },
    ],
  },
  {
    title: 'Required, not optional',
    note: 'A red asterisk marks what must be filled, in view and in edit mode. Nothing marks what need not be.',
    compare: [
      {
        verdict: 'do',
        caption: 'Mark the few. On a form where most fields are required, the marks are the exception and stay readable.',
        render: () => (
          <>
            <TextField label="Part Number" required defaultValue="00455-156-5734-01-F" />
            <TextField label="Customer Reference" defaultValue="" />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'The word (optional) adds a word to every field that needs nothing said about it.',
        render: () => (
          <>
            <TextField label="Part Number" required defaultValue="00455-156-5734-01-F" />
            <TextField label="Customer Reference (optional)" defaultValue="" />
          </>
        ),
      },
    ],
  },
  {
    title: 'A hint or an error, never both',
    note: 'Two lines under one field, each claiming to say what to do next, is one line too many.',
    compare: [
      {
        verdict: 'do',
        caption: 'While it is right, the hint explains the format.',
        render: () => (
          <TextField label="Part Number" hint="Prefixed by the customer." defaultValue="00455-" />
        ),
      },
      {
        verdict: 'dont',
        caption: 'Once it is wrong, the hint has to give the line up. Keeping both leaves the reader choosing which one to believe.',
        render: () => (
          <div>
            <TextField label="Part Number" hint="Prefixed by the customer." defaultValue="156-5734" />
            {/* A `<span>`, not a `<p>`: `.vy-specimen p` carries the stage's
                own ink at a higher specificity than `.vy-field-error`, so the
                error rendered in ordinary text and the card showed two
                identical grey lines instead of a grey one and a red one. */}
            <span className="vy-field-error">Start with the customer prefix.</span>
          </div>
        ),
      },
    ],
  },
];
