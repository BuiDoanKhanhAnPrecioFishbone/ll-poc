/**
 * THE LAYOUT GRID, measured at every width that changes it.
 *
 *   node scripts/with-server.mjs grid:check
 *
 * WHY THIS EXISTS. Design system B8 states four things about the content box,
 * and until 9 Nov 2026 none of them was written down and none was measured:
 *
 *   1  A page is one of four shapes, and only two of them declared a width.
 *      `.vy-page--doc` and `.vy-page--record` capped at 1180; `.vy-page--grid`
 *      and a bare `.vy-page` declared nothing and grew with the window — 1624px
 *      of content at a 1920 viewport, 2264px at 2560. The dashboard was the
 *      casualty: twelve 28px chart bars spread over 1600px with 98px of air
 *      between them, and four queue tiles 400px wide to hold one digit.
 *
 *   2  The LIST shape is uncapped ON PURPOSE, and that has to stay a decision
 *      rather than decay back into an omission. The widest grid in this product
 *      is 1806px at its default view and 2106px with every column turned on, so
 *      any cap would create horizontal scrolling on a window wide enough to
 *      avoid it. Check B fails if the opt-out stops working.
 *
 *   3  Nothing but the sidebar and the two gutters may eat the width. Measured
 *      as an identity — sidebar + gutters + content == viewport — rather than
 *      as a formula with the breakpoints hard-coded, so moving a breakpoint
 *      does not make this file wrong.
 *
 *   4  THE CONTENT WIDTH IS NOT MONOTONIC IN THE VIEWPORT WIDTH, and that is
 *      the finding this check exists to pin down. Crossing 1180px upward the
 *      sidebar expands from 56px to 248px and the gutters from 14px to 24px:
 *      the window gains 100px and the content LOSES 112px. A 1366 laptop shows
 *      less of a list than an 1100 one. It is a real trade — the labelled rail
 *      is orientation, decision D1, and the user can collapse it — but it must
 *      be the ONLY place where widening the window narrows the page. A second
 *      one would be a bug, and nothing would have caught it.
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK: horizontal page overflow. `mobile:check`
 * owns that, and owns its 198 open tablet findings; duplicating them here would
 * make this check red for a reason that has nothing to do with the grid.
 *
 * Exit code 1 if anything is found, so it can gate a build.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9475);
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const EXTRA_FLAGS = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* One route per page SHAPE, plus a second list screen because the two carry
   different grids and only one of them can be the widest. */
const ROUTES = [
  { route: '/',                                 shape: 'base'   },
  { route: '/my-queues',                        shape: 'base'   },
  { route: '/sales-management/quotation',       shape: 'grid'   },
  { route: '/engineering/part-mst',             shape: 'grid'   },
  { route: '/sales-management/quotation/rfq-1', shape: 'record' },
  { route: '/design-system',                    shape: 'doc'    },
];

/* Every width at which something in the shell changes, plus one on each side
   of the 1180 step and two beyond any screen we were asked to support. */
const WIDTHS = [375, 600, 768, 820, 900, 980, 1100, 1180, 1280, 1366, 1440, 1920];

/* The one place the content is allowed to shrink as the window grows. Stated
   as the pair it sits between, so a moved breakpoint reads as a changed
   expectation rather than a silent pass. */
const DECLARED_STEP = { from: 1180, to: 1280 };

