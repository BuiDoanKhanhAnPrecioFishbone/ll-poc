/**
 * Screenshot a dialog, which `chrome --screenshot` cannot do: a dialog has to
 * be OPENED first, and that means a click.
 *
 *   chrome --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/p about:blank &
 *   node scripts/capture-dialog.mjs <url> <button text> <out.png> [wait ms]
 *
 * Drives Chrome over the DevTools protocol using Node's built-in WebSocket —
 * no Playwright, no Puppeteer, nothing to install. Used for the Run Quotation
 * and BoM Comparison figures in docs/what-changed.md.
 *
 * It clicks by matching a button's exact innerText, and prints `NOT FOUND`
 * rather than silently capturing the page without the dialog — which is the
 * failure that matters here, because the screenshot still looks plausible.
 */
import fs from 'node:fs';

const PORT = process.env.PORT || 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));

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
process.exit(0);
