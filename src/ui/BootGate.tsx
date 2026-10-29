import { useEffect, useState, type ReactNode } from 'react';
import { BootScreen, LAUNCHING, STILL_CLIMBING, WELCOME } from './Loader';
import { BOOT_STAGES } from './bootStages';

/** Past the gate already, in this tab. Read in two places, so it is one function. */
const booted = () => {
  try { return sessionStorage.getItem('vy-booted') ? BOOT_STAGES.length : 0; }
  catch { return 0; }   /* a private window still boots, it just never remembers */
};

/**
 * Holds the app behind the boot screen until the boot stages have finished.
 *
 * ONCE A SESSION, which is the rule the customer's own prototype states:
 * "subsequent loads (not first of session): shorten or skip the animation".
 * A boot screen on every route change would be a page transition wearing a
 * boot screen's clothes. `sessionStorage` rather than `localStorage` on
 * purpose — a new tab is a new session and does boot again, because it really
 * does fetch everything again.
 *
 * IT DOES NOT GUARD THE LOGIN SCREEN. Booting before a password would be
 * loading a workspace for nobody; the gate goes inside the authenticated shell
 * and `/login` renders outside it.
 *
 * NO MINIMUM DISPLAY TIME, and that is a decision rather than an omission. The
 * usual trick is to hold a loading screen for 600ms so it does not flash —
 * which spends the user's time to make our indicator look better. When the
 * boot is genuinely instant the right amount of boot screen is none.
 *
 * WHAT THAT LEFT, until 29 Oct: the flash itself. The rule is right and it was
 * only half the answer — see the note on `shown` below, where the customer's
 * 0.4s gate supplies the other half.
 */
export function BootGate({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(booted);
  /**
   * Whether the boot screen is on screen at all, and whether it is leaving.
   *
   * THE 0.4s GATE IS THE CUSTOMER'S, AND IT FIXES A FAULT WE WROTE DOWN. This
   * file argued — correctly — against a minimum display time: holding a
   * loading screen so it does not flash spends the user's time to make our
   * indicator look better. But `bootStages.ts` then admitted the consequence:
   * "four of the five resolve instantly… the boot screen FLASHES rather than
   * tells a story". Her redesign answers it from the other end. Nothing is
   * shown for the first 0.4 seconds, so a boot that beats the clock shows
   * nothing at all, and one that does not is already worth a screen.
   *
   * The two rules are not in tension: no floor once it is up, no screen until
   * it is earned.
   */
  const [shown, setShown] = useState(false);
  const [exiting, setExiting] = useState(false);

  /**
   * RUNS ONCE, AND THE DEPENDENCY LIST IS THE WHOLE POINT.
   *
   * Written as `[step]` this deadlocked on the second station: advancing the
   * step re-ran the effect, whose cleanup set `live = false` and killed the
   * sequence that was advancing it. The boot screen sat on "Loading your menu"
   * for ever. A sequence that drives state cannot also be restarted by it.
   *
   * `Math.max` rather than `s + 1` because React runs effects twice in
   * development: two sequences can be in flight, and the second must not walk
   * the first one backwards.
   */
  useEffect(() => {
    if (booted() >= BOOT_STAGES.length) return;
    let live = true;
    const reveal = setTimeout(() => live && setShown(true), SHOW_AFTER);

    (async () => {
      for (let i = 0; i < BOOT_STAGES.length; i++) {
        /* Awaiting what there is to await, and nothing where there is none.
           A stage with no work advances on the next microtask, which is the
           truth about this build rather than a shortcut. */
        const work = BOOT_STAGES[i].run;
        if (work) await work();
        if (!live) return;
        setStep(s => Math.max(s, i + 1));
      }
      try { sessionStorage.setItem('vy-booted', '1'); } catch { /* private window */ }
    })();

    return () => { live = false; clearTimeout(reveal); };
  }, []);

  /**
   * The slow line, and the exit.
   *
   * "Still climbing…" after five seconds is the one thing this screen can
   * honestly add while it waits: it cannot say how much longer, and a
   * percentage that is not measured is a lie, but it can say that it has
   * noticed. The exit runs the other way — the craft leaves the top of the
   * frame and the workspace is behind it, which is 0.4s of the user's time
   * spent only when a screen they have already seen is being taken away.
   */
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!shown || step >= BOOT_STAGES.length) return;
    const t = setTimeout(() => setSlow(true), SLOW_AFTER);
    return () => clearTimeout(t);
  }, [shown, step]);

  const done = step >= BOOT_STAGES.length;
  /* `exiting` IS NOT A DEPENDENCY, and leaving it in cost the screen its exit.
     This effect sets it, which re-ran the effect, whose CLEANUP cleared the
     400ms timer that was about to take the screen away — so the boot screen
     sat on "Welcome aboard" for ever. Caught by screenshotting the route it
     covers. The guard it was there for is unnecessary: neither of the two
     remaining deps changes when `exiting` does. */
  useEffect(() => {
    if (!done || !shown) return;
    setExiting(true);
    const t = setTimeout(() => setShown(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [done, shown]);

  /* Never shown, or already flown away: the app, with no transition at all. */
  if (done && !shown) return <>{children}</>;
  if (!shown) return null;

  return (
    <BootScreen step={step} exiting={exiting}
                label={done ? WELCOME : slow ? STILL_CLIMBING : LAUNCHING} />
  );
}

/** Her three numbers, named here because this file is the only place they act. */
const SHOW_AFTER = 400, SLOW_AFTER = 5000, EXIT_MS = 400;
