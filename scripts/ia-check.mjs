/**
 * ia:check — proves the information architecture is complete and consistent.
 *
 * Phase 0 of the Atlassian restructure (docs/plan-atlassian-ia.md) produces two
 * contracts: docs/ia.config.mjs (the tree) and docs/_plan/split-map.md (where
 * each page's words come from). Every later phase copies from them, so an error
 * here multiplies. This script is the thing that stops that.
 *
 * The check that matters most is #5: every NON-BLANK line of the 1,625-line
 * design-system.md must be claimed by exactly one target page. Losing a
 * measured value silently is the one failure this restructure must not have.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const cfg = await import('../docs/ia.config.mjs');
const OLD = 'docs/design-system.md';
const SPLIT = 'docs/_plan/split-map.md';

const fail = [];
const warn = [];
const err = (m) => fail.push(m);

/* ---- flatten the tree ------------------------------------------------- */
const nodes = [];
(function walk(list, prefix) {
  for (const n of list) {
    const path = [prefix, n.slug].filter(Boolean).join('/');
    nodes.push({ ...n, path });
    if (n.children) walk(n.children, path);
  }
})(cfg.nav, '');

const byPath = new Map();
for (const n of nodes) {
  if (byPath.has(n.path)) err(`1· duplicate path: "${n.path}"`);
  byPath.set(n.path, n);
}

/* ---- 2 · sources either exist, or are accounted for ------------------- */
for (const n of nodes) {
  if (!n.src) continue;
  if (existsSync(n.src)) {
    // The flag is a promise about the future; once the file lands it is stale.
    if (n.status === 'planned') warn.push(`2b· ${n.path} is still marked planned, but ${n.src} now exists`);
    continue;
  }
  const planned = n.status === 'planned';
  const fromOld = Object.prototype.hasOwnProperty.call(cfg.splitSources, n.path);
  const hasMaterial = Object.prototype.hasOwnProperty.call(cfg.material, n.path);
  if (!planned) err(`2· missing source and not marked planned: ${n.path} → ${n.src}`);
  else if (!fromOld && !hasMaterial) {
    warn.push(`2· planned with no split source and no material: ${n.path}`);
  }
}

/* ---- 3 · splitSources keys are real pages ---------------------------- */
for (const p of Object.keys(cfg.splitSources)) {
  if (!byPath.has(p)) err(`3· splitSources key is not a page: "${p}"`);
}
for (const p of Object.keys(cfg.material)) {
  if (!byPath.has(p)) err(`3· material key is not a page: "${p}"`);
}

/* ---- 4+5 · the split map -------------------------------------------- */
const md = readFileSync(SPLIT, 'utf8');
const block = md.split('<!-- ia:split-map:begin -->')[1]?.split('<!-- ia:split-map:end -->')[0];
if (!block) err(`4· ${SPLIT} has no ia:split-map markers`);

const rows = (block || '').split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('|') && !/^\|\s*-+/.test(l) && !/^\|\s*id\s*\|/.test(l))
  .map((l) => l.slice(1, -1).split('|').map((c) => c.trim()));

const mapIds = new Set();
const exclusive = new Map();   // line → [ids]
const shared = new Map();      // line → [ids]
const claim = (m, line, id) => { if (!m.has(line)) m.set(line, []); m.get(line).push(id); };

for (const [id, target, lines] of rows) {
  if (!id) continue;
  if (mapIds.has(id)) err(`4· duplicate split-map id: ${id}`);
  mapIds.add(id);
  for (const tok of lines.split(',').map((s) => s.trim()).filter(Boolean)) {
    const isShared = tok.startsWith('(');
    const m = tok.replace(/[()]/g, '').match(/^(\d+)(?:-(\d+))?$/);
    if (!m) { err(`4· unparseable range "${tok}" on row ${id}`); continue; }
    const a = +m[1], b = m[2] ? +m[2] : +m[1];
    if (b < a) err(`4· reversed range "${tok}" on row ${id}`);
    for (let i = a; i <= b; i++) claim(isShared ? shared : exclusive, i, id);
  }
  // a non-structural row must point at a page or a merge-check
  if (target !== '—' && !target.startsWith('merge-check')) {
    if (!byPath.has(target)) err(`4· split-map row ${id} targets unknown page "${target}"`);
  }
}

