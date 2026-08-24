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
type T = { id: number; text: string; kind: 'info' | 'success'; undo?: () => void };
const Ctx = createContext<{
  notImplemented: (w: string) => void;
  success: (t: string) => void;
  /**
   * A change that committed immediately, with the way back.
   *
   * Inline editing buys speed by removing the Save step, and the price is that a
   * mis-click is a silent commit. Undo is what pays that price — without it,
   * "saves as you go" just means "cannot be taken back".
   */
  undoable: (text: string, undo: () => void) => void;
}>({
  notImplemented: () => {}, success: () => {}, undoable: () => {},
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
    undoable: (text: string, undo: () => void) => push(text, 'success', undo),
  }), [push]);

  return (
    <Ctx.Provider value={api}>
      <RToast.Provider swipeDirection="down" duration={4500}>
        {children}
        {items.map(t => (
          <RToast.Root key={t.id} className="vy-toast" data-kind={t.kind}
                       onOpenChange={o => !o && setItems(v => v.filter(x => x.id !== t.id))}>
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
