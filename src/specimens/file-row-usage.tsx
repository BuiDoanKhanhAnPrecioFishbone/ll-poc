import { FileRow } from '../ui/Files';
import { Button } from '../ui/Button';
import { Icon } from '../ui/icons';
import type { Example } from './types';

/**
 * The File row page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/file-row.md`. The first is hers, explicit,
 * and the kind of thing that gets added back by someone being helpful — so
 * it is worth having the two rows side by side to point at.
 */
export const examples: Example[] = [
  {
    title: 'No eye icon',
    note: 'Her note is explicit: a separate preview button is a second control for what the name already does.',
    compare: [
      {
        verdict: 'do',
        caption: 'The name is the link. One target, and the row ends with the action that is not the name — Download.',
        render: () => (
          <FileRow name="Gerber pack rev C.pdf" meta="ver. 1 · 2.4 MB"
                   action={<Button size="xs" icon={<Icon name="download" size={14} />} aria-label="Download" />} />
        ),
      },
      {
        verdict: 'dont',
        caption: 'An eye beside the name gives one job two controls, and the user has to work out whether they do the same thing. Drawn by hand.',
        render: () => (
          <FileRow name="Gerber pack rev C.pdf" meta="ver. 1 · 2.4 MB"
                   action={<>
                     <Button size="xs" icon={<Icon name="eye" size={14} />} aria-label="Preview" />
                     <Button size="xs" icon={<Icon name="download" size={14} />} aria-label="Download" />
                   </>} />
        ),
      },
    ],
  },
  {
    title: 'A refusal replaces the meta',
    note: 'The rejected row carries the reason where the size would be, with the octagon beside it — the tint is not allowed to say it alone.',
    compare: [
      {
        verdict: 'do',
        caption: 'The reason is in the row that failed, where the user is already looking.',
        render: () => (
          <FileRow name="assembly-photos.zip" state="rejected" reason="Over 10 MB. Split it or link it instead." />
        ),
      },
      {
        verdict: 'dont',
        caption: 'A red row that still reports its size says something is wrong and leaves the user to guess what. Drawn by hand.',
        render: () => (
          <FileRow name="assembly-photos.zip" state="rejected" reason="24.8 MB" />
        ),
      },
    ],
  },
];
