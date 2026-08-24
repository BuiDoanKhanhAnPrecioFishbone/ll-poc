import { legacyNav, proposedNav, settingsNav, legacyStats } from '../data/sitemap';

/**
 * The IA question, and how it was answered.
 *
 * Left is the production menu exactly as the API returns it, with every defect
 * annotated. Right WAS the proposal — and the customer declined it (decision
 * D1, 24 Aug 2026). This page now documents a decision rather than arguing for
 * one, so the right-hand column is marked as not built.
 *
 * The proposal is kept rather than deleted. The defects on the left are real
 * and measured; if the naming ever does get revisited, this is the work already
 * done on it. What would be dishonest is leaving the column unmarked, because
 * anyone reviewing the prototype would read it as a plan.
 */
export function SitemapPage() {
  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">Sitemap</h1>
          <p className="vy-page-sub">
            The live <code>/api/account/get/menus</code> payload captured 19 Aug 2026 — {legacyStats.totalNodes} nodes, unedited — beside a restructure that was proposed and declined.
          </p>
        </div>
      </div>

      {/* Stated once, at the top, before any of the argument below it. A reader
          who stops after the first screen should still leave knowing which of
          these two columns is the product. */}
      <div className="vy-verdict">
        <h2>The restructure was declined</h2>
        <p>
          Renaming and regrouping 51 screens invalidates what every user has already
          learned, and the value being bought here is legibility rather than a different
          information architecture. <strong>The prototype ships the live menu on the left,
          verbatim</strong> — same groups, same names, same order.
        </p>
        <p>
          The defects annotated below are still real, and still worth fixing one day. They
          are observations, not a work list.
        </p>
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
          <h2 className="vy-compare-head vy-compare-head--before">
            Live — 8 groups, 51 nodes
            <span className="vy-compare-tag" data-state="built">This is what the prototype builds</span>
          </h2>
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
          <h2 className="vy-compare-head vy-compare-head--after">
            Proposed — 8 verb-named groups, admin moved out
            <span className="vy-compare-tag" data-state="declined">Declined — not built</span>
          </h2>
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
                  {i.keepsLegacyRoute && (
                    <div className="vy-note-inline">
                      Keeps the production URL so the mockup and the live system can be compared
                      at the same address; the new path redirects here.
                    </div>
                  )}
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
