import { useEffect, useMemo, useState } from 'react';
import { generateParts, PART_COLUMNS, type Part } from '../data/parts';
import { PART_QUICK, partFilterFields } from '../data/partFilters';
import { ViewPicker } from '../ui/ViewPicker';
import { DataGrid } from '../ui/DataGrid';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { PartDetail } from '../components/PartDetail';
import { ImportPartsDialog } from '../components/ImportPartsDialog';
import { AddPartDialog } from '../components/AddPartDialog';
import { FilterToolbar } from '../ui/FilterToolbar';
import { ViewSetting } from '../ui/ViewSetting';
import { useViews, draftFrom } from '../ui/useViews';
import { applyView, activeCount, type FilterValues, type SavedView } from '../ui/views';
import { SmartIcon } from '../components/quotation/SmartButtons';
import { useExcelExport } from '../ui/useExcelExport';

export function PartMaster() {
  const toast = useToast();
  /* Re-read after a part is created, so the new row is in the list behind the
     detail dialog rather than appearing only on the next visit. */
  const [created, setCreated] = useState(0);
  const data = useMemo(() => generateParts(2000), [created]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

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
  /* Empty by default — see the note on PART_QUICK. A parts list is a reference,
     not a worklist, so it opens showing every part. */
  const [quickOn, setQuickOn] = useState<string[]>([]);
  const [settingOpen, setSettingOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { exportRows, excel } = useExcelExport<Part>();
  /* Held by id rather than by row, so a selection survives sorting, filtering
     and paging — the user picks parts, not positions. */
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

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

  const toggleQuick = (key: string) =>
    setQuickOn(v => (v.includes(key) ? v.filter(k => k !== key) : [...v, key]));

  /* Quick filters narrow CONJUNCTIVELY with each other and with the advanced
     conditions, exactly as on Project Requirements — turning on two statuses
     asks for parts that are both, which is empty, and the empty state says so
     rather than the grid silently showing nothing. */
  const rows = useMemo(() => {
    const quickMatched = data.filter(p =>
      PART_QUICK.filter(f => quickOn.includes(f.key)).every(f => f.match(p)));
    return applyView(quickMatched, fields, values);
  }, [data, quickOn, fields, values]);

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
        /* Was the single word "parts", which told a reader nothing they could
           not see from the heading. */
        subtitle="Every part on file, with its source and what is on hand"
        kpis={
          /* Each tile IS its filter and shows whether it is on, the same
             contract as Project Requirements: a count you cannot act on is
             decoration. Counted across every part, not the filtered rows — a
             tile summarising the grid it sits above would just repeat it. */
          <>
            {PART_QUICK.map(f => {
              const n = data.filter(f.match).length;
              const on = quickOn.includes(f.key);
              return (
                <button key={f.key} type="button" className="vy-kpi" data-key={f.key}
                        aria-pressed={on} onClick={() => toggleQuick(f.key)}>
                  <span className="vy-kpi-n">{n.toLocaleString()}</span>
                  <span className="vy-kpi-label">{f.label}</span>
                </button>
              );
            })}
          </>
        }
        filters={(quickOn.length > 0 || active > 0) ? (
          <div className="vy-filter-row-main">
            <Button variant="text" onClick={() => { setQuickOn([]); setValues({}); }}>
              Clear filters
            </Button>
          </div>
        ) : null}
        searchPlaceholder="Search part number, description or customer"
        actions={<>
          {/* Opens the scope choice the guideline asks for — Import All or
              Import by Customer — rather than reporting one unspecified action
              for two different outcomes. */}
          <Button onClick={() => setImportOpen(true)}>Import</Button>
          {/* Named as the guideline names it. The label changes only to state
              the SCOPE once a selection exists, because that is the moment the
              two possible outcomes diverge — export what I picked, or export
              everything I can see. A button that reads the same either way
              makes the user check the grid to find out which it will do. */}
          <Button
            title="Export Part Master Data"
            /* "Allow to select single or multi part before exporting by
               checking on 1st column on part's row" and "when clicking on
               Export download the Part Master data as an Excel file for
               selected part(s)". The SCOPE is the selection when there is one
               and the filtered view otherwise — which is what the label has
               always promised and now what it does. */
            onClick={() => exportRows(
              selected.size ? rows.filter(r => selected.has(r.id)) : rows,
              view.columns.map(c => PART_COLUMNS.find(p => String(p.field) === c.field)!).filter(Boolean),
              selected.size ? `PartMaster-selected-${selected.size}.xlsx` : 'PartMaster.xlsx',
            )}>
            {selected.size
              ? `Export ${selected.size} selected`
              : 'Export Part Master Data'}
          </Button>
          <Button variant="filled" onClick={() => setAddOpen(true)}>New Part</Button>
        </>}
        filterPanel={
          <FilterToolbar fields={fields} values={values} onChange={setValues}
                         onClear={() => setValues({})} activeCount={active}
                         onEditFields={() => setSettingOpen(true)} />
        }
        filterActive={active}
        quickActive={quickOn.length}
        views={
          <ViewPicker views={savedViews} activeId={activeId} onChange={setActiveId} />
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
        selected={selected}
        onSelectedChange={setSelected}
        onOpenRow={setSelectedPart}
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

      {/* Renders nothing; it owns the workbook and triggers the download. */}
      {excel}

      {importOpen && <ImportPartsDialog parts={data} onClose={() => setImportOpen(false)} />}

      {/* "Create the new Part successfully" then "Display the details of the
          newly created part" — the list refreshes and the record opens. */}
      <AddPartDialog
        open={addOpen} parts={data}
        onClose={() => setAddOpen(false)}
        onCreated={p => { setCreated(c => c + 1); setSelectedPart(p); }}
      />

      {selectedPart && <PartDetail part={selectedPart} onClose={() => setSelectedPart(null)} />}

    </>
  );
}
