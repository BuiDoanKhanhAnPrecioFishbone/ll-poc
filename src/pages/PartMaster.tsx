import { useMemo, useState } from 'react';
import { generateParts, PART_COLUMNS, type Part } from '../data/parts';
import { StandardGrid } from '../components/StandardGrid';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import { StatusBadge } from '../components/StatusBadge';

export function PartMaster() {
  const data = useMemo(() => generateParts(2000), []);
  const [selected, setSelected] = useState<Part | null>(null);

  return (
    <>
      <StandardGrid data={data} columns={PART_COLUMNS} title="Part Master" onRowClick={setSelected} />

      {selected && (
        <Dialog title={selected.partNumber} onClose={() => setSelected(null)} width={640}>
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
          <DialogActionsBar>
            <Button onClick={() => setSelected(null)}>Close</Button>
            <Button themeColor="primary" onClick={() => setSelected(null)}>Edit part</Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </>
  );
}
