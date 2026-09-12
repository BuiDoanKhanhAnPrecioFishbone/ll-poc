/**
 * Three defects that only exist once the page is PAINTED.
 *
 *   npm run dev            # in another terminal
 *   npm run render:check
 *
 * `css-orphans` and `css-consistency` read the stylesheets. These three cannot:
 * every one of them is a fact about computed style, and every one shipped past
 * a clean build, a clean lint and both of those scripts.
 *
 *   A  A `.vy-` class rule outranked by a higher-specificity selector, so a
 *      declaration sits in the file and never applies. Kendo ships
 *      `.k-grid a { color: inherit }` at (0,1,1), which beats `.vy-cell-link`
 *      at (0,1,0) — so an identifier rendered as an <a> took the cell's text
 *      colour while the same control rendered as a <button> stayed brand blue.
 *      Project Requirements and Part Master disagreed for weeks.
 *
 *   B  Two sibling blocks that each paint something, touching at 0px, inside a
 *      parent that provides no gap. `.vy-unverified` had padding and no margin
 *      inside a `display: block` card, so the dashboard's caution note sat
 *      flush against the chart legend.
 *
 *   C  A state painted in a colour that duplicates another state's, or its own
 *      backdrop. The chart drew In-Progress from a token whose value is
 *      `#ffffff` — thirty-nine records, on a white card, invisible — and gave
 *      `draft` and `cancelled` the same grey. Two queue cards shared one amber.
 *
 * WHY IT VISITS SEVERAL ROUTES. Check A compares a class's computed value
 * ACROSS routes, because that is the only way the cell-link split was visible:
 * on any single screen every cell-link agrees with itself. A one-page run would
 * have reported nothing.
 *
 * Exit code 1 if anything is found, so it can gate a build.
 *
 * Driven over the DevTools protocol with Node's built-in WebSocket — no
 * Playwright, no Puppeteer, nothing to install. Same approach as
 * scripts/capture-dialog.mjs.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9444);

/* Every route that renders real content. Placeholders are skipped: they share
   one component, so checking 40 of them checks the same markup 40 times. */
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

