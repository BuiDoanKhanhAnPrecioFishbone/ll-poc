import { ROLE_WIDTH } from '../components/column-model';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '@progress/kendo-react-buttons';

const RAMPS = {
  Blue: ['--vy-blue-50','--vy-blue-100','--vy-blue-200','--vy-blue-300','--vy-blue-400','--vy-blue-500','--vy-blue-600','--vy-blue-700','--vy-blue-800','--vy-blue-900'],
  Grey: ['--vy-grey-0','--vy-grey-25','--vy-grey-50','--vy-grey-100','--vy-grey-200','--vy-grey-300','--vy-grey-400','--vy-grey-500','--vy-grey-600','--vy-grey-700','--vy-grey-800','--vy-grey-900'],
  Red:  ['--vy-red-50','--vy-red-500','--vy-red-600','--vy-red-700'],
};

const ROLE_NOTES: Record<string, string> = {
  ident:  'The primary identifier. Monospaced, tabular, never truncated — it is how people refer to the record out loud and in email.',
  text:   'The only role allowed to truncate. Fixed at 280px with the full value in a tooltip; the grid scrolls rather than squeezing every column.',
  code:   'Short enumerations. Width is set to the longest member of the enum, so it never clips and never over-reserves.',
  number: 'Right-aligned with tabular figures so magnitudes line up and a misplaced digit is visible.',
  money:  'Right-aligned, currency-aware, always two decimals.',
  date:   'Sized to the full rendered format. A truncated date is worse than no date — production truncates 100% of them.',
  status: 'One badge from the shared status tokens. Never free text.',
  rating: 'A Kendo Rating rendered read-only in the cell. Note that a Rating has a 32px floor, so rows containing one cannot reach compact density — see GAP-02.',
};

export function DesignSystemPage() {
  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">Design system</h1>
          <p className="vy-page-sub">
            Every value below is a CSS custom property. Nothing here overrides a Kendo component —
            the tokens are mapped onto Kendo’s own variable API, so all components inherit at once.
          </p>
        </div>
      </div>

      <Section title="Colour ramps"
        note="The current system uses one flat blue and ad-hoc #333/#666/#ccc greys, which is why hover, selected and disabled states are hard to tell apart.">
        {Object.entries(RAMPS).map(([name, vars]) => (
          <div className="vy-ramp" key={name}>
            <div className="vy-ramp-name">{name}</div>
            <div className="vy-ramp-row">
              {vars.map(v => (
                <div className="vy-swatch" key={v} style={{ background: `var(${v})` }} title={v}>
                  <span>{v.replace('--vy-', '')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Status vocabulary"
        note="Seven tokens, and what they encode is who is blocked — not what stage the record is at. `open` means waiting on us and is what a work queue filters to; `waiting` means waiting on a customer, supplier or approver. Production colours every Part Master status the same green, which makes the column decorative.">
        <div className="vy-badge-row">
          {['Draft','New','In-Progress','Quoted','Completed','Blocked','Cancelled'].map(s => <StatusBadge key={s} value={s} />)}
        </div>
      </Section>

      <Section title="Column roles"
        note="The rule that replaces uniform 108px columns. Width is a consequence of what the column holds.">
        <table className="vy-spec-table">
          <thead><tr><th>Role</th><th>Width</th><th>Rule</th></tr></thead>
          <tbody>
            {Object.entries(ROLE_WIDTH).map(([role, w]) => (
              <tr key={role}>
                <td><span className="vy-code">{role}</span></td>
                <td className="vy-num">{w}px</td>
                <td>{ROLE_NOTES[role]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Buttons" note="Kendo Button, unmodified. Only the primitives changed.">
        <div className="vy-badge-row">
          <Button themeColor="primary">Primary</Button>
          <Button themeColor="base">Secondary</Button>
          <Button themeColor="base" fillMode="outline">Outline</Button>
          <Button themeColor="error">Destructive</Button>
          <Button themeColor="primary" disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Type scale" note="The production app declares no font-family at all — the computed value is the bare keyword `sans-serif`, so it renders differently on every OS.">
        <div className="vy-type-scale">
          {[['--vy-text-2xl','24px','Page title'],['--vy-text-xl','20px','Section title'],['--vy-text-lg','16px','Subsection'],['--vy-text-md','14px','Body emphasis'],['--vy-text-base','13px','Body / grid default'],['--vy-text-sm','12px','Secondary'],['--vy-text-xs','11px','Column headers, meta']].map(([v,size,use]) => (
            <div className="vy-type-row" key={v}>
              <span style={{ fontSize: `var(${v})` }}>{use}</span>
              <code>{v} · {size}</code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="vy-ds-section">
      <h2>{title}</h2>
      {note && <p className="vy-ds-note">{note}</p>}
      {children}
    </section>
  );
}
