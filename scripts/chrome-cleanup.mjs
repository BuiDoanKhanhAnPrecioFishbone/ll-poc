/**
 * Kill-safe cleanup for every script that launches headless Chrome.
 *
 *   const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vy-render-'));
 *   const chrome = spawn(CHROME, [...]);
 *   cleanupOnKill(chrome, profile);
 *
 * WHY. Every check here launches Chrome with a throwaway profile and removes
 * both at the bottom of main — which only runs on a normal exit. On 14 Sep 2026
 * a laptop's disk filled to the last byte, and it took three rounds to get the
 * space back, because two things were true at once:
 *
 *   Killed runs had left Chrome running. Ctrl-C in a terminal signals the whole
 *   process group, so Chrome dies with its parent — but signalling only the
 *   Node process does not reach it: `kill <pid>`, a CI cancellation, or
 *   `pkill -f mobile-check`, whose pattern cannot match Chrome's command line.
 *   Chrome carries on, parentless, writing into its profile.
 *
 *   Deleting those profiles freed nothing. A deleted file's blocks are not
 *   returned until the last process holding it open exits, and the orphaned
 *   Chromes were holding them. The directories vanished; the space did not.
 *
 * WHAT THIS COVERS: SIGINT, SIGTERM and SIGHUP; an uncaught exception or
 * rejection; and any `process.exit()` in a script's own error paths that forgot
 * the profile — several did. Each kills Chrome and removes its profile.
 *
 * WHAT IT CANNOT COVER: SIGKILL, which no process can intercept. For that case
 * the next run sweeps profiles a killed run left behind, older than six hours —
 * long enough that none can belong to a run still in progress, since the
 * slowest check here takes five minutes.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/* Exactly the prefixes these scripts create. A glob of vy-* would do the same
   today and would quietly start deleting anything else that ever used it. */
const PREFIXES = [
  'vy-render-', 'vy-touch-', 'vy-mobile-', 'vy-focus-',
  'vy-hover-', 'vy-shots-', 'vy-sweep-',
];

const STALE_MS = 6 * 60 * 60 * 1000;

const SIGNAL_CODES = { SIGINT: 130, SIGTERM: 143, SIGHUP: 129 };

let swept = false;

/** Removes profile directories left by runs that were killed outright. */
export function sweepStaleProfiles({ now = Date.now(), dir = os.tmpdir() } = {}) {
  const removed = [];
  let entries = [];
  try { entries = fs.readdirSync(dir); } catch { return removed; }
  for (const name of entries) {
    if (!PREFIXES.some(p => name.startsWith(p))) continue;
    const full = path.join(dir, name);
    let stat;
    try { stat = fs.statSync(full); } catch { continue; }
    if (!stat.isDirectory() || now - stat.mtimeMs < STALE_MS) continue;
    try { fs.rmSync(full, { recursive: true, force: true }); removed.push(name); }
    catch { /* in use or already gone */ }
  }
  return removed;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* A child killed by signal keeps exitCode null forever and sets signalCode, so
   "still running" has to look at both. */
const running = child => child.exitCode === null && child.signalCode === null;

/* SIGKILL IS A REQUEST, NOT AN EVENT. Removing the profile straight after
   sending it raced Chrome's own shutdown: its child processes outlive the
   browser process by a moment, and one of them recreated the profile's
   Default/ directory after it had been deleted. Measured on the first run of
   this helper — the orphaned processes were gone, and an empty skeleton of the
   profile was still on disk. So: wait for the browser to exit, then delete, and
   delete again until the directory stays gone. */
async function removeWhenSettled(dir) {
  for (let i = 0; i < 10; i++) {
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 }); } catch { /* retry */ }
    await sleep(150);
    if (!fs.existsSync(dir)) {
      await sleep(150);
      if (!fs.existsSync(dir)) return;
    }
  }
}

/**
 * Registers cleanup for one Chrome and its profile. Idempotent, so it is safe
 * alongside a script's own normal-exit teardown, which runs first.
 */
export function cleanupOnKill(chrome, profile) {
  if (!swept) {
    swept = true;
    const removed = sweepStaleProfiles();
    if (removed.length) {
      console.log(`removed ${removed.length} Chrome profile(s) left behind by killed runs`);
    }
  }

  let exiting = false;

  /* The full path: kill, wait for the browser to go, remove, exit. Used for
     signals and crashes, where there is time to await. */
  const killThenExit = async (code, err) => {
    if (exiting) return;
    exiting = true;
    if (err) console.error(err?.stack || err);
    try { if (running(chrome)) chrome.kill('SIGKILL'); } catch { /* already gone */ }
    if (running(chrome)) {
      await Promise.race([new Promise(r => chrome.once('exit', r)), sleep(3000)]);
    }
    await removeWhenSettled(profile);
    process.exit(code);
  };

  for (const sig of Object.keys(SIGNAL_CODES)) {
    process.once(sig, () => { killThenExit(SIGNAL_CODES[sig]); });
  }
  process.once('uncaughtException', err => { killThenExit(2, err); });
  process.once('unhandledRejection', err => { killThenExit(2, err); });

  /* The fallback, for a script's own `process.exit()` in an error path that
     skipped its teardown. An exit handler cannot await, so this is best effort
     and can lose the race above; whatever it misses is an empty skeleton that
     the stale sweep removes on a later run. */
  process.on('exit', () => {
    if (exiting) return;
    try { if (running(chrome)) chrome.kill('SIGKILL'); } catch { /* already gone */ }
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* already gone */ }
  });
}
