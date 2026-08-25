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
 * The six `vy-btn--*` variants are expected to show: Button builds its class at
 * runtime from the `variant` prop, so no literal string contains them.
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
const orphans=[...declared].filter(c=>!used.has(c)).sort();

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
process.exit(0);
