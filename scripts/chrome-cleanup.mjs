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
  'vy-hover-', 'vy-shots-', 'vy-sweep-', 'vy-dialog-',
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

  const onSignal = {};
  for (const sig of Object.keys(SIGNAL_CODES)) {
    onSignal[sig] = () => { killThenExit(SIGNAL_CODES[sig]); };
    process.once(sig, onSignal[sig]);
  }
  const onUncaught = err => { killThenExit(2, err); };
  const onRejection = err => { killThenExit(2, err); };
  process.once('uncaughtException', onUncaught);
  process.once('unhandledRejection', onRejection);

  /* The fallback, for a script's own `process.exit()` in an error path that
     skipped its teardown. An exit handler cannot await, so this is best effort
     and can lose the race above; whatever it misses is an empty skeleton that
     the stale sweep removes on a later run. */
  const onExit = () => {
    if (exiting) return;
    try { if (running(chrome)) chrome.kill('SIGKILL'); } catch { /* already gone */ }
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* already gone */ }
  };
  process.on('exit', onExit);

  /* RELEASE, FOR A SCRIPT THAT RUNS MORE THAN ONE CHROME. Call it once this
     Chrome has been shut down, and the handlers go with it. Without it they
     outlive their Chrome and pile up, one set per Chrome, and a later Ctrl-C
     runs all of them at once: a stale handler finds its Chrome already gone and
     calls process.exit while the live handler is still in its remove-until-gone
     loop, which cuts that loop short and can leave the empty profile skeleton the
     loop exists to catch.

     IT DOES NOT PREVENT AN ORPHAN, and an earlier version of this comment said it
     did. Measured: capture-shots.mjs with release() removed, killed while its
     second Chrome ran, left 0 Chrome processes and 0 profiles. Every handler
     sends SIGKILL to its own Chrome before it waits for anything, so the live
     Chrome dies whichever handler finishes first. What release() protects is the
     tidy half of the cleanup, and the sweep backs that up regardless.
     capture-shots.mjs runs a Chrome per viewport kind and is the reason this
     exists. A script with one Chrome can ignore the return value. */
  return function release() {
    for (const sig of Object.keys(SIGNAL_CODES)) process.off(sig, onSignal[sig]);
    process.off('uncaughtException', onUncaught);
    process.off('unhandledRejection', onRejection);
    process.off('exit', onExit);
  };
}

/**
 * Wait for a launched Chrome to expose a debuggable page, and say what went
 * wrong when it does not.
 *
 * WHY THIS IS SHARED NOW. Seven scripts each carried an identical 11-line
 * `connect()`: a 60-iteration loop at 250ms, so a **15-second** budget, ending
 * in `throw new Error('Chrome never exposed a debuggable page')`. On 15 Oct
 * 2026 three pushes to main failed CI on exactly that message — once in
 * touch:check, twice in focus:check — each dying at the 15-second mark with
 * every other check green. A different check each time is the signature of a
 * startup race, not a defect in the thing being checked.
 *
 * TWO THINGS WERE WRONG.
 *
 * Fifteen seconds is not a budget, it is a guess, and it was made on a laptop
 * where Chrome is warm. A CI runner starts it cold, from a page cache that has
 * never seen the binary. Sixty seconds costs nothing when Chrome is ready in
 * one — the loop exits on success, not on the clock.
 *
 * And the message blamed the wrong thing. Chrome is spawned with
 * `stdio: 'ignore'`, so a Chrome that CRASHED and a Chrome that was merely slow
 * produced the same sentence, and neither said which. Watching the child means
 * the common failure — it died, here is the code — reports itself, and only a
 * genuine timeout is called a timeout.
 */
export async function connectToChrome(port, chrome, { budgetMs = 60_000, everyMs = 250 } = {}) {
  let death = null;
  chrome?.once?.('exit', (code, signal) => { death = { code, signal }; });
  chrome?.once?.('error', err => { death = { err: err.message }; });

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let waited = 0; waited < budgetMs; waited += everyMs) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json`);
      const page = (await r.json()).find(t => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }

    if (death) {
      const how = death.err ? `could not be started: ${death.err}`
        : death.signal ? `was killed by ${death.signal}`
        : `exited with code ${death.code}`;
      throw new Error(`Chrome ${how}. Tried ${port}; CHROME_PATH=${process.env.CHROME_PATH ?? '(unset)'}`);
    }
    await sleep(everyMs);
  }
  throw new Error(
    `Chrome never exposed a debuggable page on port ${port} within ${budgetMs / 1000}s. `
    + 'It is still running, so this is a timeout rather than a crash.',
  );
}
