/**
 * Contrast, measured on every push.
 *
 *   npm run contrast:check        (also runs inside `npm run css:check`)
 *
 * WHY THIS EXISTS, AND WHAT IT IS NOT. `docs/contrast-sweep.md` of 5 September
 * is the real sweep: a browser, a canvas pixel per element, backgrounds
 * composited up the ancestor chain, because Kendo emits `oklch()` and no regex
 * over `getComputedStyle` survives it. That sweep found the three control
 * borders that `--vy-border-control` was introduced to fix. It is also a
 * one-off: it ran once, against the palette of that day, and nothing has
 * re-run it since — while the dark theme, the status vocabulary and the 12px
 * floor all landed afterwards. A design system whose accessibility section
 * says "measured, not asserted" cannot rest on a measurement nobody repeats.
 *
 * So this is the cheap half, kept honest about being the cheap half. It reads
 * `tokens.css`, resolves every `var()` chain in BOTH themes, and checks the
 * pairs the system actually promises: each text tier on each ground it can sit
 * on, the brand and danger pairs, all eight status pills, the row tones, and
 * the four non-text boundaries — resting, hovered, the focus ring and the
 * focus border, because 1.4.11 asks for 3:1 of a control's boundary in its
 * STATES and not only at rest. No browser, no server, ~40ms.
 *
 * WHAT IT CANNOT SEE. A token pair that passes here can still fail on screen:
 * a component may put text on a ground the system never intended, Kendo may
 * paint something we did not map, and an opacity or a gradient makes the real
 * ground something no token states. Those need the browser sweep. This catches
 * the other thing — the palette drifting out from under the document — which
 * is what actually happened between September and November.
 *
 * THE ONE EXEMPTION IS DECLARED, NOT INFERRED. `--vy-on-surface-faint` is
 * 2.58:1 on white and the system says so in B1.3: decoration, never text
 * anyone reads. It is listed below by name. Nothing else gets to be an
 * exception by being inconvenient.
 */
import fs from 'node:fs';

const SRC = 'src/theme/tokens.css';
const TEXT_MIN = 4.5;   /* WCAG 1.4.3, normal-size text */
const NONTEXT_MIN = 3;  /* WCAG 1.4.11, the boundary of something you operate */

/* ---------- read the three blocks ---------- */
const lines = fs.readFileSync(SRC, 'utf8').split('\n');

function blockFrom(startPred) {
  const start = lines.findIndex(startPred);
  if (start < 0) return {};
  const out = {};
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    depth += (lines[i].match(/{/g) || []).length - (lines[i].match(/}/g) || []).length;
    const m = /^\s*(--vy-[a-z0-9-]+)\s*:\s*([^;]+);/.exec(lines[i]);
    if (m) out[m[1]] = m[2].trim();
    if (depth === 0 && i > start) break;
  }
  return out;
}

const light = blockFrom(l => l.trim().startsWith(':root {'));
const darkOverrides = blockFrom(l => l.includes('data-theme="dark"') && l.trim().endsWith('{'));
const dark = { ...light, ...darkOverrides };

/* A token may point at another token, which may point at a ramp step. Resolve
   inside the theme being checked, so `--vy-tone-short-bg` -> `--vy-status-open-bg`
   picks up the DARK status colour rather than the light one it is declared with. */
function resolve(token, env, hops = 0) {
  let v = env[token];
  while (v && v.startsWith('var(') && hops++ < 12) v = env[v.slice(4).split(')')[0].trim()];
  return v;
}

