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
import { generateMpns, mpnFilterFields, MPN_COLUMNS, MPN_QUICK } from '../data/engineering';

/**
 * Part Numbers (MPN) — `/engineering/mpn`. Gap M5.
 *
 * The sidebar has pointed here since the first build and always reached
 * `Placeholder`. Nine columns, read off the live grid.
 *
 * `PCN ALERT` and `LAST SYNCED AT` say this data is kept in step with an
 * external provider — the bundle carries `/validate/z2data` and `/z2data`, and
 * the audit log distinguishes a quote run served from the Nexar cache from one
 * that hit the Nexar API. None of that is designed here; it is recorded so
 * nobody treats these as ordinary editable columns.
 *
 * LIFECYCLE STATUS values are the industry-standard set, NOT the customer's —
 * the live grid was read before its rows loaded. Flagged in the gap list.
 */
export function MpnList() {
  const toast = useToast();
  const all = useMemo(() => generateMpns(), []);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const L = useListScreen({
    key: 'mpn-list',
    rows: all,
    columns: MPN_COLUMNS,
    filterFields: mpnFilterFields,
    quick: MPN_QUICK,
  });

  return (
    <>
      <DataGrid
        title="Manufacturer Part Number Management"
        subtitle="Approved manufacturer equivalents, kept in step with the provider"
        data={L.rows}
        columns={L.columns}
        searchPlaceholder="Search MPN, manufacturer or description"
        selected={selected}
        onSelectedChange={setSelected}
        kpis={<>{MPN_QUICK.map(f => {
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
        actions={null}
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
        allColumns={MPN_COLUMNS}
        onToggleColumn={L.toggleColumn}
        onResetColumns={() => L.setWorkingCols(L.view.columns)}
        onOpenRow={row => toast.notImplemented(`open ${row.mpnNumber}`)}
      />

      {L.settingOpen && (
        <ViewSetting
          screen="Manufacturer Part Number"
          view={{ ...L.view, columns: L.workingCols }}
          allColumns={MPN_COLUMNS}
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
