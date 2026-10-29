/**
 * The figures for `docs/so-sanh-prototype-16oct.html` — her screen beside ours,
 * annotated in the page before the shutter rather than in an editor after it.
 *
 *   npm run dev                                   # in another terminal
 *   cp "Quoting BoM 16 Oct 1.html" public/_proto/quoting-bom-16oct.html
 *   node scripts/capture-compare.mjs
 *
 * HER PROTOTYPE IS NOT IN THIS REPO. It is the customer's file; it is served
 * from `public/_proto/`, which is deleted once the figures exist, so nothing
 * here commits her work into our tree. The script says so by failing with that
 * instruction when the file is missing.
 *
 * THE CALLOUTS ARE MEASURED, NOT DRAWN. Each mark names an element; the box is
 * that element's own `getBoundingClientRect()`, positioned `fixed` over it.
 * A rectangle drawn by eye in an image editor is a rectangle that drifts the
 * first time either screen changes, and this document exists precisely because
 * the two screens keep changing.
 *
 * Both sides are photographed at 1440x900, the same metrics `capture-shots.mjs`
 * uses for desktop, so a difference in how much fits on one screen is a real
 * difference and not an artefact of two window sizes.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9458);
const OUT = process.env.SHOTS_OUT || 'docs/shots/compare-16oct';
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PROTO = 'public/_proto/quoting-bom-16oct.html';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---- page helpers, injected before every job ----------------------------- */
const HELPERS = `
window.__byText = (sel, re) =>
  Array.from(document.querySelectorAll(sel)).find(e => re.test(e.textContent.trim()));
window.__card = re =>
  Array.from(document.querySelectorAll('.card')).find(c => re.test(c.textContent.trim()));
/* The record paints a skeleton first, so every click here waits for its
   target rather than assuming one render is enough. */
window.__wait = async (fn, ms = 6000) => {
  const t0 = Date.now();
  for (;;) {
    const v = fn();
    if (v) return v;
    if (Date.now() - t0 > ms) throw new Error('timed out waiting for ' + fn);
    await new Promise(r => setTimeout(r, 100));
  }
};
window.__setVal = (el, v) => {
  const proto = el.tagName === 'TEXTAREA'
    ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
};
/* One outline per mark, over the element, in the page's own coordinates. */
window.__mark = marks => {
  document.querySelectorAll('.vycmp').forEach(e => e.remove());
  const css = document.getElementById('vycmp-css') || document.createElement('style');
  css.id = 'vycmp-css';
  css.textContent = \`
    .vycmp { position: fixed; z-index: 2147483647; pointer-events: none;
             border: 3px solid #E0552A; border-radius: 8px;
             box-shadow: 0 0 0 3px rgba(224,85,42,.22); }
    .vycmp > b { position: absolute; inset-block-start: -14px; inset-inline-start: -14px;
                 inline-size: 28px; block-size: 28px; border-radius: 50%;
                 background: #E0552A; color: #fff; text-align: center;
                 font: 700 15px/28px ui-sans-serif, system-ui, sans-serif; }\`;
  document.head.appendChild(css);
  const missing = [];
  for (const [n, el] of marks) {
    if (!el) { missing.push(n); continue; }
    const r = el.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'vycmp';
    d.style.left = r.left + 'px'; d.style.top = r.top + 'px';
    d.style.width = r.width + 'px'; d.style.height = r.height + 'px';
    d.innerHTML = '<b>' + n + '</b>';
    document.body.appendChild(d);
  }
  return missing;
};
`;

const STOP_MOTION = `(() => {
  const s = document.createElement('style');
  s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(s);
})()`;

/* ---- the seven figures --------------------------------------------------- */
const HER = '/_proto/quoting-bom-16oct.html';
const REC = '/sales-management/quotation/rfq-67';

/* Our wizard will not leave step 1 with the assembly blank — which is the
   point of one of the figures — so the step-2 job fills it the way a user
   would, through the fields themselves. */
const FILL_STEP1 = `
  __setVal(await __wait(() => document.querySelector('input[aria-label="Assembly Part Number"]')), '9001234');
  __setVal(document.querySelector('input[aria-label="Revision"]'), 'A');
  __setVal(document.querySelector('textarea[aria-label="Description"]'), 'Sensor interface PCBA');
  /* TEMPLATE IS REQUIRED SINCE 29 OCT, and this script found out the way a
     user would: Next stopped working. A ComboBox cannot be filled by setting
     its input, so it is opened and the first option is clicked. */
  const tplField = __byText('.vy-quote-config-field', /^Template/);
  tplField.querySelector('.k-input-button, .k-select').click();
  (await __wait(() => document.querySelector('.k-animation-container li.k-list-item'))).click();
  await new Promise(r => setTimeout(r, 300));
  __byText('button', /^Next$/).click();
  await new Promise(r => setTimeout(r, 900));
`;

