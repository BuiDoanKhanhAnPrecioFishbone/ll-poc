/**
 * Can you see where the control is?
 *
 *   node scripts/with-server.mjs border:check    # starts the server itself
 *
 * Or `npm run border:check` against a server already on the port BASE_URL
 * names (5180) — not where `npm run dev` lands on its own.
 *
 * WHY THIS EXISTS. `contrast:check` reads `tokens.css`. It can prove that
 * `--vy-border-control` clears 3:1 on every ground; it cannot know that
 * `.vy-search` was pointing at `--vy-border` instead. On 8 Nov a hand-written
 * sweep found seven controls drawing their own boundary with a structure
 * token — a chip, a colour swatch, two selects, the search field, the audit
 * chip and Kendo's outlined button, which is the DEFAULT variant of our
 * Button. Every one of them was a token chosen wrongly, not a token valued
 * wrongly, and nothing in the build could see it. This is that sweep, kept.
 *
 * WHAT IT MEASURES. For every focusable element that draws a border: the
 * contrast of that border against the first opaque ancestor behind it. WCAG
 * 1.4.11 asks 3:1 of the boundary of something a user operates.
 *
 * IN THREE STATES, not one — added 9 Nov. The resting sweep above is what
 * found seven mis-picked tokens, and then hid two more for a month, because
 * 1.4.11 covers a control's STATES and a sweep with no mouse sees none of
 * them. `.vy-input:hover` pointed at `--vy-border-heavy`, which is 5.24 on
 * white and 2.68 on the dark panel; the focus EDGE of every text input kept
 * blue-400 at 2.88 on `surface-strong` after the note beside it had already
 * measured that number and moved the focus RING off it. Both were found by
 * hand. The hover and focus passes exist so the next one is not.
 *
 * The states are reached by bringing them to REST rather than by driving a
 * mouse — see the comment on `forceState` in the probe, which also records
 * what that cannot reach.
 *
 * WHAT IT DELIBERATELY DOES NOT FLAG is in ALLOW below, with a reason each.
 * 1.4.11 asks for 3:1 only where the boundary is what identifies the control.
 * A card with a heading in it, a tab with a label and an underline, a solid
 * button whose fill reads at 9:1 — these are identified by something other
 * than their edge, and darkening their borders would be noise, not access.
 * An entry here is a judgement, so each one carries the argument.
 *
 * THE SELF-TEST GUARDS A BUG THIS CHECK ALREADY HAD. The first version of the
 * sweep reported exactly 1.00 for every control. It read colours by painting
 * them onto a 1x1 canvas and never cleared it, so a transparent value left
 * the previous pixel behind and every border measured equal to its own
 * ground. The planted fault below therefore asserts the RATIO, not just that
 * something was caught: a broken sampler returns 1.00 and fails the check
 * before it can report a clean run.
 *
 * DARK IS A SECOND PASS, and it is set the way a person sets it — the stored
 * preference, then a reload — because stamping `data-theme` after load leaves
 * Kendo's derived colours on their previous values, which is how an earlier
 * version of this sweep produced a dark pass identical to its light one.
 *
 * Same CDP harness as the other checks. NO BACKTICKS inside PROBE.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9456);
const MIN = 3;   /* WCAG 1.4.11, non-text contrast */

const VIEWPORTS = [
  { label: 'light', width: 1440, height: 900, theme: 'light' },
  { label: 'dark', width: 1440, height: 900, theme: 'dark' },
];

const ROUTES = [
  '/', '/my-queues',
  '/sales-management/quotation', '/sales-management/quotation/rfq-1',
  '/engineering/part-mst', '/engineering/bom', '/engineering/mpn', '/engineering/mfg',
  '/inventory-management/packing-list', '/design-system', '/audit', '/login',
];

/* Identified by something other than their edge. Each line is an argument,
   not a suppression — if one stops being true, delete it and fix the control. */
