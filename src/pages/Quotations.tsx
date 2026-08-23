import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { Rating } from '../ui/Rating';
import { DataGrid, fmtDate } from '../ui/DataGrid';
import { useToast } from '../ui/Toast';
import { generateQuotations, QUOTATION_COLUMNS, daysUntil, type Quotation } from '../data/quotations';

const OWNER = 'Huyen NTN';

/**
 * Quotations list.
 *
 * Density defaults to compact and the queue defaults to "assigned to me",
 * because the people in this screen are sales/estimating working it daily —
 * they arrive to answer "what's mine and what's late", not to browse 330 RFQs.
 * Both defaults are one click to undo, and the chip row states what is applied
 * rather than filtering silently.
 */
export function Quotations() {
  const all = useMemo(() => generateQuotations(330), []);
  const [mineOnly, setMineOnly] = useState(true);
  const [openOnly, setOpenOnly] = useState(true);
  const toast = useToast();

  const data = useMemo(() => all.filter(q =>
    (!mineOnly || q.assignedTo === OWNER) &&
    (!openOnly || (q.status !== 'Completed' && q.status !== 'Cancelled'))
  ), [all, mineOnly, openOnly]);

  const overdue = data.filter(q => daysUntil(q.dateNeeded) < 0).length;

  /* Priority and Date Needed carry bespoke cells; every other column is
     rendered by its role. Widths still come from the role in both cases. */
  const columns = useMemo(() => QUOTATION_COLUMNS.map(c => {
    if (c.field === 'priority') return {
      ...c,
      render: (q: Quotation) => (
        <Rating value={q.priority} max={3} />
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
      filters={<>
        <span className="vy-filter-label">Showing</span>
        <Chip label={`Assigned to ${OWNER}`} selected={mineOnly} onClick={() => setMineOnly(m => !m)} />
        <Chip label="Open only" selected={openOnly} onClick={() => setOpenOnly(o => !o)} />
        {(mineOnly || openOnly) && (
          <Button variant="text" onClick={() => { setMineOnly(false); setOpenOnly(false); }}>
            Show all {all.length}
          </Button>
        )}
      </>}
      rowHref={q => `/sales-management/quotation/${q.id}`}
    />
  );
}
