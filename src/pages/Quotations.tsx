import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Priority } from '../ui/Priority';
import { DataGrid, fmtDate } from '../ui/DataGrid';
import { useToast } from '../ui/Toast';
import { usePrefs } from '../ui/prefs';
import { generateQuotations, QUOTATION_COLUMNS, daysUntil, type Quotation } from '../data/quotations';
import { measureFor, scopeFilter } from '../data/queues';
import { FilterBar } from '../ui/FilterBar';
import { applyConditions, type Condition } from '../ui/filters';
import { QUOTATION_QUICK, QUOTATION_FILTER_FIELDS } from '../data/quotationFilters';

/** Which quick filters are worth a tile. Not all of them — five tiles is a
 *  dashboard, and the row stops being read. */
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
  const all = useMemo(() => generateQuotations(330), []);
  const [params, setParams] = useSearchParams();
  const queue = measureFor(params.get('queue'));
  const scope = params.get('scope');

  /* Quick filters default to the two an estimator wants on arrival. They are
     one click to drop, and the bar states what is applied rather than filtering
     silently. */
  const [quickOn, setQuickOn] = useState<string[]>(['mine', 'open']);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const { dateStyle } = usePrefs();
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
    const quickMatched = all.filter(q =>
      QUOTATION_QUICK.filter(f => quickOn.includes(f.key)).every(f => f.match(q)));
    return applyConditions(quickMatched, conditions, QUOTATION_FILTER_FIELDS);
  }, [all, queue, scope, quickOn, conditions]);


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

  return (
    <DataGrid
      data={data}
      columns={columns}
      title="Quotations"
      subtitle="Customer RFQs and the quotes sent back"
      kpis={
        /* The review: "if you want to highlight it, a KPI summary would be
           better than those numbers... This KPI can also be the filter. When
           clicking, they can quickly view late records or new."

           So each tile IS its quick filter, and shows whether it is on. A count
           you cannot act on is decoration. */
        <>
          {QUOTATION_QUICK.filter(f => KPI_KEYS.includes(f.key)).map(f => {
            const n = all.filter(f.match).length;
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
        {/* New RFQ FIRST. The 25 Aug review: users read left to right, and the
            most frequent action should be encountered first — estimators raise
            RFQs many times a day, and the system they already use puts it on
            the left. Export is the rare action and keeps the far corner. */}
        <Button variant="filled"
                onClick={() => toast.notImplemented('open a blank RFQ form for a new customer enquiry')}>
          New RFQ
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
        <FilterBar
          quick={QUOTATION_QUICK} activeQuick={quickOn} onQuick={toggleQuick}
          fields={QUOTATION_FILTER_FIELDS}
          conditions={conditions} onConditions={setConditions}
          total={all.length} shown={data.length}
        />
      )}
      rowHref={q => `/sales-management/quotation/${q.id}`}
    />
  );
}
