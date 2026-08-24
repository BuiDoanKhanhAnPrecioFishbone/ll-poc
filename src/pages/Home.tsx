import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateQuotations, CUSTOMER_OPTIONS, type QuotationStatus } from '../data/quotations';
import { QUEUES_PATH } from '../data/sitemap';
import { Select } from '../ui/Overlays';

/**
 * Home.
 *
 * Stays the landing page (decision D6): it is `sequence 1` in the live menu and
 * everybody already knows what is there. An earlier version of this file
 * replaced it with a work queue, which spent the one screen every user has
 * learned in order to add one they had not. The queues now live at their own
 * nav entry and this page does what the live Home does — the Quotation Request
 * chart, with its filters.
 *
 * NOT FULLY VERIFIED. The live chart renders from an API response, so its exact
 * series and filter set are not in the shipped bundle the way the Run Quotation
 * strings are. The shape here — requests per month, split by status, filtered by
 * year and customer — is inferred from the RFQ record and marked as such on the
 * page. It is the one thing in this prototype resting on inference rather than
 * evidence, which is why it says so out loud.
 *
 * What has been REMOVED is the stock Kendo demo chart the live Home still
 * carries — "World Population by Broad Age Groups", sample data, in production.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Six-token status vocabulary, mapped to the five RFQ statuses. Order is the
   lifecycle order, so a stack reads bottom-to-top as work progressing. */
const SERIES: { status: QuotationStatus; token: string }[] = [
  { status: 'New', token: 'draft' },
  { status: 'In-Progress', token: 'progress' },
  { status: 'Quoted', token: 'open' },
  { status: 'Completed', token: 'done' },
  { status: 'Cancelled', token: 'cancelled' },
];

export function Home() {
  const all = useMemo(() => generateQuotations(330), []);

  const years = useMemo(
    () => [...new Set(all.map(q => q.createdDate.getFullYear()))].sort((a, b) => b - a).map(String),
    [all],
  );
  const [year, setYear] = useState(() => String(new Date(2026, 7, 19).getFullYear()));
  const [customer, setCustomer] = useState('All customers');

  const rows = useMemo(() => all.filter(q =>
    String(q.createdDate.getFullYear()) === year &&
    (customer === 'All customers' || q.customer === customer),
  ), [all, year, customer]);

  /* One pass, twelve buckets. Months with no requests still get a column — a
     gap in a time series is information, and dropping empty months would make
     an eight-month year look like a busy one. */
  const byMonth = useMemo(() => {
    const empty = () => Object.fromEntries(SERIES.map(s => [s.status, 0])) as Record<QuotationStatus, number>;
    const buckets = MONTHS.map(() => empty());
    for (const q of rows) buckets[q.createdDate.getMonth()][q.status]++;
    return buckets;
  }, [rows]);

  const monthTotals = byMonth.map(b => SERIES.reduce((n, s) => n + b[s.status], 0));
  const peak = Math.max(1, ...monthTotals);
  const total = monthTotals.reduce((a, b) => a + b, 0);

  return (
    <div className="vy-page">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">Home</h1>
          <p className="vy-page-sub">Huyen NTN · Linh Long Engineering · Tuesday 19 August</p>
        </div>
        <Link className="vy-link" to={QUEUES_PATH}>What needs me today →</Link>
      </div>

      <section className="vy-chart-card">
        <div className="vy-chart-head">
          <div>
            <h2 className="vy-chart-title">Quotation Request</h2>
            <p className="vy-chart-sub">
              {total === 0 ? 'No requests' : `${total} request${total === 1 ? '' : 's'}`} in {year}
              {customer !== 'All customers' && ` · ${customer}`}
            </p>
          </div>
          <div className="vy-chart-filters">
            <Select label="Year" value={year} onChange={setYear} options={years} />
            <Select label="Customer" value={customer} onChange={setCustomer}
                    options={['All customers', ...CUSTOMER_OPTIONS]} />
          </div>
        </div>

        {total === 0 ? (
          /* Not an empty axis. A chart frame with nothing in it reads as a
             failed render; a sentence says which filter emptied it. */
          <div className="vy-empty-state vy-empty-state--inline">
            <strong>No quotation requests match</strong>
            <p>
              Nothing was raised in {year}
              {customer !== 'All customers' && ` for ${customer}`}. Try another year or customer.
            </p>
          </div>
        ) : (
          <>
            {/* Twelve stacked bars, in CSS. Not worth a chart dependency, and
                every colour stays a status token like everywhere else.

                The inline style is the one place this repo allows it, and only
                in this form: it sets a CSS CUSTOM PROPERTY carrying a computed
                value. The height is data — a share of the peak month — which no
                stylesheet can know. The working agreement bans inline styling
                because it hides design decisions from the token layer; a data
                value passed to a rule that lives in the stylesheet does not. */}
            <div className="vy-chart" role="img"
                 aria-label={`Quotation requests per month in ${year}, ${total} in total`}>
              {byMonth.map((b, i) => (
                <div className="vy-chart-col" key={MONTHS[i]}>
                  <div className="vy-chart-stack" title={`${MONTHS[i]}: ${monthTotals[i]}`}>
                    {SERIES.map(s => b[s.status] > 0 && (
                      <span key={s.status} className="vy-chart-seg" data-status={s.token}
                            style={{ '--seg-h': `${(b[s.status] / peak) * 100}%` } as React.CSSProperties}
                            title={`${MONTHS[i]} · ${s.status}: ${b[s.status]}`} />
                    ))}
                  </div>
                  <span className="vy-chart-n" data-zero={monthTotals[i] === 0 || undefined}>
                    {monthTotals[i]}
                  </span>
                  <span className="vy-chart-month">{MONTHS[i]}</span>
                </div>
              ))}
            </div>

            <ul className="vy-chart-legend">
              {SERIES.map(s => {
                const n = rows.filter(q => q.status === s.status).length;
                return (
                  <li key={s.status} data-zero={n === 0 || undefined}>
                    <span className="vy-chart-key" data-status={s.token} aria-hidden />
                    {s.status}<em>{n}</em>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="vy-unverified">
          This chart’s series and filters are inferred from the RFQ record. Unlike the rest of
          Quotations, they have not been verified against the live screen.
        </p>
      </section>
    </div>
  );
}