const PROBE = `(() => {
  const page = document.querySelector('.vy-page');
  if (!page) return { error: 'no .vy-page' };
  const cs = getComputedStyle(page);
  const r = page.getBoundingClientRect();
  const padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight);

  /* The sidebar only counts when it is IN THE FLOW. Below 820 it is fixed and
     translated off-screen, so its 248px box takes none of the row. */
  const side = document.querySelector('.vy-sidebar');
  let sideW = 0;
  if (side) {
    const scs = getComputedStyle(side);
    sideW = scs.position === 'fixed' ? 0 : Math.round(side.getBoundingClientRect().width);
  }

  const shapes = { grid: 'vy-page--grid', record: 'vy-page--record', doc: 'vy-page--doc' };
  let shape = 'base';
  for (const k in shapes) if (page.classList.contains(shapes[k])) shape = k;

  const root = getComputedStyle(document.documentElement);
  const capTok = root.getPropertyValue('--vy-page-max').trim();

  /* Every auto-fit layout grid in the stylesheets, and whether its minimum is
     a token or a literal. Read from the RULES, not the DOM, so a grid that
     happens not to be mounted on this route is still covered. */
  const literals = [];
  for (const sh of document.styleSheets) {
    let rs; try { rs = sh.cssRules; } catch (e) { continue; }
    for (const rule of rs) {
      if (!rule.selectorText || !rule.style) continue;
      const v = rule.style.getPropertyValue('grid-template-columns');
      if (!v || v.indexOf('auto-fit') < 0) continue;
      const m = v.match(/minmax\\(([^,]+),/);
      if (!m) continue;
      const min = m[1].trim();
      if (min.indexOf('var(') === 0) continue;
      if (min === '0' || min === '0px' || min === 'min-content' || min === 'auto') continue;
      literals.push({ sel: rule.selectorText, min: min });
    }
  }

  return {
    shape: shape,
    vw: window.innerWidth,
    inner: Math.round(r.width - padL - padR),
    outer: Math.round(r.width),
    gutters: Math.round(padL + padR),
    sidebar: sideW,
    maxWidth: cs.maxWidth,
    cap: capTok,
    literals: literals,
  };
})()`;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-grid-'));
const chrome = spawn(CHROME, [...EXTRA_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--force-device-scale-factor=1', '--window-size=1920,1000', 'about:blank'], { stdio: 'ignore' });
const release = cleanupOnKill(chrome, profile);

const ws = new WebSocket(await connectToChrome(PORT, chrome));
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) =>
  new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async expression =>
  (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.result?.value;

await send('Page.enable'); await send('Runtime.enable');

/* A planted stylesheet, injected after load, so the self-test exercises the
   same code path the real measurement uses rather than a parallel one. */
const PLANT = `(() => {
  const s = document.createElement('style');
  s.id = 'vy-grid-plant';
  s.textContent = '.vy-page{max-width:640px !important}' +
    '.vy-grid-plant-victim{display:grid;grid-template-columns:repeat(auto-fit,minmax(222px,1fr))}';
  document.head.appendChild(s);
})()`;
const UNPLANT = `(() => { const el = document.getElementById('vy-grid-plant'); if (el) el.remove(); })()`;

const visit = async (route, width) => {
  await send('Emulation.setDeviceMetricsOverride',
    { width, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: BASE + route });
  await sleep(2600);
  return evalJs(PROBE);
};

const findings = [];
const table = [];
let measurements = 0;
let capPx = null;

for (const { route, shape } of ROUTES) {
  const seen = [];
  for (const width of WIDTHS) {
    const v = await visit(route, width);
    measurements++;
    if (!v || v.error) { findings.push(`${route} @${width}  ${v?.error || 'page did not render'}`); continue; }
    if (v.shape !== shape) {
      findings.push(`${route} @${width}  expected the ${shape} shape, got ${v.shape}`);
    }
    if (capPx === null && v.cap) capPx = parseFloat(v.cap);
    seen.push({ width, ...v });
    table.push({ route, shape, width, inner: v.inner, sidebar: v.sidebar, gutters: v.gutters });

    /* C — the identity. Nothing but the rail and the two gutters. */
    const accounted = v.sidebar + v.gutters + v.inner;
    if (shape !== 'grid' && v.outer < v.vw - v.sidebar) {
      /* a capped page legitimately leaves the remainder empty */
    } else if (Math.abs(accounted - v.vw) > 1) {
      findings.push(`${route} @${width}  ${v.sidebar} rail + ${v.gutters} gutters + ${v.inner} content = ${accounted}, not ${v.vw}`);
    }

    /* A — a capped shape never exceeds the cap. */
    if (shape !== 'grid' && capPx && v.outer > capPx + 1) {
      findings.push(`${route} @${width}  ${shape} shape is ${v.outer}px wide, over the ${capPx}px cap`);
    }
  }

  /* B — the list shape opts out, proven at the widest width swept. */
  const widest = seen[seen.length - 1];
  if (shape === 'grid' && widest && capPx && widest.outer <= capPx) {
    findings.push(`${route} @${widest.width}  the list shape is capped at ${widest.outer}px — the opt-out is gone`);
  }

  /* D — one declared step, and no other. */
  for (let i = 1; i < seen.length; i++) {
    const a = seen[i - 1], b = seen[i];
    if (b.inner >= a.inner - 1) continue;
    const declared = a.width === DECLARED_STEP.from && b.width === DECLARED_STEP.to;
    const line = `${route}  ${a.width}→${b.width}px widens the window by ${b.width - a.width} and narrows the content by ${a.inner - b.inner}`;
    if (!declared) findings.push(line + '  — undeclared');
  }
}

/* F — every auto-fit minimum is a token. Read once; the rules are the same on
   every route. */
const lastProbe = await visit(ROUTES[0].route, 1440);
for (const l of lastProbe?.literals ?? []) {
  findings.push(`${l.sel}  auto-fit minimum is the literal ${l.min}, not a token`);
}

/* ---------- the self-test ----------------------------------------------------
   A sweep that reports nothing is only worth reading if it can prove it would
   have found something. Two faults, one per class: a cap that a shape blows
   through, and a literal minimum. */
await visit('/sales-management/quotation', 1440);
await evalJs(PLANT);
await sleep(300);
const planted = await evalJs(PROBE);
await evalJs(UNPLANT);

const caughtCap = planted && capPx && planted.outer <= 640 + 1 && planted.maxWidth === '640px';
const caughtLiteral = (planted?.literals ?? []).some(l => l.min === '222px');
const selfTest = [
  ['a cap planted on the list shape is seen', !!caughtCap],
  ['a literal auto-fit minimum is seen', caughtLiteral],
];
const failedSelf = selfTest.filter(t => !t[1]);

ws.close(); chrome.kill(); release?.();

/* ---------- report ---------------------------------------------------------- */
const w = n => String(n).padStart(5);
console.log(`\ngrid:check  ${measurements} measurements · ${ROUTES.length} routes × ${WIDTHS.length} widths`);

if (failedSelf.length) {
  console.error('\n  SELF-TEST FAILED');
  for (const [name] of failedSelf) console.error(`    ${name}`);
  process.exit(2);
}
console.log(`  self-test passed (${selfTest.length} planted faults, each caught)`);

const byShape = {};
for (const r of table) (byShape[r.shape] ??= []).push(r);
console.log('\n  content width by shape');
for (const shape of ['base', 'record', 'doc', 'grid']) {
  const rows = byShape[shape]; if (!rows) continue;
  const one = ROUTES.find(r => r.shape === shape).route;
  const line = WIDTHS.map(width => w(rows.find(r => r.width === width && r.route === one)?.inner ?? '—')).join('');
  console.log(`    ${shape.padEnd(7)}${line}`);
}
console.log(`    ${'vw'.padEnd(7)}${WIDTHS.map(w).join('')}`);

if (findings.length) {
  console.error(`\n  ${findings.length} FINDING${findings.length === 1 ? '' : 'S'}\n`);
  for (const f of findings) console.error(`    ${f}`);
  process.exit(1);
}
console.log(`\n  the ${DECLARED_STEP.from}→${DECLARED_STEP.to}px step is the only one, and it is declared`);
console.log('  no finding\n');
