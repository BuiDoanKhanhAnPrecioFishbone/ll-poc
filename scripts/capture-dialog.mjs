/**
 * Screenshot a dialog, which `chrome --screenshot` cannot do: a dialog has to
 * be OPENED first, and that means a click.
 *
 *   node scripts/capture-dialog.mjs <url> <button text> <out.png> [wait ms]
 *
 * Drives Chrome over the DevTools protocol using Node's built-in WebSocket —
 * no Playwright, no Puppeteer, nothing to install. Used for the Run Quotation
 * and BoM Comparison figures in docs/what-changed.md.
 *
 * It clicks by matching a button's exact innerText, and prints `NOT FOUND`
 * rather than silently capturing the page without the dialog — which is the
 * failure that matters here, because the screenshot still looks plausible.
 *
 * IT STARTS ITS OWN CHROME NOW, and stops it. Its instructions used to begin
 * with starting one by hand — `chrome --headless=new ... about:blank &` — and
 * nothing ever stopped that Chrome. The trailing `&` detached it from any
 * terminal that could Ctrl-C it, so every capture left one running, which is
 * the orphan pattern that filled a laptop's disk on 14 Sep 2026, written into
 * the usage line. It was the one Chrome-using script chrome-cleanup.mjs did not
 * cover, because it never launched the Chrome it used.
 *
 * If a Chrome is ALREADY answering on the port, it attaches to that one and
 * leaves it running — it did not start it, so it is not its to stop. Same rule
 * with-server.mjs follows for a dev server.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill } from './chrome-cleanup.mjs';

const PORT = process.env.PORT || 9333;
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const EXTRA_FLAGS = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const answering = async () => {
  try { await fetch(`http://127.0.0.1:${PORT}/json`, { signal: AbortSignal.timeout(1500) }); return true; }
  catch { return false; }
};

let chrome = null;
let profile = null;
if (await answering()) {
  console.log(`attaching to the Chrome already on :${PORT}, and leaving it running`);
} else {
  profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-dialog-'));
  chrome = spawn(CHROME, [...EXTRA_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    'about:blank'], { stdio: 'ignore' });
  cleanupOnKill(chrome, profile);
}

/* Stops only a Chrome this script started. Waits for it to exit before removing
   the profile, for the reason chrome-cleanup.mjs records. */
const finish = async code => {
  if (chrome) {
    chrome.kill();
    await Promise.race([new Promise(r => chrome.once('exit', r)), sleep(3000)]);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }
  }
  process.exit(code);
};

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json`);
      const pages = (await r.json()).filter(t => t.type === 'page');
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('no debuggable page');
}

const ws = new WebSocket(await target());
await new Promise(r => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',
  { width: 1440, height: 1000, deviceScaleFactor: 2, mobile: false });

const [, , url, clickText, outfile, extraWait] = process.argv;

await send('Page.navigate', { url });
await sleep(4500);

// wait for the app to settle
await evaluate(`(async()=>{let p=-1,s=0,t=Date.now();
  while(Date.now()-t<12000){const n=document.querySelectorAll('*').length;
    if(n===p&&n>150){if(++s>=3)break;}else s=0;p=n;await new Promise(r=>setTimeout(r,220));}
  return document.querySelectorAll('*').length;})()`);

if (clickText && clickText !== '-') {
  const clicked = await evaluate(`(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>x.innerText.trim()===${JSON.stringify(clickText)});
    if(!b) return 'NOT FOUND';
    b.click(); return 'clicked';
  })()`);
  console.log('click:', clicked);
  await sleep(Number(extraWait || 2500));
}

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
fs.writeFileSync(outfile, Buffer.from(shot.result.data, 'base64'));
console.log('wrote', outfile, Math.round(fs.statSync(outfile).size / 1024) + 'KB');
ws.close();
await finish(0);