const OPEN_WIZARD = `
  (await __wait(() => __byText('button', /^Run Quotation$/))).click();
  await __wait(() => document.querySelector('.vy-run-step--config'));
  await new Promise(r => setTimeout(r, 600));
`;

/* The loading screens, for the "what you see while you wait" section of the
   document. Three of them live for well under a second by design, so these
   jobs skip the readiness wait and photograph the page while it is still
   coming up — `wait` is the whole exposure. */
const LOADING_JOBS = [
  {
    /* The landing, which only exists for one beat of the specimen's loop. */
    /* Caught mid-pulse on purpose: the ring is only on screen for 800ms and
       it is half the point of the arrival. */
    name: 'load-landing', route: '/design-system', prep: `
      const art = await __wait(() => document.querySelector('.vy-ds-motion-art'));
      const ring = art.querySelector('svg circle[fill="none"]');
      await __wait(() => parseFloat(ring.getAttribute('opacity') || '0') > 0.45, 30000);
      art.scrollIntoView({ block: 'center' });`,
    clip: '.vy-ds-motion-art',
    marks: `[]`,
  },
  { name: 'load-record', route: REC, wait: 260, raw: true },
  { name: 'load-grid', route: '/sales-management/quotation', wait: 260, raw: true },
];

const JOBS = [
  {
    name: 'her-step1', route: HER,
    marks: `[
      [1, __card(/Select Action/)],
      [2, document.querySelector('#tpl')?.closest('.f') || document.querySelector('#tpl')?.parentElement?.parentElement],
      [3, __card(/Continue from Drafts/)],
      [4, document.querySelector('.attl')],
    ]`,
  },
  {
    name: 'her-step2', route: HER,
    prep: `__byText('button', /^Next/).click(); await new Promise(r => setTimeout(r, 500));`,
    marks: `[[6, __card(/Quote Setup/)]]`,
  },
  {
    name: 'her-result', route: HER,
    prep: `__byText('button', /Quote result/).click(); await new Promise(r => setTimeout(r, 500));`,
    marks: `[
      [8, document.querySelector('select')?.parentElement],
      [9, __byText('button', /^Add Package$/)],
      [10, __byText('button', /^Pricing Detail$/)],
      [11, __byText('button', /^Import$/)?.parentElement],
    ]`,
  },
  {
    name: 'ours-step1-top', route: REC, prep: OPEN_WIZARD,
    marks: `[
      [1, document.querySelector('.vy-run-section .vy-radios')],
      [5, __byText('.vy-quote-config-field', /Select Column Detection/)],
    ]`,
  },
  {
    name: 'ours-step1-bottom', route: REC,
    prep: OPEN_WIZARD + `
      (await __wait(() => document.querySelector('.vy-run-draft-list'))).scrollIntoView({ block: 'end' });
      await new Promise(r => setTimeout(r, 400));`,
    marks: `[
      [2, __byText('.vy-quote-config-field', /Select template/)],
      [3, document.querySelector('.vy-run-draft-list')],
      [4, document.querySelector('.vy-attachments')],
    ]`,
  },
  {
    name: 'ours-step2', route: REC, prep: OPEN_WIZARD + FILL_STEP1,
    marks: `[
      [6, document.querySelector('.vy-quote-context')],
      [7, document.querySelector('.vy-run-banner')],
    ]`,
  },
  {
    /* One part with three manufacturers, close up: the question is whether
       the line's own cells read as one merged block across the group. */
    name: 'ours-step2-group', route: REC, prep: OPEN_WIZARD + FILL_STEP1,
    marks: `[]`, clip: '.vy-minitable-k',
  },
  {
    /* Step 3's strip is the editable one — nine pickers rather than twelve
       read-only facts — so it is the other half of any argument about how
       that strip is laid out. */
    name: 'ours-step3', route: REC, prep: OPEN_WIZARD + FILL_STEP1 + `
      __byText('button', /^Next$/).click();
      await __wait(() => __byText('button', /Get Prices/));
      await new Promise(r => setTimeout(r, 500));`,
    marks: `[[6, document.querySelector('.vy-quote-context')]]`,
  },
  {
    /* The busy overlay, caught during the one wait in this build that is real:
       Get Prices runs a timer that stands in for a marketplace request. */
    name: 'load-busy', route: REC, prep: OPEN_WIZARD + FILL_STEP1 + `
      __byText('button', /^Next$/).click();
      await __wait(() => __byText('button', /Get Prices/));
      await new Promise(r => setTimeout(r, 400));
      __byText('button', /Get Prices/).click();
      await new Promise(r => setTimeout(r, 700));`,
    marks: `[]`,
  },
  {
    /* The error state, by breaking a panel on purpose — the design system
       carries a specimen that throws during render, and the boundary that
       wraps every route catches it. */
    name: 'load-error', route: '/design-system', prep: `
      (await __wait(() => __byText('button', /^Break this panel$/))).click();
      await __wait(() => __byText('h2, h3, strong, p', /went wrong|try again|Reload/i));
      await new Promise(r => setTimeout(r, 500));
      document.querySelector('.vy-ds-errorstate').scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 300));`,
    marks: `[]`,
  },
  {
    name: 'ours-result', route: REC,
    prep: `
      /* Kendo's TabStrip is a list of .k-link spans, not buttons. */
      (await __wait(() => __byText('.k-link', /Quotation Result/))).click();
      /* The eye, since 29 Oct — guideline 2.1 §4 opens a result that way. */
      (await __wait(() => document.querySelector('.vy-tabpanel .vy-icon-btn'))).click();
      await __wait(() => __byText('button', /^Pricing Detail$/));
      await new Promise(r => setTimeout(r, 600));`,
    marks: `[
      [10, __byText('button', /^Pricing Detail$/)],
      [11, __byText('button', /^Import$/)],
    ]`,
  },
];

