/**
 * The design system's own figures, captured from the running specimen.
 *
 *   npm run dev                                  # or let with-server.mjs do it
 *   node scripts/capture-design-system.mjs
 *
 * WHY THIS EXISTS. The 26 pictures in `docs/design-system.md` were captured by
 * hand, and nothing in `scripts/` could redo them. That held until a token
 * moved: on 7 Nov `--vy-text-2xs` went 10px -> 12px and on 8 Nov
 * `--vy-on-surface-subtle` went `#626d7e` -> `#5b6575`, and every figure drawn
 * from the specimen page silently became a picture of a palette that no longer
 * existed — in a document whose first paragraph promises the opposite. A
 * figure nobody can regenerate is a figure that goes stale without telling
 * anyone.
 *
 * WHAT IT COVERS. Only the sections of `/design-system`, which is where the
 * token figures come from. The screenshots taken from real app screens —
 * `states-field-*`, `states-row-tones`, `error-state`, `responsive-*`, the
 * rocket states — are not here: several were taken against records that are
 * not in the seed data, so a script cannot reproduce them without inventing
 * content. Those stay manual, and that is worth fixing separately by seeding
 * the records they used.
 *
 * FRAMING. The section's own bounding box plus a 16px margin, at
 * deviceScaleFactor 2, with transitions stopped — the same rules
 * `capture-shots.mjs` uses, for the same reason: a figure caught mid-animation
 * photographs as a layout bug.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const OUT = process.env.DS_SHOTS_OUT || 'docs/assets/design-system';
const PORT = Number(process.env.CDP_PORT || 9472);
const CHROME = process.env.CHROME_BIN
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/* Section heading on /design-system -> the file names it feeds.
   `Buttons` writes two because the document has referenced `states-buttons`
   since the figures were renamed, and `buttons` is still on disk. */
const FIGURES = [
  ['Semantic layer — what components reference', ['semantic-layer']],
  ['Colour ramps — the raw values underneath', ['colour-ramps']],
  ['Status vocabulary', ['status-vocabulary']],
  ['Column roles', ['column-roles']],
  ['Buttons', ['states-buttons', 'buttons']],
  ['Chip — selected and unselected', ['chip-states']],
  ['Button — anatomy', ['button-anatomy']],
  ['Button — the states that hold still', ['button-states']],
  ['Elevation', ['elevation']],
  ['Motion', ['motion']],
  ['Type scale', ['type-scale']],
];

/* The Buttons figure is the one with the keyboard on it — D1 says so in the
   caption, and a focus ring is the thing it is there to show. */
const PREP = {
  Buttons: `(() => {
    const s = [...document.querySelectorAll('.vy-ds-section')]
      .find(x => x.querySelector('h2')?.textContent.trim() === 'Buttons');
    const b = [...s.querySelectorAll('button')].find(x => x.textContent.trim() === 'Text');
    if (!b) return 'no Text button';
    b.focus();
    return document.activeElement === b ? 'focused' : 'focus refused';
  })()`,
};

const STOP_MOTION = `(() => {
  const s = document.createElement('style');
  s.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(s);
  document.body.getBoundingClientRect();
})()`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-ds-shots-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--force-device-scale-factor=1', '--window-size=1440,1200', 'about:blank'], { stdio: 'ignore' });
const release = cleanupOnKill(chrome, profile);

const ws = new WebSocket(await connectToChrome(PORT, chrome));
await new Promise(r => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async expression =>
  (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }))?.result?.result?.value;

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',
  { width: 1440, height: 1200, deviceScaleFactor: 2, mobile: false });

fs.mkdirSync(OUT, { recursive: true });
let written = 0;
const failed = [];

for (const theme of ['light', 'dark']) {
  /* Stamped before the first paint rather than toggled after it: kendo-bridge
     warns that flipping `data-theme` at runtime leaves Kendo's derived colours
     on their previous values. */
  await send('Page.addScriptToEvaluateOnNewDocument',
    { source: `document.documentElement.setAttribute('data-theme','${theme}')` });
  await send('Page.navigate', { url: `${BASE}/design-system` });
  await sleep(3800);
  await evalJs(`document.documentElement.setAttribute('data-theme','${theme}')`);
  await evalJs(STOP_MOTION);

  const applied = await evalJs(`document.documentElement.getAttribute('data-theme')`);
  if (applied !== theme) { failed.push(`${theme}: theme did not apply (got ${applied})`); continue; }

  for (const [heading, names] of FIGURES) {
    if (PREP[heading]) await evalJs(PREP[heading]);

    const box = await evalJs(`(() => {
      const h = [...document.querySelectorAll('.vy-ds-section h2')]
        .find(e => e.textContent.trim() === ${JSON.stringify(heading)});
      if (!h) return null;
      const s = h.closest('.vy-ds-section');
      s.scrollIntoView({ block: 'start' });
      const r = s.getBoundingClientRect();
      return { x: r.x - 16, y: r.y - 16, width: r.width + 32, height: r.height + 32 };
    })()`);
    if (!box) { failed.push(`${theme}: section "${heading}" not found`); continue; }
    await sleep(350);

    const shot = await send('Page.captureScreenshot',
      { format: 'png', clip: { ...box, scale: 2 }, captureBeyondViewport: true });
    const data = shot.result?.data;
    if (!data) { failed.push(`${theme}: "${heading}" returned no image`); continue; }

    for (const name of names) {
      const file = path.join(OUT, theme === 'dark' ? `${name}-dark.png` : `${name}.png`);
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      written++;
      console.log(`  ${path.basename(file).padEnd(26)} ${Math.round(fs.statSync(file).size / 1024)}KB  ${Math.round(box.width)}x${Math.round(box.height)}`);
    }
  }
}

ws.close();
chrome.kill();
release?.();

console.log(`\n${written} figures written to ${OUT}`);
if (failed.length) { failed.forEach(f => console.error(`  FAILED  ${f}`)); process.exit(1); }
