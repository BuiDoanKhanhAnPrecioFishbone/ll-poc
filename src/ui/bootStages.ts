/**
 * What the app is actually waiting for between a password and a workspace.
 *
 * FIVE STATIONS, AND THEY ARE NOT INVENTED. The illustration carries five, and
 * the live system carries five things worth waiting on — read out of its own
 * bundle rather than guessed at. Each stage below names the signal in the
 * customer's auth store that completes it, so wiring this to production is one
 * line per stage rather than a design exercise.
 *
 * WHAT IS HONEST ABOUT THIS PROTOTYPE, said plainly. Four of the five resolve
 * instantly here, because there is no server: the session is not exchanged,
 * permissions are not fetched, preferences are already in localStorage. So the
 * boot screen flashes rather than tells a story, and that is the correct
 * behaviour for a boot this fast — a progress indicator that lingers when the
 * work does not is a progress indicator that lies.
 *
 * The journey is therefore watched on `/design-system`, where it steps through
 * the five as a specimen and says so. The product does not pretend.
 */
export type BootStage = {
  key: string;
  /** Shown and read aloud while this one is outstanding. */
  label: string;
  /**
   * The live store's own signal that ends this stage — the wiring target.
   * Named here so the mapping survives in the code rather than in a document.
   */
  liveSignal: string;
  /**
   * The real work, where this build has any. `null` means nothing to await
   * here yet, NOT "wait a while" — there is no timer in this file.
   */
  run: (() => Promise<unknown>) | null;
};

export const BOOT_STAGES: BootStage[] = [
  {
    key: 'session', label: 'Signing you in',
    liveSignal: 'LOGIN_SUCCESS → isAuthInitialized',
    /* Production exchanges the credential for a token here. The prototype
       authenticates nothing, by design — see Login.tsx. */
    run: null,
  },
  {
    key: 'navigation', label: 'Loading your menu',
    liveSignal: 'navigation (set on LOGIN_SUCCESS)',
    /* THE ONE STAGE WITH REAL WORK IN IT. The sidebar is built from this
       module, and loading it as a chunk is what production does too — the menu
       a user may open is not knowable until their navigation tree arrives. */
    run: () => import('../data/sitemap'),
  },
  {
    key: 'permissions', label: 'Checking your permissions',
    liveSignal: 'getPermission',
    /* Every screen in this prototype is visible to everyone; there is nothing
       to ask and nobody to ask it of. */
    run: null,
  },
  {
    key: 'preferences', label: 'Restoring your settings',
    liveSignal: 'CHANGE_FORMAT_CONFIG',
    /* Density, theme and the saved views are read from localStorage by
       PrefsProvider, which has already run by the time this does. */
    run: null,
  },
  {
    key: 'workspace', label: 'Opening your workspace',
    liveSignal: 'isInitialized',
    run: null,
  },
];
