import { useState } from 'react';
import { Button } from './Button';
import { Select } from './Overlays';
import { FilterToolbar } from './FilterToolbar';
import { TextField } from './Field';
import type { ColumnSpec } from '../components/column-model';
import type { SavedView, ViewField, ViewSort } from './views';

/**
 * View Setting — the panel behind the gear.
 *
 * A RIGHT SIDEBAR, not a modal: the customer's Testing Guideline says "display
 * the 'Request For Quotation - View Setting' right sidebar". An earlier note
 * here recorded it as a modal, from a screenshot of it maximised.
 *
 * Three tabs, exactly as the live one has them, with its headings and its
 * button labels:
 *
 *   Filter  FILTER OPTIONS  · "Add more filter(s)"
 *   Column  COLUMN OPTIONS  · "Add a column"  · drag to reorder · editable name · width
 *   Sort    SORTING OPTIONS · "Add a column"  · drag to reorder · Sort Descending
 *
 * The Sort tab reuses the Column tab's hint verbatim in the live build — it
 * says "Add or remove columns" on a sorting panel — and its add button reads
 * "Add a column". Both are copy defects, logged as D5 and D6. Corrected here,
 * because a wrong instruction is not a convention worth preserving.
 */
type Tab = 'filter' | 'column' | 'sort';

