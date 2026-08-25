import { Button } from './Button';

/**
 * Pagination at the foot of the grid.
 *
 * The 25 Aug review asked for this and for the record count to move here from
 * the page title: "Using pagination bar at bottom of grid. Showing 1–50 of 330."
 *
 * It replaces infinite scroll over a virtualised list. That was faster and it
 * is worth being straight about what the change costs: the previous grid
 * rendered about 40 DOM nodes for 21,941 records and never paged. The trade is
 * deliberate — a pager gives a POSITION. Scrolling tells you there is more; a
 * pager tells you where you are, lets you come back to where you were, and is
 * how everyone on this system already reads a long list.
 *
 * Virtualisation stays underneath, so a 200-row page is still cheap to render.
 */
const SIZES = [25, 50, 100];

export function Pager({ page, pageSize, total, onPage, onPageSize }: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="vy-pager">
      <span className="vy-pager-count">
        {total === 0 ? 'No records' : <>Showing {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}</>}
      </span>

      <span className="vy-toolbar-spacer" />

      {/* Page size lives here rather than in the toolbar: it is a property of
          the pager and means nothing without it. */}
      <label className="vy-pager-size">
        <span>Rows</span>
        <select value={pageSize} onChange={e => { onPageSize(Number(e.target.value)); onPage(0); }}>
          {SIZES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <nav className="vy-pager-nav" aria-label="Pagination">
        <Button size="sm" variant="text" disabled={page === 0}
                onClick={() => onPage(page - 1)} aria-label="Previous page">‹</Button>
        {pageNumbers(page, pages).map((n, i) =>
          n === null
            ? <span className="vy-pager-gap" key={`gap${i}`} aria-hidden>…</span>
            : <button key={n} type="button" className="vy-pager-page"
                      aria-current={n === page ? 'page' : undefined}
                      onClick={() => onPage(n)}>{n + 1}</button>
        )}
        <Button size="sm" variant="text" disabled={page >= pages - 1}
                onClick={() => onPage(page + 1)} aria-label="Next page">›</Button>
      </nav>
    </div>
  );
}

/**
 * First, last, and a window around the current page.
 *
 * 330 records at 25 a page is 14 buttons, which is a row of numbers nobody
 * reads. Keeping the first and last visible means "jump to the end" stays one
 * click, which is the only long-distance move people actually make.
 */
function pageNumbers(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i);
  const out: (number | null)[] = [0];
  const lo = Math.max(1, page - 1);
  const hi = Math.min(pages - 2, page + 1);
  if (lo > 1) out.push(null);
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < pages - 2) out.push(null);
  out.push(pages - 1);
  return out;
}