/* ── the checks, as one source string evaluated in the page ──────────────── */
const PROBE = `(() => {
  const spec = sel => {
    let a=0,b=0,c=0;
    for (const part of sel.replace(/\\s*[>+~]\\s*/g,' ').trim().split(/\\s+/)) {
      a += (part.match(/#[\\w-]+/g)||[]).length;
      b += (part.match(/\\.[\\w-]+/g)||[]).length
         + (part.match(/\\[[^\\]]+\\]/g)||[]).length
         + (part.match(/:(?!:)(?!where)(?!is)[\\w-]+(\\([^)]*\\))?/g)||[]).length;
      c += (part.match(/(^|[\\s>+~])[a-zA-Z][\\w-]*/g)||[]).length
         + (part.match(/::[\\w-]+/g)||[]).length;
    }
    return a*10000 + b*100 + c;
  };

  /* A — a .vy- class rule losing a property to something more specific. A
     modifier of the SAME class (.vy-x.is-active, .vy-x[data-zero]) is what a
     modifier is for and is not reported. */
  const collisions = () => {
    const rules = [];
    for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules } catch { continue }
      for (const r of rs) { if (!r.selectorText || !r.style) continue;
        for (const sel of r.selectorText.split(',')) {
          const s = sel.trim(); if (!s) continue;
          rules.push({ s, spec: spec(s), props: [...r.style].filter(p => !p.startsWith('--')) });
        } } }
    const out = new Map();
    for (const cr of rules.filter(r => /^\\.vy-[\\w-]+$/.test(r.s))) {
      let els; try { els = [...document.querySelectorAll(cr.s)] } catch { continue }
      if (!els.length) continue;
      for (const other of rules) {
        if (other.spec <= cr.spec) continue;
        if (other.s.includes(cr.s.slice(1))) continue;
        const shared = cr.props.filter(p => other.props.includes(p));
        if (!shared.length) continue;
        if (!els.some(e => { try { return e.matches(other.s) } catch { return false } })) continue;
        out.set(cr.s + '|' + other.s, { loser: cr.s, winner: other.s, props: shared });
      }
    }
    return [...out.values()];
  };

  /* The computed value of each flagged property, so the runner can tell a real
     split (the same class rendering differently on two routes) from a rule that
     loses while another supplies the same value. */
  const sample = flagged => {
    const seen = {};
    for (const f of flagged) {
      const el = document.querySelector(f.loser);
      if (!el) continue;
      const cs = getComputedStyle(el);
      for (const p of f.props) seen[f.loser + ' ' + p] = cs[p];
    }
    return seen;
  };

  /* B — two painted siblings touching at 0px with no gap and no margin. */
  const touching = () => {
    const paints = el => { const c = getComputedStyle(el);
      return (c.backgroundColor && c.backgroundColor !== 'rgba(0, 0, 0, 0)')
          || parseFloat(c.borderTopWidth) > 0 || parseFloat(c.borderBottomWidth) > 0; };
    const out = new Set();
    for (const parent of document.querySelectorAll('main *, .vy-page *')) {
      const pc = getComputedStyle(parent);
      if ((pc.display.includes('flex') || pc.display.includes('grid'))
          && pc.rowGap !== 'normal' && parseFloat(pc.rowGap) > 0) continue;
      const kids = [...parent.children].filter(k => k.getClientRects().length);
      for (let i = 1; i < kids.length; i++) {
        const a = kids[i-1], b = kids[i];
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        if (Math.abs(rb.top - ra.bottom) > 0.6 || rb.top < ra.top) continue;
        if (!paints(a) || !paints(b)) continue;
        const ca = getComputedStyle(a), cb = getComputedStyle(b);
        if (parseFloat(ca.marginBottom) > 0 || parseFloat(cb.marginTop) > 0) continue;
        /* A ruled list is meant to touch: rows that each carry their own
           border-bottom and internal padding are one object, not two that
           collided. Compared by BORDER, not by className — the first version
           compared class strings and so reported a plain field row against a
           field row carrying a --wide modifier: two rows of one ruled list. */
        if (parseFloat(ca.borderBottomWidth) > 0 && parseFloat(cb.borderBottomWidth) > 0) continue;
        const nm = e => (typeof e.className === 'string' && e.className ? e.className : e.tagName).slice(0,30);
        out.add(nm(a) + ' | ' + nm(b));
      }
    }
    return [...out];
  };

  /* C — a state painted as its own backdrop, or as another state. The fill is
     checked first, then the accent, because a card carries its state in a bar
     while a swatch carries it in the fill. */
  const colour = () => {
    const behind = el => { let n = el.parentElement;
      while (n) { const c = getComputedStyle(n).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)') { const p = c.match(/[\\d.]+/g);
          if (!c.startsWith('rgba') || Number(p[3]) === 1) return c; }
        n = n.parentElement; } return 'rgb(255, 255, 255)'; };
    /* A pressed tile is a UI state, not a data state, and its tint is not the
       colour that identifies its key. Left in, one pressed KPI made the class's
       fills look varied, so the check read the fill instead of the accent and
       reported the other three tiles as "all render white". */
    const els = [...document.querySelectorAll('[data-status],[data-tone],[data-key]')]
      .filter(e => e.getClientRects().length)
      .filter(e => e.getAttribute('aria-pressed') !== 'true'
                && !e.hasAttribute('data-on')
                && !e.classList.contains('is-active'));
    const invisible = [], groups = {};
    for (const e of els) {
      const cs = getComputedStyle(e), be = getComputedStyle(e, '::before');
      const fill = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : null;
      const state = e.dataset.status || e.dataset.tone || e.dataset.key;
      const cls = (typeof e.className === 'string' ? e.className : '').split(' ')[0];
      if (fill && fill === behind(e) && !(e.textContent||'').trim())
        invisible.push(cls + ' [' + state + '] is painted its own backdrop');
      const edges = ['borderLeftColor','borderTopColor','borderBottomColor','borderRightColor']
        .filter(p => parseFloat(cs[p.replace('Color','Width')]) > 0).map(p => cs[p]);
      const bar = (be.content && be.content !== 'none'
                   && be.backgroundColor !== 'rgba(0, 0, 0, 0)') ? be.backgroundColor : null;
      const accent = bar || edges.find(c => c && c !== 'rgba(0, 0, 0, 0)') || null;
      ((groups[cls] ??= {})[state] ??= { fill, accent });
    }
    /* WHICH PROPERTY CARRIES THE STATE is a per-class question, not a
       per-element one. A KPI tile is a white card on an off-white page, so its
       fill differs from its backdrop and looked like the state colour — every
       tile on five screens was reported as "all render rgb(255,255,255)". It is
       the fill being IDENTICAL across states that proves it carries nothing;
       the accent is then what identifies the state. */
    const shared = [];
    for (const [cls, states] of Object.entries(groups)) {
      const entries = Object.entries(states);
      if (entries.length < 2) continue;
      const fills = new Set(entries.map(([, v]) => v.fill));
      const useFill = fills.size > 1;
      const byColour = {};
      for (const [st, v] of entries) {
        const c = useFill ? v.fill : v.accent;
        if (!c) continue;
        (byColour[c] ??= []).push(st);
      }
      for (const [c, sts] of Object.entries(byColour))
        if (sts.length > 1) shared.push(cls + ': ' + sts.join(' = ') + ' all render ' + c
          + (useFill ? '' : ' (accent)'));
    }
    return { invisible, shared };
  };

  const flagged = collisions();
  /* Keyed by the element's FULL class list, not by the selector asked for.
     vy-ident is typographic — mono, tabular — and takes its colour from
     whatever it is composed with: brand blue beside vy-cell-link on a list,
     near-black standing alone on a record. Keyed by selector alone that read as
     one class resolving two ways, which is correct and not a defect. Keyed by
     composition, only a genuinely identical element rendering differently is
     reported — which is exactly the cell-link case, where the class list
     matches and only the tag differs. */
  const asked = (window.__vyAsk || []).reduce((acc, [sel, prop]) => {
    const el = document.querySelector(sel);
    if (!el) return acc;
    const combo = (typeof el.className === 'string' ? el.className : '')
      .split(/\\s+/).filter(Boolean).sort().join('.');
    acc[(combo ? '.' + combo : sel) + ' ' + prop] = getComputedStyle(el)[prop];
    return acc;
  }, {});
  return { collisions: flagged, computed: { ...sample(flagged), ...asked },
           touching: touching(), colour: colour() };
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

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-render-'));
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

  const findings = [];
  const acrossRoutes = {};   // "selector prop" -> { value: [routes] }

  /* TWO PASSES, and the first version had only one — which is why it missed the
     very bug it was written for. A collision is only DETECTED on routes where
     an element matches the winning selector: Project Requirements renders its
     identifier as an <a> and matches `.k-grid a`, Part Master renders a
     <button> and does not. Sampling only where the collision was seen gave one
     value, one route, and nothing to compare it with. Pass 2 asks every route
     for the same properties, including the routes that never flagged. */
  const visit = async (route, ask) => {
    await send('Page.navigate', { url: BASE + route });
    await sleep(3200);
    await send('Runtime.evaluate',
      { expression: `window.__vyAsk = ${JSON.stringify(ask)}`, returnByValue: true });
    const r = await send('Runtime.evaluate',
      { expression: PROBE, awaitPromise: true, returnByValue: true });
    return r.result?.result?.value;
  };

  const wanted = new Set();
  for (const route of ROUTES) {
    const v = await visit(route, []);
    if (!v) { findings.push({ route, kind: 'probe', detail: 'page did not render' }); continue; }
    for (const t of v.touching)         findings.push({ route, kind: 'touching', detail: t });
    for (const i of v.colour.invisible) findings.push({ route, kind: 'invisible', detail: i });
    for (const s of v.colour.shared)    findings.push({ route, kind: 'same-colour', detail: s });
    for (const c of v.collisions) for (const p of c.props) wanted.add(c.loser + '\u0000' + p);
  }

  const ask = [...wanted].map(k => k.split('\u0000'));
  if (ask.length) {
    for (const route of ROUTES) {
      const v = await visit(route, ask);
      if (!v) continue;
      for (const [k, val] of Object.entries(v.computed)) {
        ((acrossRoutes[k] ??= {})[val] ??= []).push(route);
      }
    }
  }

  /* A class whose computed value for a property differs between routes is the
     cell-link shape: one rule winning here and losing there. A collision whose
     value is the same everywhere is a declaration that loses to a rule
     supplying the same result — noise, and not reported. */
  for (const [k, values] of Object.entries(acrossRoutes)) {
    if (Object.keys(values).length < 2) continue;
    const where = Object.entries(values).map(([v, rs]) => `${v} on ${rs.join(', ')}`).join('  /  ');
    findings.push({ route: '(across routes)', kind: 'specificity', detail: `${k} resolves two ways — ${where}` });
  }

  /* Teardown never decides the exit code. Chrome keeps writing to its profile
     for a moment after kill(), and an ENOTEMPTY from a temp directory is not a
     reason to fail a check that has already run. */
  ws.close();
  chrome.kill();
  await new Promise(r => chrome.once('exit', r));
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }

  console.log(`routes ${ROUTES.length}  findings ${findings.length}`);
  for (const f of findings) console.log(`  [${f.kind}] ${f.route}\n      ${f.detail}`);
  if (!findings.length) console.log('  nothing painted wrong');
  process.exit(findings.length ? 1 : 0);
}

main().catch(e => { console.error(e.message); process.exit(2); });
