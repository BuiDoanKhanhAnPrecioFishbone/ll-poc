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
console.log('declared',declared.size,'used',used.size,'orphaned',orphans.length);
console.log(orphans.join('\n'));
process.exit(0);
