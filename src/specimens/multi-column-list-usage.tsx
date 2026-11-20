import { useState } from 'react';
import { MultiColumnList } from '../ui/Inputs';
import { Select } from '../ui/Overlays';
import type { Example } from './types';

type Part = { part: string; rev: string; desc: string };

/* Her own two rows, kept verbatim: they differ in the last character of
   sixteen, which is the whole argument for the extra columns. */
const PARTS: Part[] = [
  { part: '0455-300-0017-11', rev: '01', desc: 'PCA iovrm_v11' },
  { part: '0455-300-0017-12', rev: '02', desc: 'PCA iovrm_v12' },
  { part: '0455-300-0019-04', rev: '04', desc: 'PCA sensor board' },
  { part: '0455-118-2240-02', rev: '02', desc: 'Harness, 2.4m' },
];

const COLUMNS = [
  { field: 'part', header: 'Part Number', width: '190px' },
  { field: 'rev', header: 'Rev', width: '60px' },
  { field: 'desc', header: 'Description', width: '200px' },
];

type Pkg = { code: string };
const PACKAGES: Pkg[] = ['0402', '0603', 'SOT-23', 'QFN-24'].map(code => ({ code }));

function Parts() {
  const [v, setV] = useState<Part | null>(PARTS[0]);
  return <MultiColumnList label="Part Number" columns={COLUMNS} data={PARTS}
                          value={v} onChange={setV} textField="part" dataItemKey="part" />;
}

function PartsAsSelect() {
  const [v, setV] = useState(PARTS[0].part);
  return <Select label="Part Number" options={PARTS.map(p => p.part)} value={v} onChange={setV} />;
}

function PackagesAsColumns() {
  const [v, setV] = useState<Pkg | null>(PACKAGES[0]);
  return <MultiColumnList label="Package" columns={[{ field: 'code', header: 'Package', width: '160px' }]}
                          data={PACKAGES} value={v} onChange={setV} textField="code" dataItemKey="code" />;
}

function PackagesAsSelect() {
  const [v, setV] = useState(PACKAGES[0].code);
  return <Select label="Package" options={PACKAGES.map(p => p.code)} value={v} onChange={setV} />;
}

/**
 * The Multi-column list page's USAGE tab, drawn.
 *
 * Two rules off `docs/components/multi-column-list.md`, and they point in
 * opposite directions — which is why the page needs both cards. The control
 * earns its extra width on a serialised value and wastes it on a word.
 *
 * Open both lookups in the first pair: the argument is in the popup, not in
 * the closed field.
 */
export const examples: Example[] = [
  {
    title: 'When the value does not identify the row',
    note: 'Her own example: two part numbers differing in the last character of sixteen.',
    compare: [
      {
        verdict: 'do',
        caption: 'Rev and Description in their own columns, so the eye lands on the difference instead of hunting for it.',
        render: () => <Parts />,
      },
      {
        verdict: 'dont',
        caption: 'One column of near-identical strings. The reader compares sixteen characters to reject each row, and picks the wrong one once.',
        render: () => <PartsAsSelect />,
      },
    ],
  },
  {
    title: 'Not for a short list of words',
    note: 'Package type, status, currency — those are a select.',
    compare: [
      {
        verdict: 'do',
        caption: 'One word identifies the row already. A plain select is the whole control it needs.',
        render: () => <PackagesAsSelect />,
      },
      {
        verdict: 'dont',
        caption: 'A header and a column for a four-character code: furniture around a word that was never ambiguous.',
        render: () => <PackagesAsColumns />,
      },
    ],
  },
];