async function main() {
  const wantsHers = (process.argv.slice(2).length
    ? process.argv.slice(2).some(n => n.startsWith('her-'))
    : true);
  if (wantsHers && !fs.existsSync(PROTO)) {
    console.error(`Missing ${PROTO}.\n`
      + 'Copy the customer\'s "Quoting BoM 16 Oct 1.html" there first; it is not tracked.');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  /* `node scripts/capture-compare.mjs ours-result` re-shoots one figure when
     one screen changed, instead of all seven — and, more to the point, without
     needing her prototype on disk for the jobs it is not taking. */
  const only = process.argv.slice(2);
  const all = [...JOBS, ...LOADING_JOBS];
  const jobs = only.length ? all.filter(j => only.includes(j.name)) : JOBS;
  if (!jobs.length) { console.error(`no job named ${only.join(', ')}`); process.exit(1); }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-cmp-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--force-device-scale-factor=1', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
  const release = cleanupOnKill(chrome, profile);

  const ws = new WebSocket(await connectToChrome(PORT, chrome));
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise(res => {
    const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params }));
  });
  const run = async expr => {
    const r = await send('Runtime.evaluate',
      { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails || r.result?.result?.subtype === 'error') {
      throw new Error(JSON.stringify(r.result).slice(0, 400));
    }
    return r.result?.result?.value;
  };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',
    { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  let bad = 0;
  for (const job of jobs) {
    await send('Page.navigate', { url: BASE + job.route });
    /* A raw job is photographing the page BEFORE it is ready, which is the
       whole point of it: the record skeleton lives 700ms. */
    if (job.raw) {
      await sleep(job.wait ?? 300);
      const shot0 = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
      const file0 = path.join(OUT, `${job.name}.jpg`);
      fs.writeFileSync(file0, Buffer.from(shot0.result.data, 'base64'));
      console.log(`  ${job.name} -> ${file0} (${(fs.statSync(file0).size / 1024).toFixed(0)} KB)`);
      continue;
    }
    await sleep(1400);
    await run(HELPERS);
    /* Vite's first transform of a cold route outruns a fixed sleep, and a shot
       of a blank page still weighs 8KB and still gets written. */
    await run(`__wait(() => document.querySelector('.card, .vy-app, main, #root > *'))`);
    await run(STOP_MOTION);
    if (job.prep) await run(`(async () => { ${job.prep} })()`);
    /* NO_MARKS=1 takes the same figure without the callouts — for showing a
       screen as it is, rather than arguing about parts of it. */
    const missing = process.env.NO_MARKS ? [] : await run(`__mark(${job.marks})`);
    if (missing?.length) { console.warn(`  ${job.name}: no element for mark(s) ${missing}`); bad++; }

    /* `clip` photographs one element rather than the viewport, at 3x, for the
       figures that are about a 300px drawing rather than about a screen. */
    let clip;
    if (job.clip) {
      clip = await run(`(() => { const e = document.querySelector(${JSON.stringify(job.clip)});
        if (!e) return null; const r = e.getBoundingClientRect();
        return { x: r.left, y: r.top, width: r.width, height: r.height, scale: 3 }; })()`);
      if (!clip) console.warn(`  ${job.name}: nothing matched ${job.clip}`);
    }
    const shot = await send('Page.captureScreenshot',
      { format: 'jpeg', quality: 90, ...(clip ? { clip } : {}) });
    const data = shot.result?.data;
    if (!data) { console.error(`  ${job.name}: no image`); bad++; continue; }
    const file = path.join(OUT, `${job.name}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    console.log(`  ${job.name} -> ${file} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
  }

  ws.close(); chrome.kill(); release();
  process.exit(bad ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
