/**
 * Capture the figures the comparison document needs.
 *
 *   npm run dev            # in another terminal
 *   node scripts/capture-shots.mjs
 *
 * `capture-dialog.mjs` takes one shot of one dialog. This takes the whole set,
 * at two device sizes, because the phone figures have to be captured the same
 * way every time to be worth comparing to each other.
 *
 * EVERY SHOT IS THE MOCKUP. There are no live-system phone captures and there
 * will not be: that would mean signing into the customer's production system,
 * and the document says plainly that we have only audited it at desktop size.
 * A figure captioned "live" that was not captured live would be worse than no
 * figure at all.
 *
 * TRANSITIONS ARE STOPPED BEFORE EVERY CAPTURE. A drawer caught mid-slide
 * photographs as a half-open drawer, and the reader cannot tell that from a
 * layout bug. The same rule the checks use.
 *
 * JPEG rather than PNG, quality 82: these are embedded as data URIs in a
 * document that already carries five desktop captures, and a 16MB ceiling.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9455);
const OUT = 'docs/shots';
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const PHONE = { width: 375, height: 812, mobile: true, scale: 2 };
const DESK = { width: 1440, height: 900, mobile: false, scale: 1 };

/* `prep` runs in the page after load and before the capture. It may click,
   set preferences, or scroll; it returns when the page is settled. */
const JOBS = [
  // ---- phone -------------------------------------------------------------
  { name: 'ph-mock-partmaster', route: '/engineering/part-mst', vp: PHONE },
  { name: 'ph-mock-record', route: '/sales-management/quotation/rfq-1', vp: PHONE },
  { name: 'ph-mock-queues', route: '/my-queues', vp: PHONE },
  { name: 'ph-mock-login', route: '/login', vp: PHONE },
  {
    name: 'ph-mock-nav', route: '/engineering/mpn', vp: PHONE,
    prep: `(async () => {
      document.querySelector('.vy-nav-toggle').click();
      await new Promise(r => setTimeout(r, 500));
    })()`,
  },
  {
    name: 'ph-mock-compact', route: '/engineering/mpn', vp: PHONE,
    density: 'compact',
  },
  {
    name: 'ph-mock-comfortable', route: '/engineering/mpn', vp: PHONE,
    density: 'comfortable',
  },
  // ---- desktop screens the document lists but never shows -----------------
  { name: 'dk-mock-mfg', route: '/engineering/mfg', vp: DESK },
  { name: 'dk-mock-mpn', route: '/engineering/mpn', vp: DESK },
  { name: 'dk-mock-packing', route: '/inventory-management/packing-list', vp: DESK },
  { name: 'dk-mock-bom', route: '/engineering/bom', vp: DESK },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

const STOP_MOTION = `(() => {
  const s = document.createElement('style');
  s.id = 'vy-stop-motion';
  s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(s);
  document.body.getBoundingClientRect();
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

  fs.mkdirSync(OUT, { recursive: true });

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-shots-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--force-device-scale-factor=1', '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });

  const ws = new WebSocket(await connect());
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) =>
    new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Page.enable'); await send('Runtime.enable');

  for (const job of JOBS) {
    const vp = job.vp;
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height,
      deviceScaleFactor: vp.scale, mobile: vp.mobile });
    await send('Emulation.setTouchEmulationEnabled',
      { enabled: vp.mobile, maxTouchPoints: vp.mobile ? 5 : 0 });

    await send('Page.navigate', { url: BASE + job.route });
    await sleep(1200);

    if (job.density) {
      await send('Runtime.evaluate', {
        expression: `localStorage.setItem('vy.density', ${JSON.stringify(job.density)})`,
        returnByValue: true });
      await send('Page.reload');
    }
    await sleep(3400);

    await send('Runtime.evaluate', { expression: STOP_MOTION, returnByValue: true });
    if (job.prep) {
      await send('Runtime.evaluate',
        { expression: job.prep, awaitPromise: true, returnByValue: true });
    }
    await sleep(500);

    /* Assert the page actually rendered something of ours before saving a
       picture of it — a blank capture still looks like a file. */
    const ok = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('.vy-shell, .vy-login')`,
      returnByValue: true });
    if (!ok.result?.result?.value) {
      console.error(`  ${job.name}: page did not render — skipped`);
      continue;
    }

    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    const data = shot.result?.data;
    if (!data) { console.error(`  ${job.name}: no image returned`); continue; }
    const file = path.join(OUT, job.name + '.jpg');
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    const kb = Math.round(fs.statSync(file).size / 1024);
    console.log(`  ${job.name.padEnd(22)} ${vp.width}x${vp.height}  ${kb}KB  ${job.route}`);
  }

  /* Leave the preference as the app ships it. */
  await send('Runtime.evaluate',
    { expression: `localStorage.setItem('vy.density','comfortable')`, returnByValue: true });

  ws.close();
  chrome.kill();
  await new Promise(r => chrome.once('exit', r));
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }
  console.log('done');
}

main().catch(e => { console.error(e.message); process.exit(2); });
