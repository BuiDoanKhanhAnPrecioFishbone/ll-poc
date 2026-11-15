/**
 * The design system as a browsable static site.
 *
 *   npm run ds:site          →  docs/site/
 *
 * INPUT is `docs/ia.config.mjs` and nothing else decides what exists: the
 * script walks `nav`, writes one HTML page per node at a path that mirrors the
 * tree, and renders each node's markdown through `renderMarkdown` — the same
 * function behind `md-doc.mjs`, so the site and the PDF handover cannot drift
 * apart on what a table or a link looks like.
 *
 * WHAT A NODE BECOMES
 *   - `src` exists on disk          → that markdown, rendered.
 *   - `kind: 'generated'`           → a stub naming its generator.
 *   - otherwise (`planned`)         → a stub that says so and says where the
 *                                     words will come from (`splitSources` =
 *                                     already written, to be moved;
 *                                     `material` = not written, draft from).
 *   The nav never links to a page that was not written: every node always has a
 *   page, real or stub, and the link check at the end proves it.
 *
 * COMPONENT TABS. Phase 3 marks tab boundaries INSIDE a component's markdown
 * with `<!-- ds:tab examples|code|usage|changelog -->`. If those comments are
 * present the component becomes `<slug>/<tab>.html` plus a redirect at
 * `<slug>.html`; if not, it is one page at `<slug>.html` with no tab bar.
 * Nothing here fakes a tab, so Phase 3 is purely additive.
 *
 * THEME. The stylesheet reads only `--vy-*` custom properties, copied from
 * `src/theme/tokens.css`. No colour is written in this file; the dark theme is
 * whatever tokens.css already says it is.
 *
 * NO DEPENDENCIES, NO NETWORK. Search is a JSON file filtered in the browser.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, PHASES, GROUPS, nav, splitSources, material } from '../docs/ia.config.mjs';
import { renderMarkdown, esc } from './md-doc.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* `--out <dir>` sends the site somewhere else, which is how it reaches Vercel:
   the deploy runs the build, the build writes the site into dist/ds, and
   nothing is committed. Paths inside a page are all relative, so the site
   works at any prefix.
   The generator CLEARS its output directory, so the guard stays: either the
   directory is named "site", or it is inside dist/, which the build owns. */
const outArg = (() => { const i = process.argv.indexOf('--out'); return i > -1 ? process.argv[i + 1] : null; })();
const OUT = path.resolve(ROOT, outArg || site.outDir);
const DIST = path.join(ROOT, 'dist');
const safe = OUT.startsWith(ROOT + path.sep)
  && (path.basename(OUT) === 'site' || OUT === DIST || OUT.startsWith(DIST + path.sep));
if (!safe) throw new Error(`refusing to clear ${OUT}: not a "site" directory and not inside dist/`);

const TAB_ORDER = ['examples', 'code', 'usage', 'changelog'];
const TAB_LABEL = { examples: 'Examples', code: 'Code', usage: 'Usage', changelog: 'Changelog' };
const TAB_RE = /^\s*<!--\s*ds:tab\s+(\S+)\s*-->\s*$/;

