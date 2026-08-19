import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allDestinations } from '../data/sitemap';

/**
 * Cmd/Ctrl-K navigation.
 *
 * The learning-curve argument: with 51 destinations behind a collapsed
 * hamburger, a new user must remember which of eight groups owns a screen
 * before they can reach it. Search removes that requirement entirely — and it
 * matches on the OLD label too (`wasCalled`), so anyone trained on the current
 * system finds the renamed screen by the name they already know.
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
        const legacy = (d.wasCalled ?? '').toLowerCase();
        const hint = (d.hint ?? '').toLowerCase();
        let score = -1;
        if (title.startsWith(needle)) score = 0;
        else if (title.includes(needle)) score = 1;
        else if (legacy.includes(needle)) score = 2;   // found by its old name
        else if (hint.includes(needle)) score = 3;
        return { d, score };
      })
      .filter(r => r.score >= 0)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map(r => r.d);
  }, [q]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => { if (open) setQ(''); }, [open]);

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
              <div className="vy-palette-row">
                <span className="vy-palette-group">{r.group}</span>
                <span className="vy-palette-title">{r.title}</span>
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
