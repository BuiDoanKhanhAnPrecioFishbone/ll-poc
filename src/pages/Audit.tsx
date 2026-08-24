import { useState } from 'react';
import { findings, effortValueOrder, type Finding } from '../data/findings';

const AREAS: (Finding['area'] | 'All')[] = ['All', 'Tables', 'Navigation', 'Content', 'Layout', 'System'];

/**
 * The audit, after decision D1.
 *
 * These seventeen findings are all measured from the live system and all still
 * true. Eight of them are NOT being acted on, because acting on them would mean
 * renaming or regrouping screens users have already learned — and that is the
 * thing the customer declined.
 *
 * So the page leads with the split rather than the count. An undifferentiated
 * list of seventeen reads as a backlog, and eight of these will never be done;
 * saying so is the difference between a record and a false promise.
 */
export function AuditPage() {
  const [area, setArea] = useState<typeof AREAS[number]>('All');
  const [status, setStatus] = useState<'All' | Finding['status']>('All');
  const shown = findings
    .filter(f => area === 'All' || f.area === area)
    .filter(f => status === 'All' || f.status === status)
    .sort((a, b) => effortValueOrder(a) - effortValueOrder(b));

  const fixed = findings.filter(f => f.status === 'fixed').length;
  const observed = findings.length - fixed;

  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">UX audit</h1>
          <p className="vy-page-sub">
            {findings.length} findings measured from the live system, 19 Aug 2026.
            {' '}{fixed} built, {observed} recorded and not being acted on.
          </p>
        </div>
      </div>

      <div className="vy-verdict">
        <h2>Not every finding is a work item</h2>
        <p>
          <strong>{fixed} were built.</strong> They are surface defects — a clipped
          identifier, a missing empty state, a header that collapses — and fixing them
          changes nothing a user has learned.
        </p>
        <p>
          <strong>{observed} are recorded and deliberately not being acted on.</strong> Each
          would mean renaming a screen, moving a route, or regrouping the menu. The finding
          is still true; it is just not worth what it costs the people already using the
          system. Every one says why on its own card.
        </p>
      </div>

      <div className="vy-filter-row">
        {(['All', 'fixed', 'observation'] as const).map(sKey => (
          <button key={sKey} className={'vy-chip' + (sKey === status ? ' is-on' : '')}
                  onClick={() => setStatus(sKey)}>
            {sKey === 'All' ? 'All findings' : sKey === 'fixed' ? 'Built' : 'Recorded only'}
            {sKey !== 'All' && <span> {sKey === 'fixed' ? fixed : observed}</span>}
          </button>
        ))}
      </div>

      <div className="vy-filter-row">
        {AREAS.map(a => (
          <button key={a} className={'vy-chip' + (a === area ? ' is-on' : '')} onClick={() => setArea(a)}>
            {a}{a !== 'All' && <span> {findings.filter(f => f.area === a).length}</span>}
          </button>
        ))}
      </div>

      <div className="vy-findings">
        {shown.map(f => (
          <article className="vy-finding" key={f.id} data-status={f.status}>
            <header>
              <span className="vy-finding-id">{f.id}</span>
              <h2>{f.title}</h2>
              <div className="vy-finding-tags">
                <span className="vy-tag" data-status={f.status}>
                  {f.status === 'fixed' ? 'Built' : 'Recorded only'}
                </span>
                <span className="vy-tag" data-effort={f.effort}>{f.effort} effort</span>
                <span className="vy-tag" data-value={f.value}>{f.value} value</span>
              </div>
            </header>
            <dl>
              <dt>Evidence</dt><dd>{f.evidence}</dd>
              <dt>Why it matters</dt><dd>{f.impact}</dd>
              <dt>Recommendation</dt><dd>{f.fix}</dd>
              {/* Last, and always present: what actually happened to it. A
                  recommendation with no outcome beside it reads as outstanding. */}
              <dt>Outcome</dt><dd className="vy-finding-outcome">{f.note}</dd>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