const warnings = [];
const warn = m => warnings.push(m);
const attr = s => esc(String(s)).replace(/"/g, '&quot;');
const plain = s => s.replace(/[`*]/g, '');

/* ---- 0. the tree --------------------------------------------------------- */

/** Components sit under the GROUPS headings, in GROUPS order (stable). */
const groupRank = g => { const i = GROUPS.indexOf(g); return i < 0 ? GROUPS.length : i; };

function build(list, parent, prefix) {
  const kids = list.map(n => {
    const p = prefix === null ? n.slug : (prefix ? `${prefix}/${n.slug}` : n.slug);
    return { ...n, path: p, parent, depth: parent ? parent.depth + 1 : 0 };
  });
  if (parent && parent.path === 'components') {
    kids.sort((a, b) => groupRank(a.group) - groupRank(b.group));
  }
  for (const k of kids) {
    const orig = list.find(n => n.slug === k.slug);
    k.children = orig.children ? build(orig.children, k, k.path) : [];
  }
  return kids;
}
const tree = build(nav, null, '');
const flat = [];
(function walk(list) { for (const n of list) { flat.push(n); walk(n.children); } })(tree);

/* ---- 1. decide each node's pages ---------------------------------------- */

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = rel => !!rel && fs.existsSync(path.join(ROOT, rel));

for (const n of flat) {
  n.file = n.path === '' ? 'index.html' : `${n.path}.html`;
  if (n.kind === 'generated') n.mode = 'generated';
  else if (exists(n.src)) n.mode = 'md';
  else { n.mode = 'stub'; if (n.status !== 'planned') warn(`${n.path || '/'}: status shipped but ${n.src} is missing, rendered as a stub`); }

  n.tabs = null;
  if (n.mode === 'md') {
    const lines = read(n.src).split('\n');
    const pre = []; const tabs = new Map(); let cur = null;
    for (const l of lines) {
      const m = TAB_RE.exec(l);
      if (m) {
        if (!TAB_ORDER.includes(m[1])) { warn(`${n.src}: unknown tab "${m[1]}" ignored`); continue; }
        cur = m[1]; if (!tabs.has(cur)) tabs.set(cur, []); continue;
      }
      (cur ? tabs.get(cur) : pre).push(l);
    }
    n.pre = pre.join('\n');
    if (tabs.size) {
      n.tabs = TAB_ORDER.filter(t => tabs.has(t)).map(t => ({ name: t, md: tabs.get(t).join('\n') }));
      for (const t of n.tabs) {
        if (n.children.some(c => c.slug === t.name)) throw new Error(`${n.path}: tab "${t.name}" collides with a child page`);
      }
    } else n.md = n.pre;
  }
  n.entry = n.tabs ? `${n.path}/${n.tabs[0].name}.html` : n.file;
}

/* ---- 2. render ----------------------------------------------------------- */

/* The output directory is wholly ours: start from empty so a deleted page cannot linger. */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const mediaCopied = new Map();
const pages = [];                  // every file we will write
const bySrc = new Map();           // repo-relative src → { entry, ids: Map(id → file) }

const up = file => path.posix.relative(path.posix.dirname(file), '.') || '.';
const rel = (from, to) => path.posix.relative(path.posix.dirname(from), to) || path.posix.basename(to);

/**
 * `<!-- ds:specimen <slug> -->` becomes a live example, framed from the app.
 *
 * It is spliced in AROUND renderMarkdown rather than handed to it, because the
 * renderer drops standalone HTML comments — it has to, so a ds:tab directive
 * never prints into the PDF handover — and a placeholder passed through it
 * would be dropped the same way.
 *
 * The frame points at /specimen/<slug> on the SAME deploy, so there is an
 * example to show only when the site is served (the Vercel preview, or
 * `npm run preview`). Opened as a file:// copy there is no app to frame, which
 * is why the caption says what it is rather than leaving a blank box.
 */
/* Which slugs the app actually has an example for, read straight out of the
   registry: a directive naming a slug nobody wrote is a dead frame, and a
   blank box on a page is exactly the kind of fault that survives a review. */
const SPECIMEN_SLUGS = new Set(
  fs.readdirSync(path.join(ROOT, 'src/specimens'))
    .filter(f => f.endsWith('.tsx') && f !== 'registry.tsx')
    .map(f => f.replace(/\.tsx$/, '')),
);

const SPECIMEN_RE = /^\s*<!--\s*ds:specimen\s+(\S+)\s*-->\s*$/;

const specimenHtml = slug =>
  `<figure class="specimen">`
  /* NOT loading="lazy". The frame is the main thing on the page, and lazily
     it loaded on some pages and stayed at about:blank on others depending on
     where it fell in the viewport — an example that appears only sometimes is
     worse than none. The CSS keeps a min-height so nothing jumps. */
  + `<iframe src="/specimen/${attr(slug)}" title="Live example: ${attr(slug)}" `
  + `data-specimen="${attr(slug)}"></iframe>`
  + `<figcaption>Live example \u2014 the real component, not a picture.</figcaption></figure>`;

function render(n, md, file) {
  const baseDir = path.dirname(path.join(ROOT, n.src));
  const opts = {
    baseDir,
    tocLabel: 'Contents',
    imageHandler(href) {
      const abs = path.resolve(baseDir, href);
      if (!fs.existsSync(abs)) { warn(`${n.src}: missing image ${href}`); return ''; }
      const r = path.relative(ROOT, abs);
      const dest = 'media/' + r.replace(/^docs\//, '').replace(/\.\.\//g, '');
      if (!mediaCopied.has(dest)) {
        fs.mkdirSync(path.dirname(path.join(OUT, dest)), { recursive: true });
        fs.copyFileSync(abs, path.join(OUT, dest));
        mediaCopied.set(dest, true);
      }
      return rel(file, dest);
    },
    linkHandler(href) {
      if (/^(https?:|mailto:)/.test(href)) return href;
      if (href.startsWith('#')) return `vyref:${n.src}${href}`;
      const [r, frag] = href.split('#');
      if (!r.endsWith('.md')) return null;                 // a path into the repo, not into the site
      const target = path.relative(ROOT, path.resolve(baseDir, r));
      return `vyref:${target}${frag ? '#' + frag : ''}`;
    },
  };

  /* Split on the directive, render the prose either side of it, and drop the
     frame in between. With no directive this is one segment and behaves
     exactly as it did before. */
  const parts = []; let buf = [];
  for (const line of md.split('\n')) {
    const m = SPECIMEN_RE.exec(line);
    if (m) { parts.push({ md: buf.join('\n') }, { specimen: m[1] }); buf = []; }
    else buf.push(line);
  }
  parts.push({ md: buf.join('\n') });

  let title = '', toc = [];
  const html = parts.map(p => {
    if (p.specimen) return specimenHtml(p.specimen);
    if (!p.md.trim()) return '';
    const r = renderMarkdown(p.md, opts);
    if (!title && r.title) title = r.title;
    toc = toc.concat(r.toc);
    return r.html;
  }).filter(Boolean).join('\n');

  return {
    html: guides(html.replace(/^<h1 [^>]*>.*?<\/h1>\n?/, '')),
    title: title || n.title,
    toc: toc.filter(t => t.level === 2),
  };
}

/**
 * The three sections every component page carries get a semantic block.
 *
 * `When to use` and `When not to use` are a do/don't pair on 28 of the 29
 * pages, and they were reading as two more headings in a column of prose.
 * They are wrapped and tinted here rather than marked up by hand, so nobody
 * has to learn a syntax and no existing page needs editing.
 *
 * The colours are the system's own generic severities — `--vy-accent-positive`
 * is what the product already uses for a success toast, a done step and a
 * completed checklist — not the status vocabulary, which belongs to data.
 * And not colour alone: the heading keeps its words and gains a glyph, which
 * is the same rule B1.6 applies to a status.
 */
const GUIDE = {
  'When to use': 'do',
  'When not to use': 'dont',
  'Accessibility': 'a11y',
};

/* Anatomy gets a wrapper but NOT a tinted panel and NOT a colour. Its table's
   first column is a number keyed to the picture above it, and drawing those
   as markers is the thing that helps. There is no do/don't here to encode, so
   a colour would be decoration pretending to be meaning. */
const PLAIN = { 'Anatomy': 'parts' };

function guides(html) {
  const parts = html.split(/(?=<h2 )/);
  return parts.map(seg => {
    const m = /^<h2 [^>]*>(.*?)<\/h2>/.exec(seg);
    if (!m) return seg;
    const label = plain(m[1]).trim();
    const kind = GUIDE[label];
    if (kind) return `<section class="guide guide-${kind}">${seg}</section>`;
    const flat = PLAIN[label];
    return flat ? `<section class="${flat}">${seg}</section>` : seg;
  }).join('');
}

for (const n of flat) {
  if (n.mode !== 'md') {
    pages.push({ node: n, file: n.file, kind: 'stub', toc: [] });
    continue;
  }
  const rec = { entry: n.entry, ids: new Map() };
  bySrc.set(n.src, rec);
  if (!n.tabs) {
    const r = render(n, n.md, n.file);
    pages.push({ node: n, file: n.file, kind: 'md', ...r });
    for (const m of r.html.matchAll(/ id="([^"]+)"/g)) rec.ids.set(m[1], n.file);
  } else {
    for (const t of n.tabs) {
      const file = `${n.path}/${t.name}.html`;
      const r = render(n, n.pre + '\n\n' + t.md, file);
      pages.push({ node: n, file, kind: 'md', tab: t.name, ...r });
      for (const m of r.html.matchAll(/ id="([^"]+)"/g)) if (!rec.ids.has(m[1])) rec.ids.set(m[1], file);
    }
    pages.push({ node: n, file: n.file, kind: 'redirect', toc: [] });
  }
}

/* ---- 3. the shell -------------------------------------------------------- */

const badge = n => {
  const b = n.phase && PHASES[n.phase] && PHASES[n.phase].badge;
  return b ? `<span class="badge badge-${n.phase}">${esc(b)}</span>` : '';
};

function sidebar(current, from) {
  const onPath = new Set(); for (let p = current; p; p = p.parent) onPath.add(p);
  const item = n => {
    const here = n === current;
    const a = `<a href="${attr(rel(from, n.entry))}"${here ? ' aria-current="page"' : ''}>${esc(n.title)}</a>${badge(n)}`;
    if (!n.children.length) return `<li>${a}</li>`;
    return `<li><details${onPath.has(n) ? ' open' : ''}><summary>${a}</summary>${list(n.children, n.path === 'components')}</details></li>`;
  };
  const list = (kids, grouped) => {
    let last = null; const out = [];
    for (const k of kids) {
      if (grouped && k.group && k.group !== last) { out.push(`<li class="grp">${esc(k.group)}</li>`); last = k.group; }
      out.push(item(k));
    }
    return `<ul>${out.join('')}</ul>`;
  };
  return list(tree, false);
}

function breadcrumb(n, from) {
  const chain = []; for (let p = n; p; p = p.parent) chain.unshift(p);
  const home = tree[0];
  const crumbs = n === home ? [] : [home, ...chain];
  const parts = crumbs.map(c => c === n ? `<li aria-current="page">${esc(c.title)}</li>` : `<li><a href="${attr(rel(from, c.entry))}">${esc(c === home ? 'Home' : c.title)}</a></li>`);
  return parts.length ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${parts.join('')}</ol></nav>` : '';
}

function stubBody(n, from) {
  const out = [];
  const lead = n.mode === 'generated'
    ? `<p>This page is generated. It is built by <code>${esc(n.generator || 'a generator')}</code>, which does not exist yet; the page will fill in when it does.</p>`
    : `<p>This page is planned. It has not been written, and the navigation lists it so the shape of the system is visible.</p>`;
  out.push(`<div class="stub">${lead}`);
  if (n.mode === 'stub') {
    const split = splitSources[n.path]; const mat = material[n.path];
    /* WHAT A STUB SAYS, AND WHAT IT NO LONGER SAYS.
       These pages used to print the project's own bookkeeping: section ids in
       the handover document, the path to the split map, the source files to
       draft from, and the `basis` line behind each release phase — notes
       written for the manifest, not for a reader. The site is deployed beside
       the product, so a stub now says only what a reader needs: that the page
       is planned, and whether its words already exist.
       None of it is deleted. `ia.config.mjs` still carries every basis, and
       ia:check still fails on a phase label that has none. */
    if (split) out.push('<p>Its words already exist in the handover document and will be moved here.</p>');
    else if (!mat) out.push('<p>No source material has been recorded for it yet.</p>');
    /* with material and no split the lead sentence already says it is unwritten;
       a second sentence saying so again is the page repeating itself */
  }
  out.push('</div>');
  if (n.children.length) {
    let last = null; const li = [];
    for (const k of n.children) {
      if (n.path === 'components' && k.group && k.group !== last) { li.push(`<li class="grp">${esc(k.group)}</li>`); last = k.group; }
      li.push(`<li><a href="${attr(rel(from, k.entry))}">${esc(k.title)}</a>${badge(k)}</li>`);
    }
    out.push(`<h2 id="in-this-section">In this section</h2><ul class="children">${li.join('')}</ul>`);
  }
  return out.join('\n');
}

const CSS = fs.readFileSync(new URL('./ds-site.css', import.meta.url), 'utf8');
const JS = fs.readFileSync(new URL('./ds-site.client.js', import.meta.url), 'utf8');
const THEME_BOOT = `try{var t=localStorage.getItem('vy-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

function shell(p) {
  const n = p.node; const from = p.file;
  const idx = flat.indexOf(n);
  const prev = flat[idx - 1]; const next = flat[idx + 1];
  const root = up(from);
  const tocList = p.toc.map(t => `<li><a href="#${attr(t.id)}">${esc(plain(t.text))}</a></li>`).join('');
  const toc = p.toc.length
    ? `<aside class="toc" aria-label="Contents"><h2>Contents</h2><ol>${tocList}</ol></aside>`
    : '<aside class="toc"></aside>';

  /* THE SAME CONTENTS, INLINE, FOR THE WIDTHS WHERE THE RAIL IS GONE.
     The sticky one is hidden below 1180px and the sidebar collapses behind a
     button below 860px, so between those widths — and on every phone — a long
     page arrived as an unbroken wall of prose with nothing to show its shape.
     Three sections is the floor: fewer than that, a list of links is longer
     than the thing it indexes. */
  const tocInline = p.toc.length >= 3
    ? `<details class="toc-inline" open><summary>On this page</summary><ol>${tocList}</ol></details>`
    : '';
  const tabs = p.tab || (n.tabs && p.kind === 'md')
    ? `<nav class="tabbar" aria-label="${attr(n.title)} sections"><ul>${n.tabs.map(t => {
        const f = `${n.path}/${t.name}.html`;
        return `<li><a href="${attr(rel(from, f))}"${t.name === p.tab ? ' aria-current="page"' : ''}>${TAB_LABEL[t.name]}</a></li>`;
      }).join('')}</ul></nav>` : '';
  const pn = (x, cls, label) => x ? `<a class="${cls}" href="${attr(rel(from, x.entry))}"><span>${label}</span>${esc(x.title)}</a>` : '<span></span>';
  const heading = p.tab ? `${esc(n.title)}` : esc(n.title);
  const body = p.kind === 'md' ? p.html : stubBody(n, from);
  return `<!doctype html>
<html lang="${site.defaultLocale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(n.title)}${p.tab ? ' — ' + TAB_LABEL[p.tab] : ''} · ${esc(site.title)}</title>
<script>${THEME_BOOT}</script>
<link rel="stylesheet" href="${root}/assets/tokens.css">
<style>
${CSS}
</style>
</head>
<body data-root="${root}/">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <button class="menu" type="button" aria-label="Menu" aria-expanded="false" aria-controls="side">Menu</button>
  <a class="brand" href="${attr(rel(from, tree[0].entry))}">${esc(site.title)}</a>
  <div class="search">
    <input id="q" type="search" placeholder="Search pages and headings" aria-label="Search" autocomplete="off">
    <ul id="results" role="listbox" hidden></ul>
  </div>
  <button id="theme" class="themebtn" type="button" aria-label="Switch theme">Theme</button>
</header>
<div class="layout">
<nav class="side" id="side" aria-label="Site">${sidebar(n, from)}</nav>
<main id="main">
${breadcrumb(n, from)}
<h1>${heading}${badge(n)}</h1>
${tabs}
<article class="doc">
${tocInline}
${body}
</article>
<nav class="pn" aria-label="Previous and next">${pn(prev, 'prev', 'Previous')}${pn(next, 'next', 'Next')}</nav>
</main>
${toc}
</div>
<script>${JS}</script>
</body>
</html>
`;
}

/* ---- 4. write ------------------------------------------------------------ */

fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'src/theme/tokens.css'), path.join(OUT, 'assets/tokens.css'));

const resolveRefs = (p, html) => html
  .replace(/<a href="vyref:([^"#]*)(?:#([^"]*))?">(.*?)<\/a>/g, (_, src, frag, text) => {
    const rec = bySrc.get(src);
    if (!rec) return `<span class="unlinked">${text}</span>`;
    let file = rec.entry; let hash = '';
    if (frag) {
      if (rec.ids.has(frag)) { file = rec.ids.get(frag); hash = '#' + frag; }
      else warn(`${p.node.path || '/'}: link to ${src}#${frag} has no such heading; linked to the page`);
    }
    if (file === p.file) return `<a href="${hash || attr(rel(p.file, file))}">${text}</a>`;
    return `<a href="${attr(rel(p.file, file))}${hash}">${text}</a>`;
  });

