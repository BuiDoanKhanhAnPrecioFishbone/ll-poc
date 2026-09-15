/**
 * Does the same control react the same way when you point at it?
 *
 *   node scripts/with-server.mjs hover:check    # starts the server itself
 *
 * Or `npm run hover:check` against a server already on BASE_URL (5180).
 *
 * WHY THIS EXISTS. Hovering a part number on Part Master underlined it;
 * hovering an RFQ number on Project Requirements did not. Same component, same
 * classes — `.vy-cell-link.vy-ident` — on two screens meant to be one pattern.
 * One renders a <button> and one an <a>, and Kendo's grid ships
 * `a:hover { text-decoration: none }` at (0,2,1), which outranks
 * `.vy-cell-link:hover` at (0,2,0) for the anchor only.
 *
 * It was found by a person, not by a check, and not for lack of a check that
 * compares this very class across routes: render-check's check A exists because
 * of the COLOUR half of the same Kendo rule. But it samples computed style at
 * rest, and nothing about a hover-only declaration is visible at rest.
 *
 * THE DEFECT, stated narrowly on purpose:
 *
 *   controls with the SAME class list, sitting on the SAME surface, that look
 *   IDENTICAL at rest, and resolve DIFFERENTLY when hovered.
 *
 * Each clause removes a way to be wrong. Different classes are different
 * controls. A different surface — a dark sidebar against a white card — is a
 * legitimate reason for a different hover tint. And requiring agreement at rest
 * means a context rule that changes the resting look too (which is what context
 * rules nearly always do) never reaches the comparison; what is left is a
 * hover rule that applies to some copies of a control and not others.
 *
 * HOW HOVER IS PRODUCED: CSS.forcePseudoState over the DevTools protocol, on
 * the control AND ITS ANCESTORS. A real pointer puts :hover on every element
 * under it, and the grid's row rules depend on that —
 * `.k-grid tbody tr:hover .vy-cell-link` only matches if the row is hovered
 * too. Forcing the control alone would measure a state no mouse can produce.
 * Cleared after every control, so one row's hover never leaks into the next.
 *
 * MOTION IS STOPPED FIRST. A hover declaration with a transition, read straight
 * after the state is forced, returns the value it is transitioning FROM — the
 * resting one — and every control would compare equal. Same rule as every other
 * check here.
 *
 * DESKTOP, LIGHT ONLY, and deliberately so. Hover is a pointer affordance; a
 * phone has none. And the splits this finds are specificity splits — which
 * selector wins — not token values, so a split in dark exists in light too.
 *
 * IT TESTS ITSELF FIRST: a planted split that must be reported, a planted
 * pair that must NOT be, and proof that forcing hover changed anything at all
 * — without which "no splits" would also be what a no-op looks like.
 *
 * Same CDP harness as the other checks. NO BACKTICKS inside the page scripts.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9460);
const VIEWPORT = { width: 1440, height: 900 };

/* Same routes as render-check, for the same reason: every route that renders
   real content, placeholders skipped. */
const ROUTES = [
  '/',
  '/my-queues',
  '/sales-management/quotation',
  '/sales-management/quotation/rfq-1',
  '/engineering/part-mst',
  '/engineering/bom',
  '/engineering/mpn',
  '/engineering/mfg',
  '/inventory-management/packing-list',
  '/design-system',
  '/sitemap',
  '/login',
];

/* What a hover is allowed to change, and so what it can change inconsistently. */
const PROPS = ['textDecorationLine', 'color', 'backgroundColor', 'borderTopColor', 'boxShadow'];

/* Twenty grid rows are twenty copies of one control. Three of each per route is
   enough to compare, and keeps a 2,000-row list from costing 2,000 measurements. */
const MAX_PER_KEY = 3;

/* How far up the ancestor chain :hover is forced. Deep enough for the row rules
   (a > td > tr > tbody > table > ...); a real pointer goes all the way to <html>,
   but nothing past this depth carries a hover rule in this app. */
const ANCESTOR_DEPTH = 8;

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* Extra Chrome flags, space-separated. Exists for CI: Ubuntu 23.10+ blocks the
   unprivileged user namespaces Chrome's sandbox needs, so a runner may need
   `CHROME_FLAGS=--no-sandbox`. Empty everywhere else. */
const EXTRA_FLAGS = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STOP_MOTION = `(() => {
  const s = document.createElement('style');
  s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(s);
  document.body.getBoundingClientRect();
  return true;
})()`;

/* A planted split, mirroring the real one exactly: one class on an <a> and on a
   <button>, with an anchor-only hover rule that wins on specificity. And a
   planted pair that agree, which must not be reported and must visibly change
   colour on hover — the proof that hover was applied at all. */
