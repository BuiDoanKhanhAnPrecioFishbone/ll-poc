import { useMemo, useState } from 'react';
import { Dialog, Checkbox, Select } from '../../../ui/Overlays';
import { Button } from '../../../ui/Button';
import { SearchField } from '../../../ui/Field';
import {
  GROUPS, MASTER_GROUP, SUPPLIERS, masterSuppliers, supplierStats, suppliersChanged,
  type Group, type SupplierId, type SupplierSetup,
} from '../../../data/suppliers';

/**
 * Preferred Suppliers — for this quote only.
 *
 * ASKED FOR by the customer's Quoting BoM mockup of 16 Oct: one list grouped by
 * priority, a tick to use a supplier on this quote, a dropdown to move it to
 * another group, and "Auto-pick tries Group 1 first, then Group 2. Unticked
 * suppliers are skipped for this quote only; you can still pick them manually
 * in Quoting."
 *
 * WHY A DIALOG AND NOT A PANEL. Fourteen suppliers is more than a setup strip
 * can hold, and the setting is used once per quote at most — most quotes take
 * the master list untouched. What the strip carries instead is the one line
 * that matters when it HAS been touched: "2 not used · 1 moved".
 *
 * EVERY CHANGE IS MARKED, and marked as a departure from the master rather than
 * as an error: a moved supplier says which group it came from, an unticked one
 * says it is not in use. Reset to Master undoes the lot, and is disabled when
 * there is nothing to undo — a button that does nothing is worse than no button
 * because it has to be tried before that is known.
 */
export function SupplierDialog({ value, onSave, onClose }: {
  value: SupplierSetup;
  onSave: (next: SupplierSetup) => void;
  onClose: () => void;
}) {
  /* Edited on a copy and committed by Save: a supplier list half-changed is a
     quote priced on a rule nobody chose. */
  const [draft, setDraft] = useState<SupplierSetup>(() =>
    Object.fromEntries(Object.entries(value).map(([id, v]) => [id, { ...v }])));
  const [search, setSearch] = useState('');

  const set = (id: SupplierId, patch: Partial<SupplierSetup[string]>) =>
    setDraft(d => ({ ...d, [id]: { ...d[id], ...patch } }));

  const ids = useMemo(() => {
    const k = search.trim().toLowerCase();
    return Object.keys(draft)
      .filter(id => !k || SUPPLIERS[id].toLowerCase().includes(k))
      .sort((a, b) => SUPPLIERS[a].localeCompare(SUPPLIERS[b]));
  }, [draft, search]);

  const stats = supplierStats(draft);

  return (
    <Dialog
      open size="md"
      title="Preferred Suppliers"
      onClose={onClose}
      actions={<>
        {/* LEFT OF THE ROW, because it undoes rather than commits — the same
            place the record's Discard Changes sits. */}
        <Button className="vy-dialog-action-start" variant="text"
                disabled={!suppliersChanged(draft)}
                onClick={() => setDraft(masterSuppliers())}>
          Reset to Master
        </Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="filled" onClick={() => onSave(draft)}>Save</Button>
      </>}
    >
      <div className="vy-sup-top">
        <SearchField placeholder="Search supplier" aria-label="Search supplier"
                     value={search} onChange={e => setSearch(e.target.value)} />
        <span className="vy-sup-count">
          {stats.inUse} of {stats.total} in use · this quote only
        </span>
      </div>

      <div className="vy-sup-list">
        {GROUPS.map(g => {
          const rows = ids.filter(id => draft[id].group === g);
          const allOn = rows.length > 0 && rows.every(id => draft[id].on);
          return (
            <section className="vy-sup-group" key={g}>
              <header className="vy-sup-group-head">
                <strong>Group {g}</strong>
                <span className="vy-sup-count">
                  {rows.filter(id => draft[id].on).length} of {rows.length} in use
                </span>
                <Checkbox checked={allOn} onCheckedChange={on => rows.forEach(id => set(id, { on }))}
                          label="Use all" />
              </header>

              {rows.map(id => {
                const moved = MASTER_GROUP[id] !== draft[id].group;
                const off = !draft[id].on;
                return (
                  <div className="vy-sup-row" key={id} data-off={off || undefined}
                       data-changed={(moved || off) || undefined}>
                    <Checkbox checked={draft[id].on} onCheckedChange={on => set(id, { on })}
                              label={SUPPLIERS[id]} />
                    {moved && <span className="vy-sup-tag">Moved from Group {MASTER_GROUP[id]}</span>}
                    {off && <span className="vy-sup-tag">Not used</span>}
                    <Select label={`Priority group for ${SUPPLIERS[id]}`} size="small"
                            value={String(draft[id].group)}
                            options={GROUPS.map(x => ({ value: String(x), label: `Group ${x}` }))}
                            onChange={v => set(id, { group: Number(v) as Group })} />
                  </div>
                );
              })}

              {!rows.length && (
                <p className="vy-sup-empty">No supplier in this group matches the search.</p>
              )}
            </section>
          );
        })}
      </div>

      <p className="vy-hint">
        Auto-pick tries Group 1 first, then Group 2. A supplier that is not in use is skipped
        for this quote only — you can still choose it by hand in the Supplier column.
      </p>
    </Dialog>
  );
}