const searchIndex = [];
for (const p of pages) {
  const target = path.join(OUT, p.file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (p.kind === 'redirect') {
    const to = rel(p.file, p.node.entry);
    fs.writeFileSync(target, `<!doctype html>\n<html lang="${site.defaultLocale}"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${attr(to)}"><title>${esc(p.node.title)}</title><link rel="canonical" href="${attr(to)}"></head><body><a href="${attr(to)}">${esc(p.node.title)}</a></body></html>\n`);
    continue;
  }
  if (p.kind === 'md') p.html = resolveRefs(p, p.html);
  fs.writeFileSync(target, shell(p));
  searchIndex.push({
    title: p.node.title + (p.tab ? ` — ${TAB_LABEL[p.tab]}` : ''),
    path: p.file,
    section: p.node.parent ? (p.node.path.split('/')[0]) : '',
    headings: p.toc.map(t => plain(t.text)),
  });
}
fs.writeFileSync(path.join(OUT, 'search-index.json'), JSON.stringify(searchIndex));
// file:// pages cannot fetch() a sibling JSON file; the same data as a script can be loaded anywhere.
fs.writeFileSync(path.join(OUT, 'search-index.js'), `window.__VY_SEARCH=${JSON.stringify(searchIndex)};`);

/* ---- 5. prove it --------------------------------------------------------- */

function checkLinks() {
  const files = []; (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith('.html')) files.push(f);
    }
  })(OUT);
  const idsOf = new Map();
  const ids = f => { if (!idsOf.has(f)) idsOf.set(f, new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))); return idsOf.get(f); };
  let checked = 0; const dead = [];
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8').replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
    const here = path.relative(OUT, f);
    for (const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      const url = m[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:|data:)/.test(url) || url.startsWith('url=')) continue;
      /* /specimen/<slug> is a route in the app this site is deployed beside,
         not a file in the site. It is the ONE absolute path allowed, named
         rather than waved through, so any other absolute link is still a
         dead link and still fails the build. */
      if (/^\/specimen\//.test(url)) {
        const slug = url.split('/')[2];
        if (!SPECIMEN_SLUGS.has(slug)) dead.push(`${here}: ${url} (no specimen is registered for "${slug}")`);
        continue;
      }
      checked++;
      const [r, frag] = url.split('#');
      const target = r ? path.resolve(path.dirname(f), r) : f;
      if (!target.startsWith(OUT) || !fs.existsSync(target)) { dead.push(`${here}: ${url}`); continue; }
      if (frag && target.endsWith('.html') && !ids(target).has(frag)) dead.push(`${here}: ${url} (no #${frag})`);
    }
    for (const m of html.matchAll(/<meta http-equiv="refresh" content="0; url=([^"]+)"/g)) {
      checked++; if (!fs.existsSync(path.resolve(path.dirname(f), m[1]))) dead.push(`${here}: refresh to ${m[1]}`);
    }
  }
  return { checked, dead, files: files.length };
}

const nodeCount = flat.length;
const nodePages = flat.filter(n => fs.existsSync(path.join(OUT, n.file))).length;
const tabPages = pages.filter(p => p.tab).length;
const stubs = flat.filter(n => n.mode !== 'md').length;
const { checked, dead, files } = checkLinks();

console.log(`nav nodes: ${nodeCount}`);
console.log(`node pages emitted: ${nodePages}  (${nodeCount - stubs} from markdown, ${stubs} stubs; ${flat.filter(n => n.mode === 'generated').length} of those generated)`);
console.log(`tab pages: ${tabPages} across ${flat.filter(n => n.tabs).length} components`);
console.log(`html files written: ${files}; search entries: ${searchIndex.length}; images copied: ${mediaCopied.size}`);
console.log(`internal links checked: ${checked}; dead: ${dead.length}`);
for (const w of warnings) console.warn('warn:', w);
if (nodePages !== nodeCount) { console.error(`FAIL: ${nodeCount - nodePages} nav nodes have no page`); process.exit(1); }
if (dead.length) { for (const d of dead.slice(0, 40)) console.error('DEAD', d); process.exit(1); }
