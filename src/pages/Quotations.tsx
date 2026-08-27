import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Priority } from '../ui/Priority';
import { DataGrid, fmtDate } from '../ui/DataGrid';
import { useToast } from '../ui/Toast';
import { usePrefs } from '../ui/prefs';
import { generateQuotations, QUOTATION_COLUMNS, daysUntil, type Quotation } from '../data/quotations';
import { measureFor, scopeFilter, ME } from '../data/queues';
import { applyItarVisibility } from '../data/itar';
import { FilterToolbar } from '../ui/FilterToolbar';
import { applyView, activeCount, type FilterValues } from '../ui/views';
import { QUOTATION_QUICK, quotationFilterFields } from '../data/quotationFilters';
import { ViewSetting } from '../ui/ViewSetting';
import { useViews, draftFrom } from '../ui/useViews';
import { applySort, type SavedView } from '../ui/views';

/**
 * The four measures. These are the ONLY quick filters, and they live in the KPI
 * row — there is no chip row beside it saying the same four things again.
 *
 * There was, briefly. The chips came first; the review then asked for a KPI
 * summary that doubles as the filter; the tiles were added and the chips were
 * never removed. The screen ended up offering every measure twice, in two
 * shapes, three inches apart.
 *
 * "Assigned to me" is deliberately NOT here. It is a scope — whose records you
 * are looking at — not a state a record can be in, and mixing the two in one
 * row makes the tiles read as though they combine the same way.
 */
const KPI_KEYS = ['open', 'overdue', 'due-week', 'waiting-doc'];

/**
 * Quotations list.
 *
 * Density defaults to compact and the queue defaults to "assigned to me",
 * because the people in this screen are sales/estimating working it daily —
 * they arrive to answer "what's mine and what's late", not to browse 330 RFQs.
 * Both defaults are one click to undo, and the chip row states what is applied
 * rather than filtering silently.
 *
 * ARRIVING FROM A QUEUE TILE. `?queue=overdue&scope=mine` applies exactly the
 * predicate the tile counted with — imported from data/queues.ts rather than
 * re-written here, so the tile's number and this list can never disagree. The
 * queue filter overrides the page's own two chips while it is on, because a tile
 * that says 4 and opens a list of 2 has lied about something.
 */
/** "3 days late", "today", "in 12 days" — the same fact as a date, said the way
 *  someone would say it out loud. */
function relativeDay(d: number): string {
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  return d < 0 ? `${-d} days late` : `in ${d} days`;
}

