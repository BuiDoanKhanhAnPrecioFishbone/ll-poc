import { Button } from '../ui/Button';
import { FileRow, FileTypeChip } from '../ui/Files';
import type { Example } from './types';

const Dl = () => (
  <Button variant="text" size="xs" aria-label="Download">⤓</Button>
);
const More = () => (
  <Button variant="text" size="xs" aria-label="More">⋯</Button>
);

export const examples: Example[] = [
  {
    title: 'The five chips',
    note: 'Her families: PDF red, XLS green, DOC blue, IMG teal, ZIP and anything else gray. The label is the real extension; the colour is the family.',
    render: () => (
      <>
        <FileTypeChip name="a.pdf" />
        <FileTypeChip name="a.xlsx" />
        <FileTypeChip name="a.docx" />
        <FileTypeChip name="a.png" />
        <FileTypeChip name="a.zip" />
        <FileTypeChip name="a.dxf" />
      </>
    ),
  },
  {
    title: 'View mode',
    note: 'The name is the link that opens the preview — her note is explicit that there is no eye icon, because a second control for what the name already does is one control too many.',
    render: () => (
      <div className="vy-specimen-stack">
        <FileRow name="Apple_RFQ_drawing.pdf" meta="ver. 1 · 2.4 MB" action={<Dl />} />
        <FileRow name="bom-test.xlsx" meta="ver. 2 · 86 KB" action={<Dl />} />
      </div>
    ),
  },
  {
    title: 'Edit mode, and one added but not saved',
    note: 'More replaces Download. The added row takes the information tint — the same colour a changed field uses, saying "this is new here".',
    render: () => (
      <div className="vy-specimen-stack">
        <FileRow state="edit" name="assembly-notes.docx" meta="ver. 1 · 40 KB" action={<More />} />
        <FileRow state="added" name="Gerber_Rev2.zip" meta="1.1 MB" action={<More />} />
      </div>
    ),
  },
  {
    title: 'Uploading, and rejected',
    note: 'The rejected row keeps the octagon that an error toast uses: the tint is never allowed to carry the meaning alone.',
    render: () => (
      <div className="vy-specimen-stack">
        <FileRow state="uploading" name="Gerber_Rev1.zip" progress={60} />
        <FileRow state="rejected" name="photo.heic" reason="File type not allowed" />
      </div>
    ),
  },
];
