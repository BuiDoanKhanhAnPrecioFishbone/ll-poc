/**
 * Reports values that bypass the token system.
 *
 * `css-orphans.js` answers "does this rule still describe real markup". This
 * answers the other half: "does this rule use the scale, or did someone type a
 * number". Both failures look fine on the screen they were written for and only
 * show up as drift — a 15px gap beside a 16px one, a #f5f7fa that should have
 * been --vy-grey-50, a 13px font that is not on the ramp.
 *
 *   node scripts/css-consistency.js
 *
 * tokens.css is the ONE file allowed to hold raw values; it is the definition of
 * the scale, so it is skipped. md3.css, base.css and kendo-bridge.css are
 * bridges to third-party and browser defaults, reported separately and not
 * counted as failures.
 *
 * Since the Kendo migration it also answers a third question: "does this rule
 * style a third-party class without saying WHERE" — see check 6.
 */
import fs from 'node:fs';

const SKIP = new Set(['tokens.css']);
const SOFT = new Set(['md3.css', 'base.css', 'kendo-bridge.css']);   // reported, not counted
const FILES = ['tokens', 'base', 'md3', 'kendo-bridge', 'components', 'app', 'responsive']
  .map(f => `src/theme/${f}.css`);

/* The scales, read out of tokens.css itself rather than duplicated here — a
   checker with its own copy of the scale drifts from the scale. */
