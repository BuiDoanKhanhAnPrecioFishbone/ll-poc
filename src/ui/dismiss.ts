import { createContext } from 'react';

/**
 * How to dismiss the container we are inside, if any. `null` means "not in one".
 *
 * Exists for `Select`, and for one key. Escape has to reach whatever is
 * innermost — the open dropdown list, or failing that the container holding it —
 * and Kendo gives neither control a way to say "I handled it" to the other. So
 * `Select` takes Escape away from Kendo entirely and decides, and this is how it
 * reaches the container once it has nothing of its own left to close.
 *
 * A CONTEXT RATHER THAN A DOM LOOKUP because Kendo PORTALS a dialog to the body:
 * `.vy-dialog-host` is a React ancestor of the dialog but not a DOM one, so no
 * amount of `closest()` would find it. Context travels the same tree the events
 * do, which is the tree that matters here.
 *
 * `Dialog` is not the only provider. `ViewSetting` is a right sidebar with its
 * own scrim, and it provides this too, so a dropdown inside it behaves the way
 * a dropdown inside a dialog does. See docs/modal-patterns.md.
 *
 * ITS OWN FILE so that `Overlays.tsx` exports components and nothing else —
 * mixing a context export in there costs Fast Refresh on a 400-line file every
 * screen in the app depends on.
 */
export const DialogDismiss = createContext<(() => void) | null>(null);
