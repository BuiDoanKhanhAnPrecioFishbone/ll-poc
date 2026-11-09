/**
 * Figures for the component pages, captured from a real screen.
 *
 *   node scripts/with-server.mjs comp:shots
 *
 * WHY A SECOND CAPTURE SCRIPT. `capture-design-system.mjs` photographs the
 * specimen page, which is where the token figures live. The toolbar
 * components do not appear there and cannot sensibly be put there: a filter
 * panel with no grid behind it is a row of empty selects. So these are taken
 * from Project Requirements, which is the screen they actually live on.
 *
 * AND WHY THAT IS SAFE HERE, when `states-field-*` are still manual. Those
 * were shot against a record typed by hand — Halden Marine, a project number
 * that is in no fixture — so a script cannot reproduce them without inventing
 * content. Everything below is on seeded data, so the same command gives the
 * same picture on anyone's machine.
 *
 * EACH FIGURE DECLARES ITS OWN PREP, runs it, waits, and clips to a named
 * element. A step that cannot find what it needs fails the run rather than
 * saving a picture of the wrong thing — a blank capture still looks like a
 * file.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const OUT = process.env.COMP_SHOTS_OUT || 'docs/assets/components';
const PORT = Number(process.env.CDP_PORT || 9474);
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const EXTRA_FLAGS = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const LIST = '/sales-management/quotation';
const RECORD = '/sales-management/quotation/rfq-1';
const HOME = '/';
const QUEUES = '/my-queues';

const FIGURES = [
  {
    name: 'filter-toolbar',
    route: LIST,
    prep: `(() => {
      const f = [...document.querySelectorAll('button')].find(b => /vy-funnel/.test(b.className));
      if (!f) return 'no funnel';
      f.click();
      return 'opened';
    })()`,
    clip: '.vy-filter-toolbar',
  },
  {
    name: 'column-chooser',
    route: LIST,
    prep: `(() => {
      const b = [...document.querySelectorAll('button')].find(x => /^Columns/.test(x.textContent.trim()));
      if (!b) return 'no Columns button';
      b.click();
      return 'opened';
    })()`,
    clip: '.vy-popover',
  },
  {
    name: 'view-picker',
    route: LIST,
    prep: `'nothing to open'`,
    clip: '.vy-view-picker',
    pad: 10,
  },
  {
    name: 'pager',
    route: LIST,
    prep: `'nothing to open'`,
    clip: '.vy-pager',
  },
  {
    /* The priority column alone: the header cell plus the first six rows,
       which is where all three levels appear together. A single `.vy-priority`
       is 20px tall and says nothing about the scale. */
    name: 'priority',
    route: LIST,
    prep: `'nothing to open'`,
    box: `(() => {
      const th = [...document.querySelectorAll('th')].find(t => /Priority/.test(t.textContent));
      const rows = [...document.querySelectorAll('tbody tr')].slice(0, 6);
      if (!th || !rows.length) return null;
      const a = th.getBoundingClientRect();
      const last = rows[rows.length - 1].getBoundingClientRect();
      return { x: a.x - 12, y: a.y - 12, width: a.width + 24, height: (last.bottom - a.top) + 24 };
    })()`,
  },
  {
    name: 'pattern-record-view',
    route: RECORD,
    prep: `'nothing to open'`,
    clip: '.vy-record-panel, .vy-record, main',
    pad: 0,
  },
  {
    name: 'pattern-record-edit',
    route: RECORD,
    prep: `(() => {
      const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Edit');
      if (!b) return 'no Edit button';
      b.click();
      return 'editing';
    })()`,
    clip: '.vy-record-panel, .vy-record, main',
    pad: 0,
  },
  /* NO pattern-discard FIGURE. The discard confirmation only opens when the
     record actually has unsaved changes, and a synthetic `input` event on a
     controlled field does not produce one — the dialog never appeared and the
     run failed on a missing clip rather than saving a picture of the record
     behind it, which is the behaviour this script is supposed to have. Driving
     a real edit from here would mean knowing which field on which record is
     safe to type into, which is the kind of knowledge that rots. The dialog is
     described in words on the pattern page instead. */
  {
    name: 'view-setting',
    route: LIST,
    prep: `(() => {
      const b = [...document.querySelectorAll('button')].find(x => /view-setting|vy-gear|Setup View/i.test(x.className + (x.getAttribute('aria-label') || '') + x.textContent));
      if (!b) return 'no View Setting button';
      b.click();
      return 'opened';
    })()`,
    clip: '.vy-viewsetting, aside[role="dialog"], [role="dialog"]',
    pad: 0,
  },
  {
    name: 'datagrid',
    route: LIST,
    prep: `'nothing to open'`,
    box: `(() => {
      const g = document.querySelector('.vy-grid-k, .k-grid');
      if (!g) return null;
      const head = g.querySelector('thead tr');
      const rows = [...g.querySelectorAll('tbody tr')].slice(0, 7);
      if (!head || !rows.length) return null;
      const a = head.getBoundingClientRect();
      const last = rows[rows.length - 1].getBoundingClientRect();
      return { x: a.x, y: a.y - 8, width: Math.min(a.width, 1180), height: (last.bottom - a.top) + 16 };
    })()`,
  },
  {
    name: 'tabs',
    route: RECORD,
    prep: `'nothing to open'`,
    clip: '.vy-tabs .k-tabstrip-items-wrapper, .vy-tabs',
    pad: 8,
  },
  {
    name: 'pattern-wizard',
    route: RECORD,
    prep: `(() => {
      const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Run Quotation');
      if (!b) return 'no Run Quotation button';
      b.click();
      return 'opened';
    })()`,
    clip: '.vy-run-nav, [role="dialog"]',
    pad: 0,
  },
  {
    /* The Home chart, light and dark. It is the one figure in this set whose
       point is COLOUR rather than layout: the five series are drawn from the
       status palette, and on 9 Nov the In-Progress fill measured 1.12:1 on the
       light card and 1.37:1 on the dark one. A picture of the stack in both
       themes is what makes a repeat of that visible at a glance. */
    name: 'pattern-dashboard',
    route: HOME,
    prep: `(() => document.querySelector('.vy-chart') ? 'drawn' : 'no chart')()`,
    clip: '.vy-chart-card',
    pad: 0,
  },
  {
    /* The four queue tiles, on Team — Mine depends on which of the 330 seeded
       RFQs happen to carry this user, and a figure that is four zeros on
       someone else's machine is not the figure. Team is every RFQ, so the row
       is populated by construction. */
    name: 'pattern-queues',
    route: QUEUES,
    prep: `(() => {
      const b = [...document.querySelectorAll('.vy-scope-btn')].find(x => x.textContent.trim() === 'Team');
      if (!b) return 'no Team toggle';
      b.click();
      return 'team';
    })()`,
    clip: '.vy-queue-row',
    pad: 0,
  },
  {
    /* THE CONTENT CAP, which only exists above it. At 1440 every shape is still
       narrower than 1180 + its gutters, so a 1440 figure would show nothing;
       1920 is the first common width where the cap and the width it declines
       to use are both on screen. */
    name: 'layout-cap',
    route: HOME,
    width: 1920,
    prep: `(() => document.querySelector('.vy-chart-card') ? 'drawn' : 'no card')()`,
    clip: '.vy-content, .vy-main',
    pad: 0,
  },
  {
    name: 'pattern-search',
    route: HOME,
    prep: `(() => {
      const b = document.querySelector('.vy-search');
      if (!b) return 'no search button';
      b.click();
      return 'opened';
    })()`,
    clip: '.vy-palette',
    pad: 0,
  },
  {
    name: 'more-menu',
    route: RECORD,
    prep: `(() => {
      const b = [...document.querySelectorAll('button')].find(x => /vy-more-btn/.test(x.className));
      if (!b) return 'no More button';
      b.click();
      return 'opened';
    })()`,
    clip: '.vy-more-menu',
  },
];

