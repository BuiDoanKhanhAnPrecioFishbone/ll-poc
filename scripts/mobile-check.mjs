/**
 * The system on a phone — everything that is not a touch target.
 *
 *   npm run dev            # in another terminal
 *   npm run mobile:check
 *
 * `touch:check` answers "can I hit it". This answers "can I see it, and does it
 * fit". Different failures, and the ones here are the ones a desktop review
 * never shows: a page that scrolls sideways, a label cut off mid-word, type
 * that shrank below reading size on the one device most likely to be held at
 * arm's length.
 *
 * WHAT IT LOOKS FOR
 *
 *   SIDEWAYS   The document is wider than the viewport. Always a defect: the
 *              page rocks horizontally under a thumb and there is nothing out
 *              there to reach.
 *   ESCAPES    An element sticks out past an edge while NOT inside anything
 *              that scrolls horizontally. A grid that scrolls sideways is doing
 *              its job and is skipped; a card hanging 30px off screen is not.
 *   SMALLTEXT  Rendered type under 12px. Not a WCAG threshold — 1.4.4 is about
 *              zoom, which still works — but 11px on a phone is a decision
 *              nobody makes on purpose.
 *   CUTOFF     Text clipped by its container with no ellipsis, so a word simply
 *              ends. An ellipsis is a choice and is skipped; silence is not.
 *
 * IT TESTS ITSELF FIRST, like touch:check and for the same reason: three
 * injected faults with known verdicts, and it refuses to report a clean run
 * unless it caught exactly those.
 *
 * Same CDP harness as scripts/touch-targets.mjs. NO BACKTICKS inside PROBE.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9446);
const VIEWPORT = { width: 375, height: 812, scale: 2 };

const ROUTES = [
  '/', '/my-queues',
  '/sales-management/quotation', '/sales-management/quotation/rfq-1',
  '/engineering/part-mst', '/engineering/bom', '/engineering/mpn', '/engineering/mfg',
  '/inventory-management/packing-list',
  '/design-system', '/sitemap', '/login',
];

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(() => {
  /* MEASURE A SETTLED PAGE. Anything mid-transition measures wherever it
     happens to be, and a frozen one measures its start value forever: a hidden
     pane stops compositing, so transitions never advance, and because
     transitions sit ABOVE important declarations in the cascade a stuck one
     cannot be overridden by anything — not a stylesheet, not inline
     !important. Chasing that cost half an hour and nearly produced a report
     that the mobile nav drawer was broken, when the drawer was fine and the
     pane simply was not drawing. Switching them off makes every number here a
     property of the CSS rather than of the frame it was caught on. */
  const stopMotion = document.createElement('style');
  stopMotion.textContent =
    '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(stopMotion);
  document.body.getBoundingClientRect();

  /* NOT innerWidth. Under device emulation the visual viewport GROWS to cover
     whatever overflows: inject an element 60px wider than the screen and
     innerWidth goes from 375 to 435, so every comparison against it passes by
     definition and the check reports a clean page no matter what is hanging off
     it. The self-test caught this on its first run — the injected fault came
     back undetected while the other two were found.
     documentElement.clientWidth stays at the layout viewport, 375. */
  const W = document.documentElement.clientWidth;

  const seen = el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const where = el => {
    const raw = el.className && el.className.baseVal !== undefined
      ? el.className.baseVal : (el.className || '');
    const first = String(raw).trim().split(/\\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (first ? '.' + first : '');
  };

  const label = el => (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 40);

  /* WHAT ESCAPES IS WHAT PAINTS OUTSIDE, not what MEASURES outside — and the
     first version conflated them, which produced 91 findings and not one real.
     An element whose ancestor clips it cannot paint past that ancestor, so its
     visible extent is the intersection with every clipping box above it. That
     covers all three ways this went wrong at once: a Kendo grid column sitting
     at x=1400 inside a header that clips at 375, a nav drawer parked off-canvas
     to the left, and a <col> that paints nothing anywhere. */
  const clipBox = el => {
    const r = el.getBoundingClientRect();
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const c = p.getBoundingClientRect();
      box.left = Math.max(box.left, c.left);
      box.top = Math.max(box.top, c.top);
      box.right = Math.min(box.right, c.right);
      box.bottom = Math.min(box.bottom, c.bottom);
    }
    box.width = Math.max(0, box.right - box.left);
    box.height = Math.max(0, box.bottom - box.top);
    return box;
  };

  /* <col> and <colgroup> carry column widths and paint nothing; they reported
     38 escapes between them. */
  const LAYOUT_ONLY = { COL: 1, COLGROUP: 1, TEMPLATE: 1 };

  const all = Array.from(document.querySelectorAll('body *'))
    .filter(el => !LAYOUT_ONLY[el.tagName])
    .filter(seen);

  /* ESCAPES — innermost only. One wide child drags every ancestor past the edge
     with it, and listing all of them buries the one thing to fix. */
  const escapes = [];
  for (const el of all) {
    const r = clipBox(el);
    if (r.width <= 0 || r.height <= 0) continue;      // clipped away entirely
    if (r.right <= W + 1 && r.left >= -1) continue;   // inside the screen
    const childAlsoOut = Array.from(el.querySelectorAll('*')).some(c => {
      if (LAYOUT_ONLY[c.tagName] || !seen(c)) return false;
      const cr = clipBox(c);
      return cr.width > 0 && cr.height > 0 && (cr.right > W + 1 || cr.left < -1);
    });
    if (childAlsoOut) continue;
    escapes.push({ sel: where(el), what: label(el),
                   right: Math.round(r.right), left: Math.round(r.left),
                   over: Math.round(Math.max(r.right - W, -r.left)) });
  }

  /* SMALLTEXT — only elements that render their own text. */
  const small = [];
  for (const el of all) {
    const direct = Array.from(el.childNodes)
      .some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!direct) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size >= 12) continue;
    small.push({ sel: where(el), what: label(el), size: Math.round(size * 10) / 10 });
  }

  /* CUTOFF — clipped with no ellipsis. */
  const cut = [];
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.textOverflow === 'ellipsis') continue;
    if (cs.overflowX !== 'hidden' && cs.overflow !== 'hidden') continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    /* The screen-reader-only pattern is a 1px box clipping text ON PURPOSE, and
       it is the whole point that nothing is shown. Two of those were the only
       CUTOFF findings in the first run. Nothing legible is 8px wide. */
    if (el.clientWidth < 8 || el.clientHeight < 8) continue;
    const direct = Array.from(el.childNodes)
      .some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!direct) continue;
    cut.push({ sel: where(el), what: label(el),
               by: Math.round(el.scrollWidth - el.clientWidth) });
  }

  const doc = document.documentElement;
  const meta = document.querySelector('meta[name="viewport"]');
  stopMotion.remove();
  return {
    sideways: doc.scrollWidth > W + 1 ? { scrollWidth: doc.scrollWidth, viewport: W } : null,
    viewportMeta: meta ? meta.content : null,
    escapes, small, cut,
  };
})()`;

/* The injected faults, as a source string so they render in the page. */
const SELFTEST = `(() => {
  const host = document.createElement('div');
  host.id = 'vy-mobile-selftest';
  host.innerHTML =
    '<div class="vy-st-wide" style="width:' + (innerWidth + 60) + 'px;height:8px"></div>' +
    '<p class="vy-st-small" style="font-size:9px">nine pixel text</p>' +
    '<div class="vy-st-cut" style="width:40px;overflow:hidden;white-space:nowrap">' +
      'a sentence far wider than forty pixels</div>' +
    /* Sits at x=2000 inside a box that clips at 60px wide. It measures far off
       screen and paints entirely on it, which is a grid column exactly. Must
       NOT be reported as an escape. */
    '<div class="vy-st-clipwrap" style="width:60px;overflow:hidden;position:relative">' +
      '<div class="vy-st-clipped" style="position:absolute;left:2000px;width:80px;height:8px"></div>' +
    '</div>';
  document.body.appendChild(host);
})()`;

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

async function main() {
  try { await fetch(BASE); }
  catch { console.error(`Cannot reach ${BASE}. Start the dev server first: npm run dev`); process.exit(2); }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-mobile-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    `--window-size=${VIEWPORT.width},${VIEWPORT.height}`, 'about:blank'], { stdio: 'ignore' });

  const ws = new WebSocket(await connect());
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) =>
    new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: VIEWPORT.width, height: VIEWPORT.height,
    deviceScaleFactor: VIEWPORT.scale, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  const visit = async (route, withFaults = false) => {
    await send('Page.navigate', { url: BASE + route });
    await sleep(3200);
    if (withFaults) {
      await send('Runtime.evaluate', { expression: SELFTEST, returnByValue: true });
      await sleep(150);
    }
    const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    return r.result?.result?.value;
  };

  const st = await visit('/', true);
  const caught = {
    escape: !!st?.escapes?.some(e => e.sel.indexOf('vy-st-wide') >= 0),
    small: !!st?.small?.some(e => e.sel.indexOf('vy-st-small') >= 0),
    cut: !!st?.cut?.some(e => e.sel.indexOf('vy-st-cut') >= 0),
    /* Must be FALSE. The three above being true is what rules out "quiet
       because the whole probe died". */
    clippedNotReported: !st?.escapes?.some(e => e.sel.indexOf('vy-st-clipped') >= 0),
  };
  if (!caught.escape || !caught.small || !caught.cut || !caught.clippedNotReported) {
    console.error('self-test failed — the check cannot see its own injected faults');
    console.error('  ' + JSON.stringify(caught));
    ws.close(); chrome.kill();
    process.exit(2);
  }

  const findings = [];
  for (const route of ROUTES) {
    const v = await visit(route);
    if (!v) { findings.push({ route, kind: 'probe', detail: 'page did not render' }); continue; }
    if (v.sideways) findings.push({ route, kind: 'sideways',
      detail: `document is ${v.sideways.scrollWidth}px wide in a ${v.sideways.viewport}px viewport` });
    if (!v.viewportMeta || v.viewportMeta.indexOf('width=device-width') < 0) findings.push({ route,
      kind: 'viewport-meta', detail: `meta viewport is ${v.viewportMeta || 'absent'}` });
    for (const e of v.escapes) findings.push({ route, kind: 'escapes',
      detail: `${e.sel} "${e.what}" reaches ${e.right}px, ${e.over}px past the edge` });
    for (const e of v.small) findings.push({ route, kind: 'smalltext',
      detail: `${e.sel} "${e.what}" at ${e.size}px` });
    for (const e of v.cut) findings.push({ route, kind: 'cutoff',
      detail: `${e.sel} "${e.what}" clipped by ${e.by}px with no ellipsis` });
  }

  ws.close();
  chrome.kill();
  await new Promise(r => chrome.once('exit', r));
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }

  /* TWO TIERS, kept apart the way touch:check keeps them apart.

     DEFECTS are things that are wrong however you feel about them: a page that
     scrolls sideways, content painted off the edge, a word cut in half, a
     missing viewport meta. These gate.

     SMALL TEXT is ADVICE. 11px is the `--vy-text-xs` step and a legitimate
     caption size — iOS caption2 is 11pt — so a list of 305 of them is a
     description of the type scale, not a bug report. Gating on it would mean a
     check that can never pass and therefore is never read. */
  const DEFECT = { sideways: 1, escapes: 1, cutoff: 1, 'viewport-meta': 1, probe: 1 };
  const defects = findings.filter(f => DEFECT[f.kind]);
  const small = findings.filter(f => f.kind === 'smalltext');

  const byDefect = new Map();
  for (const f of defects) {
    const key = f.kind + ' ' + f.detail;
    if (!byDefect.has(key)) byDefect.set(key, { ...f, routes: new Set() });
    byDefect.get(key).routes.add(f.route);
  }
  const rows = [...byDefect.values()];

  console.log(`viewport ${VIEWPORT.width}x${VIEWPORT.height}  routes ${ROUTES.length}  self-test passed`);
  console.log(`DEFECTS ${rows.length}`);
  for (const r of rows) {
    console.log(`  [${r.kind}] ${r.detail}`);
    console.log(`        ${[...r.routes].slice(0, 4).join(' ')}${r.routes.size > 4 ? ' …' : ''}`);
  }
  if (!rows.length) {
    console.log('  no sideways scroll, nothing painted off the edge, nothing cut off');
  }

  /* Internal reference pages are separated rather than dropped: they are part
     of the app and they are also not what a customer opens on a phone. */
  const DOCS = { '/sitemap': 1, '/design-system': 1 };
  const onScreens = small.filter(f => !DOCS[f.route]);
  const inDocs = small.filter(f => DOCS[f.route]);
  const sizes = new Map();
  for (const f of onScreens) {
    const m = /at ([0-9.]+)px/.exec(f.detail);
    const size = m ? m[1] : '?';
    const sel = f.detail.split(' "')[0];
    const key = size + '\u0000' + sel;
    sizes.set(key, (sizes.get(key) || 0) + 1);
  }
  console.log(`\nSMALL TEXT (advice, not a gate) — under 12px`);
  console.log(`  ${onScreens.length} on customer screens, ${inDocs.length} on /sitemap and /design-system`);
  const ranked = [...sizes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  for (const [key, n] of ranked) {
    const [size, sel] = key.split('\u0000');
    console.log(`  ${String(n).padStart(3)}x  ${sel}  at ${size}px`);
  }

  process.exit(rows.length ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
