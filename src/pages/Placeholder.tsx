import { useLocation } from 'react-router-dom';
import { legacyNav, liveNav, proposedNav, settingsNav } from '../data/sitemap';

/**
 * Stands in for screens not yet mocked.
 *
 * Decision D8 puts depth ahead of breadth: one module verified field-by-field
 * against the live system argues better than five built from inference. So this
 * page's job is to be HONEST rather than impressive — it says plainly that the
 * screen is not built, rather than showing a plausible-looking approximation
 * that a reviewer might mistake for verified work.
 */
export function Placeholder() {
  const { pathname } = useLocation();
  const { title, group, hint } = resolve(pathname);
  return (
    <div className="vy-page">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">{title}</h1>
          <p className="vy-page-sub">{group}</p>
        </div>
      </div>
      <div className="vy-stub">
        <span className="vy-stub-tag">Not yet mocked</span>
        {hint && <p className="vy-stub-hint">{hint}</p>}
        <p className="vy-stub-note">
          Quotations is the module built out in this prototype. This screen exists
          in the navigation because it exists in the live menu — it has not been
          checked against the real one, so nothing is shown here rather than
          something that looks checked and is not.
        </p>
        <p className="vy-stub-note">
          When it is built it will use the same list pattern as Part Master: same
          toolbar order, same column roles, same status vocabulary. That is the
          point of standardising — a new screen costs a column spec, not a design.
        </p>
      </div>
    </div>
  );
}


/**
 * What screen is this, and which module does it belong to?
 *
 * The first version searched `liveNav` items only, so anything that was not a
 * leaf of the live menu rendered as the word "Screen" over an empty subtitle —
 * a page that cannot name itself. Three kinds of path hit that:
 *
 *   - MODULE ROOTS like `/sales-management`. `liveNav` groups carry no path;
 *     only `legacyNav` does, which is where the group's own URL lives.
 *   - THE PROPOSED TREE, `/sell/*` and `/settings/*`. Those are the sitemap
 *     redesign's paths, reachable from the Sitemap page rather than the rail.
 *   - ANYTHING ELSE, including a typo.
 *
 * None is reachable by clicking — group headers toggle rather than navigate —
 * so this only shows on a typed or pasted URL. That is exactly when a page
 * naming itself matters most: the reader has no breadcrumb to fall back on.
 *
 * The last case now derives a title from the path rather than saying "Screen",
 * because "Metadata Type" tells you what you asked for and "Screen" tells you
 * the app did not recognise it — which is the one thing the reader can already
 * see.
 */
function resolve(pathname: string): { title: string; group: string; hint?: string } {
  for (const g of liveNav) {
    const hit = g.items.find(i => i.path === pathname);
    if (hit) return { title: hit.title, group: g.title, hint: hit.hint };
  }
  const root = legacyNav.find(g => g.path === pathname);
  if (root) return { title: root.title, group: 'Module' };
  for (const g of [...proposedNav, ...settingsNav]) {
    const hit = g.items.find(i => i.path === pathname);
    if (hit) return { title: hit.title, group: `${g.title} · proposed sitemap`, hint: hit.hint };
  }
  return { title: titleFromPath(pathname), group: 'Not in the menu' };
}

/** `/system-setup/metadata-type` → "Metadata Type". */
function titleFromPath(pathname: string): string {
  const last = pathname.split('/').filter(Boolean).pop();
  if (!last) return 'Screen';
  return last.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
