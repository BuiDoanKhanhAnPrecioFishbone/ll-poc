import { useLocation } from 'react-router-dom';
import { proposedNav, settingsNav } from '../data/sitemap';

/**
 * Stands in for screens not yet mocked. It still does real work: it states
 * where the screen sits, what it is for, and where it lived before — which is
 * the migration note a stakeholder needs when reviewing the new IA.
 */
export function Placeholder() {
  const { pathname } = useLocation();
  let group = '', item: any = null;
  for (const g of [...proposedNav, ...settingsNav]) {
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
        <p className="vy-stub-hint">{item?.hint}</p>
        {item?.wasCalled && (
          <p className="vy-stub-was">
            In the current system this is <strong>{item.wasCalled}</strong>.
          </p>
        )}
        <p className="vy-stub-note">
          This screen would use the same standard list pattern as the Part Master —
          same toolbar order, same column roles, same status vocabulary. That is the
          point of standardising: a new screen costs a column spec, not a design.
        </p>
      </div>
    </div>
  );
}