/* ---------- WCAG 2.x relative luminance ---------- */
function luminance(hex) {
  const h = (hex || '').trim().replace('#', '');
  const full = h.length === 3 ? [...h].map(c => c + c).join('') : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const ch = [0, 2, 4].map(i => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function ratio(a, b) {
  const la = luminance(a), lb = luminance(b);
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ---------- what the system promises ---------- */
const TEXT_TIERS = ['on-surface-strong', 'on-surface', 'on-surface-soft', 'on-surface-muted', 'on-surface-subtle'];

/* Every ground a tier can legitimately sit on. `surface-strong` and
   `surface-selected` are in here because the September sweep missed them —
   it ran with every popover closed, and the subtle tier failed on both. */
const GROUNDS = ['surface', 'surface-app', 'surface-raised', 'surface-subtle',
  'surface-sunken', 'surface-strong', 'surface-hover', 'surface-selected'];

const STATUSES = ['draft', 'open', 'progress', 'done', 'waiting', 'review', 'blocked', 'cancelled'];
const TONES = ['excluded', 'missing'];   /* the two that carry their own fg */

/* Declared exemption — B1.3. Decoration only, never text to read. */
const DECORATIVE = ['--vy-on-surface-faint'];

/* The Home chart's five stacked series, named as the legend names them. */
const CHART_SERIES = [
  { name: 'New',         token: '--vy-status-draft-fg' },
  { name: 'In-Progress', token: '--vy-status-progress-fg' },
  { name: 'Quoted',      token: '--vy-status-open-fg' },
  { name: 'Completed',   token: '--vy-status-done-fg' },
  { name: 'Cancelled',   token: '--vy-chart-cancelled' },
];

const failures = [];
const checked = [];

function check(kind, label, fgTok, bgTok, env, min) {
  const fg = resolve(fgTok, env), bg = resolve(bgTok, env);
  if (!fg || !bg) return;                       /* not declared in this theme */
  if (DECORATIVE.includes(fgTok)) return;
  const r = ratio(fg, bg);
  if (r === null) return;                        /* rgba(), color-mix() — not ours to judge */
  checked.push(r);
  if (r < min) failures.push({ kind, label, fg, bg, r, min });
}

for (const [themeName, env] of [['light', light], ['dark', dark]]) {
  for (const tier of TEXT_TIERS)
    for (const ground of GROUNDS)
      check('text', `${themeName}  ${tier} on ${ground}`, `--vy-${tier}`, `--vy-${ground}`, env, TEXT_MIN);

  check('text', `${themeName}  brand text on a panel`, '--vy-brand-text', '--vy-surface', env, TEXT_MIN);
  check('text', `${themeName}  label on the brand fill`, '--vy-brand-on', '--vy-brand', env, TEXT_MIN);
  check('text', `${themeName}  danger text on a panel`, '--vy-danger-text', '--vy-surface', env, TEXT_MIN);
  check('text', `${themeName}  danger text on the banner`, '--vy-danger-text', '--vy-danger-subtle', env, TEXT_MIN);
  check('text', `${themeName}  label on the danger fill`, '--vy-danger-on', '--vy-danger', env, TEXT_MIN);

  for (const s of STATUSES)
    check('text', `${themeName}  status ${s}`, `--vy-status-${s}-fg`, `--vy-status-${s}-bg`, env, TEXT_MIN);
  for (const t of TONES)
    check('text', `${themeName}  row tone ${t}`, `--vy-tone-${t}-fg`, `--vy-tone-${t}-bg`, env, TEXT_MIN);

  /* A BOUNDARY IS SET BY ITS WORST GROUND, exactly like a text tier, and this
     loop is here because the first version of this file checked the control
     boundary against the panel alone. `--vy-border-control` was chosen in
     September as "the lightest value that conforms" — on white. Swept across
     every ground on 8 Nov it cleared one of seven: 3.06 on the panel, then
     2.98, 2.85, 2.85, 2.78, 2.65 and 2.35 going down the surfaces. A control
     sits on the page and in a sunken strip as often as it sits on a panel. */
  /* AND A STATE IS A BOUNDARY. The resting pair alone is what let two of these
     through for a month: `.vy-input:hover` pointed at `--vy-border-heavy`,
     which is 5.24 on white and 2.02 on `surface-strong` in dark, and
     `--vy-brand-boundary-strong` — the focus EDGE of every text input — kept
     blue-400 at 2.88 in dark after the note beside it had already measured
     that value and moved the focus RING off it. Both fixed 9 Nov; both are in
     this loop now so neither can come back.

     `--vy-brand-boundary-soft` and `--vy-brand-boundary-light` are NOT here,
     and that is a judgement rather than an oversight: they draw banner edges,
     the verdict panel and a horizontal rule, which 1.4.11 does not cover, and
     they fail it on purpose (1.37 and 2.08 in light). Nothing stops a control
     pointing at them by mistake — `.vy-density-choice` and `.vy-vs-dir` both
     did — and that is `border:check`'s job, because it reads the live DOM and
     this file reads only the palette. */
  /* A CHART FILL IS NON-TEXT TOO, and nothing here measured one until 9 Nov.
     Every pair above is ink on a ground or an edge on a ground — a shape that
     carries no text and draws no border fell between them. That gap is what
     let the In-Progress series on the Home chart sit at 1.12:1 on the light
     card and 1.37:1 on the dark one: it pointed at `--vy-status-progress-bg`,
     a chip background, which is pale by design because text sits on it. The
     comment above that rule had already caught the same series once, drawn
     white on white, and fixed it by switching to `-bg` — then the status pairs
     were restructured and the exception quietly became the bug again.

     The five series are the four `-fg` halves plus `--vy-chart-cancelled`, all
     against `--vy-surface`, which is the card they are drawn on and the only
     ground they ever have.

     WHAT THIS CANNOT SEE, stated so it is not mistaken for cover: whether two
     series can be told APART. Contrast is a luminance ratio, and these five
     separate by hue at near-equal lightness — draft/open/done sit within
     1.08:1 of each other in light. No threshold in 1.4.11 applies to that,
     and the answer is not a colour anyway: the segments are divided by a drawn
     separator in the card colour, which is in `app.css` beside the fills. */
  for (const s of CHART_SERIES)
    check('non-text', `${themeName}  chart series ${s.name} on the card`, s.token, '--vy-surface', env, NONTEXT_MIN);

  for (const ground of GROUNDS) {
    check('non-text', `${themeName}  control boundary on ${ground}`, '--vy-border-control', `--vy-${ground}`, env, NONTEXT_MIN);
    check('non-text', `${themeName}  control boundary, hovered, on ${ground}`, '--vy-border-control-hover', `--vy-${ground}`, env, NONTEXT_MIN);
    check('non-text', `${themeName}  focus ring on ${ground}`, '--vy-brand-boundary', `--vy-${ground}`, env, NONTEXT_MIN);
    check('non-text', `${themeName}  focus border on ${ground}`, '--vy-brand-boundary-strong', `--vy-${ground}`, env, NONTEXT_MIN);
  }
}

/* ---------- the self-test, for the same reason the September sweep had one ----------
   A sweep that reports no failures is only worth reading if it can prove it
   would have found one. */
const planted = ratio('#bbbbbb', '#ffffff');
if (!(planted > 1.9 && planted < 1.95)) {
  console.error(`contrast:check — SELF-TEST FAILED: #bbbbbb on white computed ${planted?.toFixed(2)}, expected 1.92`);
  process.exit(2);
}

const worst = Math.min(...checked);
console.log(`\ncontrast:check  ${checked.length} token pairs, both themes  ·  self-test passed (planted 1.92:1 detected)`);
if (failures.length === 0) {
  console.log(`  no pair below its threshold — tightest is ${worst.toFixed(2)}:1`);
  console.log(`  ${DECORATIVE.length} declared exemption: --vy-on-surface-faint, decoration only (B1.3)\n`);
  process.exit(0);
}
console.log(`\n  ${failures.length} BELOW THRESHOLD\n`);
for (const f of failures)
  console.log(`    ${f.label.padEnd(46)} ${f.fg} on ${f.bg}   ${f.r.toFixed(2)}:1  needs ${f.min}`);
console.log('');
process.exit(1);
