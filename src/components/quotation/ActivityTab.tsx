import { useMemo, useState } from 'react';
import { fmtLongDate, fmtTime } from '../../ui/regional';
import type { ActivityEntry, Quotation } from '../../data/quotations';
import { TODAY } from '../../data/quotations';
import { Select } from '../../ui/Overlays';
import { StatusBadge } from '../../ui/Badge';
import { fmtDate } from '../../ui/renderCell';

/**
 * Activity log — rebuilt on 15 October 2026 against the live screen.
 *
 * The customer rebuilt this tab in Voyager and asked us to follow it. Read on
 * the live RFQ record the same day (`/sales-management/quotation/<id>`, Activity
 * Logs). What they now ship, and what this reproduces:
 *
 *   STATUS FLOW        a horizontal timeline of status changes, each card
 *                      carrying the status, who moved it, and `from -> to`.
 *                      Theirs is a Kendo Timeline in horizontal mode, with a
 *                      year flag at the start of the track.
 *   MASTER / DETAIL    a filtered list on the left — user, date from, date to —
 *                      and the selected entry's field changes on the right.
 *                      Entries are grouped under a date heading.
 *   FIELD CHANGES      one row per field: its name, the old value struck
 *                      through, an arrow, the new value.
 *
 * WHAT THIS REPLACES. Our own version grouped by day AND by author and opened
 * each entry's diff inline. The customer's version answers a different question
 * well — "what did this record look like before, and who moved it" — and the
 * status flow in particular is information we were not showing at all.
 *
 * THREE PLACES THIS DOES NOT COPY THE LIVE SCREEN, each noted where it happens:
 * the opening selection, the ordering inside a day, and the pluralisation.
 */
const ALL_USERS = 'All users';

