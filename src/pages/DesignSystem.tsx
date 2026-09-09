import { ROLE_WIDTH } from '../components/column-model';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * The design system, on screen.
 *
 * REWRITTEN 9 SEP 2026, because it had stopped being true. The page was last
 * touched on 23 August and still described a system from before the KendoReact
 * migration, the Voyager IQ palette, the semantic token layer and dark mode. It
 * showed three raw ramps and named none of the roles everything now runs on,
 * documented a `rating` column role that has since been deleted, and said
 * "structure follows Material 3" without mentioning the component library the
 * customer actually chose.
 *
 * That matters more than a stale page usually would: design decision D10 is
 * "which screens is the design system signed off against", and this is the page
 * that answer gets reviewed on. Approving a system against two-week-old
 * documentation is how you approve the wrong thing.
 */

/** The raw ramps. Real values, and the ONLY place they are allowed to live. */
const RAMPS = {
  Blue: ['--vy-blue-50','--vy-blue-100','--vy-blue-200','--vy-blue-300','--vy-blue-400','--vy-blue-500','--vy-blue-600','--vy-blue-700','--vy-blue-800','--vy-blue-900'],
  Grey: ['--vy-grey-0','--vy-grey-25','--vy-grey-50','--vy-grey-100','--vy-grey-200','--vy-grey-300','--vy-grey-400','--vy-grey-500','--vy-grey-600','--vy-grey-700','--vy-grey-800','--vy-grey-900'],
  Red:  ['--vy-red-50','--vy-red-500','--vy-red-600','--vy-red-700'],
};

/** The layer everything actually references. Grouped by the job each does. */
const SEMANTIC: { group: string; note: string; tokens: string[] }[] = [
  { group: 'Surfaces', note: 'What a thing sits on. `app` is the page, `raised` a dialog or menu, `sunken` an inset that sits below the page, `chrome` the deliberately dark furniture that stays dark in both themes.',
    tokens: ['--vy-surface-app','--vy-surface','--vy-surface-raised','--vy-surface-subtle','--vy-surface-sunken','--vy-surface-strong','--vy-surface-hover','--vy-surface-selected','--vy-surface-chrome'] },
  { group: 'Text', note: 'Six tiers, because the stylesheets were already using six greys for text. `on-surface` is body copy; `strong` is above it for headings and identifiers. `faint` measures 2.58:1 on white and is legitimate only on a dark ground or where the text is decorative.',
    tokens: ['--vy-on-surface-strong','--vy-on-surface','--vy-on-surface-soft','--vy-on-surface-muted','--vy-on-surface-subtle','--vy-on-surface-faint','--vy-on-surface-invert'] },
  { group: 'Lines', note: '`border` is STRUCTURE — panel edges, table rules — which WCAG 1.4.11 does not cover. `border-control` is the boundary of something you can operate, which it does, and it is the one value in the system chosen by measurement rather than by the ramp.',
    tokens: ['--vy-border-faint','--vy-border','--vy-border-strong','--vy-border-mid','--vy-border-heavy','--vy-border-control'] },
  { group: 'Brand', note: 'Fill and text are separate roles because in a dark theme they pull opposite ways: a fill must be dark enough for its label, brand text light enough for the page. The dark theme inverts the pair rather than shifting it.',
    tokens: ['--vy-brand','--vy-brand-hover','--vy-brand-active','--vy-brand-text','--vy-brand-on','--vy-brand-subtle','--vy-brand-boundary'] },
  { group: 'Danger', note: 'The red ramp is a value; these are the jobs it does. Separable for the same reason brand is.',
    tokens: ['--vy-danger','--vy-danger-text','--vy-danger-subtle','--vy-danger-boundary','--vy-danger-on'] },
];

const ROLE_NOTES: Record<string, string> = {
  ident:  'The primary identifier. Monospaced, tabular, never truncated — it is how people refer to the record out loud and in email.',
  text:   'The only role allowed to truncate. Fixed at 280px with the full value in a tooltip; the grid scrolls rather than squeezing every column.',
  code:   'Short enumerations. Width is set to the longest member of the enum, so it never clips and never over-reserves.',
  number: 'Right-aligned with tabular figures so magnitudes line up and a misplaced digit is visible.',
  money:  'Right-aligned, currency-aware, always two decimals.',
  date:   'Sized to the full rendered format. A truncated date is worse than no date — production truncates 100% of them.',
  status: 'One badge from the shared status tokens. Never free text.',
};

