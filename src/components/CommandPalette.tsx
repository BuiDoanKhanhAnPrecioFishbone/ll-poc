import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allDestinations } from '../data/sitemap';

/**
 * Cmd/Ctrl-K navigation.
 *
 * The learning-curve argument: with 51 destinations behind a collapsed
 * hamburger, a new user must remember which of eight groups owns a screen
 * before they can reach it. Search removes that requirement entirely.
 *
 * WHAT IT ACTUALLY MATCHES, measured 9 Nov — because this comment used to
 * claim the `wasCalled` tier was doing the work, and it was not:
 *
 *   live destinations                     47
 *   of those carrying `wasCalled`          0
 *   of those carrying `hint`               0
 *
 * Both fields exist on `NavItem`, and both are populated only on `proposedNav`
 * and `settingsNav` — the renaming proposal decision D1 declined. `liveNav` is
 * what this palette searches, so two of its scoring tiers could never fire.
 * Nothing noticed, because a tier that matches nothing looks exactly like a
 * query with no answer.
 *
 * THE ROUTE IS THE THIRD NAME, and it is the one that was missing. Finding C1
 * records that every screen here has three: the nav says "Project
 * Requirements", the browser title says "Request for Quotation", and the route
 * says `quotation`. C1 declines to pick one, on the grounds that choosing
 * breaks the two that users already search for. The answer to that is not to
 * pick — it is to match all of them. So the path is a scoring tier, which is
 * why this palette's own placeholder can offer `so-mst`: that string is a
 * route, it is printed in the URL bar, and before 9 Nov typing it returned
 * nothing.
 *
 * STILL OUT OF REACH, and left that way on purpose: "RFQ" and "Request for
 * Quotation" match nothing, because neither appears in any nav label or route.
 * Putting them in would mean inventing a fourth name for 47 screens.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return allDestinations.slice(0, 8);
    return allDestinations
      .map(d => {
        const title = d.title.toLowerCase();
        const path = d.path.toLowerCase();
        const legacy = (d.wasCalled ?? '').toLowerCase();
        const hint = (d.hint ?? '').toLowerCase();
        let score = -1;
        if (title.startsWith(needle)) score = 0;
        else if (title.includes(needle)) score = 1;
        /* Below both title tiers, so a route match never outranks the name on
           screen. Above the two that live data does not populate. */
        else if (path.includes(needle)) score = 2;     // found by its route
        else if (legacy.includes(needle)) score = 3;   // found by its old name
        else if (hint.includes(needle)) score = 4;
        return { d, score };
      })
      .filter(r => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map(r => r.d);
  }, [q]);

  /* Typing moves the highlight back to the first result, and opening the
     palette starts from an empty query. Both were effects, so both painted one
     frame of the old state first — a stale highlight on the row you had arrowed
     to, and the previous search still in the box as it appeared. */
  const [seenQ, setSeenQ] = useState(q);
  if (seenQ !== q) { setSeenQ(q); setSel(0); }

  const [seenOpen, setSeenOpen] = useState(open);
  if (seenOpen !== open) {
    setSeenOpen(open);
    if (open) setQ('');
  }

  if (!open) return null;

  return (
    <div className="vy-palette-backdrop" onClick={onClose}>
      <div className="vy-palette" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          className="vy-palette-input"
          placeholder="Search screens — try “What If”, “RMA”, or “so-mst”"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
            if (e.key === 'Enter' && results[sel]) { navigate(results[sel].path); onClose(); }
            if (e.key === 'Escape') onClose();
          }}
        />
        <ul className="vy-palette-list">
          {results.map((r, i) => (
            <li
              key={r.path}
              className={i === sel ? 'is-sel' : ''}
              onMouseEnter={() => setSel(i)}
              onClick={() => { navigate(r.path); onClose(); }}
            >
              {/* Title first — the group is a qualifier, not a prefix. See
                  the note on `.vy-palette-row` for the five left edges this
                  replaced. */}
              <div className="vy-palette-row">
                <span className="vy-palette-title">{r.title}</span>
                <span className="vy-palette-group">{r.group}</span>
              </div>
              {r.wasCalled && <div className="vy-palette-was">formerly {r.wasCalled}</div>}
            </li>
          ))}
          {results.length === 0 && <li className="vy-palette-empty">No screen matches “{q}”.</li>}
        </ul>
        <div className="vy-palette-foot">
          <kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>↵</kbd> to open · <kbd>esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
