/**
 * tokens-build — the token table, and a machine-readable export.
 *
 * THE PLAN SAID THE OTHER DIRECTION, AND THE FILE SAYS IT WAS WRONG.
 * Phase 5 was written as "make DTCG JSON the source, generate tokens.css from
 * it, prove the output byte-identical". Measured before starting:
 *
 *     src/theme/tokens.css   1,055 lines
 *       prose inside comments      544   51%
 *       token declarations         414   39%
 *
 * More than half that file is reasoning — hue degrees worked out, contrast
 * ratios with the date they were measured, decision ids, what was tried and
 * rejected. Making JSON the source means that prose lives in JSON strings,
 * where it cannot be read or edited. The byte-identical check would have gone
 * green while the most valuable half of the file got worse. So the CSS stays
 * the source, and the JSON is an EXPORT.
 *
 * WHAT IS CHECKED INSTEAD. Every declaration is re-emitted from the parsed
 * model and compared to the line it came from. 414 of 414 must match exactly,
 * or this exits non-zero. That is the same guarantee the plan wanted, applied
 * to the part a machine consumes rather than to the part a person reads.
 *
 *   node scripts/tokens-build.mjs          write both, check, report
 *   node scripts/tokens-build.mjs --check  check only, write nothing
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src/theme/tokens.css');
const JSON_OUT = path.join(ROOT, 'docs/tokens/voyager.tokens.json');
const MD_OUT = path.join(ROOT, 'docs/foundations/tokens/all-tokens.md');
const checkOnly = process.argv.includes('--check');

/* ---- parse ---------------------------------------------------------------
   Brace DEPTH, not a bare "}": a dark block is
   @media (prefers-color-scheme: dark) { :root:not(...) { … } }
   and resetting on the first closing brace drops every dark value — a fault
   this file's own history has already seen once. */
const lines = fs.readFileSync(SRC, 'utf8').split('\n');
/* A token is declared up to THREE times: once in :root, and once in each of
   the two dark blocks (@media prefers-color-scheme, and [data-theme="dark"]).
   Keeping only a light/dark pair silently drops the third — the check caught
   exactly that, 138 declarations missing out of 414 — so every occurrence is
   kept, and the two dark ones are compared to each other. */
const tokens = new Map();          // name → { name, decls: [{theme, line, value}], note }
let depth = 0, darkAt = null, comment = [], inComment = false;

