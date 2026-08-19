import { legacyNav, proposedNav, settingsNav, legacyStats } from '../data/sitemap';

/**
 * The IA argument, side by side. Left is the production menu exactly as the
 * API returns it, with every defect annotated. Right is the proposal.
 */
export function SitemapPage() {
  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">Sitemap — current vs proposed</h1>
          <p className="vy-page-sub">
            Left-hand column is the live <code>/api/account/get/menus</code> payload captured 19 Aug 2026 — {legacyStats.totalNodes} nodes, unedited.
          </p>
        </div>
      </div>

      <div className="vy-stat-row">
        <Stat n={legacyStats.repeatedConfiguration} label={'screens named “Configuration”'} />
        <Stat n={legacyStats.repeatedReporting} label={'screens named “Reporting”'} />
        <Stat n={legacyStats.namespaceMismatches} label="routes in the wrong namespace" />
        <Stat n={legacyStats.groupsRoutingToRoot} label="group headers that route to Home" />
        <Stat n={legacyStats.duplicateSequences} label="duplicate sort sequences" />
      </div>

      <div className="vy-compare">
        <section className="vy-compare-col">
          <h2 className="vy-compare-head vy-compare-head--before">Current — 8 groups, 51 nodes, behind a hamburger</h2>
          {legacyNav.map(g => (
            <div className="vy-tree-group" key={g.title}>
              <div className="vy-tree-group-title">
                {g.title}
                <code>{g.path}</code>
              </div>
              {g.issues?.map(x => <div className="vy-issue" key={x}>{x}</div>)}
              {g.children.map(c => (
                <div className="vy-tree-item" key={c.path + c.title}>
                  <div className="vy-tree-item-row">
                    <span>{c.title}</span><code>{c.path}</code>
                  </div>
                  {c.issues?.map(x => <div className="vy-issue" key={x}>{x}</div>)}
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="vy-compare-col">
          <h2 className="vy-compare-head vy-compare-head--after">Proposed — 8 verb-named groups, admin moved out, always visible</h2>
          {[...proposedNav, ...settingsNav].map(g => (
            <div className="vy-tree-group" key={g.title}>
              <div className="vy-tree-group-title">
                {g.title}
                <span className="vy-tree-purpose">{g.purpose}</span>
              </div>
              {g.items.map(i => (
                <div className="vy-tree-item" key={i.path}>
                  <div className="vy-tree-item-row">
                    <span>{i.title}</span><code>{i.path}</code>
                  </div>
                  {i.wasCalled && <div className="vy-was">was: {i.wasCalled}</div>}
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="vy-stat">
      <div className="vy-stat-n">{n}</div>
      <div className="vy-stat-label">{label}</div>
    </div>
  );
}
