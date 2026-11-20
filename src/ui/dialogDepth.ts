import { createContext, useContext } from 'react';

/**
 * How many dialogs deep is this subtree? 0 means "not in a dialog at all".
 *
 * It lived inside `Overlays.tsx`, where `Dialog` both provides and reads it to
 * stack three deep. It is out here because a SECOND component now needs to
 * read it without importing the dialog: `Button`, so that the destructive
 * action can take its weight from WHERE IT IS.
 *
 *   in a toolbar        outlined — a danger button on the record bar sits
 *                       beside Save and Export and must not out-shout them
 *   in a confirm popup  filled — by then the question has already been asked
 *                       and the red button IS the answer
 *
 * The BA's Buttons section, 16 Nov: *"Danger in a toolbar: outlined, 1px
 * danger border and danger text. Danger in a confirm popup: filled, white
 * text."* Her rule is about place, so the component reads the place rather
 * than asking every call site to remember which one it is in. A new variant
 * name — `dangerOutline` — would have put the same decision in 6 call sites
 * and every future one, where it can be got wrong silently.
 *
 * A SEPARATE MODULE rather than an export from `Overlays.tsx`, because
 * `ConfirmDialog` already imports both files and `Button` importing the
 * overlay module would put a cycle one future import away. `dismiss.ts` and
 * `dialogOpen.ts` are here for the same reason, so this is the file shape the
 * directory already uses.
 */
export const DialogDepth = createContext(0);

/** True inside any `Dialog`, at any depth. */
export function useInDialog(): boolean {
  return useContext(DialogDepth) > 0;
}
