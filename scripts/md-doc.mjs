/**
 * Markdown → one self-contained HTML file, pictures and all.
 *
 *   node scripts/md-doc.mjs docs/design-system.md docs/design-system.html
 *
 * WHY THIS EXISTS. A `.md` file sent to someone arrives without its images:
 * every `![](assets/…)` is a path into a repository the reader does not have.
 * The project already solved this once for the 16 Oct comparison document —
 * `bundle-doc.mjs` folds pictures into HTML — but that one takes HTML in. The
 * design system is written in Markdown because it is a document people edit,
 * so it needs the step before: render it, then fold the pictures in.
 *
 * NO MARKDOWN LIBRARY. Adding one to a prototype's dependency tree to render
 * one document is a poor trade, and the subset in use here is small and
 * known: headings, tables, lists, block quotes, rules, images, links, inline
 * code, bold and italic. Anything outside that subset is passed through as a
 * paragraph rather than silently swallowed.
 *
 * IMAGES ARE DOWNSCALED ON THE WAY IN. The captures are 2× — about 2300px
 * wide — which is right for reading a swatch on a retina screen and wrong for
 * a file somebody has to receive. `sips` resamples them to 1300px, which took
 * the set from 6.6MB to 3.3MB; PNG rather than JPEG because half of these
 * pictures ARE colour swatches, and JPEG puts artefacts around flat fills.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error('usage: node scripts/md-doc.mjs <in.md> <out.html>');
  process.exit(1);
}

const MAX_PX = Number(process.env.MAX_PX || 1300);
const baseDir = path.dirname(src);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-mddoc-'));

/* ---- inline helpers ------------------------------------------------------ */

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** GitHub's own rule, so the anchors a Markdown reader followed still work. */
const slug = t => t.trim().toLowerCase()
  .replace(/[^\p{L}\p{N}\s_-]/gu, '')
  .replace(/\s/g, '-');

let imageCount = 0;
function dataUri(rel) {
  const file = path.resolve(baseDir, rel);
  if (!fs.existsSync(file)) { console.error('missing image:', rel); process.exit(1); }
  const small = path.join(tmp, `${imageCount++}-${path.basename(file)}`);
  fs.copyFileSync(file, small);
  try {
    execFileSync('sips', ['-Z', String(MAX_PX), small], { stdio: 'ignore' });
  } catch { /* sips is macOS-only; the full-size image is still correct */ }
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  return `data:${mime};base64,${fs.readFileSync(small).toString('base64')}`;
}

/** Inline spans, in the order that keeps code literal. */
function inline(s) {
  const code = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${code.push(c) - 1}\u0000`);
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, href) => `<figure><img alt="${alt}" src="${dataUri(href)}"></figure>`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const target = href.startsWith('#') || href.startsWith('http') ? href : href;
    const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${target}"${ext}>${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(code[Number(i)])}</code>`);
  return s;
}

/* ---- block parse --------------------------------------------------------- */

const lines = fs.readFileSync(src, 'utf8').split('\n');
const html = [];
const toc = [];
const tocLabel = process.env.DOC_TOC_LABEL || 'Contents';
let seenTitle = false;
let i = 0;

const isTableRow = l => /^\s*\|.*\|\s*$/.test(l);
const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

while (i < lines.length) {
  const line = lines[i];

  if (!line.trim()) { i++; continue; }

  if (/^---+$/.test(line.trim())) { html.push('<hr>'); i++; continue; }

  const h = /^(#{1,4})\s+(.*)$/.exec(line);
  if (h) {
    const level = h[1].length;
    const text = h[2].trim();
    const id = slug(text);

    /* THE DOCUMENT'S OWN CONTENTS SECTION IS DROPPED. A Markdown file needs a
       hand-written index because nothing renders one for it; this page builds
       a better one from the headings, and printing both gives the reader two
       tables of contents to choose between. Everything up to the next rule
       goes with the heading. */
    if (id === slug(tocLabel)) {
      i++;
      while (i < lines.length && !/^---+$/.test(lines[i].trim())) i++;
      i++;
      continue;
    }

    html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
    /* The title is not an entry in its own index. */
    if (level === 1 && !seenTitle) { seenTitle = true; i++; continue; }
    if (level <= 2) toc.push({ level, text, id });
    i++; continue;
  }

  if (line.startsWith('> ')) {
    const buf = [];
    while (i < lines.length && lines[i].startsWith('>')) {
      buf.push(lines[i].replace(/^>\s?/, ''));
      i++;
    }
    html.push(`<blockquote>${inline(buf.join(' ').trim())}</blockquote>`);
    continue;
  }

  if (isTableRow(line) && isTableRow(lines[i + 1] || '') && /^[\s|:-]+$/.test(lines[i + 1])) {
    const head = cells(line);
    i += 2;
    const body = [];
    while (i < lines.length && isTableRow(lines[i])) { body.push(cells(lines[i])); i++; }
    /* A header row of empty cells is a layout device, not a heading — the
       two-column spec tables in this document use one. Rendering it draws a
       grey band over nothing. */
    const headed = head.some(c => c.trim());
    html.push('<div class="t"><table>'
      + (headed ? '<thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead>' : '')
      + '<tbody>'
      + body.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('')
      + '</tbody></table></div>');
    continue;
  }

  if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
    const ordered = /^\s*\d+\.\s+/.test(line);
    const items = [];
    while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
      let text = lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, '');
      i++;
      /* A continuation line is indented and is not itself a new item. */
      while (i < lines.length && /^\s{2,}\S/.test(lines[i])
             && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
        text += ' ' + lines[i].trim();
        i++;
      }
      items.push(`<li>${inline(text)}</li>`);
    }
    html.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
    continue;
  }

  const buf = [];
  while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>|---+$)/.test(lines[i])
         && !isTableRow(lines[i]) && !/^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) {
    buf.push(lines[i]); i++;
  }
  const para = inline(buf.join(' ').trim());
  /* A paragraph that is only a picture is a figure, not a paragraph. */
  html.push(/^<figure>/.test(para) ? para : `<p>${para}</p>`);
}

