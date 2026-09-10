import { useEffect, useMemo, useState } from 'react';
import type { ColumnSpec } from '../components/column-model';
import { useViews } from './useViews';
import { applyView, activeCount, type FilterValues, type SavedView, type ViewField } from './views';

/**
 * The list-screen toolbar, as one hook.
 *
 * WHY IT EXISTS. `BomList.tsx` argued the case in its own comment and the
 * argument is the project's position: "two grids that answer the same question
 * with two different control layouts cost a user more than either layout
 * saves". Part Master, Bills of Materials and Project Requirements all carry
 * saved views, a column chooser and a filter panel because of it.
 *
 * Then Manufacturers, MPN and Packing Lists arrived with none of the three, on
 * the reasoning that nothing had asked for them there — which is the reasoning
 * this project had already weighed and turned down for BoM, in the identical
 * position. Six list screens, three toolbars, no rule a user could learn.
 *
 * Rather than copy eighty lines into three more files, the machinery those
 * three screens already shared by accident is stated once here. Each screen
 * still declares WHAT it filters and sorts by; none of them re-implement HOW.
 */
export function useListScreen<T>({ key, rows, columns, filterFields, quick }: {
  /** Storage key for saved views. Distinct per screen, so one screen's views
      cannot appear in another's picker. */
  key: string;
  rows: T[];
  columns: ColumnSpec<T>[];
  filterFields: (rows: T[]) => ViewField<T>[];
  /** The KPI tiles, which double as filters. Omit where a split would be noise. */
  quick?: { key: string; label: string; match: (row: T) => boolean }[];
}) {
  const [values, setValues] = useState<FilterValues>({});
  const [quickOn, setQuickOn] = useState<string[]>([]);
  const [settingOpen, setSettingOpen] = useState(false);

  const systemView = useMemo<SavedView>(() => ({
    id: 'system', name: 'Default', isDefault: false, system: true,
    fields: filterFields(rows).map(f => String(f.field)),
    /* `hiddenByDefault` is honoured, so a column that is empty in most records
       does not open at full width beside the identifier. */
    columns: columns.filter(c => !c.hiddenByDefault).map(c => ({ field: String(c.field) })),
    sort: [],
  }), [rows, columns, filterFields]);

  const views = useViews(key, systemView);
  const { active: view } = views;

  const [workingCols, setWorkingCols] = useState(view.columns);
  useEffect(() => { setWorkingCols(view.columns); }, [view]);

  const toggleColumn = (field: string) => setWorkingCols(cols =>
    cols.some(c => c.field === field)
      ? cols.filter(c => c.field !== field)
      : [...cols, { field }].sort((a, b) =>
          columns.findIndex(c => String(c.field) === a.field) -
          columns.findIndex(c => String(c.field) === b.field)));

  const allFields = useMemo(() => filterFields(rows), [rows, filterFields]);
  const fields = useMemo(
    () => allFields.filter(f => view.fields.includes(String(f.field))),
    [allFields, view.fields]);
  const filterActive = activeCount(fields, values);

  const visibleRows = useMemo(() => {
    const on = (quick ?? []).filter(f => quickOn.includes(f.key));
    return applyView(rows.filter(r => on.every(f => f.match(r))), fields, values);
  }, [rows, quick, quickOn, fields, values]);

  const visibleColumns = useMemo(() => {
    const byField = new Map(columns.map(c => [String(c.field), c]));
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
      .filter(Boolean) as ColumnSpec<T>[];
  }, [workingCols, columns]);

  return {
    views, view, values, setValues, quickOn, setQuickOn,
    settingOpen, setSettingOpen,
    allFields, fields, filterActive,
    rows: visibleRows, columns: visibleColumns,
    workingCols, setWorkingCols, toggleColumn,
    toggleQuick: (k: string) =>
      setQuickOn(v => (v.includes(k) ? v.filter(x => x !== k) : [...v, k])),
    clearAll: () => { setQuickOn([]); setValues({}); },
  };
}
