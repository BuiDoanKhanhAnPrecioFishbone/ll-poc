/**
 * The Do/Don't cards, as PAINTED.
 *
 *   node scripts/with-server.mjs dodont:check    # starts the server itself
 *   npm run dodont:check                         # against a server on 5180
 *
 * 70 card pairs across 34 component pages say "this is right, that is wrong".
 * Every one of them is live React, which is the point — a picture of a button
 * goes stale when a token moves and these cannot. The cost is that each card
 * is a small program, and three of the four ways they fail are invisible to
 * `tsc`, to lint and to the build:
 *
 *   1. A stage that renders NOTHING. A component given props it quietly
 *      ignores paints an empty box, and an empty box under a green tick reads
 *      as "do nothing".
 *   2. A pair whose halves are THE SAME. The whole argument of a card is the
 *      difference between its two sides; two identical stages is a page
 *      asserting a distinction it does not show. This is the one that nearly
 *      shipped — the badge card contrasting one amber against two is four
 *      characters away from being the same card twice.
 *   3. A page that overflows its own width, which an iframe hides by
 *      scrolling rather than by complaining.
 *   4. A console error from a specimen nobody opens by hand.
 *
 * Written 21 Nov 2026, the morning after the cards were drawn, because the
 * previous evening's work was pushed on a clean build with 31 of the 34 pages
 * never once looked at. A clean build says the code runs. It does not say the
 * page says anything.
 *
 * CDP rather than a test runner, and Chrome rather than Playwright: that is
 * what `render-check.mjs` already does and the dependency is already paid for.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupOnKill, connectToChrome } from './chrome-cleanup.mjs';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(process.env.CDP_PORT || 9446);   // not render-check's 9444
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const EXTRA_FLAGS = (process.env.CHROME_FLAGS || '').split(' ').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* The slugs come from the directory, not from a list here. A list would be one
   more place to forget a page — which is the failure this whole script is
   about. */
const SLUGS = fs.readdirSync('src/specimens')
  .filter(f => f.endsWith('-usage.tsx'))
  .map(f => f.replace(/-usage\.tsx$/, '-usage'))
  .sort();

/* NO BACKTICKS BELOW THIS LINE, not even in a comment, and no dollar-brace
   either. The probe is a template literal evaluated in Chrome, so a backtick
   closes it and an interpolation is evaluated by Node first. Both mistakes
   were made writing this file, three times between them, and each one failed
   as a SyntaxError in the script rather than as a wrong answer — which is the
   good kind of failure and the reason the rule is written here rather than
   remembered.

   The probe. Returns findings, not raw numbers: what counts as wrong belongs
   next to the DOM it is reading, and the node side stays a reporter.

   `signature` is deliberately NOT innerHTML. Two stages differing only in a
   React key, a generated id or a `useId` are the same card to a reader and
   different strings to a comparison. It is the visible text plus the shape of
   the element tree — tag names and our own `vy-` classes — which is what a
   person actually sees. */
const PROBE = `(() => {
  const out = [];
  /* DIRECT children only. Card, Group, Conversation and the record skeleton
     all render a <section> of their own INSIDE a stage, so a descendant
     selector reported eight nested "(untitled)" sections on the Card page as
     pairs with no cards in them. */
  const sections = [...document.querySelectorAll('.vy-specimen > section')];
  if (!sections.length) return [{ kind: 'empty-page', detail: 'no sections rendered' }];

  /* WHAT A READER SEES, and the first version was not it. Tag names plus our
     own classes missed every difference that lives somewhere else: a badge
     whose family is a data-token, a divider that is an inline border, a
     checkbox whose third state is a DOM property, a glyph that differs by its
     fill. Six real pairs came back as "identical" on the first run and all
     six were the signature's fault, not the card's — so it now reads the
     state attributes, the input's own flags, and the handful of computed
     values that carry meaning in this system. */
  const sig = (el) => {
    const shape = [...el.querySelectorAll('*')].map(n => {
      const cls = (typeof n.className === 'string' ? n.className : '')
        .split(/\\s+/).filter(c => c.startsWith('vy-') || c.startsWith('k-')).sort().join('.');
      const data = [...n.attributes]
        .filter(a => a.name.startsWith('data-') || a.name === 'fill' || a.name === 'stroke-width')
        .map(a => a.name + '=' + a.value).sort().join(',');
      /* Concatenation, not a template literal. This probe is itself inside
         one on the node side, so a nested interpolation would be evaluated by
         Node before Chrome ever saw it — and so would a dollar-brace written
         in a comment, which is how this line was found. */
      /* AN INPUT HAS NO TEXT. Its value is a property, so innerText over a
         page of form controls returns the labels and nothing else — which is
         how the number field's six-decimal card came back "identical" when
         one side read $0.000012 and the other 0.00. */
      const val = ('value' in n && typeof n.value === 'string') ? '="' + n.value + '"' : '';
      const flags = n.tagName === 'INPUT'
        ? '[' + (n.checked ? 'checked' : '') + (n.indeterminate ? 'indeterminate' : '')
              + (n.readOnly ? 'ro' : '') + ']'
        : '';
      const cs = getComputedStyle(n);
      const paint = [cs.backgroundColor, cs.color, cs.borderLeftStyle + cs.borderLeftWidth,
                     cs.borderBottomStyle, cs.boxShadow === 'none' ? '' : 'shadow',
                     cs.fontWeight].join('|');
      return n.tagName + (cls ? '.' + cls : '') + (data ? '{' + data + '}' : '') + val + flags + paint;
    }).join('>');
    return (el.innerText || '').replace(/\\s+/g, ' ').trim() + ' || ' + shape;
  };

  for (const s of sections) {
    const title = (s.querySelector('h2')?.textContent || '(untitled)').trim();
    const cards = [...s.querySelectorAll('.vy-dodont-card')];
    const stage = s.querySelector('.vy-specimen-stage:not(.vy-dodont-stage)');
    if (!cards.length) { if (!stage) out.push({ kind: 'no-cards', detail: title }); continue; }
    if (cards.length !== 2) out.push({ kind: 'odd-pair', detail: title + ' has ' + cards.length + ' cards' });

    const seen = [];
    for (const c of cards) {
      const verdict = c.getAttribute('data-verdict') || '(none)';
      const st = c.querySelector('.vy-dodont-stage');
      const cap = (c.querySelector('figcaption')?.innerText || '').trim();
      const h = st ? st.getBoundingClientRect().height : 0;
      const kids = st ? st.childElementCount : 0;
      const painted = st ? [...st.querySelectorAll('*')].some(n => {
        const r = n.getBoundingClientRect();
        return r.width > 2 && r.height > 2;
      }) : false;

      if (!st)                     out.push({ kind: 'no-stage', detail: title + ' / ' + verdict });
      else if (!kids || !painted)  out.push({ kind: 'blank-stage', detail: title + ' / ' + verdict + ' (h=' + Math.round(h) + ', children=' + kids + ')' });
      if (cap.length < 20)         out.push({ kind: 'thin-caption', detail: title + ' / ' + verdict + ': "' + cap + '"' });
      if (!['do','dont'].includes(verdict)) out.push({ kind: 'bad-verdict', detail: title + ' / ' + verdict });
      seen.push({ verdict, sig: st ? sig(st) : '' });
    }
    if (seen.length === 2 && seen[0].verdict === seen[1].verdict)
      out.push({ kind: 'same-verdict', detail: title + ' — both cards say ' + seen[0].verdict });
    if (seen.length === 2 && seen[0].sig && seen[0].sig === seen[1].sig)
      out.push({ kind: 'identical-pair', detail: title + ' — both stages render the same thing' });
  }

  const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (over > 2) out.push({ kind: 'overflows', detail: over + 'px wider than the frame' });
  return out;
})()`;

