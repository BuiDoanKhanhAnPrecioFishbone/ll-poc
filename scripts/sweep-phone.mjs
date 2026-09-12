/* Every route at phone size, plus the states a route sweep never reaches.
   For LOOKING at, not for measuring — the last defect on this app was visible
   in a figure while every automated check called the page clean. */
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const BASE = 'http://localhost:5180';
const PORT = 9459;
const OUT = '/private/tmp/claude-501/-Users-nguyenhuyen-development-LL/1a814b96-7e63-4bbd-baa8-28794bd32c3d/scratchpad/sweep';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const JOBS = [
  { n: '01-home', r: '/' },
  { n: '02-queues', r: '/my-queues' },
  { n: '03-quotations', r: '/sales-management/quotation' },
  { n: '04-record', r: '/sales-management/quotation/rfq-1' },
  { n: '05-partmaster', r: '/engineering/part-mst' },
  { n: '06-bom', r: '/engineering/bom' },
  { n: '07-mpn', r: '/engineering/mpn' },
  { n: '08-mfg', r: '/engineering/mfg' },
  { n: '09-packing', r: '/inventory-management/packing-list' },
  { n: '10-login', r: '/login' },
  { n: '11-sitemap', r: '/sitemap' },
  { n: '12-designsystem', r: '/design-system' },
  // states no route sweep reaches
  { n: '13-drawer', r: '/engineering/mpn',
    prep: `(async()=>{document.querySelector('.vy-nav-toggle').click();await new Promise(r=>setTimeout(r,450));})()` },
  { n: '14-usermenu', r: '/',
    prep: `(async()=>{document.querySelector('.vy-avatar').click();await new Promise(r=>setTimeout(r,450));})()` },
  { n: '15-dialog-newpart', r: '/engineering/part-mst',
    prep: `(async()=>{const b=[...document.querySelectorAll('button')].find(x=>/^New Part$/.test(x.textContent.trim()));b.click();await new Promise(r=>setTimeout(r,900));})()` },
  { n: '16-columns', r: '/engineering/mpn',
    prep: `(async()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Columns/.test(x.textContent.trim()));b.click();await new Promise(r=>setTimeout(r,700));})()` },
  { n: '17-filters', r: '/engineering/part-mst',
    prep: `(async()=>{const b=document.querySelector('button[aria-label="Show filter toolbar"]')||[...document.querySelectorAll('.vy-funnel')][0];b.click();await new Promise(r=>setTimeout(r,700));})()` },
  { n: '18-record-edit', r: '/sales-management/quotation/rfq-1',
    prep: `(async()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Edit$/.test(x.textContent.trim()));if(b){b.click();await new Promise(r=>setTimeout(r,900));}})()` },
];

const STOP = `(()=>{const s=document.createElement('style');
  s.textContent='*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(s);document.body.getBoundingClientRect();})()`;

async function connect() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      const p = (await r.json()).find(t => t.type === 'page');
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl; } catch {}
    await sleep(250);
  }
  throw new Error('no debuggable page');
}

fs.mkdirSync(OUT, { recursive: true });
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-sweep-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${PORT}`,
   `--user-data-dir=${profile}`,'--no-first-run','--window-size=375,812','about:blank'],{stdio:'ignore'});
const ws = new WebSocket(await connect()); await new Promise(r => (ws.onopen = r));
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });

await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });

for (const j of JOBS) {
  await send('Page.navigate', { url: BASE + j.r });
  await sleep(3400);
  await send('Runtime.evaluate', { expression: STOP, returnByValue: true });
  if (j.prep) await send('Runtime.evaluate', { expression: j.prep, awaitPromise: true, returnByValue: true });
  await sleep(400);
  /* the width numbers alongside the picture, so a look and a measurement
     disagree loudly rather than quietly */
  const m = await send('Runtime.evaluate', { expression: `(()=>{
    const c=document.querySelector('.vy-content')||document.documentElement;
    const d=document.documentElement;
    return JSON.stringify({shell:c.scrollWidth+'/'+c.clientWidth, doc:d.scrollWidth+'/'+d.clientWidth});
  })()`, returnByValue: true });
  /* THE ASSERTION THIS SCRIPT SHIPPED WITHOUT, and it cost a whole sweep: with
     the dev server down every capture was the same connection-error page, 18
     files of identical byte length, and the width numbers beside them all read
     375/375 because an error page fits any screen. A picture of nothing still
     looks like a picture. */
  const rendered = await send('Runtime.evaluate', {
    expression: `!!document.querySelector('.vy-shell, .vy-login')`, returnByValue: true });
  if (!rendered.result?.result?.value) {
    console.error(`  ${j.n}: THE APP DID NOT RENDER — aborting the sweep`);
    process.exitCode = 2;
    break;
  }
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
  fs.writeFileSync(path.join(OUT, j.n + '.jpg'), Buffer.from(shot.result.data, 'base64'));
  console.log(`  ${j.n.padEnd(20)} ${j.r.padEnd(38)} ${m.result?.result?.value}`);
}
ws.close(); chrome.kill(); await new Promise(r => chrome.once('exit', r));
try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); } catch {}
console.log('saved to', OUT);
