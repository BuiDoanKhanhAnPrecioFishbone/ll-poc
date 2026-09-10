import { useMemo, useState } from 'react';
import { Dialog } from '../ui/Overlays';
import { TextField } from '../ui/Field';
import { MiniTable } from '../ui/MiniTable';
import { generateMpns, MPN_COLUMNS, type Mpn } from '../data/engineering';
import type { ColumnSpec } from './column-model';

/**
 * AML Search — gap M2.
 *
 * On the live Part Master toolbar (`Add new Part` · `Import` ·
 * `Export Part Master Data` · **`AML Search`**) and missing here, which was odd
 * twice over: the Approved Manufacturer List is already modelled inside a part
 * record by `MpnMapping.tsx`, so the data existed with no way in from the list.
 *
 * WHAT IT SEARCHES IS AN INFERENCE, and flagged as one. The live dialog was not
 * opened — it is on a production screen and we were reading, not clicking. What
 * the name fixes is the SUBJECT: an Approved Manufacturer List is manufacturers
 * and manufacturer part numbers, which is exactly the question the part-number
 * box on this screen cannot answer. So it searches MPN and manufacturer, and
 * says so in its own subtitle rather than pretending to be authoritative.
 */
const COLUMNS: ColumnSpec<Mpn>[] = MPN_COLUMNS.filter(
  c => ['mpnNumber', 'manufacturer', 'description', 'lifecycleStatus', 'packageType'].includes(c.field),
);

export function AmlSearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const all = useMemo(() => generateMpns(), []);

  /* Nothing until something is typed. A dialog that opens showing 600 rows
     invites scrolling; this one asks a question and waits for it. */
  const hits = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (n.length < 2) return [];
    return all.filter(m =>
      m.mpnNumber.toLowerCase().includes(n) ||
      m.manufacturer.toLowerCase().includes(n) ||
      m.description.toLowerCase().includes(n)).slice(0, 60);
  }, [q, all]);

  return (
    <Dialog
      open
      title="AML Search"
      subtitle="Find a part by its manufacturer or manufacturer part number"
      size="lg"
      onClose={onClose}
    >
      <TextField
        label="Manufacturer or MPN"
        placeholder="Murata, TI, 0603…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />

      {q.trim().length < 2 ? (
        <p className="vy-hint">Type at least two characters.</p>
      ) : hits.length === 0 ? (
        <p className="vy-empty-inline">No approved manufacturer part matches “{q.trim()}”.</p>
      ) : (
        <>
          <p className="vy-hint">
            {hits.length === 60 ? 'First 60 matches' : `${hits.length} match${hits.length === 1 ? '' : 'es'}`}
          </p>
          <MiniTable data={hits} columns={COLUMNS} empty="No match." />
        </>
      )}
    </Dialog>
  );
}