const ALLOW = [
  ['.k-button-solid', 'Solid button: the fill is the control, and it reads at 9.16:1. The border is the same colour as the fill by construction'],
  ['.vy-kpi', 'A tile with a number in it at 24px. The figure is what you see, not the edge'],
  ['.vy-queue', 'A card link with a heading and a count inside it'],
  ['.k-tabstrip-item', 'A tab: identified by its label and by the 2px active underline'],
];

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const EXTRA_FLAGS = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(() => {
  const MIN = ${MIN};
  const ALLOW = ${JSON.stringify(ALLOW.map(a => a[0]))};

  const stopMotion = document.createElement('style');
  stopMotion.textContent =
    '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(stopMotion);

  /* 'copy', not the default 'source-over'. Painting a transparent colour over
     the previous pixel leaves the previous pixel, which is how this sweep
     once reported 1.00 for everything it looked at. */
  const cv = document.createElement('canvas');
  cv.width = 1; cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const srgb = value => {
    cx.globalCompositeOperation = 'copy';
    cx.fillStyle = value;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  /* The ground BEHIND the control, which is what its edge has to separate it
     from — so the walk starts at the parent, never at the element itself. */
  const ground = el => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const bg = srgb(getComputedStyle(p).backgroundColor);
      if (bg[3] > 0.95) return bg;
    }
    return srgb(getComputedStyle(document.body).backgroundColor);
  };

  const where = el => {
    const raw = el.className && el.className.baseVal !== undefined
      ? el.className.baseVal : (el.className || '');
    const first = String(raw).trim().split(/\\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (first ? '.' + first : '');
  };
  const label = el => (el.getAttribute('aria-label') || el.textContent || '')
    .replace(/\\s+/g, ' ').trim().slice(0, 30);

  const SEL = [
    'a[href]', 'button', 'input:not([type=hidden])', 'select', 'textarea',
    'summary', '[role=button]', '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /* ---- HOW A STATE IS MEASURED WITHOUT A MOUSE ------------------------------
     hover:check uses CDP's forcePseudoState, and is right to: it compares a
     handful of candidate controls and needs the ancestor chain hovered too,
     the way a real pointer does. That is per node, and this sweep looks at
     every bordered control on 12 routes in 2 themes — 8160 round trips.

     So here the state is brought to REST instead. Every rule in every sheet
     whose selector carries the pseudo-class is re-emitted with that
     pseudo-class swapped for one that is TRUE right now, carrying only its
     border declarations, appended last so it wins at equal specificity:

         .vy-input:hover  ->  .vy-input:not(:focus)   { border-color: ... }
         .vy-cell-input:focus -> .vy-cell-input:not(:hover) { border-color: ... }

     :not() has the specificity of its argument, so one pseudo-class becomes
     one pseudo-class and the cascade order is unchanged. Only border and
     outline declarations are copied, which keeps the rewrite from moving
     layout or backgrounds — so what this measures is the state's EDGE against
     the RESTING ground. A hovered grid row tints itself, and that tint is not
     applied here. It is not a hole: surface-hover is one of the eight
     grounds contrast:check measures every boundary token against, so the
     edge-on-hover-tint pair is covered by the other half of the pair of
     checks. Stated rather than left to be discovered.

     WHAT IT STILL CANNOT SEE: states carried by an ATTRIBUTE rather than a
     pseudo-class — [aria-pressed], [aria-checked], [data-on]. Those need the
     app to be in that state, and three of them were found on 9 Nov by reading
     the palette instead (.vy-density-choice[aria-checked] at 1.37). The
     declared-exemption note in contrast:check records which. */
  const BORDERY = /^(border|outline)/;
  const forceState = kind => {
    const pseudo = kind === 'hover' ? /:hover\\b/g : /:focus-visible|:focus-within|:focus\\b/g;
    const stand  = kind === 'hover' ? ':not(:focus)' : ':not(:hover)';
    const out = [];
    /* selectorText FIRST. Since CSS nesting shipped, a plain CSSStyleRule also
       carries a cssRules list — empty, but truthy — so a group test written
       before the selector test swallows every style rule in the document and
       the rewrite emits nothing. That is what the first run of this pass did,
       and the self-test is the only reason it was not mistaken for a clean
       sweep. */
    const walk = (rules, cond) => {
      for (const r of rules) {
        if (!r.selectorText) {
          if (r.cssRules) walk(r.cssRules, r.conditionText !== undefined ? r.conditionText : cond);
          continue;
        }
        if (!pseudo.test(r.selectorText)) { pseudo.lastIndex = 0; continue; }
        pseudo.lastIndex = 0;
        if (r.selectorText.indexOf(':not(:') !== -1) continue;   /* :not(:hover) — do not invert it */
        /* style.cssText, NOT the indexed longhands. Chrome expands
           border-color into four longhands, and when the value is a var() it
           keeps a pending-substitution placeholder whose
           getPropertyValue('border-top-color') is the EMPTY STRING. The first
           version of this pass read it that way and emitted 51 rules of
           'border-top-color: !important' — syntactically fine, no effect, and
           a clean three-state report. It passed its own self-test because the
           planted faults used literal hex. They use var() now. */
        const decls = [];
        for (const part of String(r.style.cssText || '').split(';')) {
          const colon = part.indexOf(':');
          if (colon < 0) continue;
          const prop = part.slice(0, colon).trim();
          if (!BORDERY.test(prop)) continue;
          const val = part.slice(colon + 1).replace(/\\s*!important\\s*$/, '').trim();
          if (!val) continue;
          decls.push(prop + ':' + val + ' !important');
        }
        if (!decls.length) continue;
        const body = r.selectorText.replace(pseudo, stand) + '{' + decls.join(';') + '}';
        out.push(cond ? '@media ' + cond + '{' + body + '}' : body);
        pseudo.lastIndex = 0;
      }
    };
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch (e) { continue; }   /* cross-origin */
      walk(rules, '');
    }
    const el = document.createElement('style');
    el.id = 'vy-force-' + kind;
    el.textContent = out.join('\\n');
    document.head.appendChild(el);
    return { el: el, rules: out.length };
  };

  const sweep = () => {
    let checked = 0;
    const found = [];
    for (const el of document.querySelectorAll(SEL)) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (parseFloat(cs.opacity) < 0.5) continue;           /* disabled, dimmed on purpose */
      const w = parseFloat(cs.borderTopWidth) || 0;
      if (!w) continue;                                      /* no border to judge */
      const col = srgb(cs.borderTopColor);
      if (col[3] < 0.5) continue;                            /* transparent edge is not a boundary */
      if (ALLOW.some(a => el.matches(a))) continue;
      checked++;
      const value = ratio(col, ground(el));
      if (value >= MIN) continue;
      found.push({ sel: where(el), what: label(el), ratio: Math.round(value * 100) / 100,
                   border: cs.borderTopColor });
    }
    return { checked: checked, found: found };
  };

  const out = { resting: sweep() };
  for (const kind of ['hover', 'focus']) {
    const forced = forceState(kind);
    out[kind] = sweep();
    out[kind].rules = forced.rules;
    forced.el.remove();
  }
  return out;
})()`;

/* ONE PLANTED FAULT PER STATE, each at a ratio the run asserts.
   a: a real control with a 1px #cccccc edge on white — 1.61:1, must be caught
      AT THAT RATIO, which is what proves the sampler is reading colours rather
      than repeating the last one it saw.
   b: the same control at #767676 — 4.54:1, must stay quiet.
   c: conforming at rest and 1.61:1 ON HOVER. Must be quiet in the resting
      sweep and caught in the hover one — which is the whole claim the state
      rewrite makes, and the only way to know the rewrite ran at all.
   d: the same for :focus-visible.
   c and d draw their weak edge from a CUSTOM PROPERTY, not from literal hex,
   because every rule in this app does and the two are not the same test: a
   rewrite that reads expanded longhands gets an empty string out of a var()
   and silently applies nothing. With literal hex these two passed while the
   real sweep was measuring resting borders three times over. */
const SELFTEST = `(() => {
  const host = document.createElement('div');
  host.id = 'vy-border-selftest';
  host.style.cssText = 'background:#ffffff;padding:4px';
  host.innerHTML =
    '<style>' +
    '#vy-border-selftest{--vy-st-weak:#cccccc}' +
    '.vy-st{border:1px solid #767676;background:#ffffff;width:60px;height:24px}' +
    '.vy-st-h:hover{border-color:var(--vy-st-weak)}' +
    '.vy-st-f:focus-visible{border-color:var(--vy-st-weak)}' +
    '</style>' +
    '<button id="vy-bt-a" style="border:1px solid #cccccc;background:#ffffff;width:60px;height:24px">a</button>' +
    '<button id="vy-bt-b" style="border:1px solid #767676;background:#ffffff;width:60px;height:24px">b</button>' +
    '<button id="vy-bt-c" class="vy-st vy-st-h">c</button>' +
    '<button id="vy-bt-d" class="vy-st vy-st-f">d</button>';
  document.body.appendChild(host);
})()`;

const STATES = ['resting', 'hover', 'focus'];

async function main() {
  try { await fetch(BASE); }
  catch { console.error(`Cannot reach ${BASE}. Start the dev server first: node scripts/with-server.mjs border:check`); process.exit(2); }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-border-'));
  const chrome = spawn(CHROME, [...EXTRA_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
  cleanupOnKill(chrome, profile);

  const ws = new WebSocket(await connectToChrome(PORT, chrome));
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) =>
    new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Page.enable'); await send('Runtime.enable');

  const visit = async (route, vp, selfTest = false) => {
    await send('Emulation.setDeviceMetricsOverride',
      { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: BASE + route });
    await sleep(900);
    await send('Runtime.evaluate', {
      expression: `localStorage.setItem('vy.theme', ${JSON.stringify(vp.theme)})`,
      returnByValue: true });
    await send('Page.reload');
    await sleep(3000);
    const got = await send('Runtime.evaluate', {
      expression: `document.documentElement.getAttribute('data-theme')`, returnByValue: true });
    const actual = got.result?.result?.value;
    if (actual !== vp.theme) {
      throw new Error(`asked for ${vp.theme} on ${route}, page rendered ${actual || 'system'}`);
    }
    if (selfTest) { await send('Runtime.evaluate', { expression: SELFTEST, returnByValue: true }); await sleep(120); }
    const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    return r.result?.result?.value;
  };

  /* Nothing below is believed until all four planted faults come back, each in
     the state it belongs to and at its measured value. */
  const st = await visit('/', VIEWPORTS[0], true);
  const at = (state, what) => st?.[state]?.found?.find(f => f.what === what);
  const right = (state, what) => { const f = at(state, what); return !!f && Math.abs(f.ratio - 1.61) < 0.05; };
  const checks = [
    ['weak resting edge caught at 1.61', right('resting', 'a')],
    ['conforming resting edge quiet', !at('resting', 'b')],
    ['hover-only fault quiet at rest', !at('resting', 'c')],
    ['hover-only fault caught at 1.61', right('hover', 'c')],
    ['focus-only fault quiet at rest', !at('resting', 'd')],
    ['focus-only fault caught at 1.61', right('focus', 'd')],
    ['the state rewrite emitted rules', (st?.hover?.rules || 0) > 0 && (st?.focus?.rules || 0) > 0],
  ];
  if (checks.some(c => !c[1])) {
    console.error('self-test failed — the check cannot see its own planted faults');
    for (const [name, ok] of checks) console.error(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}`);
    ws.close(); chrome.kill();
    process.exit(2);
  }

  const seen = { resting: new Map(), hover: new Map(), focus: new Map() };
  const counts = { resting: 0, hover: 0, focus: 0 };
  let rewrote = 0;
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      const res = await visit(route, vp);
      if (!res) continue;
      rewrote = Math.max(rewrote, res.hover?.rules || 0);
      for (const state of STATES) {
        const r = res[state];
        if (!r) continue;
        counts[state] += r.checked;
        for (const f of r.found) {
          /* Keyed on the SELECTOR alone, not on the label. Six audit chips
             reading "Navigation 6", "Content 3" and so on are one rule drawn
             six times, and six rows saying the same thing bury the next
             finding. One example label is enough to go and look at it. */
          const prev = seen[state].get(f.sel);
          if (!prev) seen[state].set(f.sel, { ...f, n: 1, vps: new Set([vp.label]), routes: new Set([route]) });
          else {
            prev.n++; prev.vps.add(vp.label); prev.routes.add(route);
            if (f.ratio < prev.ratio) { prev.ratio = f.ratio; prev.border = f.border; prev.what = f.what; }
          }
        }
      }
    }
  }

  ws.close(); chrome.kill();

  const total = STATES.reduce((n, s) => n + counts[s], 0);
  console.log(`\nborder:check  ${total} bordered controls across ${ROUTES.length} routes x ${VIEWPORTS.length} themes x ${STATES.length} states`);
  console.log(`  self-test passed (4 planted faults, each at 1.61:1, each in its own state) · ${rewrote} state rules rewritten per page`);
  let bad = 0;
  for (const state of STATES) {
    const rows = [...seen[state].values()].sort((x, y) => x.ratio - y.ratio);
    bad += rows.length;
    const head = state === 'resting' ? 'RESTING' : state === 'hover' ? 'HOVER' : 'FOCUS';
    console.log(`\n${head}  ${counts[state]} measured · UNDER ${MIN}:1  ${rows.length}   controls, not instances`);
    for (const r of rows) {
      console.log(`  ${String(r.ratio).padStart(5)}  ${r.sel}  ${r.border}${r.n > 1 ? `  x${r.n}` : ''}  e.g. "${r.what}"`);
      console.log(`         ${[...r.vps].join(' + ')} · ${[...r.routes].slice(0, 3).join(' ')}`);
    }
    if (!rows.length) console.log('  every control that draws its own edge can be seen against what is behind it');
  }
  console.log(`\n${ALLOW.length} kinds allowed by argument; attribute-borne states ([aria-pressed], [aria-checked], [data-on]) are out of reach here — see the header.\n`);
  process.exit(bad ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
