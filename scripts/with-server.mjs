/**
 * Start the dev server, run the checks against it, shut it down.
 *
 *   node scripts/with-server.mjs render:check touch:check
 *   npm run check:visual          # the same thing, all five
 *
 * WHY THIS EXISTS, beyond saving a terminal. Every browser check defaults to
 * `http://localhost:5180`, and `npm run dev` serves on **5173** — Vite's
 * default, since vite.config.ts sets no port. 5180 is a port Vite only reaches
 * by walking up from 5173 when the seven below it are busy. So the documented
 * sequence — "npm run dev in another terminal, then npm run check" — exits 2
 * with "Cannot reach http://localhost:5180" on a machine where nothing else is
 * running. The gate pointed at a port nothing serves.
 *
 * This script owns the port instead of hoping: it starts Vite with
 * `--strictPort` on the port the checks actually read, so a busy port is a
 * loud failure rather than a server that quietly lands somewhere else and a
 * check that quietly can't find it.
 *
 * If something already answers on BASE_URL it is reused and left running —
 * your own `npm run dev` is not killed out from under you.
 *
 * EVERY CHECK RUNS, even after one fails. `npm run a && npm run b` stops at
 * the first failure, which on a gate means finding one defect per run. These
 * are independent measurements of the same build; you want all of them.
 */
import { spawn } from 'node:child_process';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const PORT = Number(new URL(BASE).port || 80);
const BOOT_TIMEOUT_MS = 90_000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Module scope so the signal handlers below can reach it. */
let server = null;

async function answers() {
  try {
    const c = AbortSignal.timeout(2000);
    await fetch(BASE, { signal: c });
    return true;
  } catch { return false; }
}

/** Run one npm script, inheriting stdio. Resolves with the exit code. */
function run(script) {
  return new Promise(resolve => {
    const p = spawn('npm', ['run', '-s', script], {
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: BASE },
    });
    p.on('exit', code => resolve(code ?? 1));
    p.on('error', () => resolve(1));
  });
}

async function main() {
  const scripts = process.argv.slice(2);
  if (!scripts.length) {
    console.error('usage: node scripts/with-server.mjs <npm-script> [...]');
    process.exit(2);
  }

  let log = '';

  if (await answers()) {
    console.log(`Reusing the server already answering on ${BASE}`);
  } else {
    console.log(`Starting the dev server on ${BASE} (strict port)`);
    /* `detached` puts npm and the Vite it spawns in their own process group.
       Killing the npm wrapper alone leaves Vite holding the port — the next
       run then "reuses" a server for a tree that is no longer checked out. */
    server = spawn('npm', ['run', 'dev', '--', '--port', String(PORT), '--strictPort'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });
    /* Kept, not streamed: it is noise on a good run and the only explanation
       on a bad one. Printed below if the server never comes up. */
    server.stdout.on('data', d => { log += d; });
    server.stderr.on('data', d => { log += d; });

    const deadline = Date.now() + BOOT_TIMEOUT_MS;
    let up = false;
    while (Date.now() < deadline) {
      if (server.exitCode !== null) break;
      if (await answers()) { up = true; break; }
      await sleep(300);
    }
    if (!up) {
      console.error(`\nThe dev server never answered on ${BASE}. Vite said:\n`);
      console.error(log.trim() || '(nothing)');
      stop();
      process.exit(2);
    }
  }

  const results = [];
  for (const s of scripts) {
    console.log(`\n=== ${s} ===`);
    results.push([s, await run(s)]);
  }

  stop();

  console.log('\n--- summary ---');
  for (const [s, code] of results) {
    console.log(`  ${code === 0 ? 'pass' : 'FAIL'}  ${s}${code === 0 ? '' : `  (exit ${code})`}`);
  }
  process.exit(results.some(([, c]) => c !== 0) ? 1 : 0);
}

function stop() {
  if (!server || server.exitCode !== null) return;
  const pid = server.pid;
  server = null;
  try { process.kill(-pid, 'SIGTERM'); }
  catch { /* already gone */ }
}

/* Ctrl-C must not leave a Vite process holding the port: the next run would
   then "reuse" a server serving whatever was checked out at the time. */
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { stop(); process.exit(130); });
}

main().catch(e => { console.error(e.message); process.exit(2); });