export function Quotations() {
  /* ITAR visibility is applied FIRST, before any filter or count. An
     export-controlled record must not reach an uncleared account through a
     total, a KPI tile or a queue link either — not only through the grid. */
  const { rows: all, withheld } = useMemo(
    () => applyItarVisibility(generateQuotations(330)), []);
  const [params, setParams] = useSearchParams();
  const queue = measureFor(params.get('queue'));
  const scope = params.get('scope');

  /* Quick filters default to the two an estimator wants on arrival. They are
     one click to drop, and the bar states what is applied rather than filtering
     silently. */
  const [quickOn, setQuickOn] = useState<string[]>(['open']);
  /* Whose records. Separate from the measures, and matching the Mine/Team
     toggle on My Queues — the same question deserves the same control. */
  const [mine, setMine] = useState(true);
  /* One value per field. No operators — see docs/filter-spec.md. */
  const [values, setValues] = useState<FilterValues>({});
  const { dateStyle } = usePrefs();

  /* Options are drawn from the rows themselves, so a picker never offers a
     value no record has. */
  /**
   * The built-in view: every column the screen has, in the guideline's order,
   * and the filter fields the live toolbar shows. It cannot be renamed or
   * deleted — a screen with no views left would have no columns at all.
   */
  const systemView = useMemo<SavedView>(() => ({
    id: 'system', name: 'Default', isDefault: false, system: true,
    fields: ['priority', 'no', 'projectName', 'customer', 'status',
             'dateNeeded', 'createdDate', 'lastUpdated'],
    columns: QUOTATION_COLUMNS.map(c => ({ field: String(c.field) })),
    sort: [],
  }), []);

  const { views: savedViews, active: view, activeId, setActiveId, save, remove } =
    useViews('quotation', systemView);
  const [settingOpen, setSettingOpen] = useState(false);

  const fields = useMemo(
    () => quotationFilterFields(all).filter(f => view.fields.includes(f.field)),
    [all, view.fields]);
  const active = activeCount(fields, values);
  const toast = useToast();

  const toggleQuick = (key: string) =>
    setQuickOn(v => (v.includes(key) ? v.filter(k => k !== key) : [...v, key]));

  const clearQueue = () => {
    const next = new URLSearchParams(params);
    next.delete('queue'); next.delete('scope');
    setParams(next, { replace: true });
  };

  const data = useMemo(() => {
    if (queue) {
      /* Arriving from a queue tile overrides the page's own filters. A tile that
         says 4 and opens a list of 2 has lied about something, so the tile's
         predicate is the only one that applies. */
      const inScope = scopeFilter(scope);
      return all.filter(q => inScope(q) && queue.match(q));
    }
    /* Quick filters are conjunctive with each other and with the advanced
       conditions: every chip you turn on narrows further. */
    const inScope = mine ? all.filter(q => q.assignedTo === ME) : all;
    const quickMatched = inScope.filter(q =>
      QUOTATION_QUICK.filter(f => quickOn.includes(f.key)).every(f => f.match(q)));
    return applyView(quickMatched, fields, values);
  }, [all, queue, scope, quickOn, values, fields, mine]);


  /* Priority and Date Needed carry bespoke cells; every other column is
     rendered by its role. Widths still come from the role in both cases. */
  const columns = useMemo(() => QUOTATION_COLUMNS.map(c => {
    if (c.field === 'priority') return {
      ...c,
      render: (q: Quotation) => (
        <Priority value={q.priority} />
      ),
    };
    if (c.field === 'dateNeeded') return {
      ...c,
      /* ONE format per column, chosen in preferences. The cell used to print
         both an exact date and a relative one, and only on rows that were late
         or due soon — so the column had two shapes depending on the row, and
         every row paid the width of the longer one. Colour still carries
         urgency, in both formats. */
      render: (q: Quotation) => {
        const d = daysUntil(q.dateNeeded);
        const closed = q.status === 'Completed' || q.status === 'Cancelled';
        const tone = closed ? 'none' : d < 0 ? 'overdue' : d <= 3 ? 'soon' : 'none';
        return (
          <span className="vy-due" data-tone={tone}>
            <span className="vy-num">
              {dateStyle === 'exact' ? fmtDate(q.dateNeeded) : relativeDay(d)}
            </span>
          </span>
        );
      },
    };
    return c;
  }), [dateStyle]);

  /**
   * The view decides which columns appear, in what order, under what name and
   * at what width.
   *
   * NO LEADING ACTION COLUMN. The customer's Testing Guideline lists a "View
   * Detail" column first, and the live system has one — a KendoReact command
   * column, which is that component's default rather than a design decision.
   * It is deliberately not built here; see docs/open-questions.md, question 1.
   *
   * The short of it: every major system opens a row from its title or
   * identifier (Jira, Linear, GitHub, Asana, Salesforce, HubSpot), and where
   * they carry row actions those sit in a TRAILING overflow menu. That matters
   * here because the customer's own notes plan a second row action — "duplicate
   * record (clone)" is replacing Historical RFQ — and a leading icon column
   * does not survive a second icon, let alone a third.
   *
   * This is a knowing deviation from a client document, raised with them rather
   * than taken silently.
   */
  const allColumns = useMemo(() => {
    const byField = new Map(columns.map(c => [String(c.field), c]));
    const ordered = view.columns
      .map(vc => {
        const base = byField.get(vc.field);
        if (!base) return null;
        return {
          ...base,
          ...(vc.label ? { title: vc.label } : {}),
          ...(vc.width ? { width: vc.width, widthNote: 'Set on this view.' } : {}),
        };
      })
      .filter(Boolean) as typeof columns;
    return ordered;
  }, [columns, view.columns]);

  /* The view's sort runs before the grid's own header sorting, so a saved view
     opens in the order it was saved in. */
  const sorted = useMemo(
    () => applySort(data, view.sort, (row, f) => (row as Record<string, unknown>)[f]),
    [data, view.sort]);

  return (
    <>
    <DataGrid
      data={sorted}
      columns={allColumns}
      title="Quotations"
      subtitle={withheld > 0
        /* Says that something is hidden without saying what — the count alone
           is not export-controlled, the records are. Silence here would make a
           compliance filter look like missing data. */
        ? <>Customer RFQs and the quotes sent back · <strong>{withheld} not shown (ITAR)</strong></>
        : 'Customer RFQs and the quotes sent back'}
      kpis={
        /* The review: "if you want to highlight it, a KPI summary would be
           better than those numbers... This KPI can also be the filter. When
           clicking, they can quickly view late records or new."

           So each tile IS its quick filter, and shows whether it is on. A count
           you cannot act on is decoration. */
        <>
          {QUOTATION_QUICK.filter(f => KPI_KEYS.includes(f.key)).map(f => {
            /* Counted within the current scope. A tile reading 66 above a grid
               showing 15 rows is not a summary of anything on screen. */
            const n = (mine ? all.filter(q => q.assignedTo === ME) : all).filter(f.match).length;
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
      searchPlaceholder="Search RFQ number, project or customer"
      actions={<>
        {/* "Add New", as the live toolbar labels it — not "New RFQ". It leads,
            per the 25 Aug review: users read left to right and the most
            frequent action should be met first. Export is rare and keeps the
            far corner. */}
        <Button variant="filled"
                onClick={() => toast.notImplemented('open the New Project Requirement modal')}>
          Add New
        </Button>
        <span className="vy-actions-gap" />
        <Button onClick={() => toast.notImplemented(`export these ${data.length} RFQs to Excel`)}>
          Export
        </Button>
      </>}
      filters={queue ? (
        /* One filter, stated in full, with one way out. Showing the page's own
           chips alongside it would imply they still apply — they do not. */
        <div className="vy-filter-row-main">
          <span className="vy-filter-label">From My Queues</span>
          <Chip label={`${queue.label} · ${scope === 'team' ? 'Team' : 'Mine'}`} selected onClick={clearQueue} />
          <span className="vy-filter-note">{queue.meaning}</span>
          <Button variant="text" onClick={clearQueue}>Clear</Button>
        </div>
      ) : (
        /* Scope only. The measures are the KPI tiles above — putting them here
           as well is what this row used to do. */
        <div className="vy-filter-row-main">
          <div className="vy-scope" role="group" aria-label="Whose records to show">
            {[true, false].map(v => (
              <button key={String(v)} type="button" className="vy-scope-btn"
                      aria-pressed={mine === v} onClick={() => setMine(v)}>
                {v ? 'Mine' : 'Everyone'}
              </button>
            ))}
          </div>
          {(quickOn.length > 0 || active > 0) && (
            <Button variant="text"
                    onClick={() => { setQuickOn([]); setValues({}); }}>
              Clear filters
            </Button>
          )}
        </div>
      )}
      filterPanel={
        <FilterToolbar fields={fields} values={values} onChange={setValues}
                       onClear={() => setValues({})} activeCount={active} />
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
      viewSetting={
        <button type="button" className="vy-funnel" aria-label="Setup View Template"
                title="Setup View Template" onClick={() => setSettingOpen(true)}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
               strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6M10 2v2M10 16v2M4 10H2M18 10h-2M5 5 3.6 3.6M16.4 16.4 15 15M15 5l1.4-1.4M3.6 16.4 5 15" />
          </svg>
        </button>
      }
      rowHref={q => `/sales-management/quotation/${q.id}`}
    />

    {settingOpen && (
      <ViewSetting
        view={view}
        allColumns={columns}
        allFields={quotationFilterFields(all)}
        canDelete={!view.system}
        onClose={() => setSettingOpen(false)}
        onDiscard={() => setSettingOpen(false)}
        onDelete={() => { remove(view.id); setSettingOpen(false); }}
        onSave={(v, asNew) => {
          /* Saving a built-in view, or ticking "New View", creates a copy —
             the built-in is the fallback every other view is measured against
             and must stay as shipped. */
          save(asNew ? { ...draftFrom(v, v.name), isDefault: v.isDefault } : v);
          setSettingOpen(false);
          toast.success(asNew ? `View “${v.name}” created.` : `View “${v.name}” saved.`);
        }}
      />
    )}
    </>
  );
}
