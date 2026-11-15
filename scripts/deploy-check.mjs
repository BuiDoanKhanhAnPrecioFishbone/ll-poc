/**
 * deploy-check — ask the deployed site the questions only it can answer.
 *
 * WHY THIS EXISTS. Every other check in this repo walks FILES. `ds:site`
 * verified 16,000 internal links by resolving them on disk, and all of them
 * were correct — while `/ds` served the design system with none of its
 * stylesheets. The fault lived entirely in the hosting: a rewrite kept the
 * browser's base at `/ds`, so `./assets/tokens.css` resolved one level too
 * high, landed outside the site, and the SPA catch-all answered it with
 * `text/html`. A stylesheet link was handed a page, the browser dropped it,
 * and the page rendered as unstyled prose.
 *
 * No file-level check can see that. It needs a real request to a real host.
 *
 * WHAT IT DOES, beyond a list of URLs. It fetches a few pages and then follows
 * every asset THOSE pages reference — stylesheets, scripts, the search index —
 * resolving each against the URL the browser actually ended on, and asserts
 * the content-type matches the extension. That generalises the bug instead of
 * pinning the one address that caused it: any future path that silently falls
 * through to the SPA fails here.
 *
 *   npm run deploy:check                     the address recorded in README
 *   npm run deploy:check -- <base-url>       a preview deployment
 */
const BASE = (process.argv[2] || process.env.DEPLOY_URL || 'https://ll-poc-tau.vercel.app').replace(/\/$/, '');

/* Several of these have more than one correct answer — `application/javascript`
   is the older name for `text/javascript` and both are served in the wild — so
   each extension lists what is ACCEPTABLE rather than one exact string. The
   question this check exists to ask is not "which synonym did the host pick"
   but "was an asset answered with a page". */
const TYPE_FOR = {
  '.css':  ['text/css'],
  '.js':   ['text/javascript', 'application/javascript'],
  '.mjs':  ['text/javascript', 'application/javascript'],
  '.json': ['application/json', 'text/json'],
  '.html': ['text/html'],
  '.png':  ['image/png'],
  '.jpg':  ['image/jpeg'], '.jpeg': ['image/jpeg'],
  '.svg':  ['image/svg+xml'],
  '.woff2':['font/woff2', 'application/font-woff2'],
};

const fails = [];
const notes = [];
const fail = m => { fails.push(m); console.error(`  FAIL  ${m}`); };
const ok = m => console.log(`  ok    ${m}`);

async function get(url, { redirect = 'follow' } = {}) {
  const r = await fetch(url, { redirect });
  return { status: r.status, type: (r.headers.get('content-type') || '').split(';')[0].trim(), url: r.url, body: r };
}

/** A page, and every asset it points at, resolved the way a browser would. */
async function checkPage(path, mustContain) {
  const r = await get(BASE + path);
  if (r.status !== 200) return fail(`${path} → HTTP ${r.status}`);
  if (r.type !== 'text/html') return fail(`${path} → content-type ${r.type}, expected text/html`);
  const html = await r.body.text();
  if (mustContain && !html.includes(mustContain)) return fail(`${path} → does not contain ${JSON.stringify(mustContain)}`);
  ok(`${path} → 200 text/html${r.url !== BASE + path ? `  (ended at ${r.url.replace(BASE, '')})` : ''}`);

  // every asset this page references, resolved against where the browser ENDED
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1])
    .filter(u => /\.(css|js|mjs|json|png|jpe?g|svg|woff2)$/.test(u))
    .filter(u => !/^(https?:|data:)/.test(u));
  const seen = new Set();
  for (const ref of refs) {
    const abs = new URL(ref, r.url).toString();
    if (seen.has(abs)) continue;
    seen.add(abs);
    const want = TYPE_FOR[(abs.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase()];
    const a = await get(abs);
    if (a.status !== 200) fail(`${path} → asset ${ref} → HTTP ${a.status}`);
    else if (want && !want.includes(a.type)) {
      fail(`${path} → asset ${ref} answered ${a.type}, expected ${want.join(' or ')}`
        + (a.type === 'text/html' ? ' — it fell through to the SPA, so the browser will drop it' : ''));
    }
  }
  if (seen.size) ok(`${path} → ${seen.size} asset(s) served with the right type`);
}

async function checkRedirect(path, to) {
  const r = await get(BASE + path, { redirect: 'manual' });
  if (r.status < 300 || r.status >= 400) {
    return fail(`${path} → HTTP ${r.status}, expected a redirect to ${to}`
      + ' — without one the browser keeps the old base and every relative asset resolves one level too high');
  }
  const loc = r.body.headers.get('location') || '';
  if (!loc.endsWith(to)) fail(`${path} → redirects to ${loc}, expected ${to}`);
  else ok(`${path} → ${r.status} → ${to}`);
}

console.log(`deploy-check ${BASE}\n`);

await checkRedirect('/ds', '/ds/');
await checkPage('/', 'Voyager ERP');
await checkPage('/ds/', 'Voyager IQ Design System');
await checkPage('/ds/components/button/examples.html', 'Button');
await checkPage('/ds/foundations/tokens/all-tokens.html', 'All tokens');

/* The live examples are an app route framed by a static page: same origin,
   different half of the deploy. If the rewrite ever stops routing it, every
   component page shows an empty box and nothing else notices. */
const spec = await get(`${BASE}/specimen/button`);
if (spec.status !== 200 || spec.type !== 'text/html') fail(`/specimen/button → ${spec.status} ${spec.type}`);
else ok('/specimen/button → 200 text/html (the live examples have somewhere to come from)');

const idx = await get(`${BASE}/ds/search-index.json`);
if (idx.status !== 200) fail(`/ds/search-index.json → HTTP ${idx.status}`);
else if (!idx.type.includes('json')) fail(`/ds/search-index.json → ${idx.type}, expected application/json`);
else {
  const entries = await idx.body.json();
  if (!Array.isArray(entries) || entries.length < 100) fail(`search index has ${entries?.length} entries, expected 100+`);
  else ok(`/ds/search-index.json → ${entries.length} entries`);
}

for (const n of notes) console.log(`  note  ${n}`);
console.log();
if (fails.length) { console.error(`deploy-check FAILED — ${fails.length} problem(s) against ${BASE}`); process.exit(1); }
console.log(`deploy-check OK — ${BASE} serves the site and every asset it asks for`);
/* fetch keeps its connection pool warm, so node lingers after the last check.
   Exit explicitly: a check that does not end cannot be put in a pipeline. */
process.exit(0);