// 4b · every splitSources id and mergeChecks id has a row, and vice versa
const declared = new Set([...Object.values(cfg.splitSources).flat(), ...Object.keys(cfg.mergeChecks)]);
for (const id of declared) if (!mapIds.has(id)) err(`4· id "${id}" declared in ia.config.mjs has no split-map row`);
const structural = new Set(rows.filter((r) => r[1] === '—').map((r) => r[0]));
for (const id of mapIds) {
  if (!declared.has(id) && !structural.has(id)) err(`4· split-map row "${id}" is claimed by nobody in ia.config.mjs`);
}

// 5 · line coverage
const oldLines = readFileSync(OLD, 'utf8').split('\n');
if (oldLines.length && oldLines[oldLines.length - 1] === '') oldLines.pop();
let uncovered = 0, doubled = 0;
for (let i = 1; i <= oldLines.length; i++) {
  if (!oldLines[i - 1].trim()) continue;            // blank lines need no home
  const ex = (exclusive.get(i) || []).length;
  const sh = (shared.get(i) || []).length;
  if (ex > 1) { doubled++; if (doubled <= 5) err(`5· line ${i} claimed exclusively by ${exclusive.get(i).join(' + ')}`); }
  if (ex === 0 && sh === 0) { uncovered++; if (uncovered <= 5) err(`5· line ${i} has no destination: ${JSON.stringify(oldLines[i - 1].slice(0, 70))}`); }
}
if (uncovered > 5) err(`5· …and ${uncovered - 5} more uncovered lines`);
const over = [...exclusive.keys()].filter((i) => i > oldLines.length);
if (over.length) err(`5· split map claims ${over.length} lines past the end of ${OLD} (${oldLines.length} lines)`);

/* ---- 6 · every component file is documented, exactly once per export --- */
const seen = new Map();                       // "File.tsx#Export" or "File.tsx" → owner
const filesTouched = new Set();
const ownerOf = [...nodes.map((n) => [n.path, n.impl || []]), ...cfg.libraries.map((l) => [`libraries/${l.name}`, l.impl || []])];
for (const [owner, list] of ownerOf) {
  for (const ref of list) {
    if (seen.has(ref)) err(`6· ${ref} is documented twice: ${seen.get(ref)} and ${owner}`);
    seen.set(ref, owner);
    const [file, exp] = ref.split('#');
    filesTouched.add(file);
    if (!existsSync(`src/ui/${file}`)) { err(`6· impl names src/ui/${file}, which does not exist`); continue; }
    if (exp) {
      const body = readFileSync(`src/ui/${file}`, 'utf8');
      if (!new RegExp(`export (function|const) ${exp}\\b`).test(body)) {
        err(`6· src/ui/${file} has no export named "${exp}" (claimed by ${owner})`);
      }
    }
  }
}
const uiFiles = readdirSync('src/ui').filter((f) => f.endsWith('.tsx'));
for (const f of uiFiles) if (!filesTouched.has(f)) err(`6· src/ui/${f} is documented nowhere — add it to a node's impl, or to libraries`);

/* ---- 6b · origin is what the code actually imports -------------------- */
const pkgJson = JSON.parse(readFileSync('package.json', 'utf8'));
const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
for (const [owner, list] of ownerOf) {
  const node = byPath.get(owner) || cfg.libraries.find((l) => `libraries/${l.name}` === owner);
  const origin = node?.origin;
  if (!origin) continue;
  // Read the file, but when the impl names one export, narrow to THAT export's
  // body. Overlays.tsx holds five components on three Kendo packages, so a
  // file-level check would pass a claim that belongs to a sibling export —
  // which is exactly the error this field exists to prevent.
  const slice = (ref) => {
    const [file, exp] = ref.split('#');
    if (!existsSync(`src/ui/${file}`)) return '';
    const body = readFileSync(`src/ui/${file}`, 'utf8');
    if (!exp) return body;
    const start = body.search(new RegExp(`export (function|const) ${exp}\\b`));
    if (start < 0) return '';
    const rest = body.slice(start + 1);
    const next = rest.search(/\nexport (function|const|type) /);
    return next < 0 ? rest : rest.slice(0, next);
  };
  // Two scopes, because the two facts live in different places:
  //   the import is at the top of the FILE,
  //   the identifier that proves WHICH export uses it is in the export BODY.
  const whole = list.map((r) => r.split('#')[0])
    .filter((f) => existsSync(`src/ui/${f}`))
    .map((f) => readFileSync(`src/ui/${f}`, 'utf8')).join('\n');
  const bodies = list.map(slice).join('\n');
  const ident = (origin.as || '').split(/\s*\+\s*/)[0].trim();
  if (ident && !new RegExp(`\\b${ident}\\b`).test(bodies)) {
    err(`6b· ${owner} claims it is built on ${ident}, which its own code does not mention`);
  }
  for (const pkg of [origin.pkg, origin.also].filter(Boolean)) {
    if (!deps[pkg]) err(`6b· ${owner} claims origin ${pkg}, which is not a dependency in package.json`);
    if (!whole.includes(pkg)) err(`6b· ${owner} claims origin ${pkg}, but no file in its impl imports it`);
  }
  if (origin.css && !bodies.includes(origin.css)) {
    err(`6b· ${owner} claims it wears the CSS class "${origin.css}", which appears in none of its impl files`);
  }
  if (!origin.pkg && !origin.css) err(`6b· ${owner} has an origin with neither pkg nor css`);
}

