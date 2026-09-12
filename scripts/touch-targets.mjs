/**
 * Touch targets, measured on a phone.
 *
 *   npm run dev             # in another terminal
 *   npm run touch:check
 *
 * WHY A SCRIPT AND NOT A READ-THROUGH. A target's size is almost never written
 * down. Sign out measured 31px from `min-height: 24px` plus 6px of padding plus
 * a line box — three declarations in two files, none of which says 31. The only
 * honest way to know is to paint it and measure.
 *
 * TWO TIERS, reported separately, because they are different claims.
 *
 *   FAIL  WCAG 2.5.8 Target Size (Minimum), AA: 24x24 CSS px. This is a
 *         conformance failure. Both of its exceptions are applied — see below.
 *
 *   THIN  44x44, which is Apple's figure and close to Material's 48. Not a
 *         conformance requirement at AA and deliberately not reported as one.
 *         It is the size a finger actually wants, and it is the bar Sign out
 *         was held to.
 *
 * THE EXCEPTIONS ARE APPLIED, or the FAIL tier would be noise:
 *
 *   Spacing  2.5.8 lets an undersized target pass if a 24px circle centred on
 *            it touches no other target's circle — i.e. the nearest other
 *            target's centre is 24px or more away. A lone 20px icon in open
 *            space conforms; two of them 10px apart do not.
 *   Inline   A target in a run of text is exempt. Detected as display:inline
 *            with a non-empty text sibling, which is what a link in a sentence
 *            looks like and what a toolbar button does not.
 *
 * Disabled controls are skipped: nothing happens when they are hit.
 *
 * IT OPENS THINGS. The defect that prompted this sweep was inside a popover,
 * and a popover's contents do not exist in the DOM until it is opened. A run
 * that only measured what is on screen at load would have missed the control it
 * was written for. Each opener is clicked, measured, and dismissed.
 *
 * IT TESTS ITSELF FIRST. Before measuring anything real it injects three
 * controls with known outcomes — two 20px buttons 2px apart (FAIL: centres 22px
 * apart, inside the 24px circle; at 10px apart the centres are 30 and the
 * spacing exception correctly rescues them, which is how the first draft of
 * this fixture was caught) and one isolated 30px button (THIN only) — and
 * refuses to report a clean sweep unless it caught exactly those. A sweep that
 * finds nothing is worth very little without that.
 *
 * Driven over the DevTools protocol with Node's built-in WebSocket, same
 * harness as scripts/render-check.mjs.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9445);

/* iPhone X/11/12-class. The narrowest phone worth designing for is 320, which
   is checked separately for layout; 375 is where the targets are. */
const VIEWPORT = { width: 375, height: 812, scale: 2 };

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

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── the probe ───────────────────────────────────────────────────────────────
   Evaluated in the page. NO BACKTICKS below this line — this is a template
   literal, and a backtick inside it ends the string. That has bitten this
   repo twice. */
