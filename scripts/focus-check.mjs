/**
 * Can you see what you have focused?
 *
 *   npm run dev            # in another terminal
 *   npm run focus:check
 *
 * WHY THIS EXISTS. On 12 Sep the page-actions row was turned into a horizontal
 * scroller to save 48px on a phone. Tabbing to the last button moved focus
 * without bringing the button into view: the focus ring was off screen, which
 * is the same as having none. Nothing caught it — not lint, not the touch
 * sweep, not the mobile sweep — because every one of them measures the page at
 * rest and this only exists while something is focused. It was found by hand,
 * which is not a strategy.
 *
 * TWO CHECKS, both per focusable element:
 *
 *   OBSCURED   Focused, the element is not visible: scrolled out of its own
 *              scroll container, or clipped to nothing by an ancestor.
 *              WCAG 2.4.11 Focus Not Obscured (Minimum), AA in 2.2.
 *   NOINDICATOR  Focusing changes nothing about how the element is drawn —
 *              no outline, no box-shadow, no border or background change.
 *              WCAG 2.4.7 Focus Visible.
 *
 * IT RUNS AT TWO WIDTHS. 1440 is where most keyboard use happens; 375 is where
 * the layout rearranges into scrollers and drawers, and where the defect that
 * prompted this lived. A check that only ran at one would have missed it.
 *
 * THE ONE THING THAT MAKES IT WORK: Emulation.setFocusEmulationEnabled. A
 * document without system focus dispatches no focus events and performs no
 * scroll-on-focus, and headless Chrome never has system focus — so without this
 * every element looks obscured and every run is a false alarm. Two hours were
 * spent proving that the hard way.
 *
 * Same CDP harness as the other checks. NO BACKTICKS inside PROBE.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9452);

const VIEWPORTS = [
  { label: 'desktop', width: 1440, height: 900, mobile: false },
  { label: 'phone', width: 375, height: 812, mobile: true },
];

const ROUTES = [
  '/', '/my-queues',
  '/sales-management/quotation', '/sales-management/quotation/rfq-1',
  '/engineering/part-mst', '/engineering/bom', '/engineering/mpn', '/engineering/mfg',
  '/inventory-management/packing-list', '/login',
];

const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const PROBE = `(async () => {
  const W = document.documentElement.clientWidth;
  const H = document.documentElement.clientHeight;

  /* Settled, for the reason recorded in mobile-check: a focus ring that fades
     in measures as absent if it is caught mid-animation, and as absent forever
     if the page is not compositing. */
  const stopMotion = document.createElement('style');
  stopMotion.textContent =
    '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(stopMotion);

  const SEL = [
    'a[href]', 'button', 'input:not([type=hidden])', 'select', 'textarea',
    'summary', '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const where = el => {
    const raw = el.className && el.className.baseVal !== undefined
      ? el.className.baseVal : (el.className || '');
    const first = String(raw).trim().split(/\\s+/).filter(Boolean)[0];
    return el.tagName.toLowerCase() + (first ? '.' + first : '');
  };
  const label = el => (el.getAttribute('aria-label') || el.textContent || '')
    .replace(/\\s+/g, ' ').trim().slice(0, 34);

  /* The painted extent: intersect with every ancestor that clips. A control
     scrolled out of its own scroller has a real rect and no visible area. */
  const painted = el => {
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
    return { w: Math.max(0, box.right - box.left), h: Math.max(0, box.bottom - box.top),
             left: box.left, top: box.top, right: box.right, bottom: box.bottom };
  };

  const drawnAs = el => {
    const cs = getComputedStyle(el);
    return [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.boxShadow,
            cs.borderColor, cs.borderWidth, cs.backgroundColor, cs.color].join('|');
  };

  const visibleNow = el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (parseFloat(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const candidates = Array.from(document.querySelectorAll(SEL))
    .filter(el => !el.disabled && el.getAttribute('aria-disabled') !== 'true')
    .filter(visibleNow)
    .slice(0, window.__vyFocusCap || 70);

  const obscured = [];
  const noIndicator = [];

  for (const el of candidates) {
    /* BLUR FIRST. The resting appearance has to be measured while the element
       is NOT focused, and one of them already is: Login autofocuses its
       username field, so the first run compared a focused input against itself
       and reported it as having no focus indicator. */
    if (document.activeElement === el) {
      el.blur();
      await new Promise(r => setTimeout(r, 12));
    }
    const before = drawnAs(el);
    el.focus();
    await new Promise(r => setTimeout(r, 12));
    if (document.activeElement !== el) continue;   // refused focus; not ours to judge
    const after = drawnAs(el);
    const p = painted(el);

    /* Off screen, or clipped away, WHILE FOCUSED. */
    const onScreen = p.w > 0 && p.h > 0 &&
                     p.right > 0 && p.bottom > 0 && p.left < W && p.top < H;
    if (!onScreen) {
      obscured.push({ sel: where(el), what: label(el),
                      box: Math.round(p.w) + 'x' + Math.round(p.h),
                      left: Math.round(p.left), top: Math.round(p.top) });
    }

    if (before === after) {
      noIndicator.push({ sel: where(el), what: label(el) });
    }
    el.blur();
  }

  stopMotion.remove();
  return { checked: candidates.length, obscured, noIndicator };
})()`;

const SELFTEST = `(() => {
  const host = document.createElement('div');
  host.id = 'vy-focus-selftest';
  /* a: clipped away with NO WAY BACK — must be reported OBSCURED.
     A POSITIVE offset does not work as a fixture: the parent's scrollWidth
     grows, the browser scrolls it on focus, and the control becomes visible,
     which is the browser behaving correctly. A NEGATIVE offset cannot be
     scrolled to — scrollLeft has no negative side — so the control stays
     invisible however hard the browser tries, which is the state this check
     exists to find.
     b: focus styling suppressed entirely — must be reported NOINDICATOR.
     c: an ordinary button — must be reported by neither. */
  host.innerHTML =
    '<div id="vy-st-scroller" style="width:60px;overflow:hidden;position:relative;height:30px">' +
      '<button id="vy-st-a" style="position:absolute;left:-4000px;width:50px;height:24px">a</button>' +
    '</div>' +
    '<button id="vy-st-b" style="width:60px;height:24px;outline:none!important;box-shadow:none!important">b</button>' +
    '<button id="vy-st-c" style="width:60px;height:24px">c</button>';
  document.body.appendChild(host);
  const b = host.querySelector('#vy-st-b');
  b.addEventListener('focus', () => { b.style.outline = 'none'; b.style.boxShadow = 'none'; });
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

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-focus-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });

  const ws = new WebSocket(await connect());
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) =>
    new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Page.enable'); await send('Runtime.enable');
  /* The line without which every result is a lie — see the header. */
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });

  const visit = async (route, vp, selfTest = false) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
    await send('Page.navigate', { url: BASE + route });
    await sleep(3200);
    if (selfTest) { await send('Runtime.evaluate', { expression: SELFTEST, returnByValue: true }); await sleep(150); }
    const r = await send('Runtime.evaluate',
      { expression: PROBE, awaitPromise: true, returnByValue: true });
    return r.result?.result?.value;
  };

  /* Nothing below is believed until the planted faults come back. */
  const st = await visit('/', VIEWPORTS[0], true);
  const caughtObscured = !!st?.obscured?.some(o => /vy-st-a/.test(o.sel) || o.what === 'a');
  const caughtNoIndicator = !!st?.noIndicator?.some(o => o.what === 'b');
  const cleanOne = !st?.obscured?.some(o => o.what === 'c') &&
                   !st?.noIndicator?.some(o => o.what === 'c');
  if (!caughtObscured || !caughtNoIndicator || !cleanOne) {
    console.error('self-test failed — the check cannot see its own planted faults');
    console.error(`  obscured caught: ${caughtObscured}  no-indicator caught: ${caughtNoIndicator}  clean control quiet: ${cleanOne}`);
    ws.close(); chrome.kill();
    process.exit(2);
  }

  const findings = [];
  let checked = 0;
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      const v = await visit(route, vp);
      if (!v) continue;
      checked += v.checked;
      for (const o of v.obscured)
        findings.push({ vp: vp.label, route, kind: 'obscured', ...o });
      for (const o of v.noIndicator)
        findings.push({ vp: vp.label, route, kind: 'no-indicator', ...o });
    }
  }

  ws.close();
  chrome.kill();
  await new Promise(r => chrome.once('exit', r));
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }

  const byControl = new Map();
  for (const f of findings) {
    const key = f.kind + ' ' + f.sel + ' ' + f.what;
    if (!byControl.has(key)) byControl.set(key, { ...f, routes: new Set(), vps: new Set() });
    byControl.get(key).routes.add(f.route);
    byControl.get(key).vps.add(f.vp);
  }
  const rows = [...byControl.values()];
  const obscured = rows.filter(r => r.kind === 'obscured');
  const noInd = rows.filter(r => r.kind === 'no-indicator');

  console.log(`focusable controls focused ${checked} across ${ROUTES.length} routes x ${VIEWPORTS.length} widths  self-test passed`);
  console.log(`OBSCURED ${obscured.length}   NO VISIBLE INDICATOR ${noInd.length}   controls, not instances`);
  for (const r of rows) {
    console.log(`  [${r.kind}] ${r.sel} "${r.what}"${r.box ? '  painted ' + r.box + ' at ' + r.left + ',' + r.top : ''}`);
    console.log(`        ${[...r.vps].join(' + ')} · ${[...r.routes].slice(0, 3).join(' ')}`);
  }
  if (!rows.length) console.log('  every focused control was on screen and visibly focused');
  process.exit(rows.length ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
