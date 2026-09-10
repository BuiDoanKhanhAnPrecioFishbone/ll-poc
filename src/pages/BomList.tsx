import { useEffect, useMemo, useState } from 'react';
import type { Part } from '../data/parts';
import { generateBomList, bomFilterFields, BOM_LIST_COLUMNS, BOM_QUICK } from '../data/bomList';
import { DataGrid } from '../ui/DataGrid';
import { Button } from '../ui/Button';
import { ViewPicker } from '../ui/ViewPicker';
import { FilterToolbar } from '../ui/FilterToolbar';
import { ViewSetting } from '../ui/ViewSetting';
import { useViews, draftFrom } from '../ui/useViews';
import { applyView, activeCount, type FilterValues, type SavedView } from '../ui/views';
import { SmartIcon } from '../components/quotation/SmartButtons';
import { useToast } from '../ui/Toast';
import { BomComparisonDialog } from '../components/quotation/BomComparisonDialog';
import { PartBomDialog } from '../components/PartBomDialog';
import { CreateBomDialog } from '../components/CreateBomDialog';

/**
 * Bill of Materials list — Inventory Management » Bill of Materials.
 *
 * The guideline's entry for this screen is three steps: navigate to it, search
 * by description or part number, and a BoM Comparison button that follows "the
 * same behavior as defined in here" — so it opens the dialog the RFQ record
 * already uses rather than a second copy of it.
 *
 * WHICH PARTS APPEAR IS AN INFERENCE, and flagged as one. The sheet says "Show
 * the list of all parts", which reads like the Part Master line it was copied
 * from. Two things argue against taking it literally: the section's own context
 * paragraph says BoM "manages the product structure for each ASSEMBLY", and the
 * sheet elsewhere gates the BoM button on a part being MAKE or MAKE/PHAN. A Bill
 * of Materials list including the BUY components that sit INSIDE those BoMs
 * would contradict a rule the same document sets.
 *
 * So this lists parts that have a BoM. If the customer means every part, it is a
 * one-line change — recorded in the assessment so it is asked rather than
 * assumed.
 *
 * `Upload BoM` is on this screen because the sheet puts it here ("Navigate to
 * Inventory Management >> Bill of Materials >> Click on the Upload BoM button"),
 * and the two-step Create BoM form behind it is now built — `CreateBomDialog`.
 */
