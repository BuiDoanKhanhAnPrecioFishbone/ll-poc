import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Notification, NotificationGroup } from '@progress/kendo-react-notification';
import { Fade } from '@progress/kendo-react-animation';

/**
 * Feedback for actions the prototype does not implement.
 *
 * A mockup full of buttons that silently do nothing is worse than one with
 * fewer buttons: a reviewer cannot tell a missing feature from a broken one,
 * and neither can the developer who inherits it. Every action that would do
 * something in the real system stays visible and says what it would do.
 *
 * Uses stock Kendo `NotificationGroup` + `Notification`.
 */
type Toast = { id: number; text: string; type: 'info' | 'success' };
const Ctx = createContext<{ notImplemented: (what: string) => void; success: (t: string) => void }>({
  notImplemented: () => {}, success: () => {},
});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, type: Toast['type']) => {
    const id = Date.now() + Math.floor(performance.now());
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4200);
  }, []);

  const api = useMemo(() => ({
    /** `what` completes the sentence "This would …". */
    notImplemented: (what: string) => push(`Not in this prototype — this would ${what}.`, 'info'),
    success: (text: string) => push(text, 'success'),
  }), [push]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <NotificationGroup className="vy-toasts">
        <Fade>
          {toasts.map(t => (
            <Notification key={t.id} type={{ style: t.type, icon: true }} closable
                          onClose={() => setToasts(x => x.filter(y => y.id !== t.id))}>
              <span>{t.text}</span>
            </Notification>
          ))}
        </Fade>
      </NotificationGroup>
    </Ctx.Provider>
  );
}
