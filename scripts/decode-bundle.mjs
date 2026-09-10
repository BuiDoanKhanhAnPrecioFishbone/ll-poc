/**
 * Recover the string tables from a Voyager production bundle.
 *
 *   curl -s https://erp.linhlongengineering.com/ | grep -o 'assets/lib-bundle-[^"]*'
 *   curl -s https://erp.linhlongengineering.com/assets/<lib-bundle>.js -o lib.js
 *   grep -o 'assets/chunk-[A-Za-z0-9_-]*\.js' lib.js | sort -u | sed 's|assets/||' \
 *     | xargs -P 12 -I{} curl -s "https://erp.linhlongengineering.com/assets/{}" -o "chunks/{}"
 *   node scripts/decode-bundle.mjs chunks/*.js      # writes decoded.json
 *
 * WHY THIS EXISTS. `docs/bundle-evidence.md` was extracted by hand on 24 Aug
 * 2026. By 10 Sep all four chunks it cites returned 404: the app was rebuilt and
 * every chunk hash changed. The evidence was unreproducible, which for a
 * document whose whole value is "these strings are literals in the shipped code"
 * is the same as not having it. This makes the next re-check an hour instead of
 * a day.
 *
 * HOW THE OBFUSCATION WORKS. Each scope holds three pieces: an array function
 * `function T(){var v=[...];return(T=function(){return v})()}`, an accessor
 * `function q(v,t){v-=OFFSET;...}` that base64-decodes an entry, and a rotation
 * IIFE that shifts the array until a checksum of parseInt-ed entries matches.
 * All three must be evaluated together — the accessor alone returns garbage,
 * because the rotation has not run.
 *
 * WHAT COST THE FIRST ATTEMPT. A regex requiring `var r=T()` matched only one
 * codegen; the `const`/`let` variant silently failed, and every failure was
 * swallowed by a try/catch. It returned 3,595 strings and looked like it had
 * worked. Broadening the declaration keyword and finding the rotation IIFE by
 * walking back from the `for(;;)` took it to 54,342. The `stats` counter is
 * there so the next run reports how many scopes it could NOT decode, rather
 * than quietly returning a plausible-looking fraction.
 */
import fs from 'node:fs';
import vm from 'node:vm';

const matchBraces = (s, from) => {
  let d = 0;
  for (let k = from; k < s.length; k++) {
    if (s[k] === '{') d++;
    else if (s[k] === '}') { d--; if (d === 0) return k; }
  }
  return -1;
};

const stats = { scopes: 0, ok: 0, noArr: 0, noRot: 0, threw: 0 };

function decodeChunk(src) {
  const out = new Set();
  // accessor: function ACC(a,b){ a-=OFFSET; <var|let|const> r=ARR();
  const accRe = /function (\w+)\((\w+)(?:,(\w+))?\)\{\s*\2\s*-=\s*(\d+)\s*;\s*(?:var|let|const)\s+(\w+)\s*=\s*(\w+)\(\)/g;
  let m;
  while ((m = accRe.exec(src))) {
    stats.scopes++;
    const acc = m[1], offset = Number(m[4]), arrFn = m[6];
    const accEnd = matchBraces(src, src.indexOf('{', m.index + 8));
    if (accEnd < 0) { stats.noArr++; continue; }
    const accSrc = src.slice(m.index, accEnd + 1);

    const arrIdx = src.indexOf(`function ${arrFn}(){`);
    if (arrIdx < 0) { stats.noArr++; continue; }
    const arrEnd = matchBraces(src, src.indexOf('{', arrIdx + arrFn.length + 10));
    if (arrEnd < 0) { stats.noArr++; continue; }
    const arrSrc = src.slice(arrIdx, arrEnd + 1);

    // rotation IIFE — find a `for(<decl> X=ACC,Y=ARR();;)` and walk out to the enclosing !function/(function
    let rotSrc = '';
    const rotRe = new RegExp(`for\\((?:var|let|const)\\s+\\w+\\s*=\\s*${acc}\\s*,\\s*\\w+\\s*=\\s*${arrFn}\\(\\)\\s*;;\\)`);
    const rm = rotRe.exec(src);
    if (rm) {
      // walk back to the nearest `!function(){` or `(function(){` before it
      const back = src.lastIndexOf('function', rm.index);
      const bodyOpen = src.indexOf('{', back + 8);
      const bodyEnd = matchBraces(src, bodyOpen);
      if (bodyEnd > 0) rotSrc = '!' + src.slice(back, bodyEnd + 1) + '()';
    }
    if (!rotSrc) stats.noRot++;

    const prog = `${arrSrc}\n${accSrc}\n${rotSrc}\n
      (function(){ const res=[]; const arr=${arrFn}();
        for (let i=0;i<arr.length;i++){ try{ const v=${acc}(${offset}+i); if(typeof v==='string'&&v) res.push(v); }catch{} }
        return res; })()`;
    try {
      const res = vm.runInNewContext(prog,
        { window: {}, console: { log(){}, warn(){}, error(){}, info(){}, trace(){}, exception(){}, table(){} },
          document: {}, globalThis: {} },
        { timeout: 5000 });
      if (res.length) stats.ok++;
      for (const s of res) out.add(s);
    } catch { stats.threw++; }
  }
  return [...out];
}

const files = process.argv.slice(2);
const all = {};
for (const f of files) {
  try { all[f] = decodeChunk(fs.readFileSync(f, 'utf8')); } catch { all[f] = []; }
}
fs.writeFileSync('decoded.json', JSON.stringify(all));
const n = Object.values(all).reduce((a, b) => a + b.length, 0);
console.log(`chunks=${files.length} strings=${n}`, JSON.stringify(stats));
