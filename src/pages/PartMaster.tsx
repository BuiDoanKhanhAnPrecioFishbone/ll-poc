import { useEffect, useMemo, useState } from 'react';
import { generateParts, PART_COLUMNS, type Part } from '../data/parts';
import { partFilterFields } from '../data/partFilters';
import { DataGrid } from '../ui/DataGrid';
import { Dialog } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { FilterToolbar } from '../ui/FilterToolbar';
import { ViewSetting } from '../ui/ViewSetting';
import { useViews, draftFrom } from '../ui/useViews';
import { applyView, activeCount, type FilterValues, type SavedView } from '../ui/views';
import { SmartIcon } from '../components/quotation/SmartButtons';

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

  /* ---- Filters, views and columns ----------------------------------------
     The guideline asks this screen for "Multi-Criteria Filtering, Customizable
     column visibility, Flexible sorting" and for view templates that can be set
     up and selected. None of it was here, and none of it needed building:
     DataGrid already takes filters, filterPanel, filterActive, views,
     viewSetting, allColumns, onToggleColumn and onResetColumns, and every one
     works on Project Requirements. This screen simply passed none of them, so
     its toolbar held a search box and nothing else.

     Wired the same way as Project Requirements, deliberately. Two grids that
     answer the same question with two different control layouts cost a user
     more than either layout saves. */
  const [values, setValues] = useState<FilterValues>({});
  const [settingOpen, setSettingOpen] = useState(false);

  /** Every column the screen has, and every field its filter panel offers. */
  const systemView = useMemo<SavedView>(() => ({
    id: 'system', name: 'Default', isDefault: false, system: true,
    fields: ['customer', 'partSource', 'partClass', 'partType', 'abc', 'uom',
             'status', 'lastChange'],
    columns: PART_COLUMNS.map(c => ({ field: String(c.field) })),
    sort: [],
  }), []);

  /* Its own storage key, so a view saved on Part Master cannot appear in the
     Project Requirements picker holding columns that screen does not have. */
  const { views: savedViews, active: view, activeId, setActiveId, save, remove } =
    useViews('part-master', systemView);

  const [workingCols, setWorkingCols] = useState(view.columns);
  useEffect(() => { setWorkingCols(view.columns); }, [view]);

  const toggleColumn = (field: string) => setWorkingCols(cols =>
    cols.some(c => c.field === field)
      ? cols.filter(c => c.field !== field)
      /* Re-adding puts a column back where the screen defines it, not at the
         end — a column that reappears elsewhere reads as a new one. */
      : [...cols, { field }].sort((a, b) =>
          PART_COLUMNS.findIndex(c => String(c.field) === a.field) -
          PART_COLUMNS.findIndex(c => String(c.field) === b.field)));

  const allFields = useMemo(() => partFilterFields(data), [data]);
  const fields = useMemo(
    () => allFields.filter(f => view.fields.includes(f.field)),
    [allFields, view.fields]);
  const active = activeCount(fields, values);

  const rows = useMemo(() => applyView(data, fields, values), [data, fields, values]);

  const allColumns = useMemo(() => {
    const byField = new Map(PART_COLUMNS.map(c => [String(c.field), c]));
    return workingCols
      .map(vc => {
        const base = byField.get(vc.field);
        if (!base) return null;
        return {
          ...base,
          ...(vc.label ? { title: vc.label } : {}),
          ...(vc.width ? { width: vc.width, widthNote: 'Set on this view.' } : {}),
        };
      })
      .filter(Boolean) as typeof PART_COLUMNS;
  }, [workingCols]);

  return (
    <>
      <DataGrid
        data={rows}
        columns={allColumns}
        title="Part Master"
        subtitle="parts"
        searchPlaceholder="Search part number, description or customer"
        actions={<>
          <Button onClick={() => toast.notImplemented('import parts from a spreadsheet')}>Import</Button>
          <Button onClick={() => toast.notImplemented(`export these ${rows.length} parts to Excel`)}>Export</Button>
          <Button variant="filled" onClick={() => toast.notImplemented('open a blank part record')}>New Part</Button>
        </>}
        filterPanel={
          <FilterToolbar fields={fields} values={values} onChange={setValues}
                         onClear={() => setValues({})} activeCount={active}
                         onEditFields={() => setSettingOpen(true)} />
        }
        filterActive={active}
        views={
          <label className="vy-view-picker">
            <span className="vy-sr-only">Select View</span>
            <select value={activeId} onChange={e => setActiveId(e.target.value)}>
              {savedViews.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name}{v.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </label>
        }
        allColumns={PART_COLUMNS}
        onToggleColumn={toggleColumn}
        onResetColumns={() => setWorkingCols(view.columns)}
        viewSetting={
          <button type="button" className="vy-funnel" aria-label="Setup View Template"
                  title="Setup View Template" onClick={() => setSettingOpen(true)}>
            <SmartIcon name="settings" />
          </button>
        }
        loading={loading}
        onOpenRow={setSelected}
      />

      {settingOpen && (
        <ViewSetting
          screen="Part Master"
          view={{ ...view, columns: workingCols }}
          allColumns={PART_COLUMNS}
          allFields={allFields}
          canDelete={!view.system}
          onClose={() => setSettingOpen(false)}
          onDiscard={() => setSettingOpen(false)}
          onDelete={() => { remove(view.id); setSettingOpen(false); }}
          /* Same rule as Project Requirements: saving a built-in view, or
             ticking "New View", creates a copy. The built-in is the fallback
             every other view is measured against and has to stay as shipped. */
          onSave={(v, asNew) => {
            save(asNew ? { ...draftFrom(v, v.name), isDefault: v.isDefault } : v);
            setWorkingCols(v.columns);
            setSettingOpen(false);
            toast.success(asNew ? `View “${v.name}” created.` : `View “${v.name}” saved.`);
          }}
        />
      )}

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