const isDark = l => /\[data-theme=["']?dark/.test(l) || /prefers-color-scheme:\s*dark/.test(l);

lines.forEach((raw, i) => {
  const t = raw.trim();

  if (inComment) { comment.push(t.replace(/^\*+\s?/, '').replace(/\*\/$/, '').trim()); if (t.includes('*/')) inComment = false; }
  else if (t.startsWith('/*')) { comment = [t.replace(/^\/\*+\s?/, '').replace(/\*\/$/, '').trim()]; if (!t.includes('*/')) inComment = true; }

  if (isDark(t) && darkAt === null) darkAt = depth;

  /* 50 of the 414 declarations carry a trailing comment, and some are aligned
     with runs of spaces. Both are captured so a declaration rebuilds to its own
     line exactly; the trailing comment is also the best description there is,
     being about that one token rather than the paragraph above it. */
  const m = /^(--vy-[a-z0-9-]+):(\s*)(.+?);(.*)$/.exec(t);
  if (m) {
    const [, name, gap, value, suffix] = m;
    const rec = tokens.get(name) || { name, decls: [], note: '' };
    // the first prose above a declaration, when it is close enough to be about it
    if (!rec.note && comment.length && comment.join(' ').length < 400) {
      /* Section headers are drawn with runs of dashes; they are decoration,
         not description, and they read as noise in a JSON string. */
      rec.note = comment.join(' ').replace(/-{3,}/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const trail = /\/\*\s*(.*?)\s*\*\//.exec(suffix);
    if (trail) rec.note = trail[1];
    rec.decls.push({ theme: darkAt !== null ? 'dark' : 'light', line: i + 1, value, gap, suffix });
    tokens.set(name, rec);
    comment = [];
  }

  depth += (raw.match(/{/g) || []).length - (raw.match(/}/g) || []).length;
  if (darkAt !== null && depth <= darkAt) darkAt = null;
});

/* ---- the check: every declaration re-emits to the line it came from ------ */
let decls = 0, mismatches = [], darkDisagree = [];
for (const rec of tokens.values()) {
  for (const d of rec.decls) {
    decls++;
    if (lines[d.line - 1].trim() !== `${rec.name}:${d.gap}${d.value};${d.suffix}`) mismatches.push(`${rec.name} line ${d.line}`);
  }
  const darks = [...new Set(rec.decls.filter(d => d.theme === 'dark').map(d => d.value))];
  if (darks.length > 1) darkDisagree.push(`${rec.name}: ${darks.join('  vs  ')}`);
  rec.light = rec.decls.find(d => d.theme === 'light')?.value ?? null;
  rec.dark = darks[0] ?? null;
  rec.lightLine = rec.decls.find(d => d.theme === 'light')?.line ?? null;
}
const totalInFile = lines.filter(l => /^\s*--vy-[a-z0-9-]+:/.test(l)).length;

/* ---- DTCG export ---------------------------------------------------------
   Groups come from the first segment after the prefix. The W3C draft says a
   tool must not infer meaning from a group, so these are organisation only. */
const TYPE = v =>
  /^#|^rgba?\(|^hsla?\(/.test(v) ? 'color'
  : /^\d+(\.\d+)?(px|rem|em|%)$/.test(v) ? 'dimension'
  : /^\d+ms$|^\d+(\.\d+)?s$/.test(v) ? 'duration'
  : /^cubic-bezier/.test(v) ? 'cubicBezier'
  : /^\d+(\.\d+)?$/.test(v) ? 'number'
  : null;

const aliasOf = v => {
  const m = /^var\((--vy-[a-z0-9-]+)\)$/.exec(v.trim());
  if (!m) return null;
  const rest = m[1].replace(/^--vy-/, '').split('-');
  return `{${rest[0]}.${rest.slice(1).join('-') || 'base'}}`;
};

const groups = {};
for (const rec of [...tokens.values()].sort((a, b) => a.decls[0].line - b.decls[0].line)) {
  const parts = rec.name.replace(/^--vy-/, '').split('-');
  const g = parts[0], key = parts.slice(1).join('-') || 'base';
  const v = rec.light ?? rec.dark;
  const entry = { $value: aliasOf(v) || v };
  const ty = TYPE(v); if (ty) entry.$type = ty;
  if (rec.note) entry.$description = rec.note;
  if (rec.dark !== null && rec.dark !== rec.light) {
    entry.$extensions = { 'com.voyager.dark': aliasOf(rec.dark) || rec.dark };
  }
  (groups[g] ??= {})[key] = entry;
}

/* ---- the lookup page ----------------------------------------------------- */
const esc = s => String(s).replace(/\|/g, '\\|');
const md = [];
md.push('# All tokens');
md.push('');
md.push('> **Generated** by `scripts/tokens-build.mjs` from `src/theme/tokens.css`,');
md.push('> which stays the source. Do not edit this page: edit the CSS, where each');
md.push('> value sits beside the reasoning and the measurement that chose it.');
md.push('');
md.push(`${tokens.size} tokens in ${Object.keys(groups).length} groups. A dash in **Dark** means the value does not change between themes.`);
md.push('');
md.push('A machine-readable export of the same set, in the W3C Design Tokens draft format, is at `docs/tokens/voyager.tokens.json`.');
for (const g of Object.keys(groups).sort()) {
  md.push('');
  md.push(`## ${g}`);
  md.push('');
  md.push('| Token | Light | Dark |');
  md.push('|---|---|---|');
  for (const [k, e] of Object.entries(groups[g])) {
    const dark = e.$extensions?.['com.voyager.dark'];
    md.push(`| \`--vy-${g}${k === 'base' ? '' : '-' + k}\` | \`${esc(e.$value)}\` | ${dark ? '`' + esc(dark) + '`' : '—'} |`);
  }
}
md.push('');

if (!checkOnly && !mismatches.length) {
  fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });
  fs.writeFileSync(JSON_OUT, JSON.stringify(groups, null, 2) + '\n');
  fs.mkdirSync(path.dirname(MD_OUT), { recursive: true });
  fs.writeFileSync(MD_OUT, md.join('\n'));
}

console.log(`tokens: ${tokens.size} names, ${decls} declarations re-emitted and compared`);
console.log(`groups: ${Object.keys(groups).length}  ·  aliases: ${[...tokens.values()].filter(r => aliasOf(r.light ?? r.dark ?? '')).length}`);
if (decls !== totalInFile) {
  console.error(`FAIL: ${totalInFile} declarations in the file, ${decls} parsed — ${totalInFile - decls} were dropped`);
  process.exit(1);
}
if (darkDisagree.length) {
  /* The two dark blocks exist so a stated preference wins over the system one.
     They should always say the same thing; if they ever drift, a theme toggle
     and a system switch would paint different colours. */
  console.error(`FAIL: ${darkDisagree.length} token(s) are declared differently in the two dark blocks`);
  for (const d of darkDisagree.slice(0, 8)) console.error('  ' + d);
  process.exit(1);
}
if (mismatches.length) {
  console.error(`FAIL: ${mismatches.length} declaration(s) do not re-emit to their own line`);
  for (const m of mismatches.slice(0, 8)) console.error('  ' + m);
  process.exit(1);
}
console.log(checkOnly ? 'tokens-build OK (check only)' : `wrote ${path.relative(ROOT, JSON_OUT)} and ${path.relative(ROOT, MD_OUT)}`);