const PLANT = `(() => {
  const st = document.createElement('style');
  st.textContent =
    '.vy-st-hov{background:none;border:0;padding:0;font:inherit;color:#123456;text-decoration:none}' +
    '.vy-st-hov:hover{text-decoration:underline}' +
    'a.vy-st-hov:hover{text-decoration:none}' +
    '.vy-st-same{background:none;border:0;padding:0;font:inherit;color:#123456}' +
    '.vy-st-same:hover{color:#654321}';
  document.head.appendChild(st);
  const host = document.createElement('div');
  host.id = 'vy-hover-selftest';
  host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;background:#ffffff;padding:8px';
  host.innerHTML =
    '<a class="vy-st-hov" href="#selftest">anchor</a> ' +
    '<button class="vy-st-hov" type="button">button</button> ' +
    '<button class="vy-st-same" type="button">one</button> ' +
    '<button class="vy-st-same" type="button">two</button>';
  document.body.appendChild(host);
  document.body.getBoundingClientRect();
  return true;
})()`;

/* Tags every control worth measuring with data-vyhov="n", in document order,
   and returns its identity and resting style.

   A SURFACE IS WHAT A CONTROL SITS ON, AND A TINT IS NOT ONE. The first version
   took the first ancestor with any background at all, and the first real
   finding came back twice: once on the grid's white rows and once on its
   striped rows, whose background is the same card with a 5% overlay —
   color(srgb 0.24 0.24 0.24 / 0.05). One defect, reported as two, because a
   stripe had been read as a different context. Half-opaque is the line: a dark
   sidebar or a card is a surface, an overlay is looked through to whatever it
   overlays. Same principle as mobile-check reporting the pager once instead of
   as its twelve children. */
const COLLECT = `(() => {
  const PROPS = ${JSON.stringify(PROPS)};
  const MAX = ${MAX_PER_KEY};
  const SEL = 'a[href], button, summary, [role="button"], [role="tab"], [role="menuitem"]';

  for (const e of document.querySelectorAll('[data-vyhov]')) e.removeAttribute('data-vyhov');

  const visible = el => {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const alphaOf = bg => {
    if (!bg || bg === 'transparent') return 0;
    const slash = bg.match(/\\/\\s*([\\d.]+)(%?)\\s*\\)$/);
    if (slash) return slash[2] ? parseFloat(slash[1]) / 100 : parseFloat(slash[1]);
    const legacy = bg.match(/^rgba\\([^,]+,[^,]+,[^,]+,\\s*([\\d.]+)\\s*\\)$/);
    if (legacy) return parseFloat(legacy[1]);
    return 1;
  };

  const surface = el => {
    for (let q = el; q; q = q.parentElement) {
      const bg = getComputedStyle(q).backgroundColor;
      if (alphaOf(bg) >= 0.5) return bg;
    }
    return 'canvas';
  };

  const seen = {};
  const out = [];
  for (const el of document.querySelectorAll(SEL)) {
    if (!visible(el)) continue;
    const classes = String(el.getAttribute('class') || '').split(/\\s+/).filter(Boolean).sort();
    if (!classes.length) continue;
    const comp = classes.join('.');
    const surf = surface(el.parentElement);
    const key = comp + ' @ ' + surf;
    seen[key] = (seen[key] || 0) + 1;
    if (seen[key] > MAX) continue;
    const cs = getComputedStyle(el);
    const rest = {};
    for (const p of PROPS) rest[p] = cs[p];
    el.setAttribute('data-vyhov', String(out.length));
    out.push({
      comp, surf, key,
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 30),
      rest,
    });
  }
  return out;
})()`;

const READ = n => `(() => {
  const PROPS = ${JSON.stringify(PROPS)};
  const el = document.querySelector('[data-vyhov="${n}"]');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const o = {};
  for (const p of PROPS) o[p] = cs[p];
  return o;
})()`;

/* ── CDP plumbing ────────────────────────────────────────────────────────── */
async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      const page = (await r.json()).find(t => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('Chrome never exposed a debuggable page');
}

/* Groups measurements and returns the splits: same key, same property, same
   resting value, more than one hovered value. */
function splits(measured) {
  const groups = new Map();
  for (const m of measured) {
    if (!m.hover) continue;
    for (const p of PROPS) {
      const g = `${m.key}|${p}|${m.rest[p]}`;
      if (!groups.has(g)) groups.set(g, { comp: m.comp, surf: m.surf, prop: p, rest: m.rest[p], by: new Map() });
      const byValue = groups.get(g).by;
      const v = m.hover[p];
      if (!byValue.has(v)) byValue.set(v, []);
      byValue.get(v).push(m);
    }
  }
  return [...groups.values()].filter(g => g.by.size > 1);
}