export function BomList() {
  const [compareOpen, setCompareOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Part | null>(null);

  /* ROWS ARE BILLS OF MATERIALS, not parts — gap M3. Built from the same
     `bomFor` the part record's BoM tab uses, so an assembly reports the same
     version and the same runner in both places. See data/bomList.ts for why
     this screen changed subject. */
  const assemblies = useMemo(() => generateBomList(), []);

  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  /* ---- Filters, views and columns ----------------------------------------
     The guideline gives this screen three steps — navigate, search, BoM
     Comparison — so none of this is demanded by it. It is here for the reason
     Part Master's toolbar is: two grids that answer the same question with two
     different control layouts cost a user more than either layout saves. This
     was the last list screen still offering a search box and nothing else. */
  const [values, setValues] = useState<FilterValues>({});
  const [quickOn, setQuickOn] = useState<string[]>([]);
  const [settingOpen, setSettingOpen] = useState(false);
  const toast = useToast();

  const systemView = useMemo<SavedView>(() => ({
    id: 'system', name: 'Default', isDefault: false, system: true,
    /* `partSource` and `abc` are deliberately not offered HERE. Every row on
       this screen is an assembly, so Part Source has one value and filtering by
       it does nothing; `abc` is empty in 100% of production records. A filter
       field that cannot change the result is a control that teaches users to
       distrust the panel. */
    fields: ['customer', 'bomStatus', 'lastRunBy', 'lastRunDate'],
    /* `hiddenByDefault` is HONOURED here, and was not before. The flag existed
       on three columns and only ever fed the width budget, so the default view
       still opened with every column — including ABC, which is empty in 100% of
       production records and was sitting at full width beside the part number.
       That is the exact finding the original audit led with, reproduced in the
       prototype meant to answer it. table-patterns.md rule 2. */
    columns: BOM_LIST_COLUMNS.map(c => ({ field: String(c.field) })),
    sort: [],
  }), []);

  /* Its own key, so a view saved here cannot appear in the Part Master picker. */
  const { views: savedViews, active: view, activeId, setActiveId, save, remove } =
    useViews('bom-list', systemView);

  const [workingCols, setWorkingCols] = useState(view.columns);
  useEffect(() => { setWorkingCols(view.columns); }, [view]);

  const toggleColumn = (field: string) => setWorkingCols(cols =>
    cols.some(c => c.field === field)
      ? cols.filter(c => c.field !== field)
      : [...cols, { field }].sort((a, b) =>
          BOM_LIST_COLUMNS.findIndex(c => String(c.field) === a.field) -
          BOM_LIST_COLUMNS.findIndex(c => String(c.field) === b.field)));

  const allFields = useMemo(() => bomFilterFields(assemblies), [assemblies]);
  const fields = useMemo(
    () => allFields.filter(f => view.fields.includes(f.field)),
    [allFields, view.fields]);
  const active = activeCount(fields, values);

  const toggleQuick = (key: string) =>
    setQuickOn(v => (v.includes(key) ? v.filter(k => k !== key) : [...v, key]));

  const rows = useMemo(() => {
    const quickMatched = assemblies.filter(p =>
      BOM_QUICK.filter(f => quickOn.includes(f.key)).every(f => f.match(p)));
    return applyView(quickMatched, fields, values);
  }, [assemblies, quickOn, fields, values]);

  const columns = useMemo(() => {
    const byField = new Map(BOM_LIST_COLUMNS.map(c => [String(c.field), c]));
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
      .filter(Boolean) as typeof BOM_LIST_COLUMNS;
  }, [workingCols]);

  return (
    <>
      <DataGrid
        data={rows}
        columns={columns}
        title="Bills of Materials"
        /* The subtitle used to explain which PARTS were on the list, because
           the list was parts. It is BoMs now, so it says what a row is. */
        subtitle="One row per bill of materials — the parts inside them live on Part Master"
        kpis={
          <>
            {BOM_QUICK.map(f => {
              const n = assemblies.filter(f.match).length;
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
        /* The two fields the sheet names, in its order. */
        searchPlaceholder="Search part number or description"
        actions={<>
          <Button onClick={() => setCompareOpen(true)}>BoM Comparison</Button>
          <Button variant="filled" onClick={() => setCreateOpen(true)}>Upload BoM</Button>
        </>}
        filters={(quickOn.length > 0 || active > 0) ? (
          <div className="vy-filter-row-main">
            <Button variant="text" onClick={() => { setQuickOn([]); setValues({}); }}>
              Clear filters
            </Button>
          </div>
        ) : null}
        filterPanel={
          <FilterToolbar fields={fields} values={values} onChange={setValues}
                         onClear={() => setValues({})} activeCount={active}
                         onEditFields={() => setSettingOpen(true)} />
        }
        filterActive={active}
        quickActive={quickOn.length}
        views={<ViewPicker views={savedViews} activeId={activeId} onChange={setActiveId} />}
        viewSetting={
          <button type="button" className="vy-funnel" aria-label="Setup View Template"
                  title="Setup View Template" onClick={() => setSettingOpen(true)}>
            <SmartIcon name="settings" />
          </button>
        }
        allColumns={BOM_LIST_COLUMNS}
        onToggleColumn={toggleColumn}
        onResetColumns={() => setWorkingCols(view.columns)}
        loading={loading}
        /* OFFERED ONLY WHEN NOTHING IS FILTERED, because `emptyHint` wins over
           the grid's own explanation and the two are right in different cases.
           This sentence answers "I searched for a part and it is not here" —
           the answer is that BUY components live on Part Master. It is the
           WRONG answer to "I turned on two tiles and the list emptied", where
           the filters are the cause and the grid says so itself. */
        emptyHint={active + quickOn.length > 0
          ? undefined
          : 'No assembly matches. Only parts that have a BoM appear on this screen.'}
        /* A BoM row still opens the assembly's part record — the BoM lives
           inside it. `row.part` is carried on the row for exactly this. */
        onOpenRow={row => setSelected(row.part)}
      />

      {settingOpen && (
        <ViewSetting
          screen="Bill of Materials"
          view={{ ...view, columns: workingCols }}
          allColumns={BOM_LIST_COLUMNS}
          allFields={allFields}
          canDelete={!view.system}
          onClose={() => setSettingOpen(false)}
          onDiscard={() => setSettingOpen(false)}
          onDelete={() => { remove(view.id); setSettingOpen(false); }}
          /* Same contract as Part Master: "save as new" builds a fresh view
             from the draft rather than overwriting the one in hand. */
          onSave={(v, asNew) => {
            save(asNew ? { ...draftFrom(v, v.name), isDefault: v.isDefault } : v);
            setWorkingCols(v.columns);
            setSettingOpen(false);
            toast.success(asNew ? `View “${v.name}” created.` : `View “${v.name}” saved.`);
          }}
        />
      )}

      {compareOpen && <BomComparisonDialog onClose={() => setCompareOpen(false)} />}
      <CreateBomDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {/* Opening a row goes straight to that assembly's BoM, which is the thing
          this screen is a list of — the part record would be a step sideways. */}
      {selected && <PartBomDialog part={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
