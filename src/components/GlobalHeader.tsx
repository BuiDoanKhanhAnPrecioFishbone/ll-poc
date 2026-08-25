import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { QUEUES_PATH } from '../data/sitemap';

/**
 * The global header widgets the 25 Aug review found missing: a clock, the
 * timezone, a language selector, and My Queues reachable from every screen.
 *
 * All four are on the shell rather than any page, because the thing they have in
 * common is that they are true no matter which screen you are on.
 */

/** Where the mockup pretends to be. A real build reads this from the user. */
const TIMEZONES = [
  { id: 'Asia/Ho_Chi_Minh', label: 'ICT · Ho Chi Minh City' },
  { id: 'America/Los_Angeles', label: 'PT · Los Angeles' },
  { id: 'America/Chicago', label: 'CT · Chicago' },
  { id: 'Europe/Stockholm', label: 'CET · Stockholm' },
];

const LANGUAGES = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'vi', label: 'Tiếng Việt', short: 'VI' },
];

/**
 * A clock in an ERP header is not decoration. Users on this system work across
 * Vietnam, the US and Europe, and every timestamp in it — a due date, a quote
 * run, an activity entry — is only readable against a stated zone. Showing the
 * time WITHOUT the zone would be worse than showing neither.
 */
export function HeaderClock({ tz }: { tz: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    /* Ticks on the minute, not the second. A seconds display in a header is
       movement in the corner of the eye all day for information nobody needs. */
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: tz,
  });
  const zone = TIMEZONES.find(z => z.id === tz)?.label.split(' · ')[0] ?? '';

  return (
    <div className="vy-clock" title={now.toLocaleString('en-GB', { timeZone: tz })}>
      <span className="vy-clock-time">{time}</span>
      <span className="vy-clock-zone">{zone}</span>
    </div>
  );
}

/**
 * The zone abbreviation is already in the clock, so this picker shows the CITY.
 * Abbreviations are ambiguous across regions and a header cannot afford the full
 * "ICT · Ho Chi Minh City" twice — at 543px that string alone collided with the
 * language picker beside it.
 */
export function TimezonePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="vy-header-select" title="Timezone">
      <span className="vy-sr-only">Timezone</span>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {TIMEZONES.map(z => (
          <option key={z.id} value={z.id}>{z.label.split(' · ')[1]}</option>
        ))}
      </select>
    </label>
  );
}

export function LanguagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="vy-header-select vy-header-select--short">
      <span className="vy-sr-only">Language</span>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.short}</option>)}
      </select>
    </label>
  );
}

/**
 * My Queues, as a header icon with a badge.
 *
 * The review: "make My Queue accessible from any screen like a notification
 * system — icon in the global header bar with badge count." It was a nav entry,
 * which meant the one thing that tells you something needs doing was only
 * visible while you were looking at the menu.
 *
 * The badge counts things that are LATE, not everything outstanding. A badge
 * that shows total workload is permanently lit, and a permanently lit badge
 * stops being read.
 */
export function QueueBell({ count }: { count: number }) {
  return (
    <NavLink to={QUEUES_PATH}
             className={({ isActive }) => 'vy-icon-btn vy-queue-bell' + (isActive ? ' is-active' : '')}
             aria-label={count ? `My Queues, ${count} overdue` : 'My Queues, nothing overdue'}
             title={count ? `${count} overdue` : 'Nothing overdue'}>
      <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor"
           strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 5h6M3 10h6M3 15h6M13 4v12M13 4l3.5 3.5M13 4 9.5 7.5" />
      </svg>
      {count > 0 && <span className="vy-count-badge">{count > 99 ? '99+' : count}</span>}
    </NavLink>
  );
}
