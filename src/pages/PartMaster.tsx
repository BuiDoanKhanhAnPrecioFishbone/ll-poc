import { useEffect, useMemo, useState } from 'react';
import { generateParts, PART_COLUMNS, type Part } from '../data/parts';
import { DataGrid } from '../ui/DataGrid';
import { Dialog } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

export function PartMaster() {
  const toast = useToast();
  const data = useMemo(() => generateParts(2000), []);
  const [selected, setSelected] = useState<Part | null>(null);

  /* The mockup's data is synchronous, so there is nothing to wait for. This
     short delay exists to DEMONSTRATE the loading state, because a pattern
     asserted in a document and never rendered is not a pattern anyone can
     review. Audit finding T5 is that the live app shows "No records available"
     while its spinner is still running; this is the alternative, on screen. */
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  return (
    <>
      <DataGrid
        data={data}
        columns={PART_COLUMNS}
        title="Part Master"
        subtitle="parts"
        searchPlaceholder="Search part number, description or customer"
        actions={<>
          <Button onClick={() => toast.notImplemented('import parts from a spreadsheet')}>Import</Button>
          <Button onClick={() => toast.notImplemented(`export these ${data.length} parts to Excel`)}>Export</Button>
          <Button variant="filled" onClick={() => toast.notImplemented('open a blank part record')}>New Part</Button>
        </>}
        loading={loading}
        onOpenRow={setSelected}
      />

      {selected && (
        <Dialog open title={selected.partNumber} subtitle={selected.description}
                onClose={() => setSelected(null)}
                actions={<>
                  <Button onClick={() => setSelected(null)}>Close</Button>
                  <Button variant="filled" onClick={() => setSelected(null)}>Edit part</Button>
                </>}>
          <div className="vy-record">
            <div className="vy-record-head">
              <div>
                <div className="vy-record-ident">{selected.partNumber}</div>
                <div className="vy-record-desc">{selected.description}</div>
              </div>
              <StatusBadge value={selected.status} />
            </div>
            <dl className="vy-record-grid">
              <div><dt>Customer</dt><dd>{selected.customer}</dd></div>
              <div><dt>Revision</dt><dd>{selected.rev || '—'}</dd></div>
              <div><dt>Source</dt><dd>{selected.partSource}</dd></div>
              <div><dt>Unit of measure</dt><dd>{selected.uom || '—'}</dd></div>
              <div><dt>On hand</dt><dd className="vy-num">{selected.onHand.toLocaleString()}</dd></div>
              <div><dt>Allocated</dt><dd className="vy-num">{selected.allocated.toLocaleString()}</dd></div>
              <div><dt>Available</dt><dd className="vy-num">{(selected.onHand - selected.allocated).toLocaleString()}</dd></div>
              <div><dt>Unit cost</dt><dd className="vy-num">{selected.unitCost.toLocaleString('en-GB', { style: 'currency', currency: 'USD' })}</dd></div>
              <div><dt>Last changed</dt><dd>{selected.lastChange.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</dd></div>
            </dl>
          </div>
        </Dialog>
      )}
    </>
  );
}
