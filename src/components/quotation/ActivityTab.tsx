import type { Quotation } from '../../data/quotations';

/**
 * Activity log.
 *
 * The live tab renders raw column names in the diff — the entry I read said
 * `DtIssuedUtc:` with no from/to values, which tells a user nothing. Here each
 * entry says who, when, and what changed from what to what, in the same
 * language the form uses.
 */
export function ActivityTab({ q }: { q: Quotation }) {
  return (
    <ol className="vy-activity">
      {q.activity.map(a => (
        <li key={a.id} className="vy-activity-item" data-action={a.action}>
          <span className="vy-avatar vy-avatar--sm">{a.initials}</span>
          <div className="vy-activity-body">
            <div className="vy-comment-meta">
              <strong>{a.author}</strong>
              <span>{a.at.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span className="vy-code">{a.action}</span>
            </div>
            <p>{a.summary}</p>
            {a.changes?.map(c => (
              <div className="vy-diff" key={c.field}>
                <span className="vy-diff-field">{c.field}</span>
                <span className="vy-diff-from">{c.from}</span>
                <span aria-hidden>→</span>
                <span className="vy-diff-to">{c.to}</span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
