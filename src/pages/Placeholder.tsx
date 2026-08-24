import { useLocation } from 'react-router-dom';
import { liveNav } from '../data/sitemap';

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
  let group = '', item: any = null;
  for (const g of liveNav) {
    const hit = g.items.find(i => i.path === pathname);
    if (hit) { group = g.title; item = hit; break; }
  }
  return (
    <div className="vy-page">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">{item?.title ?? 'Screen'}</h1>
          <p className="vy-page-sub">{group}</p>
        </div>
      </div>
      <div className="vy-stub">
        <span className="vy-stub-tag">Not yet mocked</span>
        {item?.hint && <p className="vy-stub-hint">{item.hint}</p>}
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
