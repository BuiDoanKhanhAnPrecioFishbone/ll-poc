import { ImageBox } from '../ui/Files';
import type { Example } from './types';

/* A drawn placeholder rather than a bundled photo: a specimen that ships an
   image file is a specimen that can rot, and the box is what this shows. */
const SAMPLE =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 132">
       <rect width="220" height="132" fill="#dae2f3"/>
       <circle cx="78" cy="52" r="18" fill="#7f9ce1"/>
       <path d="M18 112 74 62l34 30 26-20 48 40z" fill="#4973d4"/>
     </svg>`);

export const examples: Example[] = [
  {
    title: 'With an image',
    note: 'Max 220 × 132, her size. Clicking opens the image popup.',
    render: () => <ImageBox src={SAMPLE} alt="Part image" />,
  },
  {
    title: 'Empty',
    note: 'The same box with a dashed border, which is what keeps the layout from jumping when an image arrives.',
    render: () => <ImageBox types="PNG, JPG · max 5 MB" />,
  },
];
