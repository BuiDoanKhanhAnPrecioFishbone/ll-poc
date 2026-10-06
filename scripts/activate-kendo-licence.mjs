/* =============================================================================
   ACTIVATE THE KENDO LICENCE, IF THERE IS ONE TO ACTIVATE

   Runs on `npm install`. Without it, KendoReact paints a small badge over the
   corner of its components — found on 6 October 2026 in the corner of the Run
   Quotation dialog, in a build that had been demoed to the customer.

   WHY THIS IS A SCRIPT AND NOT ONE LINE IN package.json.

   1. It must NEVER fail an install. Continuous integration has no licence key
      and the repository is public, so `npm ci` there has to succeed unlicensed.
      A bare `kendo-ui-license activate` exits non-zero when it finds no key,
      which would stop the install.
   2. The key lives in `.env.local`, which is a Vite convention: Vite reads it,
      nothing else does. `@progress/kendo-licensing` reads the PROCESS
      environment, so the variable has to be lifted across — that is the whole
      reason activation never happened by itself on a developer's machine.
      Deployment is different: on Vercel, TELERIK_LICENSE is set in the
      dashboard and is already in the environment, so the lift is a no-op.

   The key itself is never printed, and nothing is written to the repository —
   activation patches `node_modules/@progress/kendo-licensing`, which is why it
   has to run again after every clean install. See docs/kendo-license-activation.md.
   ========================================================================== */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIN = path.join(root, 'node_modules', '.bin', 'kendo-ui-license');

/** The key from the process environment, or lifted out of `.env.local`. */
function licenceKey() {
  const fromEnv = process.env.TELERIK_LICENSE || process.env.KENDO_UI_LICENSE;
  if (fromEnv) return { key: fromEnv, from: 'the environment' };

  const envFile = path.join(root, '.env.local');
  if (!fs.existsSync(envFile)) return null;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = /^\s*(TELERIK_LICENSE|KENDO_UI_LICENSE)\s*=\s*(.+)\s*$/.exec(line);
    /* Quotes stripped, because a value may be written either way and the
       licensing tool is given the raw key. */
    if (m) return { key: m[2].trim().replace(/^["']|["']$/g, ''), from: '.env.local' };
  }
  return null;
}

const found = licenceKey();
if (!found) {
  /* Said out loud rather than silently skipped: an unlicensed build LOOKS fine
     until a Kendo component paints its badge, which is how this went unnoticed. */
  console.log('[kendo] no TELERIK_LICENSE found — skipping activation. '
    + 'Components will render with the unlicensed badge.');
  process.exit(0);
}
if (!fs.existsSync(BIN)) {
  console.log('[kendo] @progress/kendo-licensing is not installed — nothing to activate.');
  process.exit(0);
}

const r = spawnSync(BIN, ['activate'], {
  cwd: root,
  env: { ...process.env, TELERIK_LICENSE: found.key },
  encoding: 'utf8',
});
/* The tool prints the licence holder's email partially masked and the expiry;
   it does not print the key. Passed through as-is, minus anything long enough
   to be a key, because this output is read in CI logs. */
const text = `${r.stdout || ''}${r.stderr || ''}`.replace(/[A-Za-z0-9+/=]{40,}/g, '[redacted]');
console.log(text.trim() || `[kendo] activation ran with the key from ${found.from}.`);
/* Exit 0 whatever happened: a missing or expired licence is worth a message,
   never a broken install. */
process.exit(0);