export function ActivityTab({ q }: { q: Quotation }) {
  const [who, setWho] = useState(ALL_USERS);
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  /* `undefined` means "not chosen yet", which is not the same as "nothing is
     selected" — the first means fall back to the newest entry, the second is a
     filter that excluded everything. */
  const [picked, setPicked] = useState<string | undefined>(undefined);

  const flow = useMemo(() => statusFlow(q.activity), [q.activity]);
  const authors = useMemo(
    () => [ALL_USERS, ...[...new Set(q.activity.map(a => a.author))].sort()],
    [q.activity],
  );

  const visible = useMemo(
    () => q.activity.filter(a => matches(a, who, from, until)),
    [q.activity, who, from, until],
  );
  const days = useMemo(() => groupByDay(visible), [visible]);

  /* OPENS ON THE NEWEST ENTRY, where the live screen opens on "No activity
     selected". Theirs spends the whole right-hand pane on a sentence telling
     you to click something; the pane is two thirds of the tab, and the entry
     almost everyone wants is the most recent one. The empty state is kept for
     the case that actually needs it — a filter that matched nothing. */
  const newest = visible.length
    ? visible.reduce((a, b) => (b.at > a.at ? b : a))
    : undefined;
  const selected = visible.find(a => a.id === picked) ?? newest;

  if (!q.activity.length) {
    return (
      <div className="vy-empty-state vy-empty-state--inline">
        <strong>Nothing has happened yet</strong>
        <p>Edits, status changes and quote runs will appear here.</p>
      </div>
    );
  }

  return (
    <div className="vy-activity">
      {flow.length > 0 && <StatusFlow flow={flow} />}

      <div className="vy-activity-split">
        <div className="vy-activity-master">
          <div className="vy-activity-filters">
            <Select label="User" options={authors} value={who}
                    onChange={v => { setWho(v); setPicked(undefined); }} />
            {/* Native date inputs, as the live screen uses — the browser's own
                picker is localised, and a range this small does not earn a
                custom control. */}
            <label className="vy-activity-date-filter">
              <span className="vy-sr-only">Changes from</span>
              <input className="vy-input" type="date" value={from} max={until || undefined}
                     onChange={e => { setFrom(e.target.value); setPicked(undefined); }} />
            </label>
            <label className="vy-activity-date-filter">
              <span className="vy-sr-only">Changes until</span>
              <input className="vy-input" type="date" value={until} min={from || undefined}
                     onChange={e => { setUntil(e.target.value); setPicked(undefined); }} />
            </label>
          </div>

          <div className="vy-activity-scroll">
            {days.map(day => (
              <section className="vy-activity-day" key={day.key}>
                <h4 className="vy-activity-date">{day.label}</h4>
                <ul className="vy-activity-list">
                  {day.entries.map(a => (
                    <li key={a.id}>
                      <button type="button" className="vy-activity-row"
                              aria-current={a.id === selected?.id || undefined}
                              onClick={() => setPicked(a.id)}>
                        <span className="vy-avatar vy-avatar--sm" aria-hidden>{a.initials}</span>
                        <span className="vy-activity-row-main">
                          <strong>{a.author}</strong>
                          <span className="vy-activity-what">{changeCount(a)}</span>
                        </span>
                        <time className="vy-activity-time"
                              dateTime={a.at.toISOString()}>{clock(a.at)}</time>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {!visible.length && (
              <p className="vy-activity-none">No activity matches these filters.</p>
            )}
          </div>
        </div>

        <div className="vy-activity-detail">
          {selected ? <Detail a={selected} /> : (
            <p className="vy-activity-empty">No activity selected.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The status flow.
 *
 * Horizontal, and it stays horizontal: a record passes through five statuses at
 * most, so the track fits, and left-to-right is how everyone already reads a
 * sequence of states. It scrolls sideways in its own strip rather than wrapping,
 * because a flow that wraps stops reading as a flow.
 */
function StatusFlow({ flow }: { flow: FlowStep[] }) {
  return (
    <section className="vy-status-flow">
      <h3 className="vy-status-flow-title">Status flow</h3>
      <ol className="vy-status-flow-track">
        {/* The year, once, at the head of the track — the live screen's flag.
            Every card below carries a day and a month; the year is the one part
            that is nearly always the same, so it is said once. */}
        <li className="vy-status-flow-year" aria-hidden>{flow[0].at.getFullYear()}</li>
        {flow.map(step => (
          <li className="vy-status-flow-step" key={step.id}>
            <div className="vy-status-flow-card">
              <StatusBadge value={step.status} />
              <span className="vy-status-flow-who">{step.author}</span>
              <span className="vy-status-flow-change">
                <span className="vy-status-flow-was">{step.from}</span>
                <span aria-hidden>→</span>
                <span>{step.to}</span>
              </span>
            </div>
            <span className="vy-status-flow-when">{fmtDate(step.at)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Detail({ a }: { a: ActivityEntry }) {
  return (
    <>
      <header className="vy-activity-detail-head">
        <span className="vy-avatar vy-avatar--sm" aria-hidden>{a.initials}</span>
        <strong>{a.author}</strong>
        <span className="vy-activity-detail-when">
          {clock(a.at)} · {fmtDate(a.at)}
        </span>
      </header>

      {a.changes?.length ? (
        <>
          <h4 className="vy-activity-detail-title">Field changes</h4>
          <ul className="vy-change-list">
            {a.changes.map(c => (
              <li className="vy-change" key={c.field}>
                <span className="vy-change-field">{c.field}</span>
                <span className="vy-change-values">
                  <span className="vy-change-was">{c.from || '—'}</span>
                  <span className="vy-change-arrow" aria-hidden>→</span>
                  <span className="vy-change-now">{c.to || '—'}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        /* An entry with no diff is not an empty detail pane: "RFQ was created"
           is the whole story of that entry, and the live screen leaves the pane
           blank for it. */
        <p className="vy-activity-detail-summary">{a.summary}</p>
      )}
    </>
  );
}

type FlowStep = {
  id: string; status: string; author: string; at: Date; from: string; to: string;
};

/**
 * The flow is DERIVED from the log rather than stored beside it. Every status
 * change is already an entry — `action: 'Status'`, with `Status: from -> to` in
 * its changes — so a second list of the same facts could only disagree with the
 * first. The live screen reads the same way: its first card says
 * `- -> RFQ was created`, which is the creation entry with no diff on it.
 */
function statusFlow(entries: ActivityEntry[]): FlowStep[] {
  return entries
    .filter(a => a.action === 'Create' || a.action === 'Status')
    .sort((x, y) => x.at.getTime() - y.at.getTime())
    .map(a => {
      const diff = a.changes?.find(c => c.field === 'Status');
      return {
        id: a.id,
        status: diff ? diff.to : 'New',
        author: a.author,
        at: a.at,
        from: diff ? diff.from : '—',
        to: diff ? diff.to : a.summary,
      };
    });
}

function matches(a: ActivityEntry, who: string, from: string, until: string): boolean {
  if (who !== ALL_USERS && a.author !== who) return false;
  const key = dayKey(a.at);
  if (from && key < from) return false;
  if (until && key > until) return false;
  return true;
}

/**
 * Newest day first; inside a day, the order things happened.
 *
 * NOT what the live screen does — its two groups were sorted in opposite
 * directions on the record I read (13:44 before 17:00 under one date, 16:21
 * before 14:47 under the next). One of the two is wrong whichever rule was
 * intended, so this picks one and holds it: a day reads as a sequence of work,
 * and the newest day is the one you came for.
 */
function groupByDay(entries: ActivityEntry[]) {
  const byDay = new Map<string, ActivityEntry[]>();
  for (const a of entries) {
    const key = dayKey(a.at);
    (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(a);
  }
  return [...byDay.entries()]
    .sort((x, y) => (x[0] < y[0] ? 1 : -1))
    .map(([key, list]) => ({
      key,
      label: dayLabel(new Date(key + 'T12:00:00')),
      entries: list.sort((x, y) => x.at.getTime() - y.at.getTime()),
    }));
}

/** Local parts, not `toISOString()`, which is UTC and would file an evening
 *  edit in Ho Chi Minh City under the following day. */
function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Seconds included, unlike the rest of the app: this is an audit log, and two
 *  edits in the same minute have an order that matters. */
function clock(d: Date): string {
  return fmtTime(d);
}

/** "1 field changed", not the live screen's "1 field changes". */
function changeCount(a: ActivityEntry): string {
  const n = a.changes?.length ?? 0;
  if (!n) return a.summary;
  return n === 1 ? '1 field changed' : `${n} fields changed`;
}

/** "Today" and "Yesterday" beat a date for the two days people actually ask
 *  about; anything older gets the date, since "11 days ago" needs arithmetic. */
function dayLabel(d: Date): string {
  const days = Math.round((TODAY.getTime() - d.setHours(12, 0, 0, 0)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return fmtLongDate(d);
}
