import * as Popover from '@radix-ui/react-popover';
import { Link } from 'react-router-dom';
import { usePrefs, type Density, type DateStyle } from '../ui/prefs';
import type { Theme } from '../theme/applyTheme';

/**
 * The user menu, and the home for preferences that apply everywhere.
 *
 * Row density lives here rather than on each list, per the 25 Aug review. Two
 * reasons, and the second is the one that matters: a per-screen control let the
 * same user end up with a compact Quotations list and a relaxed Part Master and
 * no way to reconcile them; and a settings control on the list view is paid for
 * on every visit by everyone, to serve a choice made once.
 */
const DENSITIES: { id: Density; label: string; note: string }[] = [
  { id: 'compact', label: 'Compact', note: 'Most rows on screen' },
  { id: 'comfortable', label: 'Comfortable', note: 'Balanced' },
  { id: 'relaxed', label: 'Relaxed', note: 'Easiest to read' },
];

/* Three, not a two-way switch. "System" is a real answer and the DEFAULT one:
   a user who has already told their operating system which they prefer should
   not have to tell this application separately, and an app that cannot express
   "follow the system" silently overrides that choice the first time it is
   touched. It is also the state `tokens.css` is written around. */
const THEMES: { id: Theme; label: string; note: string }[] = [
  { id: 'light', label: 'Light', note: 'Always' },
  { id: 'dark', label: 'Dark', note: 'Always' },
  { id: 'system', label: 'System', note: 'Follow this device' },
];

const DATE_STYLES: { id: DateStyle; label: string; note: string }[] = [
  { id: 'exact', label: 'Exact date', note: '24 Aug 2026' },
  { id: 'relative', label: 'From today', note: '3 days late' },
];

export function UserMenu() {
  const { density, setDensity, theme, setTheme, dateStyle, setDateStyle } = usePrefs();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="vy-avatar" aria-label="Huyen NTN — account and preferences">H</button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="vy-popover vy-usermenu" align="end" sideOffset={8}>
          <div className="vy-usermenu-id">
            <div className="vy-avatar vy-avatar--lg" aria-hidden>H</div>
            <div>
              <strong>Huyen NTN</strong>
              <span>Linh Long Engineering</span>
            </div>
          </div>

          {/* ONLY THE PREFERENCES SCROLL. `.vy-popover` caps itself at 60vh, so
              on a 900px laptop this menu was 540px tall against 715px of
              content — and Sign out, being last, sat 139px below the fold. A
              control added specifically so the login screen could be reached by
              clicking, reachable only by scrolling first. */}
          <div className="vy-usermenu-scroll">
          <div className="vy-usermenu-section">
            <h3>Row density</h3>
            <p className="vy-usermenu-hint">Applies to every list.</p>
            <div className="vy-density-choices" role="radiogroup" aria-label="Row density">
              {DENSITIES.map(d => (
                <button key={d.id} type="button" role="radio" aria-checked={density === d.id}
                        className="vy-density-choice" onClick={() => setDensity(d.id)}>
                  <span className="vy-density-label">{d.label}</span>
                  <span className="vy-density-note">{d.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="vy-usermenu-section">
            <h3>Appearance</h3>
            <p className="vy-usermenu-hint">Dark mode is new — tell us what reads badly.</p>
            <div className="vy-density-choices" role="radiogroup" aria-label="Appearance">
              {THEMES.map(t => (
                <button key={t.id} type="button" role="radio" aria-checked={theme === t.id}
                        className="vy-density-choice" onClick={() => setTheme(t.id)}>
                  <span className="vy-density-label">{t.label}</span>
                  <span className="vy-density-note">{t.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="vy-usermenu-section">
            <h3>Dates in lists</h3>
            <p className="vy-usermenu-hint">One format per column, everywhere.</p>
            <div className="vy-density-choices" role="radiogroup" aria-label="Date format">
              {DATE_STYLES.map(d => (
                <button key={d.id} type="button" role="radio" aria-checked={dateStyle === d.id}
                        className="vy-density-choice" onClick={() => setDateStyle(d.id)}>
                  <span className="vy-density-label">{d.label}</span>
                  <span className="vy-density-note">{d.note}</span>
                </button>
              ))}
            </div>
          </div>

          </div>

          {/* THE WAY TO THE SIGN-IN SCREEN. It had none: `/login` was a route
              nobody could reach by clicking, so the one screen the kick-off
              deck spends two slides on could only be seen by typing its URL.
              A reviewer will not do that, and a reviewer is who this build is
              for.

              A real <Link>, not a toast saying what it would do. There is no
              session to end here, so signing out IS just going to that screen
              — and a control that navigates should navigate. */}
          <div className="vy-usermenu-section vy-usermenu-foot">
            <Link className="vy-usermenu-signout" to="/login">
              <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
                   strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 14v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M9 10h8m0 0-2.5-2.5M17 10l-2.5 2.5" />
              </svg>
              Sign out
            </Link>
            <p className="vy-usermenu-hint">Takes you to the sign-in screen. Nothing is stored to clear.</p>
          </div>

          <Popover.Arrow className="vy-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
