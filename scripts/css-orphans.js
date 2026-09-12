/**
 * Reports CSS classes that no component uses any more.
 *
 * This repo has been bitten three times by the same class of bug: a component is
 * rewritten, its old rules stay behind, and the next person reads a stylesheet
 * that describes markup which no longer exists. Worse, a stale rule in app.css
 * silently overrides a live one in components.css, because app.css loads later
 * at equal specificity — that is exactly how the checklist rows collapsed and
 * how the edit-mode layout broke.
 *
 *   node scripts/css-orphans.js
 *
 * RUNTIME-BUILT NAMES ARE LISTED SEPARATELY, not as orphans. Three components
 * compose a class from a prop — `vy-btn--${variant}`, `vy-field--${variant}`,
 * `vy-dialog--${size}` — so no literal string contains the result and a naive
 * scan calls every one of them dead. It called ten dead on 12 Sep 2026 and all
 * ten were live; acting on that list would have broken the Slot button path,
 * every field variant and every dialog size.
 *
 * This script cannot tell a live `vy-btn--danger` from a dead one — only that
 * something builds `vy-btn--` at runtime. So it reports them under their own
 * heading and leaves the judgement to a person, instead of filing them where
 * they read as safe to delete.
 */
import fs from 'node:fs';
import path from 'node:path';
const cssFiles=['tokens','base','md3','components','app','responsive'].map(f=>`src/theme/${f}.css`);
const css=cssFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
function walk(d,out=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory())walk(p,out); else if(/\.(tsx|ts)$/.test(e.name))out.push(p);} return out;}
const src=walk('src').map(f=>fs.readFileSync(f,'utf8')).join('\n');
const used=new Set();
// className="a b c", template literals, and 'x' + cond
for(const m of src.matchAll(/['"`]([^'"`]*\bvy-[a-z0-9-]+[^'"`]*)['"`]/g))
  for(const c of m[1].split(/[\s]+/)) if(/^vy-[a-z0-9-]+$/.test(c)) used.add(c);
const declared=new Set([...css.matchAll(/\.(vy-[a-z0-9-]+)/g)].map(m=>m[1]));

/* Prefixes a component completes at runtime: `vy-btn--${variant}` yields
   `vy-btn--`. Anything declared under one of these cannot be judged here. */
const dynamic=new Set();
for(const m of src.matchAll(/\b(vy-[a-z0-9-]*?--)\$\{/g)) dynamic.add(m[1]);
const isDynamic=c=>[...dynamic].some(p=>c.startsWith(p));

const unused=[...declared].filter(c=>!used.has(c)).sort();
const orphans=unused.filter(c=>!isDynamic(c));
const runtime=unused.filter(isDynamic);

/* Classes defined in more than one stylesheet.
   app.css loads after components.css, so a repeated name silently inherits
   whatever the earlier file set and then partly overrides it. This has now cost
   two bugs: .vy-record-head reshaped the RFQ header into a flex row, and
   .vy-badge stretched a count badge to 104px. Neither threw, and neither was
   visible in the DOM. */
const perFile = {};
/* responsive.css is EXCLUDED: overriding an earlier rule at a breakpoint is
   what that file is for, so a repeat there is intentional. Everywhere else a
   repeated name means one rule is quietly eating another. */
for (const f of cssFiles.filter(f => !f.endsWith('responsive.css'))) {
  const body = fs.readFileSync(f, 'utf8');
  /* Only BARE definitions — `.vy-foo {`. A descendant or state selector
     (`.vy-foo .bar`, `.vy-foo:has(...)`) legitimately refines a class defined
     elsewhere; two bare rules for the same class is the bug. */
  for (const m of body.matchAll(/^\.(vy-[a-z0-9-]+)\s*\{/gm)) (perFile[m[1]] ??= new Set()).add(f);
}
const dupes = Object.entries(perFile).filter(([, files]) => files.size > 1);
if (dupes.length) {
  console.log('\nDEFINED IN MORE THAN ONE FILE — later file wins, silently:');
  for (const [cls, files] of dupes) console.log('  .' + cls, '→', [...files].join(', '));
}
console.log('declared',declared.size,'used',used.size,'orphaned',orphans.length);
console.log(orphans.join('\n'));
if(runtime.length){
  console.log(`\nBUILT AT RUNTIME — not orphans, and not automatically judgeable (${runtime.length})`);
  console.log(`  from ${[...dynamic].sort().join(', ')}`);
  console.log('  '+runtime.join('\n  '));
}
process.exit(0);
