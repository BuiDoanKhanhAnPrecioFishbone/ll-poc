import * as Popover from '@radix-ui/react-popover';
import { usePrefs, type Density, type DateStyle } from '../ui/prefs';

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

const DATE_STYLES: { id: DateStyle; label: string; note: string }[] = [
  { id: 'exact', label: 'Exact date', note: '24 Aug 2026' },
  { id: 'relative', label: 'From today', note: '3 days late' },
];

export function UserMenu() {
  const { density, setDensity, dateStyle, setDateStyle } = usePrefs();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="vy-avatar" aria-label="Huyen NTN — account and preferences">H</button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="vy-popover" align="end" sideOffset={8}>
          <div className="vy-usermenu-id">
            <div className="vy-avatar vy-avatar--lg" aria-hidden>H</div>
            <div>
              <strong>Huyen NTN</strong>
              <span>Linh Long Engineering</span>
            </div>
          </div>

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

          <Popover.Arrow className="vy-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