async function main() {
  try { await fetch(BASE); }
  catch { console.error(`Cannot reach ${BASE}. Start the dev server first: npm run dev`); process.exit(2); }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-hover-'));
  const chrome = spawn(CHROME, [...EXTRA_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`, 'about:blank'], { stdio: 'ignore' });
  cleanupOnKill(chrome, profile);

  const ws = new WebSocket(await connect());
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) =>
    new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async expression =>
    (await send('Runtime.evaluate', { expression, returnByValue: true }))?.result?.result?.value;

  const shutdown = async code => {
    ws.close(); chrome.kill();
    await new Promise(r => chrome.once('exit', r));
    await sleep(300);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }
    process.exit(code);
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('DOM.enable'); await send('CSS.enable');
  await send('Emulation.setDeviceMetricsOverride',
    { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 1, mobile: false });

  /* Measures one route: resting style from COLLECT, then each control hovered
     with its ancestors, read, and cleared. */
  const measure = async (route, { plant = false } = {}) => {
    await send('Page.navigate', { url: BASE + route });
    await sleep(3200);
    await evaluate(STOP_MOTION);
    if (plant) await evaluate(PLANT);

    const controls = await evaluate(COLLECT);
    if (!Array.isArray(controls)) return { error: 'page did not return controls' };

    /* The full tree, for the parent links forcePseudoState needs. Fetched after
       COLLECT so the data-vyhov attributes are already in it. */
    const doc = (await send('DOM.getDocument', { depth: -1 }))?.result?.root;
    if (!doc) return { error: 'no DOM tree' };
    const parent = new Map();
    const walk = node => {
      for (const c of node.children || []) { parent.set(c.nodeId, node); walk(c); }
      if (node.contentDocument) walk(node.contentDocument);
    };
    walk(doc);

    const ids = (await send('DOM.querySelectorAll', { nodeId: doc.nodeId, selector: '[data-vyhov]' }))
      ?.result?.nodeIds || [];
    if (ids.length !== controls.length) {
      return { error: `tagged ${controls.length} controls, the protocol found ${ids.length}` };
    }

    for (let n = 0; n < controls.length; n++) {
      const chain = [ids[n]];
      let up = parent.get(ids[n]);
      while (up && up.nodeType === 1 && chain.length <= ANCESTOR_DEPTH) {
        chain.push(up.nodeId);
        up = parent.get(up.nodeId);
      }
      for (const nodeId of chain) await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
      controls[n].hover = await evaluate(READ(n));
      for (const nodeId of chain) await send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });
      controls[n].route = route;
    }
    return { controls };
  };

  /* ── self-test ─────────────────────────────────────────────────────────── */
  const st = await measure('/', { plant: true });
  if (st.error) { console.error('self-test could not measure: ' + st.error); await shutdown(2); }
  const planted = st.controls.filter(c => /vy-st-/.test(c.comp));
  const stSplits = splits(planted);
  const same = planted.filter(c => c.comp === 'vy-st-same');
  const caught = {
    splitReported: stSplits.some(g => g.comp === 'vy-st-hov' && g.prop === 'textDecorationLine'),
    agreementNotReported: !stSplits.some(g => g.comp === 'vy-st-same'),
    hoverActuallyApplied: same.length === 2 && same.every(c => c.hover && c.hover.color !== c.rest.color),
  };
  if (!caught.splitReported || !caught.agreementNotReported || !caught.hoverActuallyApplied) {
    console.error('self-test failed — the check cannot see its own planted faults');
    console.error('  ' + JSON.stringify(caught));
    await shutdown(2);
  }

  /* ── the sweep ─────────────────────────────────────────────────────────── */
  const all = [];
  const errors = [];
  for (const route of ROUTES) {
    const r = await measure(route);
    if (r.error) { errors.push(`${route}: ${r.error}`); continue; }
    all.push(...r.controls);
  }

  const found = splits(all);
  console.log(`${ROUTES.length} routes, ${all.length} controls hovered with their ancestors  self-test passed`);
  for (const e of errors) console.log(`  [probe] ${e}`);
  console.log(`SPLITS ${found.length}`);
  for (const g of found) {
    console.log(`  .${g.comp}  ${g.prop}  at rest ${g.rest}  on ${g.surf}`);
    for (const [value, ms] of g.by) {
      const where = [...new Set(ms.map(m => `<${m.tag}> ${m.route}`))].slice(0, 3).join(', ');
      console.log(`      hovered ${String(value).padEnd(28)} ${where}`);
    }
  }
  if (!found.length) console.log('  every control that looks the same at rest reacts the same way to a pointer');

  await shutdown(found.length || errors.length ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
