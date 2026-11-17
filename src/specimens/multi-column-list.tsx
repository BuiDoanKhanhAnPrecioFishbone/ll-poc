import { useState } from 'react';
import { MultiColumnList } from '../ui/Inputs';
import type { Example } from './types';

type Part = { part: string; rev: string; desc: string };

/* Her own two rows, kept verbatim: they differ in the last character, which
   is the whole argument for the extra columns. */
const PARTS: Part[] = [
  { part: '0455-300-0017-11', rev: '01', desc: 'PCA iovrm_v11' },
  { part: '0455-300-0017-12', rev: '02', desc: 'PCA iovrm_v12' },
  { part: '0455-300-0019-04', rev: '04', desc: 'PCA sensor board' },
  { part: '0455-118-2240-02', rev: '02', desc: 'Harness, 2.4m' },
];

const COLUMNS = [
  { field: 'part', header: 'Part Number', width: '190px' },
  { field: 'rev',  header: 'Rev',         width: '60px' },
  { field: 'desc', header: 'Description', width: '200px' },
];

function Live() {
  const [v, setV] = useState<Part | null>(PARTS[0]);
  return (
    <MultiColumnList label="Part Number" columns={COLUMNS} data={PARTS}
                     value={v} onChange={setV}
                     textField="part" dataItemKey="part" required />
  );
}

function Empty() {
  const [v, setV] = useState<Part | null>(null);
  return (
    <MultiColumnList label="Part Number" columns={COLUMNS} data={PARTS}
                     value={v} onChange={setV}
                     textField="part" dataItemKey="part" />
  );
}

export const examples: Example[] = [
  {
    title: 'Open it, then type "sensor"',
    note: 'Every column is searchable, not just the one in the box — finding a part by its description is the reason the other columns are on screen at all.',
    render: () => <Live />,
  },
  {
    title: 'Nothing picked yet',
    render: () => <Empty />,
  },
];
