/**
 * Fold a document's figures into the document.
 *
 *   node scripts/bundle-doc.mjs docs/_src/so-sanh-prototype-16oct.html \
 *                               docs/so-sanh-prototype-16oct.html
 *
 * WHY THERE ARE TWO FILES. The source in `docs/_src/` keeps `{{IMG:name}}`
 * where a picture goes, so the prose is the thing you edit and a diff of it
 * reads as prose. The built file is what leaves the building: one file, no
 * folder of images beside it, nothing to lose in an email. A document that
 * arrives with its pictures missing is a document that gets ignored.
 *
 * `{{ROCKET}}` takes the boot-screen illustration inline — SVG, so it is sharp
 * at any size and costs 4KB rather than a photograph of itself.
 */
import fs from 'node:fs';
import path from 'node:path';

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error('usage: node scripts/bundle-doc.mjs <src.html> <out.html>');
  process.exit(1);
}

const SHOTS = process.env.SHOTS_DIR || 'docs/shots/compare-16oct';
const ROCKET = process.env.ROCKET
  || 'docs/assets/rocket-journey/vy-rocket-journey-horizontal-light.svg';

let html = fs.readFileSync(src, 'utf8');
const missing = [];

html = html.replace(/\{\{ROCKET\}\}/g, () => {
  if (!fs.existsSync(ROCKET)) { missing.push(ROCKET); return ''; }
  /* The XML declaration, if one is ever added, cannot sit inside a body. */
  return fs.readFileSync(ROCKET, 'utf8').replace(/^<\?xml[^>]*\?>\s*/, '').trim();
});

html = html.replace(/\{\{IMG:([\w-]+)\}\}/g, (_, name) => {
  const file = path.join(SHOTS, `${name}.jpg`);
  if (!fs.existsSync(file)) { missing.push(file); return ''; }
  return `data:image/jpeg;base64,${fs.readFileSync(file).toString('base64')}`;
});

if (missing.length) {
  console.error('missing:\n  ' + missing.join('\n  ')
    + '\nRun scripts/capture-compare.mjs first.');
  process.exit(1);
}

const left = html.match(/\{\{[^}]+\}\}/g);
if (left) { console.error('unresolved placeholders: ' + left.join(', ')); process.exit(1); }

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`${out} — ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB, self-contained`);
