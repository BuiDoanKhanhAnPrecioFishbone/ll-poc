import { useState } from 'react';
import { findings, effortValueOrder, type Finding } from '../data/findings';

const AREAS: (Finding['area'] | 'All')[] = ['All', 'Tables', 'Navigation', 'Content', 'Layout', 'System'];

export function AuditPage() {
  const [area, setArea] = useState<typeof AREAS[number]>('All');
  const shown = findings
    .filter(f => area === 'All' || f.area === area)
    .sort((a, b) => effortValueOrder(a) - effortValueOrder(b));

  const quickWins = findings.filter(f => f.effort === 'Low' && f.value === 'High').length;

  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">UX audit</h1>
          <p className="vy-page-sub">
            {findings.length} findings from the live system, 19 Aug 2026. Sorted by effort, then value —
            {' '}{quickWins} are low-effort / high-value.
          </p>
        </div>
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
          <article className="vy-finding" key={f.id}>
            <header>
              <span className="vy-finding-id">{f.id}</span>
              <h2>{f.title}</h2>
              <div className="vy-finding-tags">
                <span className="vy-tag" data-effort={f.effort}>{f.effort} effort</span>
                <span className="vy-tag" data-value={f.value}>{f.value} value</span>
              </div>
            </header>
            <dl>
              <dt>Evidence</dt><dd>{f.evidence}</dd>
              <dt>Why it matters</dt><dd>{f.impact}</dd>
              <dt>Recommendation</dt><dd>{f.fix}</dd>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