const PROBE = `(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const SEL = [
    'a[href]', 'button', 'input:not([type=hidden])', 'select', 'textarea',
    'summary', '[role=button]', '[role=link]', '[role=checkbox]', '[role=radio]',
    '[role=menuitem]', '[role=menuitemradio]', '[role=menuitemcheckbox]',
    '[role=tab]', '[role=switch]', '[role=option]', '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const visible = el => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (parseFloat(cs.opacity) === 0) return false;
    if (el.closest('[aria-hidden="true"], [hidden]')) return false;
    return true;
  };

  const dead = el => el.disabled === true || el.getAttribute('aria-disabled') === 'true';

  /* 2.5.8 inline exception: a target inside a run of text. */
  const inlineInText = el => {
    if (getComputedStyle(el).display !== 'inline') return false;
    const p = el.parentElement;
    if (!p) return false;
    return Array.from(p.childNodes)
      .some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
  };

  /* textContent, never innerText: innerText returns '' while the pane is
     hidden, which once produced eight phantom unnamed controls. */
  const name = el => {
    const t = (el.getAttribute('aria-label') || el.textContent || el.value ||
               el.getAttribute('title') || '').replace(/\\s+/g, ' ').trim();
    return t.slice(0, 44) || ('<' + el.tagName.toLowerCase() + '>');
  };

  const where = el => {
    const raw = el.className && el.className.baseVal !== undefined
      ? el.className.baseVal : (el.className || '');
    const first = String(raw).trim().split(/\\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (first ? '.' + first : '');
  };

  /* A target you cannot hit at its own centre is not a target. This drops
     controls lying under an open popover — a finger cannot reach them, and
     counting them made overlay items look like neighbours of grid rows and
     dragged the spacing figure down. */
  const hittable = (el, cx, cy) => {
    const h = document.elementFromPoint(cx, cy);
    return !!h && (h === el || el.contains(h) || h.contains(el));
  };

  const measure = context => {
    const els = Array.from(document.querySelectorAll(SEL)).filter(visible);
    const boxes = els.map(el => {
      const r = el.getBoundingClientRect();
      return { el, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    }).filter(b => b.cx >= 0 && b.cy >= 0 && b.cx <= innerWidth && b.cy <= innerHeight)
      .filter(b => hittable(b.el, b.cx, b.cy));
    const out = [];
    for (const b of boxes) {
      if (dead(b.el) || inlineInText(b.el)) continue;
      const min = Math.min(b.w, b.h);
      if (min >= 44) continue;

      let nearest = Infinity;
      for (const o of boxes) {
        if (o === b) continue;
        /* A label wrapping its input is ONE target, not two sitting 0px
           apart. Without this every wrapped control reported nearest 0 and
           failed on spacing it does not actually lack. */
        if (o.el.contains(b.el) || b.el.contains(o.el)) continue;
        const d = Math.hypot(o.cx - b.cx, o.cy - b.cy);
        if (d < nearest) nearest = d;
      }
      /* Spacing relief applies only to the 24px tier. */
      const tier = (min < 24 && nearest < 24) ? 'FAIL' : 'THIN';
      out.push({
        context, tier,
        what: name(b.el), sel: where(b.el),
        w: Math.round(b.w), h: Math.round(b.h),
        nearest: nearest === Infinity ? null : Math.round(nearest),
      });
    }
    return out;
  };

  /* ---- self-test ---------------------------------------------------------
     Three controls with known verdicts. If the measurement is broken, this is
     where it shows, before any real number is believed. */
  if (window.__vySelfTest) {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:4px;top:400px;z-index:99999';
    host.innerHTML =
      '<button id="vy-st-a" style="width:20px;height:20px;display:block">a</button>' +
      '<button id="vy-st-b" style="width:20px;height:20px;display:block;margin-top:2px">b</button>' +
      '<button id="vy-st-c" style="width:30px;height:30px;display:block;margin-top:120px">c</button>';
    document.body.appendChild(host);
    await sleep(60);
    const seen = measure('selftest').filter(f => /^[abc]$/.test(f.what));
    host.remove();
    const verdict = Object.fromEntries(seen.map(f => [f.what, f.tier]));
    return { selftest: {
      caught: seen.length,
      a: verdict.a || 'missed', b: verdict.b || 'missed', c: verdict.c || 'missed',
    } };
  }

  /* ---- the sweep ---------------------------------------------------------- */
  const found = measure('at rest');

  /* Overlays. Their contents do not exist until opened, and the defect that
     prompted this sweep lived in one. */
  const openers = [
    { name: 'user menu',      find: () => document.querySelector('.vy-avatar') },
    { name: 'column chooser', find: () => Array.from(document.querySelectorAll('button'))
                                            .find(b => /Columns \\(/.test(b.textContent)) },
    { name: 'view setting',   find: () => document.querySelector('.vy-funnel') },
    { name: 'filter panel',   find: () => Array.from(document.querySelectorAll('button'))
                                            .find(b => /^\\s*Filters?\\b/.test(b.textContent)) },
  ];

  for (const o of openers) {
    const t = o.find();
    if (!t || !visible(t)) continue;
    const before = document.querySelectorAll(SEL).length;
    t.click();
    await sleep(600);
    /* Only measure if opening actually revealed something, so a no-op click is
       not reported as a screenful of duplicates. */
    if (document.querySelectorAll(SEL).length > before) {
      for (const f of measure(o.name)) found.push(f);
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(400);
    if (document.querySelectorAll(SEL).length > before) {
      const still = o.find();
      if (still) { still.click(); await sleep(400); }
    }
  }

  return { found };
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

async function main() {
  try { await fetch(BASE); }
  catch { console.error(`Cannot reach ${BASE}. Start the dev server first: npm run dev`); process.exit(2); }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-touch-'));
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
  /* mobile:true so load-time device gates run, not just a narrow window. */
  await send('Emulation.setDeviceMetricsOverride', {
    width: VIEWPORT.width, height: VIEWPORT.height,
    deviceScaleFactor: VIEWPORT.scale, mobile: true,
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

  const visit = async (route, selfTest = false) => {
    await send('Page.navigate', { url: BASE + route });
    await sleep(3200);
    await send('Runtime.evaluate',
      { expression: `window.__vySelfTest = ${selfTest ? 'true' : 'false'}`, returnByValue: true });
    const r = await send('Runtime.evaluate',
      { expression: PROBE, awaitPromise: true, returnByValue: true });
    return r.result?.result?.value;
  };

  /* Nothing below is believed until this passes. */
  const st = (await visit('/', true))?.selftest;
  const expected = { caught: 3, a: 'FAIL', b: 'FAIL', c: 'THIN' };
  const stOk = st && st.caught === expected.caught &&
               st.a === expected.a && st.b === expected.b && st.c === expected.c;
  if (!stOk) {
    console.error('self-test failed — the sweep cannot measure, so its result means nothing');
    console.error('  expected', JSON.stringify(expected));
    console.error('  got     ', JSON.stringify(st));
    ws.close(); chrome.kill();
    process.exit(2);
  }

  const findings = [];
  for (const route of ROUTES) {
    const v = await visit(route);
    if (!v) { findings.push({ route, tier: 'FAIL', context: 'probe', what: 'page did not render', sel: '', w: 0, h: 0 }); continue; }
    for (const f of v.found) findings.push({ route, ...f });
  }

  ws.close();
  chrome.kill();
  await new Promise(r => chrome.once('exit', r));
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }

  /* GROUPED BY CONTROL, NOT BY INSTANCE. A grid row checkbox is one control
     that appears twenty times per screen on four screens; listing each one
     buries the six things there are to fix under three hundred lines. Keyed on
     selector plus measured size, which is what a fix changes. Where the same
     control lands in both tiers across instances the worse one is reported —
     the row that happens to sit next to another target is the one that fails. */
  const byControl = new Map();
  for (const f of findings) {
    const key = f.sel + '\u0000' + f.w + 'x' + f.h;
    if (!byControl.has(key)) {
      byControl.set(key, { ...f, n: 0, names: new Set(), routes: new Set(),
                           contexts: new Set(), worstNearest: Infinity, tier: 'THIN' });
    }
    const g = byControl.get(key);
    g.n++;
    g.names.add(f.what);
    g.routes.add(f.route);
    g.contexts.add(f.context);
    if (f.tier === 'FAIL') g.tier = 'FAIL';
    if (f.nearest != null && f.nearest < g.worstNearest) g.worstNearest = f.nearest;
  }
  const rows = [...byControl.values()].sort((a, b) =>
    (a.tier === b.tier ? 0 : a.tier === 'FAIL' ? -1 : 1) ||
    (a.w * a.h) - (b.w * b.h));

  const fails = rows.filter(r => r.tier === 'FAIL');
  const thin  = rows.filter(r => r.tier === 'THIN');

  console.log(`viewport ${VIEWPORT.width}x${VIEWPORT.height}  routes ${ROUTES.length}  self-test passed`);
  console.log(`FAIL (under 24x24, WCAG 2.5.8 AA) ${fails.length}   THIN (under 44x44) ${thin.length}   controls, not instances`);
  for (const r of rows) {
    const names = [...r.names].slice(0, 2).map(n => '"' + n + '"').join(', ');
    console.log(`  [${r.tier}] ${r.w}x${r.h}  ${r.sel}  ${names}${r.names.size > 2 ? ` +${r.names.size - 2} more` : ''}`);
    console.log(`        ${r.n} instance(s) · ${r.routes.size} route(s): ${[...r.routes].slice(0, 3).join(' ')}${r.routes.size > 3 ? ' …' : ''}`
      + (r.worstNearest !== Infinity ? ` · closest neighbour ${r.worstNearest}px` : ''));
  }
  if (!rows.length) console.log('  every target is at least 44x44');
  /* Only a conformance failure gates the build. THIN is advice. */
  process.exit(fails.length ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
