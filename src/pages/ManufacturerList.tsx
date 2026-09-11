import { useMemo, useState } from 'react';
import { DataGrid } from '../ui/DataGrid';
import { ViewPicker } from '../ui/ViewPicker';
import { FilterToolbar } from '../ui/FilterToolbar';
import { ViewSetting } from '../ui/ViewSetting';
import { draftFrom } from '../ui/useViews';
import { useListScreen } from '../ui/useListScreen';
import { SmartIcon } from '../components/quotation/SmartButtons';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { generateManufacturers, manufacturerFilterFields, MANUFACTURER_COLUMNS } from '../data/engineering';

/**
 * Manufacturers (MFG) — `/engineering/mfg`. Gap M4.
 *
 * NO KPI TILES, and that is the one thing this screen does differently from its
 * neighbours. Eighteen rows over two statuses would make a tile row that reads
 * "16 / 2" — a header pretending to be a summary. The saved views, column
 * chooser and filter panel ARE here, because those are about a control layout a
 * user learns once and expects everywhere.
 */
export function ManufacturerList() {
  const toast = useToast();
  const all = useMemo(() => generateManufacturers(), []);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const L = useListScreen({
    key: 'mfg-list',
    rows: all,
    columns: MANUFACTURER_COLUMNS,
    filterFields: manufacturerFilterFields,
  });

  return (
    <>
      <DataGrid
        title="Manufacturer List"
        subtitle="Who makes a part, as distinct from who sells it to you"
        data={L.rows}
        columns={L.columns}
        searchPlaceholder="Search name, website or alias"
        selected={selected}
        onSelectedChange={setSelected}
        actions={<>
          <Button onClick={() => toast.notImplemented('import manufacturers')}>Import manufacturer</Button>
          <Button variant="filled" onClick={() => toast.notImplemented('add a manufacturer')}>Add manufacturer</Button>
        </>}
        filters={(L.quickOn.length > 0 || L.filterActive > 0) ? (
          <div className="vy-filter-row-main">
            <Button variant="text" onClick={L.clearAll}>Clear filters</Button>
          </div>
        ) : null}
        filterPanel={
          <FilterToolbar fields={L.fields} values={L.values} onChange={L.setValues}
                         onClear={() => L.setValues({})} activeCount={L.filterActive}
                         onEditFields={() => L.setSettingOpen(true)} />
        }
        filterActive={L.filterActive}
        quickActive={L.quickOn.length}
        views={<ViewPicker views={L.views.views} activeId={L.views.activeId}
                           onChange={L.views.setActiveId} />}
        viewSetting={
          <button type="button" className="vy-funnel" aria-label="Setup View Template"
                  title="Setup View Template" onClick={() => L.setSettingOpen(true)}>
            <SmartIcon name="settings" />
          </button>
        }
        allColumns={MANUFACTURER_COLUMNS}
        onToggleColumn={L.toggleColumn}
        onResetColumns={() => L.setWorkingCols(L.view.columns)}
        loading={L.loading}
        /* Offered only when no FILTER is narrowing the list — the grid writes
           its own, better sentence about filters and `emptyHint` would override
           it. The wording is a STANDING FACT about where rows come from, not a
           claim about the current state: this same hint also shows under
           "Nothing matches ‘xyz’" after a failed search, and a sentence that
           says "none on file yet" is simply false there. First draft said
           exactly that, under a heading contradicting it. */
        emptyHint={L.quickOn.length + L.filterActive > 0
          ? undefined
          : 'Manufacturers are added here, or imported as a list.'}
        onOpenRow={row => toast.notImplemented(`open ${row.name}`)}
      />

      {L.settingOpen && (
        <ViewSetting
          screen="Manufacturer List"
          view={{ ...L.view, columns: L.workingCols }}
          allColumns={MANUFACTURER_COLUMNS}
          allFields={L.allFields}
          canDelete={!L.view.system}
          onClose={() => L.setSettingOpen(false)}
          onDiscard={() => L.setSettingOpen(false)}
          onDelete={() => { L.views.remove(L.view.id); L.setSettingOpen(false); }}
          /* Same contract as every other list screen: "save as new" builds a
             fresh view from the draft rather than overwriting the one in hand. */
          onSave={(v, asNew) => {
            L.views.save(asNew ? { ...draftFrom(v, v.name), isDefault: v.isDefault } : v);
            L.setWorkingCols(v.columns);
            L.setSettingOpen(false);
          }}
        />
      )}
    </>
  );
}
