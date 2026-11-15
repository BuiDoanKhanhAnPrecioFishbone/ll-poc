import { useState } from 'react';
import { Checkbox } from '../ui/Overlays';
import type { Example } from './types';

function Independent() {
  const [coating, setCoating] = useState(true);
  const [alt, setAlt] = useState(false);
  return (
    <>
      <Checkbox checked={coating} onCheckedChange={setCoating} label="Conformal Coating" />
      <Checkbox checked={alt} onCheckedChange={setAlt} label="Provide Alt AML For Out of Stock" />
    </>
  );
}

function SelectAll() {
  const [rows, setRows] = useState([true, false, false]);
  const count = rows.filter(Boolean).length;
  return (
    <>
      <label className="vy-check">
        <input
          type="checkbox"
          className="k-checkbox k-checkbox-lg"
          aria-label="Select all rows"
          checked={count === rows.length}
          ref={el => { if (el) el.indeterminate = count > 0 && count < rows.length; }}
          onChange={e => setRows(rows.map(() => e.target.checked))}
        />
        <span>Select all</span>
      </label>
      {rows.map((on, i) => (
        <Checkbox key={i} checked={on} label={`Row ${i + 1}`}
                  onCheckedChange={c => setRows(rows.map((r, j) => (j === i ? c : r)))} />
      ))}
    </>
  );
}

export const examples: Example[] = [
  {
    title: 'Independent yes/nos',
    note: 'Each box stands alone; ticking one never changes another.',
    render: () => <Independent />,
  },
  {
    title: 'Indeterminate select-all',
    note: 'Tick some rows and the header shows a dash. The prop does not exist, so it is set on the DOM node.',
    render: () => <SelectAll />,
  },
];
