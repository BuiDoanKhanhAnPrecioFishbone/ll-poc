import { Link } from 'react-router-dom';

/**
 * Replaces the production Home, which shows a Kendo demo chart titled
 * "World Population by Broad Age Groups" — stock sample data, still live.
 * A landing page in an ERP should answer one question: what needs me today.
 */
export function Home() {
  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">My Work</h1>
          <p className="vy-page-sub">Tuesday 19 August · Huyen NTN · Linh Long Engineering</p>
        </div>
      </div>

      <div className="vy-queue-row">
        <Queue n={7} label="Quotations awaiting your response" tone="open" to="/sell/quotations" />
        <Queue n={3} label="Purchase orders over budget" tone="blocked" to="/buy/purchase-orders" />
        <Queue n={12} label="Work orders released today" tone="progress" to="/make/work-orders" />
        <Queue n={41} label="Parts below reorder point" tone="open" to="/parts" />
      </div>

      <div className="vy-callout">
        <h2>This is a mockup, not the ERP</h2>
        <p>
          It exists to test three things before any of it is built: a design system driven
          entirely by tokens, a restructured sitemap, and one standard list pattern that every
          module can inherit.
        </p>
        <div className="vy-callout-links">
          <Link className="vy-link-card" to="/parts">
            <strong>Part Master</strong>
            <span>The standard list pattern, on 2,000 rows</span>
          </Link>
          <Link className="vy-link-card" to="/sitemap">
            <strong>Sitemap</strong>
            <span>Current vs proposed IA, with the live menu payload</span>
          </Link>
          <Link className="vy-link-card" to="/design-system">
            <strong>Design system</strong>
            <span>Tokens, status vocabulary, column roles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Queue({ n, label, tone, to }: { n: number; label: string; tone: string; to: string }) {
  return (
    <Link className="vy-queue" to={to} data-tone={tone}>
      <div className="vy-queue-n">{n}</div>
      <div className="vy-queue-label">{label}</div>
    </Link>
  );
}