const STOP_MOTION = `(() => {
  const s = document.createElement('style');
  s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(s);
  document.body.getBoundingClientRect();
})()`;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-comp-'));
const chrome = spawn(CHROME, [...EXTRA_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--force-device-scale-factor=1', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
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
/* The default metrics. A figure may ask for its own `width`, and one does:
   the layout cap is only visible on a window wider than the cap. */
const DEFAULT_W = 1440;
const setMetrics = width => send('Emulation.setDeviceMetricsOverride',
  { width, height: 900, deviceScaleFactor: 2, mobile: false });
await setMetrics(DEFAULT_W);

fs.mkdirSync(OUT, { recursive: true });
const failed = [];
let written = 0;

/* Re-shoot a subset: `COMP_SHOTS_ONLY=pattern-search,pattern-queues`. Added
   when the set reached fifteen figures and adding one meant re-rendering the
   fourteen that had not changed — thirty captures, and thirty new PNGs in the
   diff for one new picture. A name that matches nothing fails the run rather
   than quietly shooting everything. */
const ONLY = (process.env.COMP_SHOTS_ONLY || '').split(',').map(x => x.trim()).filter(Boolean);
const shots = ONLY.length ? FIGURES.filter(f => ONLY.includes(f.name)) : FIGURES;
if (ONLY.length) {
  const unknown = ONLY.filter(n => !FIGURES.some(f => f.name === n));
  if (unknown.length) {
    console.error(`comp:shots — no such figure: ${unknown.join(', ')}`);
    ws.close(); chrome.kill(); release?.(); process.exit(2);
  }
  console.log(`  only: ${ONLY.join(', ')}`);
}

for (const theme of ['light', 'dark']) {
  for (const fig of shots) {
    /* A fresh load per figure: the previous figure left a panel open. */
    await setMetrics(fig.width || DEFAULT_W);
    await send('Page.navigate', { url: BASE + (fig.route || LIST) });
    await sleep(1200);
    await evalJs(`localStorage.setItem('vy.theme', ${JSON.stringify(theme)})`);
    await send('Page.reload');
    await sleep(3200);
    const applied = await evalJs(`document.documentElement.getAttribute('data-theme')`);
    if (applied !== theme) { failed.push(`${fig.name}: theme ${applied || 'system'} not ${theme}`); continue; }

    await evalJs(STOP_MOTION);
    const prep = fig.await
      ? (await send('Runtime.evaluate', { expression: fig.prep, awaitPromise: true, returnByValue: true })).result?.result?.value
      : await evalJs(fig.prep);
    if (typeof prep === 'string' && prep.startsWith('no ')) { failed.push(`${fig.name}: ${prep}`); continue; }
    await sleep(600);

    const pad = fig.pad ?? 16;
    const box = fig.box ? await evalJs(fig.box) : await evalJs(`(() => {
      const el = document.querySelector(${JSON.stringify(fig.clip)});
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return null;
      return { x: r.x - ${pad}, y: r.y - ${pad}, width: r.width + ${pad * 2}, height: r.height + ${pad * 2} };
    })()`);
    if (!box) { failed.push(`${fig.name}: ${fig.clip} not found or zero-sized`); continue; }
    await sleep(250);

    const shot = await send('Page.captureScreenshot',
      { format: 'png', clip: { ...box, scale: 2 }, captureBeyondViewport: true });
    if (!shot.result?.data) { failed.push(`${fig.name}: no image`); continue; }
    const file = path.join(OUT, theme === 'dark' ? `${fig.name}-dark.png` : `${fig.name}.png`);
    fs.writeFileSync(file, Buffer.from(shot.result.data, 'base64'));
    written++;
    console.log(`  ${path.basename(file).padEnd(26)} ${Math.round(fs.statSync(file).size / 1024)}KB  ${Math.round(box.width)}x${Math.round(box.height)}`);
  }
}

ws.close(); chrome.kill(); release?.();
console.log(`\n${written} figures written to ${OUT}`);
if (failed.length) { failed.forEach(f => console.error(`  FAILED  ${f}`)); process.exit(1); }
