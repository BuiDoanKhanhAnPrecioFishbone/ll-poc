import { useEffect, useState, type ReactNode } from 'react';
import { BootScreen } from './Loader';
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
 * boot is genuinely instant the right amount of boot screen is none. If it
 * flickers, the fix is fewer stages, not a longer wait.
 */
export function BootGate({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(booted);

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

    return () => { live = false; };
  }, []);

  if (step >= BOOT_STAGES.length) return <>{children}</>;
  return <BootScreen step={step} label={BOOT_STAGES[step].label} />;
}
