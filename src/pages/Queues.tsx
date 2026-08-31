import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateQuotations, daysUntil, PEOPLE, type Quotation } from '../data/quotations';
import { MEASURES, ME, isOpen } from '../data/queues';
import { Button } from '../ui/Button';

type Scope = 'mine' | 'team';
const SCOPE_KEY = 'vy.queues.scope';

/**
 * My Queues.
 *
 * Its own page rather than the landing screen (decision D6): Home is `sequence 1`
 * in the live menu and people already know what is there. Replacing it would
 * spend the one screen everybody has learned in order to add one they have not.
 *
 * Four measures, not a dashboard. Each answers "is there something here for me",
 * and each links straight to the Quotations list already filtered — a count you
 * cannot act on is just decoration. The predicates live in data/queues.ts so the
 * list applies exactly the same test these tiles counted with.
 */

export function Queues() {
  /* First visit defaults to Mine (decision D4): the toggle is a scope, not a
     role, and the narrower scope is the one that is always safe to show. */
  const [scope, setScope] = useState<Scope>(() => {
    try { return (localStorage.getItem(SCOPE_KEY) as Scope) ?? 'mine'; } catch { return 'mine'; }
  });
  useEffect(() => { try { localStorage.setItem(SCOPE_KEY, scope); } catch { /* private mode */ } }, [scope]);

  /* The counts arrive rather than existing. Rendering "0" while they load is the
     single worst thing this page could do — it says "nothing needs you" at the
     exact moment it does not yet know. */
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [rows, setRows] = useState<Quotation[]>([]);

  const load = () => {
    setState('loading');
    const t = setTimeout(() => {
      try { setRows(generateQuotations(330)); setState('ready'); }
      catch { setState('error'); }
    }, 420);
    return () => clearTimeout(t);
  };
  useEffect(load, []);

  const scoped = useMemo(
    () => (scope === 'mine' ? rows.filter(q => q.assignedTo.includes(ME)) : rows),
    [rows, scope],
  );

  const counts = useMemo(
    () => MEASURES.map(m => ({ ...m, n: scoped.filter(m.match).length })),
    [scoped],
  );

  /* Team view only. Who is carrying the most open work — the question a manager
     actually opens this page to ask. */
  const load_ = useMemo(() => {
    const open = scoped.filter(isOpen);
    return PEOPLE
      .map(p => ({
        person: p,
        open: open.filter(q => q.assignedTo.includes(p)).length,
        overdue: open.filter(q => q.assignedTo.includes(p) && daysUntil(q.dateNeeded) < 0).length,
      }))
      .sort((a, b) => b.open - a.open || b.overdue - a.overdue);
  }, [scoped]);
  const busiest = load_[0]?.open ?? 0;

  const total = counts.reduce((n, c) => n + c.n, 0);

  return (
    <div className="vy-page">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">My Queues</h1>
          <p className="vy-page-sub">
            {scope === 'mine' ? 'RFQs assigned to you' : 'RFQs across the team'} · Tuesday 19 August
          </p>
        </div>

        {/* A scope, not a role. Two states, both always available, so nobody has
            to work out which one they are entitled to see. */}
        <div className="vy-scope" role="group" aria-label="Whose work to show">
          {(['mine', 'team'] as Scope[]).map(s => (
            <button key={s} type="button" className="vy-scope-btn"
                    aria-pressed={scope === s} onClick={() => setScope(s)}>
              {s === 'mine' ? 'Mine' : 'Team'}
            </button>
          ))}
        </div>
      </div>

      {state === 'loading' && (
        <div className="vy-queue-row" aria-busy>
          {MEASURES.map(m => (
            <div className="vy-queue vy-queue--loading" key={m.key} aria-label={`${m.label}, loading`}>
              <div className="vy-skel vy-skel--n" />
              <div className="vy-skel vy-skel--label" />
            </div>
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="vy-empty-state" role="alert">
          <strong>Your queues could not be loaded</strong>
          <p>The request for RFQ counts did not come back. Nothing has been changed.</p>
          <Button variant="filled" onClick={load}>Try again</Button>
        </div>
      )}

      {state === 'ready' && total === 0 && (
        /* Not four zeros. Four zeros make the reader check each one to work out
           that the answer is "nothing" — a sentence says it once. */
        <div className="vy-empty-state">
          <strong>Nothing outstanding{scope === 'mine' ? '' : ' for the team'}</strong>
          <p>
            No RFQ is overdue, due this week, unassigned or waiting on a document.
            {scope === 'mine' && ' Switch to Team to see everyone else’s.'}
          </p>
          <Link className="vy-link" to="/sales-management/quotation">Open Quotations</Link>
        </div>
      )}

      {state === 'ready' && total > 0 && (
        <>
          <div className="vy-queue-row">
            {counts.map(c => (
              <Link key={c.key} className="vy-queue" data-tone={c.tone} data-zero={c.n === 0 || undefined}
                    to={`/sales-management/quotation?queue=${c.key}&scope=${scope}`}>
                <div className="vy-queue-n">{c.n}</div>
                <div className="vy-queue-label">{c.label}</div>
                <div className="vy-queue-meaning">{c.meaning}</div>
              </Link>
            ))}
          </div>

          {scope === 'team' && (
            <section className="vy-load">
              <h2 className="vy-field-group-title">Who is carrying the most</h2>
              <ul className="vy-load-list">
                {load_.map(r => (
                  <li key={r.person}>
                    <span className="vy-load-name">{r.person}</span>
                    {/* A bar, because the question is comparative. Reading five
                        numbers and ranking them is work the page should do. */}
                    <span className="vy-load-bar" aria-hidden>
                      <span style={{ width: busiest ? `${(r.open / busiest) * 100}%` : 0 }} />
                    </span>
                    <span className="vy-load-n">
                      {r.open} open
                      {r.overdue > 0 && <em className="vy-load-late">{r.overdue} late</em>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
