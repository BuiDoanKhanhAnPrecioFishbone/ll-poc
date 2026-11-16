import * as RToast from '@radix-ui/react-toast';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Action feedback. A mockup full of buttons that silently do nothing is worse
 * than one with fewer buttons: a reviewer cannot tell a missing feature from a
 * broken one. Every unimplemented action says what it would do.
 *
 * Radix Toast handles the part that is easy to get wrong — swipe dismissal,
 * a live region so screen readers announce it, and pausing the timer while the
 * pointer is over it.
 */
type T = { id: number; text: string; kind: 'info' | 'success' | 'error'; undo?: () => void };

/* The mark is what keeps a notice legible without its colour, which the BA's
   spec and `inclusive-writing` both require. Her shapes: a circle for success
   and for information, an octagon for an error — the octagon is the one that
   stays distinct in a screenshot, a photocopy or at 200% zoom.

   Drawn here rather than added to `icons.tsx`: her own open list still has the
   product icon set to draw, so committing a house `info` and `error` glyph now
   would decide something she has not. These three are shapes her notice spec
   names outright, so they are hers; the set is still hers to settle. */
function ToastMark({ kind }: { kind: T['kind'] }) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true,
                   className: 'vy-toast-mark', fill: 'none', stroke: 'currentColor',
                   strokeWidth: 1.6, strokeLinecap: 'round' as const,
                   strokeLinejoin: 'round' as const };
  if (kind === 'error') return (
    <svg {...common}>
      <path d="M5.4 1.4h5.2l3.9 3.9v5.4l-3.9 3.9H5.4L1.5 10.7V5.3z" />
      <path d="M8 4.6v4.1M8 11.3h.01" />
    </svg>
  );
  if (kind === 'success') return (
    <svg {...common}><circle cx="8" cy="8" r="6.6" /><path d="m5.2 8.2 2 2 3.7-4.2" /></svg>
  );
  return <svg {...common}><circle cx="8" cy="8" r="6.6" /><path d="M8 7.1v4.2M8 4.8h.01" /></svg>;
}
const Ctx = createContext<{
  notImplemented: (w: string) => void;
  success: (t: string) => void;
  /**
   * Something did NOT happen. Kept separate from `success` because the app used
   * to announce failures through it: a validation message telling you which
   * required fields were still empty arrived on the green success toast, as did
   * "Select assembly first!". The words were right and the colour said the
   * opposite, which is worse than saying nothing — a user who trusts the colour
   * carries on believing the step worked.
   */
  error: (t: string) => void;
  /**
   * A change that committed immediately, with the way back.
   *
   * Inline editing buys speed by removing the Save step, and the price is that a
   * mis-click is a silent commit. Undo is what pays that price — without it,
   * "saves as you go" just means "cannot be taken back".
   */
  undoable: (text: string, undo: () => void) => void;
}>({
  notImplemented: () => {}, success: () => {}, error: () => {}, undoable: () => {},
});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const push = useCallback((text: string, kind: T['kind'], undo?: () => void) => {
    setItems(v => [...v, { id: Date.now() + Math.floor(performance.now()), text, kind, undo }]);
  }, []);
  const api = useMemo(() => ({
    /** `what` completes the sentence "This would …". */
    notImplemented: (what: string) => push(`Not in this prototype — this would ${what}.`, 'info'),
    success: (text: string) => push(text, 'success'),
    error: (text: string) => push(text, 'error'),
    undoable: (text: string, undo: () => void) => push(text, 'success', undo),
  }), [push]);

  return (
    <Ctx.Provider value={api}>
      <RToast.Provider swipeDirection="down" duration={4500}>
        {children}
        {items.map(t => (
          /* A failure gets longer on screen and an assertive announcement. The
             default 4.5s is tuned for "that worked" — a message you can miss
             without cost. A message naming what you must fix before continuing
             is one you cannot, and the user is usually still reading the form
             rather than watching the corner. */
          <RToast.Root key={t.id} className="vy-toast" data-kind={t.kind}
                       duration={t.kind === 'error' ? 9000 : undefined}
                       type={t.kind === 'error' ? 'foreground' : 'background'}
                       onOpenChange={o => !o && setItems(v => v.filter(x => x.id !== t.id))}>
            <ToastMark kind={t.kind} />
            <RToast.Description className="vy-toast-text">{t.text}</RToast.Description>
            {t.undo && (
              /* Radix Action, not a plain button: it keeps the toast alive while
                 focus is inside it, so tabbing to Undo cannot race the timeout. */
              <RToast.Action asChild altText="Undo this change">
                <button className="vy-toast-undo"
                        onClick={() => { t.undo!(); setItems(v => v.filter(x => x.id !== t.id)); }}>
                  Undo
                </button>
              </RToast.Action>
            )}
            <RToast.Close className="vy-toast-close" aria-label="Dismiss">
              <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="m5 5 10 10M15 5 5 15" /></svg>
            </RToast.Close>
          </RToast.Root>
        ))}
        <RToast.Viewport className="vy-toasts" />
      </RToast.Provider>
    </Ctx.Provider>
  );
}
