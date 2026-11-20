import { ImageBox } from '../ui/Files';
import type { Example } from './types';

/* A 4:3 placeholder drawn in the file itself, so the card needs no asset and
   cannot break when one is moved. */
const PHOTO = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 132">
     <rect width="220" height="132" fill="#dfe5ee"/>
     <rect x="28" y="40" width="164" height="56" rx="6" fill="#9aa8bd"/>
     <circle cx="62" cy="68" r="12" fill="#dfe5ee"/>
   </svg>`);

/**
 * The Image box page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/image-box.md`. The first is hers and it is
 * the reason the empty state is the same box rather than a different element
 * — a claim about what does NOT happen, which only a pair of cards can show.
 */
export const examples: Example[] = [
  {
    title: 'The empty box is the same box',
    note: 'Her sizes, max 220 × 132, filled or not — which is what keeps the form from jumping when an image arrives.',
    compare: [
      {
        verdict: 'do',
        caption: 'Dashed instead of solid, and nothing else moves. The field beside it sits where it will still sit in a second’s time.',
        render: () => (
          <div style={{ display: 'flex', gap: 'var(--vy-space-8)', alignItems: 'flex-start' }}>
            <ImageBox types="PNG, JPG" />
            <ImageBox src={PHOTO} alt="Bracket, steel" />
          </div>
        ),
      },
      {
        verdict: 'dont',
        caption: 'No box until an image exists, and the whole record header shifts down the moment one is uploaded. Drawn by hand: nothing.',
        render: () => (
          <div style={{ display: 'flex', gap: 'var(--vy-space-8)', alignItems: 'flex-start' }}>
            <span className="vy-field-hint">No image</span>
            <ImageBox src={PHOTO} alt="Bracket, steel" />
          </div>
        ),
      },
    ],
  },
  {
    title: 'One image, not a gallery',
    note: 'Several images want a strip with its own navigation; her image popup carries Previous and Next for exactly that.',
    compare: [
      {
        verdict: 'do',
        caption: 'One image belongs to the record, at the size she drew.',
        render: () => <ImageBox src={PHOTO} alt="Bracket, steel" />,
      },
      {
        verdict: 'dont',
        caption: 'Three boxes in a row is a gallery with no navigation, no order and no way to say which is the part photo.',
        render: () => (
          <div style={{ display: 'flex', gap: 'var(--vy-space-6)', flexWrap: 'wrap' }}>
            <ImageBox src={PHOTO} alt="Bracket, front" />
            <ImageBox src={PHOTO} alt="Bracket, side" />
            <ImageBox src={PHOTO} alt="Bracket, fitted" />
          </div>
        ),
      },
    ],
  },
];
