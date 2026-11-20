import { Button, noPermission } from '../ui/Button';
import { DialogDepth } from '../ui/dialogDepth';
import { MoreMenu } from '../ui/MoreMenu';
import type { Example } from './types';

/**
 * The Button page's USAGE tab, drawn instead of described.
 *
 * Every rule here is already written in `docs/components/button.md` — this
 * file adds no guidance of its own. It shows the five that are about
 * APPEARANCE, which are the five a sentence conveys worst: a reader has to
 * rebuild "one filled button per view" in their head before it means
 * anything, and two cards show it at a glance.
 *
 * A SEPARATE SLUG, `button-usage`, rather than more entries in `button.tsx`.
 * The directive names a slug and a slug is a file, so this is what puts the
 * Do/Don'ts on the usage tab while the Examples tab keeps the variants, sizes
 * and states. No change to the generator, and the registry finds it on its
 * own.
 */
const more = [
  { label: 'Duplicate', onSelect: () => {} },
  { label: 'Export', onSelect: () => {} },
  { label: 'Delete', note: 'Removes the record for everyone.', danger: true, onSelect: () => {} },
];

export const examples: Example[] = [
  {
    title: 'Emphasis',
    note: 'One filled button per view — the most likely next step. Everything else steps down the ladder.',
    compare: [
      {
        verdict: 'do',
        caption: 'Give the one action a user came for the fill, and the rest an outline.',
        render: () => (
          <>
            <Button variant="filled">Save</Button>
            <Button>Discard Changes</Button>
            <Button variant="text">Export</Button>
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Fill three and none of them is primary any more — the user reads all three before choosing.',
        render: () => (
          <>
            <Button variant="filled">Save</Button>
            <Button variant="filled">Discard Changes</Button>
            <Button variant="filled">Export</Button>
          </>
        ),
      },
    ],
  },
  {
    title: 'A destructive action',
    note: 'Outlined on a toolbar, filled in the confirm popup. The component picks by reading where it is.',
    compare: [
      {
        verdict: 'do',
        caption: 'On the record bar it is outlined, and the red fill is saved for the dialog that asks.',
        render: () => (
          <>
            <Button variant="filled">Save</Button>
            <Button variant="danger">Delete</Button>
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A red fill beside Save makes Delete the loudest thing on a screen nobody came to delete on.',
        render: () => (
          <>
            <Button variant="filled">Save</Button>
            {/* The filled danger is reached through the real mechanism — the
                dialog context — rather than by forcing a Kendo class on it.
                A "Don't" card drawn with a hack stops matching the product
                the moment the mechanism changes, which is the one thing these
                cards exist to prevent. */}
            <DialogDepth.Provider value={1}>
              <Button variant="danger">Delete</Button>
            </DialogDepth.Provider>
          </>
        ),
      },
    ],
  },
  {
    title: 'The label',
    note: 'Title Case, and it names the outcome — so the toast afterwards can repeat it in the past tense.',
    compare: [
      {
        verdict: 'do',
        caption: 'Publish produces Published. The word is readable out of context, in a menu or a log.',
        render: () => (
          <>
            <Button variant="filled">Publish</Button>
            <Button>Discard Changes</Button>
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'OK answers a question the user has already scrolled past, and Cancel outside a dialog says nothing about what it loses.',
        render: () => (
          <>
            <Button variant="filled">OK</Button>
            <Button>Cancel</Button>
          </>
        ),
      },
    ],
  },
  {
    title: 'How many',
    note: 'At most four visible, the rest behind More — and the label is the word More with a chevron, never a row of dots.',
    compare: [
      {
        verdict: 'do',
        caption: 'Four and a More menu. The primary action is still findable at a glance.',
        render: () => (
          <>
            <Button variant="filled">Save</Button>
            <Button>Discard Changes</Button>
            <Button>Export</Button>
            <MoreMenu items={more} />
          </>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Seven across a toolbar and the user reads the row instead of acting on it.',
        render: () => (
          <>
            <Button variant="filled">Save</Button>
            <Button>Discard Changes</Button>
            <Button>Export</Button>
            <Button>Duplicate</Button>
            <Button>Recalculate</Button>
            <Button>Send</Button>
            <Button>Print</Button>
          </>
        ),
      },
    ],
  },
  {
    title: 'When it cannot be pressed',
    note: 'A control the user is not allowed to use says so. A control that is simply not ready yet does not have to.',
    compare: [
      {
        verdict: 'do',
        caption: 'Hover it: the reason is there. It stays focusable, so a keyboard reaches the reason too.',
        render: () => (
          <Button variant="danger" unavailable={noPermission('delete this view')}>
            Delete
          </Button>
        ),
      },
      {
        verdict: 'dont',
        caption: 'Disabled with no reason reads as broken, and a tooltip put on it would never open — a disabled button has no hover target.',
        render: () => <Button variant="danger" disabled>Delete</Button>,
      },
    ],
  },
];
