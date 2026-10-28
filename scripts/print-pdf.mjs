/**
 * Print a built document to PDF, through the same headless Chrome the figures
 * came from.
 *
 *   node scripts/print-pdf.mjs docs/so-sanh-prototype-16oct.html \
 *                              docs/so-sanh-prototype-16oct.pdf
 *
 * THE PAGE DECIDES THE PAPER, not this script: size, margins and what may not
 * be split live in the document's own `@page` and `@media print` rules, where
 * anyone editing the document can see them. All that is set here is
 * `printBackground`, because Chrome's default drops every background — and in
 * this document the backgrounds are the callout colour and the status tags,
 * which is to say the legend.
 *
 * The file is opened over the dev server rather than `file://`: a 1.6MB page
 * of data URIs loads the same either way, and this keeps one origin for every
 * capture in the toolchain.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error('usage: node scripts/print-pdf.mjs <built.html> <out.pdf>');
  process.exit(1);
}
if (!fs.existsSync(src)) { console.error(`no such file: ${src}`); process.exit(1); }

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9459);
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = ms => new Promise(r => setTimeout(r, ms));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-pdf-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' });
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

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: `${BASE}/${src.replace(/^\.?\//, '')}` });
await sleep(2500);

/* Every figure in, before the paper is cut. */
const ready = await send('Runtime.evaluate', {
  /* `figure img`, not every image on the page: the zoom overlay holds an empty
     <img> until someone clicks a figure, and an empty one never has a natural
     width — which once stopped a perfectly good print. */
  expression: `(async () => {
    const figs = Array.from(document.querySelectorAll('figure img'));
    await Promise.all(figs.filter(i => !i.complete)
      .map(i => new Promise(r => { i.onload = i.onerror = r; })));
    return figs.filter(i => !i.naturalWidth).length;
  })()`,
  awaitPromise: true, returnByValue: true,
});
const broken = ready.result?.result?.value;
if (broken) { console.error(`${broken} image(s) failed to load — not printing`); process.exit(1); }

/* THE MARGINS ARE PASSED, not only declared. With `preferCSSPageSize` alone
   Chrome took the paper size from `@page` and its own 1-inch margins from
   nowhere in particular, laying the content out narrower than the page box —
   narrow enough to trip a `max-width` rule in the document and collapse its
   side-by-side figures into one column. These are the `@page` margins in
   inches: 12mm, and 14mm at the foot. */
const MM = 25.4;
const pdf = await send('Page.printToPDF', {
  printBackground: true,
  preferCSSPageSize: true,
  marginTop: 12 / MM, marginBottom: 14 / MM,
  marginLeft: 12 / MM, marginRight: 12 / MM,
});
const data = pdf.result?.data;
if (!data) { console.error('no PDF came back'); process.exit(1); }

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(data, 'base64'));
console.log(`${out} — ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`);

ws.close(); chrome.kill(); release();
process.exit(0);