export function DesignSystemPage() {
  return (
    <div className="vy-page vy-page--doc">
      <div className="vy-page-head">
        <div>
          <h1 className="vy-page-title">Design system</h1>
          <p className="vy-page-sub">
            Every value below is a CSS custom property, and the token files are the only place raw
            values are allowed. The components are <strong>KendoReact</strong>; the look is ours,
            mapped onto Kendo’s own custom properties by a bridge rather than by re-skinning —
            so one token here moves an entire component family. Structure follows Material 3
            for elevation, state layers and motion.
          </p>
        </div>
      </div>

      <Section title="How to read this page"
        note="Raw ramps are values. The semantic layer is roles, and roles are what the stylesheets reference — 553 of them, with no raw primitive left in any component file. That indirection is the whole reason a dark theme is a change to one block rather than to every screen. Switch it in the user menu under Appearance; every swatch below follows.">
        <div className="vy-badge-row">
          <span className="vy-note-inline">Light and dark are both live — this page renders in whichever is on.</span>
        </div>
      </Section>

      <Section title="Semantic layer — what components reference"
        note="Named for the job, not the colour. A stylesheet saying `background: var(--vy-grey-0)` has hard-coded “white”, and no theme can move it; one saying `var(--vy-surface)` has hard-coded “the colour a panel is”, which a theme is allowed to answer differently.">
        {SEMANTIC.map(g => (
          <div className="vy-ds-group" key={g.group}>
            <h3>{g.group}</h3>
            <p className="vy-ds-note">{g.note}</p>
            <div className="vy-ramp-row">
              {g.tokens.map(t => (
                <div className="vy-swatch" key={t} style={{ background: `var(${t})` }} title={t}>
                  <span>{t.replace('--vy-', '')}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Colour ramps — the raw values underneath"
        note="Voyager IQ sits at hue 222, six degrees from the mark it inherits. The hue was chosen by measurement rather than taste: two status badges have to stay distinguishable from primary, and the old ramp at 216 sat 47° from the violet `waiting` badge but only 23° from the cyan `review` one. 222 sits at 41° and 29° — not merely different, more evenly separated than what it replaced.">
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
        note="Eight tokens, and what they encode is who is blocked — not what stage the record is at. `open` means waiting on us and is what a work queue filters to; `waiting` means waiting on a customer, supplier or approver. Production colours every Part Master status the same green, which makes the column decorative. In dark, `In-Progress` deliberately keeps its solid green while `Completed` becomes a tint — the guideline names them Green and Light Green, and that only reads if one of them is actually saturated.">
        <div className="vy-badge-row">
          {['Draft','New','In-Progress','Quoted','Completed','Blocked','Cancelled'].map(s => <StatusBadge key={s} value={s} />)}
        </div>
        <p className="vy-ds-note">
          Seven labels, eight tokens. The eighth is <span className="vy-code">review</span>, and it
          is deliberately not a record status: the guideline assigns cyan to a checklist
          <em> document</em> that has been uploaded and is awaiting approval, so it is reached
          through the task state on the Checklists tab rather than through this badge. A record and
          a document are not in the same lifecycle, and giving them one vocabulary would say they
          are.
        </p>
      </Section>

      <Section title="Column roles"
        note="The rule that replaces uniform 108px columns. Width is a consequence of what the column holds — and a column empty in more than half its rows is hidden by default, with the reason stated in the chooser.">
        <table className="vy-spec-table">
          <thead><tr><th>Role</th><th>Width</th><th>Rule</th></tr></thead>
          <tbody>
            {Object.entries(ROLE_WIDTH).map(([role, w]) => (
              <tr key={role}>
                <td><span className="vy-code">{role}</span></td>
                <td className="vy-num">{w}px</td>
                <td>{ROLE_NOTES[role] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Buttons"
        note="Material 3’s emphasis ladder: the variant carries importance, not the colour. One filled button per view; everything else steps down. `danger` is the one addition — an ERP deletes records, and Material folds that into filled-with-error, which reads as the main thing to do.">
        <div className="vy-badge-row">
          <Button variant="filled">Filled</Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="filled" disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Elevation"
        note="Five levels, each two shadows: a tight neutral contact shadow and a wider one tinted with the brand, because neutral grey over a warm-white surface reads as dirt rather than depth. The tint is derived from the brand token — it was a frozen literal until 9 Sep, still carrying the pre-Voyager-IQ blue. In dark it becomes near-black, because a light-tinted shadow on a dark ground is a glow.">
        <div className="vy-elev-row">
          {[0, 1, 2, 3, 4, 5].map(n => (
            <div className="vy-elev-swatch" key={n} data-level={n}>
              <span>{n}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale" note="The production app declares no font-family at all — the computed value is the bare keyword `sans-serif`, so it renders differently on every OS. English only, per design decision D12, so the scale carries no CJK line-height allowance.">
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
