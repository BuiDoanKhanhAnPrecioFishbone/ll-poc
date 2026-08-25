import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Priority } from '../ui/Priority';
import { DataGrid, fmtDate } from '../ui/DataGrid';
import { useToast } from '../ui/Toast';
import { generateQuotations, QUOTATION_COLUMNS, daysUntil, type Quotation } from '../data/quotations';
import { measureFor, scopeFilter, MEASURES, ME as OWNER } from '../data/queues';

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
export function Quotations() {
  const all = useMemo(() => generateQuotations(330), []);
  const [params, setParams] = useSearchParams();
  const queue = measureFor(params.get('queue'));
  const scope = params.get('scope');

  const [mineOnly, setMineOnly] = useState(true);
  const [openOnly, setOpenOnly] = useState(true);
  const toast = useToast();

  const clearQueue = () => {
    const next = new URLSearchParams(params);
    next.delete('queue'); next.delete('scope');
    setParams(next, { replace: true });
  };

  const data = useMemo(() => {
    if (queue) {
      /* The queue's own definition of scope, not the chips'. The tile counted
         with this pair; the list must show that same set. */
      const inScope = scopeFilter(scope);
      return all.filter(q => inScope(q) && queue.match(q));
    }
    return all.filter(q =>
      (!mineOnly || q.assignedTo === OWNER) &&
      (!openOnly || (q.status !== 'Completed' && q.status !== 'Cancelled'))
    );
  }, [all, queue, scope, mineOnly, openOnly]);

  /* The SAME predicate the queues page counts with, not a re-written one.
     Counting a bare `dateNeeded < today` here reported 22 of 33 overdue while
     My Queues said 2, because it swept in historical RFQs that were quoted
     months ago and are nobody's outstanding work. Two definitions of "overdue"
     on two screens is the exact drift data/queues.ts exists to prevent. */
  const isOverdue = MEASURES.find(m => m.key === 'overdue')!.match;
  const overdue = data.filter(isOverdue).length;

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
      render: (q: Quotation) => {
        const d = daysUntil(q.dateNeeded);
        const closed = q.status === 'Completed' || q.status === 'Cancelled';
        const tone = closed ? 'none' : d < 0 ? 'overdue' : d <= 3 ? 'soon' : 'none';
        return (
          <span className="vy-due" data-tone={tone}>
            <span className="vy-num">{fmtDate(q.dateNeeded)}</span>
            {tone !== 'none' && (
              <span className="vy-due-rel">{d < 0 ? `${-d}d late` : `in ${d}d`}</span>
            )}
          </span>
        );
      },
    };
    return c;
  }), []);

  return (
    <DataGrid
      data={data}
      columns={columns}
      title="Quotations"
      subtitle={<>RFQs{overdue > 0 && <> · <strong className="vy-alert-count">{overdue} overdue</strong></>}</>}
      searchPlaceholder="Search RFQ number, project or customer"
      defaultDensity="compact"
      actions={<>
        <Button onClick={() => toast.notImplemented(`export these ${data.length} RFQs to Excel`)}>
          Export
        </Button>
        <Button variant="filled"
                onClick={() => toast.notImplemented('open a blank RFQ form for a new customer enquiry')}>
          New RFQ
        </Button>
      </>}
      filters={queue ? (
        /* One filter, stated in full, with one way out. Showing the page's own
           chips alongside it would imply they still apply — they do not. */
        <>
          <span className="vy-filter-label">From My Queues</span>
          <Chip label={`${queue.label} · ${scope === 'team' ? 'Team' : 'Mine'}`} selected onClick={clearQueue} />
          <span className="vy-filter-note">{queue.meaning}</span>
          <Button variant="text" onClick={clearQueue}>Clear</Button>
        </>
      ) : (
        <>
          <span className="vy-filter-label">Showing</span>
          <Chip label={`Assigned to ${OWNER}`} selected={mineOnly} onClick={() => setMineOnly(m => !m)} />
          <Chip label="Open only" selected={openOnly} onClick={() => setOpenOnly(o => !o)} />
          {(mineOnly || openOnly) && (
            <Button variant="text" onClick={() => { setMineOnly(false); setOpenOnly(false); }}>
              Show all {all.length}
            </Button>
          )}
        </>
      )}
      rowHref={q => `/sales-management/quotation/${q.id}`}
    />
  );
}
