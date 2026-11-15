import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { specimens } from '../specimens/registry';
import { applyTheme, type Theme } from '../theme/applyTheme';

/**
 * One component's live examples, with no shell around them, so the design
 * system site can frame it.
 *
 * It renders outside `BootGate` and `AppShell` for the same reason `/login`
 * does: there is no workspace to load and no navigation to show.
 *
 * TWO MESSAGES CROSS THE FRAME, both same-origin:
 *   in   vy-specimen-theme   the site's own light/dark toggle, forwarded, so
 *                            the example never disagrees with the page around it
 *   out  vy-specimen-height  measured on every resize, because an iframe has
 *                            no intrinsic height and a scrollbar inside an
 *                            example is a bug a reader would blame on us
 */
export default function Specimen() {
  const { name = '' } = useParams();
  const list = specimens[name];
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; theme?: Theme };
      if (d?.type === 'vy-specimen-theme' && d.theme) applyTheme(d.theme);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const post = () => window.parent?.postMessage(
      { type: 'vy-specimen-height', name, height: Math.ceil(el.getBoundingClientRect().height) },
      window.location.origin,
    );
    const ro = new ResizeObserver(post);
    ro.observe(el);
    post();
    return () => ro.disconnect();
  }, [name]);

  return (
    <div ref={root} className="vy-specimen">
      {!list && <p className="vy-specimen-missing">No live example is written for <code>{name}</code> yet.</p>}
      {list?.map(ex => (
        <section key={ex.title}>
          <h2>{ex.title}</h2>
          {ex.note && <p>{ex.note}</p>}
          <div className="vy-specimen-stage">{ex.render()}</div>
        </section>
      ))}
    </div>
  );
}