/* The self-test. A checker that silently stops checking reads exactly like a
   clean run — this project has been bitten by that twice, once by a crashing
   CSS check and once by a tsc invocation that compiled nothing — so the two
   detectors that matter are made to fire on purpose before the real pages are
   trusted. */
const PLANT = `(() => {
  const sec = document.querySelector('.vy-specimen section');
  const clone = sec.cloneNode(true);
  clone.querySelector('h2').textContent = 'PLANTED';
  const cards = [...clone.querySelectorAll('.vy-dodont-card')];
  if (cards.length !== 2) return 'cannot plant: section has ' + cards.length + ' cards';
  /* Make the second card a copy of the first: same stage, same verdict. */
  cards[1].replaceChild(cards[0].querySelector('.vy-dodont-stage').cloneNode(true),
                        cards[1].querySelector('.vy-dodont-stage'));
  cards[1].setAttribute('data-verdict', cards[0].getAttribute('data-verdict'));
  sec.parentNode.appendChild(clone);
  return 'planted';
})()`;

async function main() {
  try { await fetch(BASE); }
  catch { console.error(`Cannot reach ${BASE}. Start the dev server first.`); process.exit(2); }

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-dodont-'));
  const chrome = spawn(CHROME, [...EXTRA_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run',
    '--window-size=900,1200', 'about:blank'], { stdio: 'ignore' });
  cleanupOnKill(chrome, profile);

  const ws = new WebSocket(await connectToChrome(PORT, chrome));
  await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  const consoleErrors = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown')
      consoleErrors.push(m.params?.exceptionDetails?.exception?.description?.slice(0, 160) || 'exception');
    if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error')
      consoleErrors.push((m.params.args?.[0]?.value ?? 'console.error').toString().slice(0, 160));
  };
  const send = (method, params = {}) =>
    new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Page.enable'); await send('Runtime.enable');

  const run = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return r.result?.result?.value;
  };

  const findings = [];
  let pairs = 0;

  for (const slug of SLUGS) {
    consoleErrors.length = 0;
    await send('Page.navigate', { url: `${BASE}/specimen/${slug}` });
    await sleep(1400);
    /* Light, not dark: the site opens light and a reader meets these there
       first. Dark is one postMessage away and the theme is forwarded by the
       page, not chosen here. */
    const found = await run(PROBE);
    if (!Array.isArray(found)) { findings.push({ slug, kind: 'probe', detail: 'probe returned nothing' }); continue; }
    pairs += await run(`document.querySelectorAll('.vy-dodont').length`) || 0;
    for (const f of found) findings.push({ slug, ...f });
    for (const e of consoleErrors) findings.push({ slug, kind: 'console', detail: e });
  }

  /* Self-test, on the last page still loaded. */
  const planted = await run(PLANT);
  const after = await run(PROBE);
  const caught = Array.isArray(after)
    && after.some(f => f.kind === 'identical-pair' && f.detail.startsWith('PLANTED'))
    && after.some(f => f.kind === 'same-verdict' && f.detail.startsWith('PLANTED'));

  ws.close();
  chrome.kill();
  await new Promise(r => chrome.once('exit', r));
  await sleep(300);
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* temp dir */ }

  console.log(`dodont:check  ${SLUGS.length} pages, ${pairs} card pairs  ·  self-test ${
    caught ? 'passed (planted an identical pair, detected)' : `FAILED (${planted})`}`);
  if (!findings.length) console.log('  every card painted something, and no pair argues with itself');
  for (const f of findings) console.log(`  [${f.kind}] ${f.slug}\n      ${f.detail}`);

  process.exit(findings.length || !caught ? 1 : 0);
}

main();
