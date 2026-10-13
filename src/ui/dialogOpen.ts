import { useSyncExternalStore } from 'react';

/**
 * Is any dialog open? One boolean, shared by two components that cannot see
 * each other.
 *
 * ASKED FOR, 13 October 2026: "open one modal/dialog now open full size first,
 * auto collapse the menu navigation". The sidebar belongs to `AppShell`; a
 * dialog renders into a portal that is a SIBLING of the shell, so there is no
 * component above both to hold the state. A context would mean every screen
 * opting in to provide it, for one boolean.
 *
 * WHY NOT A CSS ATTRIBUTE on `documentElement`, which was the first attempt:
 * the collapsed sidebar is not a narrower sidebar, it is a different one — the
 * labels are not rendered at all, because a 56px rail with text in it clips
 * every word. CSS can change the width; only React can take the labels out.
 *
 * A COUNT, not a flag: dialogs in this app stack three deep (a part record
 * opens a stock report, which opens Update Quantity). Closing the innermost one
 * must not uncollapse the shell while two are still open.
 */
let openCount = 0;
const listeners = new Set<() => void>();

function emit() { listeners.forEach(l => l()); }

/** Called by a dialog on mount; the returned function is its cleanup. */
export function markDialogOpen(): () => void {
  openCount += 1;
  emit();
  let released = false;
  return () => {
    if (released) return;        // StrictMode runs cleanups twice in development
    released = true;
    openCount = Math.max(0, openCount - 1);
    emit();
  };
}

export function useAnyDialogOpen(): boolean {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    () => openCount > 0,
    () => false,                 // server/first paint: nothing is open yet
  );
}
