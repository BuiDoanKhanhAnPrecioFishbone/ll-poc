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

/* The routes that render a Kendo Grid — the only ones where density means
   anything, and so the only ones the Compact pass needs. */
const GRID_ROUTES = [
  '/sales-management/quotation',
  '/engineering/part-mst',
  '/engineering/bom',
  '/engineering/mpn',
  '/engineering/mfg',
  '/inventory-management/packing-list',
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

  /* Transitions off before anything is measured, for the reason written up in
     mobile-check: a drawer caught mid-slide measures wherever it happens to be,
     and one frozen by a non-rendering page measures its start value forever. */
  const stopMotion = document.createElement('style');
  stopMotion.textContent =
    '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(stopMotion);
  document.body.getBoundingClientRect();

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

  /* THE TARGET IS WHAT YOU CAN TAP, NOT THE BOX THAT PAINTS. A 20px checkbox
     inside a label is tapped anywhere on the label — clicking the word toggles
     it, which is native behaviour, not something this app wired up. Measuring
     the input alone reported those as undersized when the real target is the
     whole row. Takes the union, so a label that is SMALLER than its input
     cannot shrink the figure. */
  /* CLIPPED IS NOT TAPPABLE. A grid's content box hides its overflow, so the
     last row is often cut mid-height — the element's rect still reports the
     whole box, which extends past the clip and onto whatever sits below, the
     pager included. Comparing those raw rects invented two overlaps that no
     finger could ever produce. The tappable area is the intersection with
     every clipping ancestor. */
  const clipped = (el, r) => {
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
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

  const effective = el => {
    const r = el.getBoundingClientRect();
    let lab = el.closest('label');
    if (!lab && el.id) {
      try { lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); }
      catch (e) { lab = null; }
    }
    if (!lab || !visible(lab)) return r;
    const l = lab.getBoundingClientRect();
    const left = Math.min(r.left, l.left), right = Math.max(r.right, l.right);
    const top = Math.min(r.top, l.top), bottom = Math.max(r.bottom, l.bottom);
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  };

  /* SIZE AND OVERLAP WANT DIFFERENT BOXES, and conflating them was wrong in
     both directions.

     For OVERLAP the clipped box is the honest one: the half of a row hidden
     under the grid's edge cannot be tapped, so it cannot be tapped by mistake
     either. Using raw rects there invented two collisions with the pager.

     For SIZE the clipped box is NOT: a row scrolled half out of view is not an
     undersized control, it is a normally sized one that is partly off screen,
     and it measures full size the moment it scrolls in. Reporting the clipped
     height turned one finding into eleven, every one of them a row at the edge
     of a grid. So size uses the full box and simply SKIPS anything substantially
     clipped — there is nothing to say about a control you are only half
     looking at. */
  const mostlyVisible = (el, r) => {
    const c = clipped(el, r);
    const full = r.width * r.height;
    return full <= 0 ? false : (c.width * c.height) / full >= 0.9;
  };

  const measure = context => {
    const els = Array.from(document.querySelectorAll(SEL)).filter(visible);
    const boxes = els.map(el => {
      const r = effective(el);
      return { el, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    }).filter(b => b.cx >= 0 && b.cy >= 0 && b.cx <= innerWidth && b.cy <= innerHeight)
      /* Hit tested at the CONTROL's own centre, not the union's: a label's
         centre can sit on the text beside the box, which is still the same
         target but makes the assertion say less. */
      .filter(b => { const r = b.el.getBoundingClientRect();
                     return hittable(b.el, r.left + r.width / 2, r.top + r.height / 2); })
      .filter(b => mostlyVisible(b.el, { left: b.cx - b.w / 2, top: b.cy - b.h / 2,
                                         right: b.cx + b.w / 2, bottom: b.cy + b.h / 2,
                                         width: b.w, height: b.h }));
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

  /* OVERLAPPING TARGETS. Growing a hit area with padding and a negative margin
     leaves the layout alone but can push the box over its neighbour, and then a
     tap near the seam activates the wrong control — silently, and not visible
     in a screenshot. Size alone cannot see this, and raising 55 targets is
     exactly what causes it. Same-element pairs and nested pairs are skipped for
     the reason they are skipped in the spacing figure: they are one target. */
  const overlapsIn = context => {
    const els = Array.from(document.querySelectorAll(SEL)).filter(visible);
    const boxes = els.map(el => {
      const r = clipped(el, effective(el));
      return { el, r, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    }).filter(b => b.r.width > 0 && b.r.height > 0)
      .filter(b => { const q = b.el.getBoundingClientRect();
                     return hittable(b.el, q.left + q.width / 2, q.top + q.height / 2); });
    const out = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ar = a.r, br = b.r;
        if (ar.right <= br.left || br.right <= ar.left) continue;
        if (ar.bottom <= br.top || br.bottom <= ar.top) continue;
        const area = (Math.min(ar.right, br.right) - Math.max(ar.left, br.left)) *
                     (Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top));
        /* Under a pixel of touching is a rounding artefact, not an overlap. */
        if (area < 4) continue;
        out.push({ context, a: where(a.el) + ' "' + name(a.el) + '"',
                   b: where(b.el) + ' "' + name(b.el) + '"',
                   area: Math.round(area) });
      }
    }
    return out;
  };

  /* ---- self-test ---------------------------------------------------------
     Four controls with known verdicts. If the measurement is broken, this is
     where it shows, before any real number is believed. */
  if (window.__vySelfTest) {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:4px;top:400px;z-index:99999';
    host.innerHTML =
      '<button id="vy-st-a" style="width:20px;height:20px;display:block">a</button>' +
      '<button id="vy-st-b" style="width:20px;height:20px;display:block;margin-top:2px">b</button>' +
      '<button id="vy-st-c" style="width:30px;height:30px;display:block;margin-top:120px">c</button>' +
      /* d proves the label union is live: a 20px box that would be reported on
         its own, inside a label big enough that the real target passes. It must
         come back MISSED. a/b/c coming back caught is what rules out "missed
         because the whole measurement died". */
      '<label style="display:block;width:200px;height:44px;margin-top:120px">' +
        '<input id="vy-st-d" type="checkbox" style="width:20px;height:20px">d</label>' +
      /* e and f are big enough to pass on size and deliberately overlap by
         10px, so a silent overlap check cannot pass for a clean one. */
      '<button id="vy-st-e" style="position:absolute;left:0;top:300px;width:50px;height:50px">e</button>' +
      '<button id="vy-st-f" style="position:absolute;left:40px;top:300px;width:50px;height:50px">f</button>' +
      /* g is half-clipped by its container; h sits exactly where g's UNCLIPPED
         box would reach. Raw rects call that an overlap; a finger never can.
         Must report 0 while e/f still reports 1. */
      '<div style="position:absolute;left:120px;top:300px;width:60px;height:25px;overflow:hidden">' +
        '<button id="vy-st-g" style="width:60px;height:50px">g</button></div>' +
      '<button id="vy-st-h" style="position:absolute;left:120px;top:330px;width:60px;height:20px">h</button>';
    document.body.appendChild(host);
    await sleep(60);
    const seen = measure('selftest').filter(f => /^[abcd]$/.test(f.what));
    const verdict = Object.fromEntries(seen.map(f => [f.what, f.tier]));
    const all = overlapsIn('selftest');
    const ef = all.filter(o => /"[ef]"/.test(o.a) && /"[ef]"/.test(o.b));
    const gh = all.filter(o => /"[gh]"/.test(o.a) || /"[gh]"/.test(o.b));
    host.remove();
    return { selftest: {
      caught: seen.length,
      a: verdict.a || 'missed', b: verdict.b || 'missed',
      c: verdict.c || 'missed', d: verdict.d || 'missed',
      overlapsCaught: ef.length, clipFalsePositives: gh.length,
    } };
  }

  /* ---- the sweep ---------------------------------------------------------- */
  const found = measure('at rest');
  const overlapping = overlapsIn('at rest');

  /* Overlays. Their contents do not exist until opened, and the defect that
     prompted this sweep lived in one. */
  const openers = [
    /* THE NAVIGATION DRAWER, and it was the blind spot that made this list
       look complete. Below 820px the sidebar is parked off-canvas at
       translateX(-100%), so every nav item fails the hit test at its own
       centre and is dropped before it is ever measured — the sweep reported
       "every target is at least 44x44" while the app's primary navigation sat
       at 38. A closed drawer is not an absent one. */
    { name: 'navigation',     find: () => document.querySelector('.vy-nav-toggle') },
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

  return { found, overlapping };
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

  /* Density is a stored preference, so it is set in localStorage and the page
     reloaded — the same path a user takes through the menu, rather than a class
     poked onto the DOM, which would test a state the app cannot reach. */
  const visit = async (route, { selfTest = false, density = null } = {}) => {
    await send('Page.navigate', { url: BASE + route });
    await sleep(1200);
    if (density) {
      await send('Runtime.evaluate', {
        expression: `localStorage.setItem('vy.density', ${JSON.stringify(density)})`,
        returnByValue: true });
      await send('Page.reload');
      await sleep(3200);
      const got = await send('Runtime.evaluate', {
        expression: `document.querySelector('.vy-grid-k') && document.querySelector('.vy-grid-k').getAttribute('data-density')`,
        returnByValue: true });
      /* Assert the density actually took. A pass that silently ran at the
         default would report the default's numbers and call them Compact's. */
      const actual = got.result?.result?.value;
      if (actual && actual !== density) {
        throw new Error(`asked for ${density} density on ${route}, page rendered ${actual}`);
      }
    } else {
      await sleep(2000);
    }
    await send('Runtime.evaluate',
      { expression: `window.__vySelfTest = ${selfTest ? 'true' : 'false'}`, returnByValue: true });
    const r = await send('Runtime.evaluate',
      { expression: PROBE, awaitPromise: true, returnByValue: true });
    return r.result?.result?.value;
  };

  /* Nothing below is believed until this passes. */
  const st = (await visit('/', { selfTest: true }))?.selftest;
  const expected = { caught: 3, a: 'FAIL', b: 'FAIL', c: 'THIN', d: 'missed',
                     overlapsCaught: 1, clipFalsePositives: 0 };
  const stOk = st && st.caught === expected.caught &&
               st.a === expected.a && st.b === expected.b &&
               st.c === expected.c && st.d === expected.d &&
               st.overlapsCaught === expected.overlapsCaught &&
               st.clipFalsePositives === expected.clipFalsePositives;
  if (!stOk) {
    console.error('self-test failed — the sweep cannot measure, so its result means nothing');
    console.error('  expected', JSON.stringify(expected));
    console.error('  got     ', JSON.stringify(st));
    ws.close(); chrome.kill();
    process.exit(2);
  }

  const findings = [];
  const overlaps = [];
  for (const route of ROUTES) {
    const v = await visit(route);
    if (!v) { findings.push({ route, tier: 'FAIL', context: 'probe', what: 'page did not render', sel: '', w: 0, h: 0 }); continue; }
    for (const f of v.found) findings.push({ route, ...f });
    for (const o of (v.overlapping || [])) overlaps.push({ route, ...o });
  }

  /* ---- COMPACT DENSITY -------------------------------------------------
     Compact is deliberately exempt from the 44px floor: someone who picks it
     has asked for the most rows on screen. What it is NOT exempt from is
     conformance, and the pass above never sees it — the app opens Comfortable,
     so a Compact row that fell under 24x24 would ship without anything
     measuring it. This pass measures it, and only the AA tier and overlaps
     count; a Compact row being under 44 is the point, not a finding. */
  const compactFindings = [];
  const compactOverlaps = [];
  for (const route of GRID_ROUTES) {
    const v = await visit(route, { density: 'compact' });
    if (!v) continue;
    /* EVERY tier is kept, not just FAIL. The gate still only fires on FAIL, but
       the margin has to be visible: the first run of this pass passed while a
       Compact row was 24px with a 20px target, conformant purely because the
       spacing came to exactly 24. A green tick hid that. The numbers are
       printed now, so "it passes" and "it passes by nothing" cannot look the
       same again. */
    for (const f of v.found) compactFindings.push({ route, ...f });
    for (const o of (v.overlapping || [])) compactOverlaps.push({ route, ...o });
  }
  /* Put the preference back, so a run does not leave the browser profile in a
     state the next run inherits. */
  await send('Runtime.evaluate',
    { expression: `localStorage.setItem('vy.density', 'comfortable')`, returnByValue: true });

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

  /* Deduplicated by the PAIR of controls, not by instance — one bad rule
     produces the same collision on every row of every grid. */
  const pairs = new Map();
  for (const o of overlaps) {
    const key = [o.a, o.b].sort().join(' || ');
    if (!pairs.has(key)) pairs.set(key, { ...o, n: 0, routes: new Set() });
    pairs.get(key).n++;
    pairs.get(key).routes.add(o.route);
  }
  console.log(`\nOVERLAPPING hit areas ${pairs.size} pair(s)`);
  for (const p of pairs.values()) {
    console.log(`  ${p.a}\n  overlaps ${p.b}  by ${p.area}px2`);
    console.log(`        ${p.n} instance(s) · ${[...p.routes].slice(0, 3).join(' ')}`);
  }
  if (!pairs.size) console.log('  none — no target sits on top of another');

  /* Compact is measured for CONFORMANCE only — see the note on the pass. */
  const cFails = compactFindings.filter(f => f.tier === 'FAIL');
  const cSeen = new Map();
  for (const f of cFails) {
    const key = f.sel + '\u0000' + f.w + 'x' + f.h;
    if (!cSeen.has(key)) cSeen.set(key, { ...f, routes: new Set() });
    cSeen.get(key).routes.add(f.route);
  }
  const cPairs = new Set(compactOverlaps.map(o => [o.a, o.b].sort().join(' || ')));

  /* The two numbers the criterion actually turns on. */
  const smallest = compactFindings.reduce((m, f) => Math.min(m, f.w, f.h), Infinity);
  const closest = compactFindings.reduce(
    (m, f) => (f.nearest == null ? m : Math.min(m, f.nearest)), Infinity);

  console.log(`\nCOMPACT density (grid routes; the 44 floor is waived here, AA is not)`);
  console.log(`  FAIL ${cSeen.size}   OVERLAPPING ${cPairs.size}`);
  for (const r of cSeen.values()) {
    console.log(`  [FAIL] ${r.w}x${r.h}  ${r.sel}  "${r.what}"  ${[...r.routes].slice(0, 3).join(' ')}`);
  }
  for (const p of cPairs) console.log(`  [OVERLAP] ${p}`);
  if (smallest !== Infinity) {
    const bySize = smallest >= 24;
    console.log(`  smallest target ${smallest}px, closest centres ${closest === Infinity ? 'n/a' : closest + 'px'} (AA needs 24)`);
    console.log(bySize
      ? `  conforms on SIZE — the spacing exception is not load-bearing here`
      : `  conforms ONLY via the 24px spacing exception, by ${closest - 24}px — one padding change from failing`);
  }
  if (!cSeen.size && !cPairs.size && smallest === Infinity) {
    console.log('  nothing under 44 at all in Compact');
  }

  /* A conformance failure gates the build, and so does an overlap: a tap that
     lands on the wrong control is a defect regardless of how big either is.
     Compact contributes on both counts — it is exempt from the guidance, not
     from the criterion. */
  process.exit(fails.length || pairs.size || cSeen.size || cPairs.size ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