/* ---- the shell ----------------------------------------------------------- */

const title = (lines.find(l => l.startsWith('# ')) || '# Document').slice(2).trim();

const page = `<!doctype html>
<html lang="${process.env.DOC_LANG || 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{
  --ink:#131820; --ink-2:#363e4b; --ink-3:#4d5766; --ink-4:#626d7e;
  --line:#dde2e9; --line-soft:#eceff3; --paper:#ffffff; --app:#f5f7fa;
  --brand:#1a419e; --brand-soft:#f1f4fa; --code:#15347e;
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--app);color:var(--ink-2);
  font:15px/1.65 "Inter","Segoe UI",system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:40px 28px 80px;background:var(--paper);
  box-shadow:0 1px 2px rgba(19,24,32,.06)}
h1,h2,h3,h4{color:var(--ink);line-height:1.25;text-wrap:balance}
h1{font-size:34px;font-weight:700;margin:0 0 8px;letter-spacing:-.01em}
h2{font-size:25px;font-weight:650;margin:52px 0 14px;padding-bottom:8px;
  border-bottom:2px solid var(--line)}
h3{font-size:19px;font-weight:600;margin:32px 0 10px}
h4{font-size:16px;font-weight:600;margin:24px 0 8px;color:var(--ink-2)}
p{margin:0 0 14px;max-width:86ch}
ul,ol{margin:0 0 14px;padding-left:22px;max-width:86ch}
li{margin:5px 0}
a{color:var(--brand);text-decoration:none}
a:hover{text-decoration:underline;text-underline-offset:.18em}
hr{border:0;border-top:1px solid var(--line-soft);margin:34px 0}
code{font:500 13px/1.5 "JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--brand-soft);color:var(--code);padding:1px 5px;border-radius:3px}
blockquote{margin:0 0 16px;padding:12px 16px;background:var(--brand-soft);
  border-left:3px solid var(--brand);border-radius:0 4px 4px 0;color:var(--ink-2);max-width:86ch}
blockquote p{margin:0}
.t{overflow-x:auto;margin:0 0 18px}
table{border-collapse:collapse;width:100%;font-size:13.5px}
th{text-align:left;font-weight:600;color:var(--ink);background:var(--app);
  border-bottom:1px solid var(--line);padding:8px 10px;white-space:nowrap}
td{border-bottom:1px solid var(--line-soft);padding:8px 10px;vertical-align:top}
td code{white-space:nowrap}
tr:last-child td{border-bottom:0}
figure{margin:18px 0 24px}
img{max-width:100%;height:auto;display:block;border:1px solid var(--line);border-radius:6px}
.toc{background:var(--app);border:1px solid var(--line);border-radius:8px;
  padding:18px 22px;margin:26px 0 34px}
.toc h2{margin:0 0 10px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink-4);border:0;padding:0}
.toc ol{list-style:none;margin:0;padding:0;columns:2;column-gap:36px}
.toc li{margin:3px 0;break-inside:avoid}
.toc li.l1{font-weight:600;color:var(--ink);margin-top:10px}
.toc li.l1:first-child{margin-top:0}
.toc li.l2{padding-left:14px}
@media (max-width:760px){.wrap{padding:24px 16px 60px}.toc ol{columns:1}h1{font-size:27px}}
@media print{
  body{background:#fff}
  .wrap{max-width:none;padding:0;box-shadow:none}
  h2{page-break-after:avoid}
  figure,table,blockquote{page-break-inside:avoid}
  .toc{break-after:page}
}
</style>
</head>
<body>
<div class="wrap">
<nav class="toc"><h2>${process.env.DOC_TOC_LABEL || 'Contents'}</h2><ol>
${toc.map(t => `<li class="l${t.level}"><a href="#${t.id}">${esc(t.text)}</a></li>`).join('\n')}
</ol></nav>
${html.join('\n')}
</div>
</body>
</html>`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${out} — ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB, `
  + `${imageCount} images inlined, self-contained`);