export function ViewSetting<T>({
  view, allColumns, allFields, canDelete, onSave, onDiscard, onDelete, onClose,
}: {
  view: SavedView;
  allColumns: ColumnSpec<T>[];
  allFields: ViewField[];
  canDelete: boolean;
  onSave: (v: SavedView, asNew: boolean) => void;
  onDiscard: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('filter');
  /* Maximise earns its place here: the Column tab is a three-column table of
     eleven rows, and at 460px the name and width inputs are cramped. */
  const [maximised, setMaximised] = useState(false);
  const [draft, setDraft] = useState<SavedView>(() => ({ ...view }));
  /* Ticked by default for a built-in view, because you cannot overwrite one —
     the only thing Save can do there is create. */
  const [asNew, setAsNew] = useState(Boolean(view.system));
  const [name, setName] = useState(view.system ? '' : view.name);

  const titleOf = (field: string) =>
    allColumns.find(c => String(c.field) === field)?.title ?? field;

  const canSave = asNew ? name.trim().length > 0 : true;

  const set = (patch: Partial<SavedView>) => setDraft(d => ({ ...d, ...patch }));

  /* ---- drag to reorder, for both the column and sort lists ---------------- */
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const reorder = <X,>(list: X[], from: number, to: number) => {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  };

  return (
    <>
      <div className="vy-scrim" onClick={onClose} aria-hidden />
      <aside className="vy-viewsetting" role="dialog" data-maximised={maximised || undefined}
             aria-label="Request For Quotation - View Setting">
        <header className="vy-vs-head">
          <h2>Request For Quotation - View Setting</h2>
          <div className="vy-window-actions">
            <button className="vy-icon-btn" aria-pressed={maximised}
                    aria-label={maximised ? 'Restore down' : 'Maximize'}
                    title={maximised ? 'Restore down' : 'Maximize'}
                    onClick={() => setMaximised(m => !m)}>
              <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
                   strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
                {maximised
                  ? <path d="M7 7V4h9v9h-3M4 7h9v9H4z" />
                  : <rect x="4" y="4" width="12" height="12" rx="1" />}
              </svg>
            </button>
            <button className="vy-icon-btn" aria-label="Close" title="Close" onClick={onClose}>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="m5 5 10 10M15 5 5 15" /></svg>
            </button>
          </div>
        </header>

        <div className="vy-vs-actions">
          <Button variant="filled" disabled={!canSave}
                  title={canSave ? undefined : 'A new view needs a name'}
                  onClick={() => onSave({ ...draft, name: asNew ? name.trim() : draft.name }, asNew)}>
            Save
          </Button>
          <Button onClick={onDiscard}>Discard</Button>
          {/* A built-in view cannot be deleted, so the control says why rather
              than sitting there dead. */}
          <Button variant="danger" disabled={!canDelete}
                  title={canDelete ? undefined : 'Built-in views cannot be deleted'}
                  onClick={onDelete}>
            Delete
          </Button>
        </div>

        <div className="vy-vs-form">
          <label className="vy-check">
            <input type="checkbox" className="vy-check-input" checked={asNew}
                   disabled={Boolean(view.system)}
                   onChange={e => setAsNew(e.target.checked)} />
            <span>New View</span>
          </label>

          <label className="vy-vs-field">
            <span>View Name</span>
            <TextField value={asNew ? name : draft.name}
                       placeholder="Enter view name"
                       disabled={!asNew && Boolean(view.system)}
                       onChange={e => (asNew ? setName(e.target.value) : set({ name: e.target.value }))} />
          </label>

          <label className="vy-check">
            <input type="checkbox" className="vy-check-input" checked={draft.isDefault}
                   onChange={e => set({ isDefault: e.target.checked })} />
            <span>Set as my default view</span>
          </label>
        </div>

        <div className="vy-vs-tabs" role="tablist">
          {(['filter', 'column', 'sort'] as Tab[]).map(t => (
            <button key={t} role="tab" className="vy-vs-tab" aria-selected={tab === t}
                    onClick={() => setTab(t)}>
              {t === 'filter' ? 'Filter' : t === 'column' ? 'Column' : 'Sort'}
            </button>
          ))}
        </div>

        <div className="vy-vs-body">
          {tab === 'filter' && (
            <>
              <h3 className="vy-vs-heading">Filter options</h3>
              <p className="vy-vs-hint">Which fields appear in the filter toolbar.</p>

              <ul className="vy-vs-list">
                {draft.fields.map(f => (
                  <li key={f} className="vy-vs-row">
                    <span className="vy-vs-name">{allFields.find(x => x.field === f)?.label ?? f}</span>
                    <button className="vy-vs-remove" aria-label={`Remove ${f}`}
                            onClick={() => set({ fields: draft.fields.filter(x => x !== f) })}>
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
              <AddRow
                label="Add more filter(s)"
                options={allFields.filter(f => !draft.fields.includes(f.field))
                  .map(f => ({ value: f.field, label: f.label }))}
                onAdd={f => set({ fields: [...draft.fields, f] })}
              />

              {/* THE PREVIEW.
                  Two screens on this app say "filter" and they do different
                  things: the toolbar over the grid is where you filter, this
                  tab decides what that toolbar contains. Naming alone never
                  carried that — both are "Filter", and a list of field names
                  gives no hint that a toolbar comes out the other end.

                  So the panel shows the result. It is not a mock-up of the
                  toolbar; it IS the toolbar component, rendered inert, so it
                  cannot drift from the real one. Cause and effect end up in the
                  same view and the distinction stops needing to be explained. */}
              <div className="vy-vs-preview">
                <span className="vy-vs-preview-label">The toolbar you get</span>
                <div className="vy-vs-preview-frame" aria-hidden>
                  {draft.fields.length ? (
                    <FilterToolbar
                      fields={allFields.filter(f => draft.fields.includes(f.field))
                        /* In the order this list is in, not the order the
                           fields were declared — otherwise dragging a row here
                           would change nothing the user can see. */
                        .sort((a, b) => draft.fields.indexOf(a.field) - draft.fields.indexOf(b.field))}
                      values={{}} onChange={() => {}} onClear={() => {}} activeCount={0}
                    />
                  ) : (
                    <p className="vy-vs-hint">
                      No fields, so the grid shows no filter toolbar at all — only the search box.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'column' && (
            <>
              <h3 className="vy-vs-heading">Column options</h3>
              <p className="vy-vs-hint">Add or remove columns. Drag a row to change the order.</p>
              <div className="vy-vs-colhead">
                <span>Column Name</span><span>Width</span>
              </div>
              <ul className="vy-vs-list">
                {draft.columns.map((c, i) => {
                  const spec = allColumns.find(x => String(x.field) === c.field);
                  return (
                    <li key={c.field} className="vy-vs-row vy-vs-row--col"
                        draggable
                        onDragStart={() => setDragIndex(i)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => {
                          if (dragIndex === null || dragIndex === i) return;
                          set({ columns: reorder(draft.columns, dragIndex, i) });
                          setDragIndex(null);
                        }}>
                      <span className="vy-vs-grip" aria-hidden>⋮⋮</span>
                      {/* Editable, as the live tab has it — a user can rename a
                          column inside their own view. */}
                      <TextField value={c.label ?? spec?.title ?? c.field}
                                 aria-label={`Name for ${spec?.title ?? c.field}`}
                                 onChange={e => set({
                                   columns: draft.columns.map((x, j) =>
                                     j === i ? { ...x, label: e.target.value } : x),
                                 })} />
                      <TextField type="number" placeholder="Width" min={60}
                                 aria-label={`Width for ${spec?.title ?? c.field}`}
                                 value={c.width ? String(c.width) : ''}
                                 onChange={e => set({
                                   columns: draft.columns.map((x, j) =>
                                     j === i ? { ...x, width: e.target.value ? Number(e.target.value) : undefined } : x),
                                 })} />
                      {spec?.required ? (
                        <span className="vy-vs-required" title="This column cannot be removed">(*required)</span>
                      ) : (
                        <button className="vy-vs-remove" aria-label={`Remove ${spec?.title ?? c.field}`}
                                onClick={() => set({ columns: draft.columns.filter((_, j) => j !== i) })}>
                          <TrashIcon />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <AddRow
                label="Add a column"
                options={allColumns
                  .filter(c => !draft.columns.some(x => x.field === String(c.field)))
                  .map(c => ({ value: String(c.field), label: c.title }))}
                onAdd={f => set({ columns: [...draft.columns, { field: f }] })}
              />
            </>
          )}

          {tab === 'sort' && (
            <>
              <h3 className="vy-vs-heading">Sorting options</h3>
              {/* Corrected wording. The live panel repeats the Column tab's hint
                  here, which tells the user to add or remove COLUMNS on a
                  sorting screen. */}
              <p className="vy-vs-hint">
                Drag a row to change which field sorts first. Later fields only
                decide rows the earlier ones tie on.
              </p>
              <ul className="vy-vs-list">
                {draft.sort.map((s, i) => (
                  <li key={s.field} className="vy-vs-row vy-vs-row--sort"
                      draggable
                      onDragStart={() => setDragIndex(i)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => {
                        if (dragIndex === null || dragIndex === i) return;
                        set({ sort: reorder(draft.sort, dragIndex, i) });
                        setDragIndex(null);
                      }}>
                    <span className="vy-vs-grip" aria-hidden>⋮⋮</span>
                    <span className="vy-vs-name">{titleOf(s.field)}</span>
                    <button className="vy-vs-dir" aria-pressed={s.dir === 'desc'}
                            onClick={() => set({
                              sort: draft.sort.map((x, j): ViewSort =>
                                j === i ? { ...x, dir: x.dir === 'asc' ? 'desc' : 'asc' } : x),
                            })}>
                      {s.dir === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                    <button className="vy-vs-remove" aria-label={`Remove ${titleOf(s.field)}`}
                            onClick={() => set({ sort: draft.sort.filter((_, j) => j !== i) })}>
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
              <AddRow
                label="Add a sort field"
                options={allColumns
                  .filter(c => !draft.sort.some(s => s.field === String(c.field)))
                  .map(c => ({ value: String(c.field), label: c.title }))}
                onAdd={f => set({ sort: [...draft.sort, { field: f, dir: 'asc' }] })}
              />
            </>
          )}
        </div>

        <footer className="vy-vs-foot">
          Views are held in this browser only.
        </footer>
      </aside>
    </>
  );
}

/** Pick something, then add it — so the list never grows a blank row. */
/**
 * Pick a field, then add it.
 *
 * `pick` holds the LABEL, which is what the Select's options are.
 *
 * It used to hold the field KEY while the options were labels, so the value
 * never matched any option and the trigger stayed blank after every choice —
 * the user picked "Project Name" and the box went on reading as empty, with no
 * way to tell whether the click had registered. A select's value and its
 * options have to be in the same vocabulary; translating to the key happens
 * once, on add.
 *
 * The empty first option is gone too. It rendered as a blank row that selected
 * nothing, and Radix treats an empty item value as a reset rather than a value.
 */
function AddRow({ label, options, onAdd }: {
  label: string; options: { value: string; label: string }[]; onAdd: (v: string) => void;
}) {
  const [pick, setPick] = useState('');
  if (!options.length) return <p className="vy-vs-hint">Everything available is already in the list.</p>;
  const chosen = options.find(o => o.label === pick);
  return (
    <div className="vy-vs-add">
      <Select label={label} value={pick} options={options.map(o => o.label)}
              onChange={setPick} />
      <Button size="sm" disabled={!chosen}
              title={chosen ? `${label}: ${chosen.label}` : 'Choose a field first'}
              onClick={() => { if (chosen) { onAdd(chosen.value); setPick(''); } }}>
        {label}
      </Button>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5.5 5.5 6 16a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l.5-10.5M8.5 8.5v5M11.5 8.5v5" />
    </svg>
  );
}