/* ---- 7 · no orphan markdown ----------------------------------------- */
const srcs = new Set(nodes.map((n) => n.src).filter(Boolean));
for (const dir of ['docs/components', 'docs/patterns']) {
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const p = `${dir}/${f}`;
    if (!srcs.has(p)) err(`7· ${p} exists but no page in ia.config.mjs points at it`);
  }
}

/* ---- 7b · material files exist, handoverFirst is real --------------- */
for (const [page, files] of Object.entries(cfg.material)) {
  for (const f of files) if (!existsSync(f)) err(`7b· material for "${page}" names ${f}, which does not exist`);
}
for (const p of cfg.handoverFirst) if (!byPath.has(p)) err(`7b· handoverFirst names "${p}", which is not a page`);

/* ---- 8+9 · groups, phases, and evidence ----------------------------- */
for (const n of nodes) {
  if (n.kind === 'component' && !cfg.GROUPS.includes(n.group)) err(`8· ${n.path} has unknown group "${n.group}"`);
  if (n.phase && !cfg.PHASES[n.phase]) err(`9· ${n.path} has unknown phase "${n.phase}"`);
  if (n.phase && !n.basis) err(`9· ${n.path} is labelled "${n.phase}" with no basis — a phase without evidence is a guess`);
  if (n.phase && n.kind === 'pattern') err(`9· ${n.path} is a pattern with a phase; Atlassian phases components and foundations only`);
}

/* ---- --origins · the origin table, printed rather than typed ---------- */
if (process.argv.includes('--origins')) {
  const row = (name, o, node) => {
    // Never assert an origin for a page with no implementation mapped: that is
    // a thing nobody measured, not a thing that is ours.
    if (!o && node && !(node.impl || []).length) return `| ${name} | not yet established \u2014 no page, no impl mapped | |`;
    if (!o) return `| ${name} | ours, drawn from tokens only | |`;
    const base = o.pkg ? `${o.pkg.replace('@progress/kendo-react-', 'KendoReact ').replace('@radix-ui/react-', 'Radix ')}${o.as ? ` \u2192 ${o.as}` : ''}`
                       : `native html input + Kendo class \`${o.css}\``;
    return `| ${name} | ${base} | ${o.note || (o.pkg && o.pkg.includes('progress') ? 'restyled through kendo-bridge.css' : '')} |`;
  };
  console.log('\n| Page | Origin | Changed |\n|---|---|---|');
  for (const n of nodes.filter((n) => n.kind === 'component')) console.log(row(n.path, n.origin, n));
  for (const l of cfg.libraries) console.log(`| libraries/${l.name} | ${l.origin ? l.origin.pkg : 'ours'} | ${l.note} |`);
  process.exit(fail.length ? 1 : 0);
}

/* ---- report ---------------------------------------------------------- */
const counts = {
  pages: nodes.length,
  components: nodes.filter((n) => n.kind === 'component').length,
  patterns: nodes.filter((n) => n.kind === 'pattern').length,
  planned: nodes.filter((n) => n.status === 'planned').length,
  'from old doc': Object.keys(cfg.splitSources).length,
  'origin verified': [...nodes, ...cfg.libraries].filter((n) => n.origin).length,
  'old lines mapped': [...new Set([...exclusive.keys(), ...shared.keys()])].length + '/' + oldLines.length,
};
console.log(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · '));
for (const w of warn) console.log(`  warn  ${w}`);
if (fail.length) {
  console.error(`\nia:check FAILED — ${fail.length} problem(s)\n`);
  for (const f of fail) console.error(`  ${f}`);
  process.exit(1);
}
console.log('ia:check OK');