const tokens = fs.readFileSync('src/theme/tokens.css', 'utf8');
const scale = (prefix) => new Set(
  [...tokens.matchAll(new RegExp(`--vy-${prefix}-[\\w]+:\\s*([\\d.]+)px`, 'g'))].map(m => m[1]),
);
const SPACE = scale('space');
const TEXT = scale('text');
const RADIUS = scale('radius');
const COLOURS = new Set(
  [...tokens.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map(m => m[1].toLowerCase()),
);

const findings = [];
const add = (file, line, kind, text, note) =>
  findings.push({ file: file.split('/').pop(), line, kind, text: text.trim(), note });

for (const path of FILES) {
  const name = path.split('/').pop();
  if (SKIP.has(name)) continue;
  const lines = fs.readFileSync(path, 'utf8').split('\n');

  /* The reduced-motion reset MUST use !important — it exists to beat every
     animation in the app, including third-party ones. Flagging it trains people
     to ignore the check. */
  let inReducedMotion = false, depth = 0, inComment = false;

  lines.forEach((raw, i) => {
    const n = i + 1;
    if (/@media[^{]*prefers-reduced-motion/.test(raw)) { inReducedMotion = true; depth = 0; }
    if (inReducedMotion) {
      depth += (raw.match(/\{/g) || []).length - (raw.match(/\}/g) || []).length;
      if (depth <= 0 && /\}/.test(raw) && !/@media/.test(raw)) inReducedMotion = false;
    }
    /* Comments carry prose full of numbers and hex-looking words — including
       this file's own notes about the values it replaced. Block comments span
       lines, so stripping only the single-line form leaves the body of every
       multi-line comment to be scanned as if it were CSS. */
    let line = '', i2 = 0;
    while (i2 < raw.length) {
      if (inComment) {
        const end = raw.indexOf('*/', i2);
        if (end === -1) { i2 = raw.length; } else { inComment = false; i2 = end + 2; }
      } else {
        const start = raw.indexOf('/*', i2);
        if (start === -1) { line += raw.slice(i2); i2 = raw.length; }
        else { line += raw.slice(i2, start); inComment = true; i2 = start + 2; }
      }
    }
    if (!line.trim()) return;

    /* 1. Spacing that is not on the scale. Border widths and 0 are not spacing,
          and percentages/viewport units are layout, not the scale. */
    for (const m of line.matchAll(/\b(padding|margin|gap|row-gap|column-gap)(-\w+)?:\s*([^;]+)/g)) {
      for (const v of m[3].matchAll(/(?<![-\w.])(\d+(?:\.\d+)?)px/g)) {
        /* 0 is nothing and 1px is a hairline — a rule that draws a 1px inset is
           not reaching past the scale, it is drawing a line. */
        if (v[1] === '0' || v[1] === '1') continue;
        if (!SPACE.has(v[1])) add(path, n, 'spacing', m[0], `${v[1]}px is not on the space scale`);
      }
    }

    /* 2. Font sizes off the ramp. */
    for (const m of line.matchAll(/font-size:\s*([^;]+)/g)) {
      for (const v of m[1].matchAll(/(?<![-\w.])(\d+(?:\.\d+)?)px/g)) {
        if (!TEXT.has(v[1])) add(path, n, 'type', m[0], `${v[1]}px is not on the type ramp`);
      }
    }

    /* 3. Radii off the scale. */
    for (const m of line.matchAll(/border-radius:\s*([^;]+)/g)) {
      for (const v of m[1].matchAll(/(?<![-\w.])(\d+(?:\.\d+)?)px/g)) {
        if (v[1] === '0') continue;
        if (!RADIUS.has(v[1])) add(path, n, 'radius', m[0], `${v[1]}px is not on the radius scale`);
      }
    }

    /* 4. Colour literals. A hex that IS a token value is worse than one that is
          not — it means the token exists and was bypassed. */
    for (const m of line.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
      const hex = m[1].toLowerCase();
      add(path, n, 'colour', line,
        COLOURS.has(hex) ? `#${hex} duplicates a token value` : `#${hex} is not in the ramp`);
    }
    /* rgba() for shadows and overlays is legitimate, and so is rgb(var(--x))
       — the MD3 state layers hold their channels in a token precisely so the
       opacity can vary. Only a literal rgb(12, 34, 56) reaches past the ramp. */
    for (const m of line.matchAll(/\brgb\(([^)]+)\)/g)) {
      if (/^\s*var\(/.test(m[1])) continue;
      add(path, n, 'colour', line, `rgb(${m[1]}) bypasses the ramp`);
    }

    /* 5. !important — always a specificity failure worth seeing. */
    if (/!important/.test(line) && !inReducedMotion)
      add(path, n, 'important', line, 'overrides by force');

    /* 6. UNSCOPED KENDO OVERRIDES.
          Since the migration this app styles a third-party library, and the
          rule is that it only ever does so INSIDE one of our own containers —
          `.vy-grid-k .k-grid`, not `.k-grid`. A bare `.k-*` selector reaches
          every Kendo component on every screen, including ones nobody was
          thinking about, and that is how the two systems end up fighting: our
          paint on their box, in a place no one tested.

          Phase 5 spent an afternoon on exactly this in reverse — `.vy-td` was
          written for a CSS-grid table and destroyed a real one — so the check
          exists to keep the boundary visible rather than remembered. */
    const selector = line.split('{')[0];
    if (/\.k-[a-z0-9-]/.test(selector) && /\{/.test(line)) {
      /* Scoped means a `.vy-` class appears ANYWHERE in the selector, not just
         to the left: `.k-button.vy-btn--tonal` is a compound on one element and
         is every bit as scoped as `.vy-grid-k .k-grid`. The first version of
         this check only looked leftwards and flagged its own codebase. */
      const scoped = /\.vy-[a-z0-9-]+/.test(selector);
      if (!scoped) add(path, n, 'kendo-scope', line,
        'styles a Kendo class without a .vy- ancestor — this reaches every screen');
    }
  });
}

const hard = findings.filter(f => !SOFT.has(f.file));
const soft = findings.filter(f => SOFT.has(f.file));

const report = (list, title) => {
  if (!list.length) return;
  console.log(`\n${title}`);
  const byKind = {};
  for (const f of list) (byKind[f.kind] ??= []).push(f);
  for (const kind of Object.keys(byKind).sort()) {
    console.log(`\n  ${kind}  (${byKind[kind].length})`);
    for (const f of byKind[kind].slice(0, 40)) {
      console.log(`    ${f.file}:${f.line}  ${f.note}`);
      console.log(`      ${f.text.slice(0, 100)}`);
    }
    if (byKind[kind].length > 40) console.log(`    … ${byKind[kind].length - 40} more`);
  }
};

report(hard, `OFF-SCALE VALUES  (${hard.length})`);
report(soft, `BRIDGE FILES — expected, not counted  (${soft.length})`);
console.log(`\ntotal ${hard.length} off-scale in owned stylesheets, ${soft.length} in bridges`);
