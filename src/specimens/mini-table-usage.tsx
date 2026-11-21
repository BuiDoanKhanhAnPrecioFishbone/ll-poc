import { MiniTable } from '../ui/MiniTable';
import { Group } from '../ui/Group';
import { ReadValue } from '../ui/FieldRow';
import type { ColumnSpec } from '../components/column-model';
import type { Example } from './types';

type Fact = { id: number; field: string; value: string };
type Doc = { id: number; name: string; kind: string; added: Date };

const factCols: ColumnSpec<Fact>[] = [
  { field: 'field', title: 'Field', role: 'text' },
  { field: 'value', title: 'Value', role: 'text' },
];

const docCols: ColumnSpec<Doc>[] = [
  { field: 'name', title: 'Document', role: 'ident' },
  { field: 'kind', title: 'Type', role: 'text' },
  { field: 'added', title: 'Added', role: 'date' },
];

/* REAL `Date`s, not strings. A `date` column hands its value straight to
   `fmtDate`, which hands it to `Intl.DateTimeFormat.format` — and that throws
   `RangeError: Invalid time value` on a string, taking the whole specimen
   down with it. The page rendered nothing at all and `tsc` was happy, because
   `ColumnSpec` types the FIELD and not what the role expects of it. Found by
   `dodont:check` on the morning after these cards were written. */
const docs: Doc[] = [
  { id: 1, name: 'Gerber pack rev C', kind: 'Drawing', added: new Date('2026-11-04') },
  { id: 2, name: 'Customer BoM', kind: 'Spreadsheet', added: new Date('2026-11-04') },
  { id: 3, name: 'Approval email', kind: 'Message', added: new Date('2026-11-11') },
  { id: 4, name: 'Test spec', kind: 'Document', added: new Date('2026-11-12') },
  { id: 5, name: 'Quote PDF', kind: 'Document', added: new Date('2026-11-18') },
  /* NINE, not five, and the number is load-bearing: `MiniTable` draws the
     filter row at eight rows and above. At five the Do card showed no filter
     cells while its caption promised "a filter row that earns its height" —
     a card arguing for something it was not showing. */
  { id: 6, name: 'Stencil drawing', kind: 'Drawing', added: new Date('2026-11-18') },
  { id: 7, name: 'Component datasheet', kind: 'Document', added: new Date('2026-11-19') },
  { id: 8, name: 'Shipping manifest', kind: 'Spreadsheet', added: new Date('2026-11-19') },
  { id: 9, name: 'Signed NDA', kind: 'Document', added: new Date('2026-11-20') },
];

function Facts() {
  return (
    <div className="vy-field-control">
      <span className="vy-field-label">Incoterm</span>
      <ReadValue>DDP</ReadValue>
    </div>
  );
}

/**
 * The Mini table page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/mini-table.md`. The first is the mistake
 * every ERP screen in the world has made at least once — three facts about
 * one thing laid out as a two-column table — and it is only obvious beside
 * the field group it should have been.
 */
export const examples: Example[] = [
  {
    title: 'A list, not a fact sheet',
    note: 'A table is for several of the same thing. Three facts about ONE thing are a field group.',
    compare: [
      {
        verdict: 'do',
        caption: 'Labels above values, in a group. The reader runs down one column and is done.',
        render: () => (
          <Group title="Shipping" columns={3}>
            <Facts />
            <div className="vy-field-control">
              <span className="vy-field-label">Destination</span>
              <ReadValue>Hanoi</ReadValue>
            </div>
            <div className="vy-field-control">
              <span className="vy-field-label">Carrier</span>
              <ReadValue>DHL</ReadValue>
            </div>
          </Group>
        ),
      },
      {
        verdict: 'dont',
        caption: 'A Field / Value table spends a header row, a sort control and a border on three facts, and the word “Field” tells the reader nothing.',
        render: () => (
          <MiniTable columns={factCols} data={[
            { id: 1, field: 'Incoterm', value: 'DDP' },
            { id: 2, field: 'Destination', value: 'Hanoi' },
            { id: 3, field: 'Carrier', value: 'DHL' },
          ]} />
        ),
      },
    ],
  },
  {
    title: 'Filters are what you are paying for',
    note: 'The per-column filter cells are the reason to pay for a table. A list nobody filters or sorts is a plain list.',
    compare: [
      {
        verdict: 'do',
        caption: 'Nine documents with a type and a date: columns worth sorting, and — from the eighth row — a filter row that earns its height.',
        render: () => <MiniTable columns={docCols} data={docs} />,
      },
      {
        verdict: 'dont',
        caption: 'One column of names. Nothing to sort against, nothing to filter by — a bulleted list says it in a third of the space.',
        render: () => (
          <MiniTable columns={[{ field: 'name', title: 'Document', role: 'ident' }]} data={docs} />
        ),
      },
    ],
  },
];
