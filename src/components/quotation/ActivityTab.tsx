import { useState } from 'react';
import type { ActivityEntry, Quotation } from '../../data/quotations';
import { TODAY } from '../../data/quotations';

/**
 * Activity log.
 *
 * The live tab renders raw column names in the diff — the entry I read said
 * `DtIssuedUtc:` with no from/to values, which tells a user nothing. Each entry
 * here says who, when, and what changed from what to what, in the form's own
 * words.
 *
 * REBUILT after the 25 Aug review: "adjust this layout to reduce blank space and
 * organize entries into user-friendly groups by date and by user, allowing users
 * to click to view the details of changes, which records they affected, and who
 * made them."
 *
 * Three things follow from that:
 *
 * 1. GROUPED BY DAY, then by person within the day. A flat list repeats the same
 *    date and the same name down the page; grouping states each once and turns
 *    the log into something you can skim by "what happened Tuesday".
 * 2. DETAILS ON DEMAND. Every entry used to print its full diff, so a record
 *    with twenty edits was a wall of field names. The summary line is always
 *    visible; the diff opens when asked.
 * 3. The avatar column is gone from every row. One avatar per person per day
 *    carries the same information and reclaims the indent the review called
 *    blank space.
 */
export function ActivityTab({ q }: { q: Quotation }) {
  const days = groupByDayAndAuthor(q.activity);

  if (!days.length) {
    return (
      <div className="vy-empty-state vy-empty-state--inline">
        <strong>Nothing has happened yet</strong>
        <p>Edits, status changes and quote runs will appear here.</p>
      </div>
    );
  }

  return (
    <div className="vy-activity">
      {days.map(day => (
        <section className="vy-activity-day" key={day.key}>
          {/* Sticky, so the date you are reading under stays visible while the
              entries scroll past it. */}
          <h3 className="vy-activity-date">{day.label}</h3>
          {day.byAuthor.map(group => (
            <div className="vy-activity-group" key={group.author}>
              <div className="vy-activity-who">
                <span className="vy-avatar vy-avatar--sm">{group.initials}</span>
                <strong>{group.author}</strong>
                <span className="vy-activity-count">
                  {group.entries.length} {group.entries.length === 1 ? 'change' : 'changes'}
                </span>
              </div>
              <ol className="vy-activity-list">
                {group.entries.map(a => <Entry key={a.id} a={a} />)}
              </ol>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function Entry({ a }: { a: ActivityEntry }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(a.changes?.length);
  const time = a.at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <li className="vy-activity-item" data-action={a.action}>
      {/* Only entries that HAVE a detail become buttons. A control that opens
          nothing is worse than no control. */}
      {hasDetail ? (
        <button type="button" className="vy-activity-line" aria-expanded={open}
                onClick={() => setOpen(o => !o)}>
          <span className="vy-activity-time">{time}</span>
          <span className="vy-activity-summary">{a.summary}</span>
          <span className="vy-activity-detail-n">
            {a.changes!.length} {a.changes!.length === 1 ? 'field' : 'fields'}
          </span>
          <span className="vy-activity-chevron" aria-hidden>{open ? '⌄' : '›'}</span>
        </button>
      ) : (
        <div className="vy-activity-line">
          <span className="vy-activity-time">{time}</span>
          <span className="vy-activity-summary">{a.summary}</span>
        </div>
      )}

      {open && (
        <div className="vy-activity-detail">
          {a.changes!.map(c => (
            <div className="vy-diff" key={c.field}>
              <span className="vy-diff-field">{c.field}</span>
              <span className="vy-diff-from">{c.from || '—'}</span>
              <span aria-hidden>→</span>
              <span className="vy-diff-to">{c.to || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

/**
 * Newest day first, and within a day the entries stay in the order they
 * happened — a person's edits read as a sequence, not a reverse one.
 *
 * Consecutive entries by the SAME person stay one group; if someone else edits
 * in between and the first person returns, that is two groups, because merging
 * them would imply an unbroken stretch of work that did not happen.
 */
function groupByDayAndAuthor(entries: ActivityEntry[]) {
  const byDay = new Map<string, ActivityEntry[]>();
  for (const a of [...entries].sort((x, y) => y.at.getTime() - x.at.getTime())) {
    const key = a.at.toISOString().slice(0, 10);
    (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(a);
  }

  return [...byDay.entries()].map(([key, list]) => {
    const groups: { author: string; initials: string; entries: ActivityEntry[] }[] = [];
    for (const a of [...list].reverse()) {
      const last = groups[groups.length - 1];
      if (last && last.author === a.author) last.entries.push(a);
      else groups.push({ author: a.author, initials: a.initials, entries: [a] });
    }
    return { key, label: dayLabel(new Date(key + 'T12:00:00')), byAuthor: groups.reverse() };
  });
}

/** "Today" and "Yesterday" beat a date for the two days people actually ask
 *  about; anything older gets the date, since "11 days ago" needs arithmetic. */
function dayLabel(d: Date): string {
  const days = Math.round((TODAY.getTime() - d.setHours(12, 0, 0, 0)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
