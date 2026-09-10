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
import { generatePackingLists, packingFilterFields, PACKING_LIST_COLUMNS, PACKING_QUICK } from '../data/engineering';

/**
 * Packing Lists — `/inventory-management/packing-list`. Gap M6.
 *
 * The one behaviour the bundle establishes is the shipment confirmation:
 * `Packing_List.Confirm_Ship_Title`, `Packing_List.Ship_Confirm`, and "Mark
 * this packing list as SHIPPED? This stamps the ship date and updates shipped
 * quantities." So SHIPPED is a real state, reached through a confirmation, and
 * it writes two things. `Create packing list` is also a literal in the shipped
 * code, which is why the primary action is worded that way.
 *
 * FULFILLMENT and BILLING are the live column names; only SHIPPED is a value we
 * have seen. The rest of both vocabularies is inferred and flagged.
 */
export function PackingList() {
  const toast = useToast();
  const all = useMemo(() => generatePackingLists(), []);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const L = useListScreen({
    key: 'packing-list',
    rows: all,
    columns: PACKING_LIST_COLUMNS,
    filterFields: packingFilterFields,
    quick: PACKING_QUICK,
  });

  return (
    <>
      <DataGrid
        title="Packing Lists"
        subtitle="What is going out of the door, and what has been billed for"
        data={L.rows}
        columns={L.columns}
        searchPlaceholder="Search packing list, sales order or customer"
        selected={selected}
        onSelectedChange={setSelected}
        kpis={<>{PACKING_QUICK.map(f => {
          const n = all.filter(f.match).length;
          const on = L.quickOn.includes(f.key);
          return (
            <button key={f.key} type="button" className="vy-kpi" data-key={f.key}
                    aria-pressed={on} onClick={() => L.toggleQuick(f.key)}>
              <span className="vy-kpi-n">{n.toLocaleString()}</span>
              <span className="vy-kpi-label">{f.label}</span>
            </button>
          );
        })}</>}
        actions={
          <Button variant="filled" onClick={() => toast.notImplemented('create a packing list')}>
            Create packing list
          </Button>
        }
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
        allColumns={PACKING_LIST_COLUMNS}
        onToggleColumn={L.toggleColumn}
        onResetColumns={() => L.setWorkingCols(L.view.columns)}
        onOpenRow={row => toast.notImplemented(`open ${row.packingList}`)}
      />

      {L.settingOpen && (
        <ViewSetting
          screen="Packing Lists"
          view={{ ...L.view, columns: L.workingCols }}
          allColumns={PACKING_LIST_COLUMNS}
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
